import mongoose from "mongoose";

const achievementTargetSchema = new mongoose.Schema(
    {
        achievementQty: {
            type: Number,
            default: 0,
        },

        balanceQty: {
            type: Number,
            default: 0,
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        database: {
            type: String,
            required: true,
        },

        financialYear: {
            type: String,
            required: true,
        },

        month: {
            type: String,
            required: true,
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        productName: {
            type: String,
            required: true,
        },

        stepName: {
            type: String,
            required: true,
        },

        targetQty: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const AchievementTarget = mongoose.model(
    "AchievementTarget",
    achievementTargetSchema
);
