const { sequelize } = require("../config/db");

const User = require("./User");
const Service = require("./Service");
const DemandeService = require("./DemandeService");
const Paiement = require("./Paiement");
const Evaluation = require("./Evaluation");

// Bénéficiaire (client qui a créé la demande)
User.hasMany(DemandeService, { foreignKey: "beneficiaireId", as: "DemandesBeneficiaire" });
DemandeService.belongsTo(User, { foreignKey: "beneficiaireId", as: "Beneficiaire" });

// Fournisseur (celui qui a accepté la demande)
User.hasMany(DemandeService, { foreignKey: "fournisseurId", as: "DemandesFournisseur" });
DemandeService.belongsTo(User, { foreignKey: "fournisseurId", as: "Fournisseur" });

// Service
Service.hasMany(DemandeService, { foreignKey: "serviceId" });
DemandeService.belongsTo(Service, { foreignKey: "serviceId" });

// Paiement
DemandeService.hasMany(Paiement, { foreignKey: "demandeServiceId" });
Paiement.belongsTo(DemandeService, { foreignKey: "demandeServiceId" });

// Evaluation
DemandeService.hasMany(Evaluation, { foreignKey: "demandeServiceId" });
Evaluation.belongsTo(DemandeService, { foreignKey: "demandeServiceId" });

module.exports = {
  sequelize,
  User,
  Service,
  DemandeService,
  Paiement,
  Evaluation,
};