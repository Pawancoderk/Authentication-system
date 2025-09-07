import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        default:"user"
    }
},{
    timestamps:true
})

export const User = mongoose.model("User",userModel)
