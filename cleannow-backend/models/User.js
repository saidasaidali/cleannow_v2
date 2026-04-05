// =====================================
// ÉTAPE 1 : Mettre à jour le modèle User
// =====================================
// Remplacez le contenu de models/User.js par :

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("beneficiaire", "fournisseur", "admin"),
    allowNull: false,
    defaultValue: "beneficiaire",
  },
  statut: {
    type: DataTypes.ENUM("actif", "en_attente", "suspendu"),
    allowNull: false,
    defaultValue: "actif",
  },
  cv_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // ✨ NOUVEAU : Réinitialisation mot de passe
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // ✨ NOUVEAU : Statut disponibilité (pour fournisseur)
  disponibilite: {
    type: DataTypes.ENUM("disponible", "indisponible"),
    allowNull: false,
    defaultValue: "disponible",
  },
});

module.exports = User;