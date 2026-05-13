import express from "express"
import { AddproductType, deleteProductSetup, viewproductType } from "../controller/productSetup.controller.js"
const router=express.Router()

router.post("/save-producttype",AddproductType)
router.get("/view-producttype/:database",viewproductType)
router.delete("/delete-producttype/:id",deleteProductSetup)
export default router