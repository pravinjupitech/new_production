import express from "express";
import {
  NestedUpdateProduct,
  createProduction,
  deleteNestedProduct,
  deleteProduct,
  deleteWorkerTarget,
  listOfWorkerTarget,
  productTarget,
  updateProduct,
  viewByIdProduct,
  viewProduct,
  wastageProductReport,
  workerReport,
  workerTarget,
} from "../controller/startProduction.controller.js";
const router = express.Router();

router.post("/start-production", createProduction);
router.get("/view-ProductionList/:database/:financeYear", viewProduct);
router.get("/view-by-StartProduction/:id", viewByIdProduct);
router.put("/update-StartProduction/:id", updateProduct);
router.delete("/delete-StartProduction/:id", deleteProduct);
router.delete("/delete-nested-data/:id/:innerId", deleteNestedProduct);
router.put("/nested-update-production/:id/:innerId", NestedUpdateProduct);
router.get("/current-target-product/:id", productTarget);
router.get("/wastage-report/:database/:financeYear",wastageProductReport)
router.get("/worker-report/:financeYear/:workerId",workerReport)
router.post("/save-worker-target",workerTarget)
router.get("/view-workerTarget/:database/:financeYear",listOfWorkerTarget)
router.delete("/delete-workerTaget/:id",deleteWorkerTarget)
export default router;
