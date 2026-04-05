const { DemandeService, Service, User, Paiement } = require("../models/associations");
const { Op } = require("sequelize");

// GET /api/demandes
const getAllDemandes = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let whereClause = {};
    if (role === "fournisseur") {
      whereClause = {
        [Op.or]: [
          { statut: "en_attente" },
          { fournisseurId: userId },
        ],
      };
    }

    const demandes = await DemandeService.findAll({
      where: Object.keys(whereClause).length ? whereClause : undefined,
      include: [
        { model: Service },
        { model: User, as: "Beneficiaire", attributes: ["id", "nom", "email"] },
        { model: User, as: "Fournisseur",  attributes: ["id", "nom", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(demandes);
  } catch (err) {
    console.error("getAllDemandes ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/demandes/mine
const getMyDemandes = async (req, res) => {
  try {
    const demandes = await DemandeService.findAll({
      where: { beneficiaireId: req.user.id },
      include: [
        { model: Service },
        { model: Paiement },
        { model: User, as: "Fournisseur", attributes: ["id", "nom", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(demandes);
  } catch (err) {
    console.error("getMyDemandes ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/demandes
const createDemande = async (req, res) => {
  try {
    const { serviceId, adresse, notes } = req.body;
    if (!serviceId) return res.status(400).json({ error: "serviceId est requis" });
    const demande = await DemandeService.create({
      serviceId,
      beneficiaireId: req.user.id,
      statut: "en_attente",
      adresse: adresse || null,
      notes: notes || null,
    });
    res.status(201).json(demande);
  } catch (err) {
    console.error("createDemande ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/demandes/:id
const updateDemande = async (req, res) => {
  try {
    const demande = await DemandeService.findByPk(req.params.id);
    if (!demande) return res.status(404).json({ error: "Demande non trouvée" });
    await demande.update(req.body);
    res.json(demande);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/demandes/:id/statut
const updateStatutDemande = async (req, res) => {
  try {
    const { statut, motif_refus } = req.body;
    const { role, id: userId } = req.user;

    // Admin : lecture seule, aucune action sur les statuts
    if (role === "admin") {
      return res.status(403).json({
        error: "L'administrateur ne peut pas modifier le statut d'une demande.",
      });
    }

    const STATUTS_VALIDES = ["en_attente", "en_cours", "termine", "annule"];
    if (!STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ error: `Statut invalide: ${statut}` });
    }

    const demande = await DemandeService.findByPk(req.params.id, {
      include: [{ model: Service }],
    });
    if (!demande) return res.status(404).json({ error: "Demande introuvable" });

    // ── Règles métier ────────────────────────────────────────────────

    if (statut === "en_cours") {
      // Seul un fournisseur peut accepter
      if (role !== "fournisseur") {
        return res.status(403).json({ error: "Seul un fournisseur peut accepter une demande." });
      }
      // La demande doit être en_attente
      if (demande.statut !== "en_attente") {
        return res.status(409).json({
          error: "Cette demande a déjà été acceptée par un autre fournisseur.",
        });
      }
    }

    if (statut === "termine") {
      // Seul le fournisseur assigné peut terminer
      if (role !== "fournisseur") {
        return res.status(403).json({
          error: "Seul le fournisseur assigné peut marquer une demande comme terminée.",
        });
      }
      if (demande.fournisseurId !== userId) {
        return res.status(403).json({
          error: "Seul le fournisseur assigné à cette demande peut la marquer comme terminée.",
        });
      }
      if (demande.statut !== "en_cours") {
        return res.status(400).json({
          error: "La demande doit être en cours avant de pouvoir être terminée.",
        });
      }
    }

    if (statut === "annule") {
      if (role === "fournisseur" && demande.statut !== "en_attente") {
        return res.status(403).json({
          error: "Impossible de refuser une demande déjà acceptée.",
        });
      }
    }

    // ── Mise à jour ──────────────────────────────────────────────────
    const updateData = {
      statut,
      ...(motif_refus && { motif_refus }),
    };

    // Assigner le fournisseur quand il accepte
    if (statut === "en_cours" && role === "fournisseur") {
      updateData.fournisseurId = userId;
    }

    await demande.update(updateData);

    // Créer paiement automatiquement si acceptée
    if (statut === "en_cours") {
      const paiementExistant = await Paiement.findOne({
        where: { demandeServiceId: demande.id },
      });
      if (!paiementExistant) {
        const montant = demande.Service?.prix || 0;
        await Paiement.create({
          demandeServiceId: demande.id,
          montant,
          statut: "en_attente",
          methode: "a_definir",
        });
        console.log(`✅ Paiement créé pour demande #${demande.id} — ${montant} MAD`);
      }
    }

    res.json({ message: "Statut mis à jour", demande });
  } catch (err) {
    console.error("updateStatutDemande ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// =====================================
// ÉTAPE 7 : Ajouter au demandeController.js
// =====================================
// Ajoutez ces 2 fonctions à controllers/demandeController.js :

// ── FOURNISSEUR MARQUE TERMINÉ ────────────────────────
const marquerTermine = async (req, res) => {
  try {
    const { id } = req.params;
    const demande = await DemandeService.findByPk(id);

    if (!demande) return res.status(404).json({ error: "Demande non trouvée." });

    // Vérifier que c'est bien le fournisseur
    if (demande.fournisseur_id !== req.user.id) {
      return res.status(403).json({ error: "Non autorisé." });
    }

    // Vérifier que la demande est en cours
    if (demande.statut !== "en_cours") {
      return res.status(400).json({
        error: "La demande n'est pas en cours.",
      });
    }

    // Passer au statut "pret_validation" (en attente de validation client)
    await demande.update({
      statut: "pret_validation",
    });

    res.json({
      message: "Prestation marquée comme terminée. En attente de validation du client.",
      demande,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── CLIENT VALIDE OU REJETTE ──────────────────────────
const validerPrestation = async (req, res) => {
  try {
    const { id } = req.params;
    const { valide, motif } = req.body; // valide: true/false, motif: raison du rejet

    const demande = await DemandeService.findByPk(id);
    if (!demande) return res.status(404).json({ error: "Demande non trouvée." });

    // Vérifier que c'est bien le client
    if (demande.client_id !== req.user.id) {
      return res.status(403).json({ error: "Non autorisé." });
    }

    // Vérifier que la demande est en attente de validation
    if (demande.statut !== "pret_validation") {
      return res.status(400).json({
        error: "Cette demande n'est pas en attente de validation.",
      });
    }

    if (valide) {
      // CLIENT VALIDE : marquer comme complétée et créer paiement
      await demande.update({
        statut: "completee",
        date_validation: new Date(),
      });

      // Créer automatiquement un paiement
      const { Paiement } = require("../models/associations");
      const service = await demande.getService();

      const paiement = await Paiement.create({
        demande_id: demande.id,
        montant: service.prix,
        statut: "en_attente", // Client n'a pas encore payé
      });

      res.json({
        message: "Prestation validée ! Paiement créé en attente.",
        demande,
        paiement,
      });
    } else {
      // CLIENT REJETTE : demander de recommencer
      if (!motif) {
        return res.status(400).json({
          error: "Veuillez indiquer un motif de rejet.",
        });
      }

      await demande.update({
        statut: "en_cours", // Rerevenir à en cours
        motif_rejet_validation: motif,
      });

      res.json({
        message: "Prestation rejetée. Le fournisseur a été notifié.",
        demande,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ajoutez à module.exports :
// marquerTermine, validerPrestation

module.exports = {
  getAllDemandes,
  getMyDemandes,
  createDemande,
  updateDemande,
  updateStatutDemande,
  marquerTermine,
  validerPrestation
};