import mongoose from "mongoose";
const productSetupSchema = new mongoose.Schema({
    producttype: {
        type: String
    },
    status: {
        type: String,
        default:"Active"
    },
    database:{
        type:String
    }
}, { timestamps: true })
export const ProductSetup = mongoose.model('productStep', productSetupSchema)