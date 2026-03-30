const { Service } = require("../models/associations");

// Récupérer tous les services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ajouter un service (admin ou fournisseur)
const createService = async (req, res) => {
  try {
    const { nom, description, prix } = req.body;
    const service = await Service.create({ nom, description, prix });
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mettre à jour un service
const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: "Service non trouvé" });

    await service.update(req.body);
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: "Service non trouvé" });

    await service.destroy();
    res.json({ message: "Service supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllServices, createService, updateService, deleteService };