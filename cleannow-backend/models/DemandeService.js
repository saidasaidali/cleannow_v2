const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DemandeService = sequelize.define("DemandeService", {
  statut: {
    type: DataTypes.ENUM("en_attente", "en_cours", "termine", "annule"),
    defaultValue: "en_attente",
  },
  date_demande: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  motif_refus: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Fournisseur qui a accepté la demande
  fournisseurId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = DemandeService;