import mongoose from "mongoose";
const outWordSchema=new mongoose.Schema({
    userId:{
        type:String
    },
    productId:{
        type:String
    },
    database:{
        type:String
    },
    created_by:{
        type:String
    },
    qty:{
        type:Number
    },
    date:{
        type:Date
    },
    unit:{
        type:String
    },
    time:{
        type:String
    }
},{timestamps:true})
export const OutWord=mongoose.model("outWordManagement",outWordSchema)