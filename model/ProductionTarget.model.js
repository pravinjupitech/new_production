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
      pieceWeight: {
        type: Number,
        default: 0,
      },
      pieceSqInch: {
        type: Number,
        default: 0,
      },
      bundleQty: {
        type: Number,
        default: 0,
      },
      bundleWeight: {
        type: Number,
        default: 0,
      },
      bundleSqInch: {
        type: Number,
        default: 0,
      },
      bundleinBag: {
        type: Number,
        default: 0,
      },
      bagWeight: {
        type: Number,
        default: 0,
      },
      bagQty: {
        type: Number,
        default: 0,
      },
      wastageSqInch: {
        type: Number,
        default: 0,
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