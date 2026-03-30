const express = require("express");
const router = express.Router();
const {
  getAllPaiements,
  createPaiement,
  updatePaiement,
  marquerEffectue,
} = require("../controllers/paiementController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/",    authenticateToken, getAllPaiements);
router.post("/",   authenticateToken, createPaiement);
router.put("/:id", authenticateToken, updatePaiement);

// Marquer un paiement comme effectué
router.patch("/:id/effectue", authenticateToken, marquerEffectue);

module.exports = router;