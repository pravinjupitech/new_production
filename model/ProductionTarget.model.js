import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    targetQty: {
      type: Number,
      required: true,
    },
    productDetails: {
      unit: {
        type: String,
      },
      value: {
        type: Number,
      },
     },
  },
  { _id: false }
);

const productionTargetSchema = new mongoose.Schema(
  {
    database: {
      type: String,
      required: true,
    },
    workerId: {
      type: String,
    },
    financialYear: {
      type: String,
      required: true,
    },
    month: {
      type: String,
    },
    products: {
      type: [ProductSchema],
      default: [],
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

export const ProductionTarget = mongoose.model(
  "productTarget",
  productionTargetSchema
);