import mongoose from "mongoose";

const connectDb = async()=>{
    try {
        mongoose.connect(process.env.MONGODB_URI,{
            dbName:"MernAuthentication",
        })
        console.log("MongoDb connected") 
    } catch (error) {
        console.log("Failed to connect")
    }
}

export default connectDb;

