import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema({
    database: {
        type: String
    },
    workerId: {
        type: String
    },
    finanaceYear: {
        type: String
    },
    products:[],
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true })

export const WorkerTarget = mongoose.model("workerTarget", WorkerSchema)