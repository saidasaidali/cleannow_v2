const express = require("express");
const router = express.Router();
const {
  getAllDemandes,
  getMyDemandes,
  createDemande,
  updateDemande,
  updateStatutDemande,
} = require("../controllers/demandeController");
const { authenticateToken } = require("../middleware/authMiddleware");

const { marquerTermine, validerPrestation } = require("../controllers/demandeController");

// ⚠️ /mine DOIT être avant /:id sinon Express traite "mine" comme un ID
router.get("/mine", authenticateToken, getMyDemandes);

router.get("/",    authenticateToken, getAllDemandes);
router.post("/",   authenticateToken, createDemande);
router.put("/:id", authenticateToken, updateDemande);

// Route unifiée : accepter / refuser / terminer
router.patch("/:id/statut", authenticateToken, updateStatutDemande);

// =====================================
// ÉTAPE 8 : Ajouter les routes demandes
// =====================================
// Ajoutez ces 2 lignes à routes/demandes.js :

router.patch("/:id/terminer",   authenticateToken, marquerTermine);
router.patch("/:id/valider",    authenticateToken, validerPrestation);


module.exports = router;