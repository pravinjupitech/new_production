import mongoose from "mongoose";

const InputProductDetailSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const OutputProductDetailSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
    },
    inputQty: {
      type: Number,
      required: true,
    },
    targetQty: {
      type: Number,
      required: true,
    },
    operator: {
      type: String,
      required: true,
    },
    calculatedQty: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

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

    inputProductDetails: {
      type: [InputProductDetailSchema],
      default: [],
    },

    outputProductDetails: {
      type: [OutputProductDetailSchema],
      default: [],
    },
  },
  { _id: false }
);

const productionTargetSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

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

    reportType: {
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
