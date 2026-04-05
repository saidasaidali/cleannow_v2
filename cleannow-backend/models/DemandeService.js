const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DemandeService = sequelize.define("DemandeService", {
  statut: {
  type: DataTypes.ENUM(
    "en_attente",        // Nouvelle demande, fournisseur n'a pas réagi
    "acceptee",          // Fournisseur a accepté
    "en_cours",          // Travail en cours
    "pret_validation",   // ✨ NOUVEAU : Fournisseur a marqué terminé, attend validation client
    "completee",         // ✨ MODIFIÉ : Client a validé (ancien "terminee")
    "refusee",           // Fournisseur a refusé
    "annulee"            // Client a annulé
  ),
  allowNull: false,
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
  // Ajoutez aussi ce champ pour tracker le client qui valide :
  date_validation: {
    type: DataTypes.DATE,
    allowNull: true,  // null tant que le client n'a pas validé
  },
  motif_rejet_validation: {
    type: DataTypes.STRING,
    allowNull: true,  // Si le client refuse la validation 
  },
});

module.exports = DemandeService;