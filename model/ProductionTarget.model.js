import mongoose from "mongoose";

const InputProductDetailSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
    },
    qty: {
      type: Number,
    },
    source: {
      type: String,
    },
    operator: {
      type: String,
    },
  },
  { _id: false }
);

const OutputProductDetailSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
    },
    inputQty: {
      type: Number,
    },
    targetQty: {
      type: Number,
    },
    operator: {
      type: String,
    },
    calculatedQty: {
      type: Number,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      
    },

    productName: {
      type: String,
    },

    targetQty: {
      type: Number,
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
      type:String
    },

    database: {
      type: String,
    },

    workerId: {
      type: String,
    },

    financialYear: {
      type: String,
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
