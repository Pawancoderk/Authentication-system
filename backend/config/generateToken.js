import jwt from "jsonwebtoken"
import { id } from "zod/v4/locales"
import { redisClient } from "../index.js";

export const generateToken = async(id,res)=>{
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: "1m",
    });

    const refreshToken = jwt.sign({id}, process.env.REFRESH_SECRET,{
        expiresIn: "7d",
    })

    const refreshTokenKey = `refresh_token${id}`;

    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

    res.cookie("accessToken",accessToken,{
        httpOnly: true,
        // secure: true,
        sameSite: "strict",
        maxAge: 1 * 60 * 1000,
    })

    res.cookie("refreshToken",refreshToken,{
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        // secure: true
    });
    return { accessToken, refreshToken}
}