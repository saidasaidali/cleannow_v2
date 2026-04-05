// =====================================
// ÉTAPE 5 : Ajouter les routes utilisateur
// =====================================
// Remplacez le contenu de routes/users.js par :

const express = require("express");
const router = express.Router();
const {
  getAllUsers, getUserById,
  createUser, updateUser, deleteUser,
  validerFournisseur, rejeterFournisseur,
  updateProfil, changePassword,
  getHistoriqueFournisseur, getNotificationsFournisseur,
} = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// ── Routes admin ──────────────────────────────────────
router.get("/",                 authenticateToken, authorizeRoles("admin"), getAllUsers);
router.post("/",                authenticateToken, authorizeRoles("admin"), createUser);
router.put("/:id",              authenticateToken, authorizeRoles("admin"), updateUser);
router.delete("/:id",           authenticateToken, authorizeRoles("admin"), deleteUser);
router.patch("/:id/valider",    authenticateToken, authorizeRoles("admin"), validerFournisseur);
router.patch("/:id/rejeter",    authenticateToken, authorizeRoles("admin"), rejeterFournisseur);

// ── Routes utilisateur (standard) ────────────────────
router.get("/:id",              authenticateToken, getUserById);
router.patch("/:id/profil",     authenticateToken, updateProfil);
router.patch("/:id/password",   authenticateToken, changePassword);

// ── Routes fournisseur ────────────────────────────────
router.get("/:id/historique",   authenticateToken, getHistoriqueFournisseur);
router.get("/:id/notifications", authenticateToken, getNotificationsFournisseur);

module.exports = router;