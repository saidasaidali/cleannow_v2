const { Evaluation, DemandeService, Service, User } = require("../models/associations");

// GET /api/evaluations
const getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.findAll({
      include: [
        {
          model: DemandeService,
          include: [
            { model: Service },
            {
              model: User,
              as: "Beneficiaire",
              attributes: ["id", "nom", "email"],
            },
            {
              model: User,
              as: "Fournisseur",
              attributes: ["id", "nom", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(evaluations);
  } catch (err) {
    console.error("getAllEvaluations ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/evaluations
const createEvaluation = async (req, res) => {
  try {
    const { note, commentaire, demandeServiceId } = req.body;
    const evaluation = await Evaluation.create({
      note,
      commentaire,
      demandeServiceId,
    });
    res.status(201).json(evaluation);
  } catch (err) {
    console.error("createEvaluation ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/evaluations/:id
const updateEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation)
      return res.status(404).json({ error: "Évaluation non trouvée" });
    await evaluation.update(req.body);
    res.json(evaluation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAllEvaluations, createEvaluation, updateEvaluation };