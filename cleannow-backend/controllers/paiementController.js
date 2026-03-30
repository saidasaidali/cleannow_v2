const { Paiement, DemandeService, Service, User } = require("../models/associations");

// GET /api/paiements
const getAllPaiements = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let demandeWhere = {};
    if (role === "beneficiaire") demandeWhere = { beneficiaireId: userId };

    const paiements = await Paiement.findAll({
      include: [{
        model: DemandeService,
        where: Object.keys(demandeWhere).length ? demandeWhere : undefined,
        include: [
          { model: Service },
          { model: User, as: "Beneficiaire", attributes: ["id", "nom", "email"] },
          { model: User, as: "Fournisseur",  attributes: ["id", "nom", "email"] },
        ],
      }],
      order: [["createdAt", "DESC"]],
    });

    if (role === "fournisseur") {
      return res.json(paiements.filter(p => p.DemandeService?.fournisseurId === userId));
    }

    res.json(paiements);
  } catch (err) {
    console.error("getAllPaiements ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const createPaiement = async (req, res) => {
  try {
    const { montant, demandeServiceId, statut, methode } = req.body;
    const paiement = await Paiement.create({ montant, demandeServiceId, statut, methode });
    res.status(201).json(paiement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/paiements/:id — SEUL le client bénéficiaire
const updatePaiement = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === "admin")
      return res.status(403).json({ error: "L'administrateur ne peut pas modifier un paiement." });
    if (role === "fournisseur")
      return res.status(403).json({ error: "Le fournisseur ne peut pas modifier un paiement." });

    const paiement = await Paiement.findByPk(req.params.id, {
      include: [{ model: DemandeService }],
    });
    if (!paiement) return res.status(404).json({ error: "Paiement non trouvé" });

    if (paiement.DemandeService?.beneficiaireId !== userId)
      return res.status(403).json({ error: "Accès refusé." });

    if (req.body.statut === "effectue" && paiement.DemandeService?.statut !== "termine")
      return res.status(403).json({ error: "La prestation doit être terminée avant de payer." });

    await paiement.update(req.body);
    res.json(paiement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/paiements/:id/effectue — SEUL le client bénéficiaire
const marquerEffectue = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === "admin")
      return res.status(403).json({ error: "L'administrateur ne peut pas confirmer un paiement." });
    if (role === "fournisseur")
      return res.status(403).json({ error: "Le fournisseur ne peut pas confirmer un paiement." });

    const paiement = await Paiement.findByPk(req.params.id, {
      include: [{ model: DemandeService }],
    });
    if (!paiement) return res.status(404).json({ error: "Paiement non trouvé" });

    if (paiement.DemandeService?.beneficiaireId !== userId)
      return res.status(403).json({ error: "Accès refusé." });

    if (paiement.DemandeService?.statut !== "termine")
      return res.status(403).json({ error: "La prestation doit être terminée avant de payer." });

    await paiement.update({ statut: "effectue", date_paiement: new Date() });
    res.json({ message: "Paiement effectué avec succès", paiement });
  } catch (err) {
    console.error("marquerEffectue ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllPaiements, createPaiement, updatePaiement, marquerEffectue };