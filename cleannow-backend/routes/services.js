const express = require("express");
const router = express.Router();
const { getAllServices, createService, updateService, deleteService } = require("../controllers/serviceController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getAllServices);
router.post("/", authenticateToken, authorizeRoles("admin", "fournisseur"), createService);
router.put("/:id", authenticateToken, authorizeRoles("admin", "fournisseur"), updateService);
router.delete("/:id", authenticateToken, authorizeRoles("admin", "fournisseur"), deleteService);

module.exports = router;