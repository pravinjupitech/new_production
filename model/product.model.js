import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    created_by: {
      type: String,
    },
    database: {
      type: String,
    },
    partyId: {
      type: String,
    },
    primaryUnit: {
      type: String,
    },
    secondaryUnit: {
      type: String,
    },
    secondarySize: {
      type: Number,
    },
    unitType: {
      type: String,
    },
    stockUnit: {
      type: String,
    },
    productType: {
      type: String
    },
    category: {
      type: String,
    },
    SubCategory: {
      type: String,
    },
    warehouse: {
      type: String,
    },
    pendingQty: {
      type: Number,
      default: 0,
    },
    Unit: {
      type: String,
    },
    Product_Title: {
      type: String,
    },
    Size: {
      type: String,
    },
    qty: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    HSN_Code: {
      type: String,
    },
    GSTRate: {
      type: Number,
    },
    Product_Desc: {
      type: String,
    },
    Product_image: {
      type: [],
    },
    Product_MRP: {
      type: Number,
    },
    MIN_stockalert: {
      type: Number,
    },
    addProductType: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
    },
    salesDate: {
      type: Date,
    },
    purchaseDate: {
      type: Date,
    },
    purchaseStatus: {
      type: Boolean,
      default: false,
    },
    Opening_Stock: {
      type: Number,
    },
    Purchase_Rate: {
      type: Number,
    },
    basicPrice: {
      type: Number,
    },
    landedCost: {
      type: Number,
    },
    openingRate: {
      type: Number
    },
    SalesRate: {
      type: Number,
    },
    ProfitPercentage: {
      type: Number,
    },
    Units: [
      {
        unit: {
          type: String,
        },
        qty: {
          type: Number,
        },
      },
    ],

    productDetails: [
      {
        productId: String,
        pieceWeight: Number,
        pieceSqInch: Number,
        bundleQty: Number,
        bundleWeight: Number,
        bundleSqInch: Number,
        bundleinBag: Number,
        bagWeight: Number,
        bagQty: Number,
        wastageSqInch: Number,
      },
    ],

    producttype: {
      type: String
    },
    step_Name: {
      type: String
    },
    productCosting: [{
      productId: { type: String },
      productName: { type: String },
      purchaseRate: { type: Number },
      qty: { type: Number },
      total: { type: Number }
    }]

  },
  { timestamps: true }
);
export const Product = mongoose.model("product", ProductSchema);
