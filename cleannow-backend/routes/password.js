// =====================================
// ÉTAPE 2 : Ajouter les nouvelles routes
// =====================================
// Créez routes/password.js :

const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/passwordController");

// Demander réinitialisation (pas besoin de token)
router.post("/forgot", requestPasswordReset);

// Réinitialiser avec token
router.post("/reset/:token", resetPassword);

module.exports = router;