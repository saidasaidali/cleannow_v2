const express = require("express");
const router = express.Router();
const {
  getAllUsers, getUserById,
  createUser, updateUser, deleteUser,
  validerFournisseur, rejeterFournisseur,
} = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/",     authenticateToken, authorizeRoles("admin"), getAllUsers);
router.get("/:id",  authenticateToken, getUserById);
router.post("/",    authenticateToken, authorizeRoles("admin"), createUser);
router.put("/:id",  authenticateToken, authorizeRoles("admin"), updateUser);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteUser);

// Validation fournisseur
router.patch("/:id/valider",  authenticateToken, authorizeRoles("admin"), validerFournisseur);
router.patch("/:id/rejeter",  authenticateToken, authorizeRoles("admin"), rejeterFournisseur);

module.exports = router;