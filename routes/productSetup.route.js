import express from "express"
import { AddproductType, viewproductType } from "../controller/productSetup.controller.js"
const router=express.Router()

router.post("/save-producttype",AddproductType)
router.get("/view-producttype/:database",viewproductType)
export default router