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
    defaultValue: "actif", // bénéficiaire → actif direct
  },
  cv_url: {
    type: DataTypes.STRING,
    allowNull: true, // optionnel pour fournisseur
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;