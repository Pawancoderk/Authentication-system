import express from "express";
import { loginUser, UserRegister, verifyOtp, verifyUser } from "../controllers/user.js";

const router = express.Router()

router.post("/register",UserRegister)
router.post("/verify/:token", verifyUser)
router.post("/login",loginUser)
router.post("/verify",verifyOtp)

export default router;