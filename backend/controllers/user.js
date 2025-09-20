import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import TryCatch from "../middlewares/tryCatch.js";
import sanitize from "mongo-sanitize";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import { email, json } from "zod";
import { generateAccessToken, generateToken, revokeRefreshToken, verifyRefreshToken } from "../config/generateToken.js";
import { generateCSRFToken } from "../config/csrfMiddleware.js";

export const UserRegister = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation Error",
        code: issue.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }
    return res.status(400).json({
      message: firstErrorMessage,
      error: allErrors,
    });
  }

  const { name, email, password } = validation.data;

  const ratelimitKey = `register-rate-limit:${req.ip}: ${email}`;

  if (await redisClient.get(ratelimitKey)) {
    return res.status(429).json({
      message: "Too many requests, try again later",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      message: "User Already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`;

  const dataStore = JSON.stringify({
    name,
    email,
    password: hashedPassword,
  });  

  await redisClient.set(verifyKey, dataStore, {EX: 300})

  const subject = "verify your email for Account creation";
  const html = getVerifyEmailHtml({email, token:verifyToken })

  await sendMail({email, subject, html})
  await redisClient.set(ratelimitKey, "true", {EX: 60})


  res.json({
   message: "If your email is valid, a verification link has been sent to your email. It will expire in 5 minutes. "
  });
});

export const verifyUser = TryCatch(async(req,res)=>{
  const {token} = req.params;

  if(!token){
    return res.status(400).json({
      message: "Verification token is required."
    })
  }

  const verifyKey = `verify:${token}`

  const userDataJson = await redisClient.get(verifyKey);

  if(!userDataJson){
    return res.status(400).json({
      message: "Verification link is expired."
    })
  }

  await redisClient.del(verifyKey) 
  const userData = JSON.parse(userDataJson)

  const existingUser = await User.findOne({email:userData.email})

  if(existingUser){
    return res.status(400).json({
      message: "User already exists"
    })
  }

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password
  });

  res.status(201).json({
    message: "Email verified successfully! Your account has been created ",
    user:{_id: newUser._id, name: newUser.name, email: newUser.email},

  })
})

export const loginUser = TryCatch(async(req,res)=>{
  const sanitizedBody = sanitize(req.body);
  const validation = loginSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation Error",
        code: issue.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }
    return res.status(400).json({
      message: firstErrorMessage,
      error: allErrors,
    });
  }

  const {  email, password } = validation.data;

  const ratelimitKey = `login-rate-limit${req.ip}:${email}`; 

  if (await redisClient.get(ratelimitKey)) {
    return res.status(429).json({
      message: "Too many requests, try again later",
    });
  }

  const user = await User.findOne({email})

  if(!user){
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if(!comparePassword){
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, JSON.stringify(otp),{
    EX: 300,
  })

  const subject = "Otp for verification"

  const html = getOtpHtml({email, otp})

  await sendMail({email, subject, html})

  await redisClient.set(ratelimitKey, "true", {EX: 60})

  res.json({
    message: "If your email is valid, an otp has been sent. It will be valid for 5 minutes."
  })
})

export const verifyOtp = TryCatch(async(req,res)=>{
  const {email, otp} = req.body;

  if(!email || !otp){
    return res.status(400).json({
      message: "Please provide all details"
    })
  }

  const otpKey = `otp:${email}`;

  const storedOtpString = await redisClient.get(otpKey);

  if(!storedOtpString){
    return res.status(400).json({
      message: "otp expired",
    });
  }

  const storeOtp = JSON.parse(storedOtpString);

  if(storeOtp !== otp){
     return res.status(400).json({
      message: "Invalid otp"
     })
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({email})

  const tokenData = await generateToken(user._id, res);

  res.status(200).json({
    message: `Welcome ${user.name}`, 
    user
  })
})

export const myProfile = TryCatch(async(req,res)=>{
  const user = req.user;

  res.json(user);
}) 

export const refreshToken = TryCatch(async(req,res)=>{
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
            message: "Invalid refresh token",
        });
    }

    const decode = await verifyRefreshToken(refreshToken);
    

    if(!decode){
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    generateAccessToken(decode.id,res);

    res.status(201).json({
        message: "Token refreshed"
    })
})

export const logoutUser = TryCatch(async(req,res)=>{
  const userId = req.user._id;

  await revokeRefreshToken(userId);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.clearCookie("csrfToken");

  await redisClient.del(`user:${userId}`);

  res.json({
    message: "Logged out successfully"
  })
})

export const refreshCSRF = TryCatch(async(req,res)=>{
  const userId = req.user.id

  const newCSRFToken = await generateCSRFToken(userId, res);
  res.json({
    message: "CSRF Token refreshed successfully",
    csrfToken: newCSRFToken
  })

})

export const adminControl = TryCatch(async(req,res)=>{
  res.json({
    message: "Hello admin"
  })
})

 