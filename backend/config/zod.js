import {email, z} from "zod"

export const registerSchema = z.object({
    name: z.string().min(3,"Name must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8,"Password must be 8 characters long"),
    
})


export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8,"Password must be 8 characters long"),
    
})