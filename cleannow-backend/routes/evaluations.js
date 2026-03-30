const express = require("express");
const router = express.Router();
const { getAllEvaluations, createEvaluation, updateEvaluation } = require("../controllers/evaluationController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getAllEvaluations);
router.post("/", authenticateToken, createEvaluation);
router.put("/:id", authenticateToken, updateEvaluation);

module.exports = router;