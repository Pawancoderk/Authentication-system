import express from "express";
import { loginUser, myProfile, refreshToken, UserRegister, verifyOtp, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";


const router = express.Router()

router.post("/register",UserRegister)
router.post("/verify/:token", verifyUser)
router.post("/login",loginUser)
router.post("/verify",verifyOtp)
router.get("/me",isAuth,myProfile)
router.post("/refresh",refreshToken)

export default router;