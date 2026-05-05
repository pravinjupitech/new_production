import express from "express"
import { getOutWord, saveOutword } from "../controller/outwardManagement.controller.js"
const router=express.Router()
router.post("/save-outward",saveOutword)
router.get("/get-outWord/:database",getOutWord)
export default router