const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Paiement = sequelize.define("Paiement", {
  montant: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM("en_attente", "effectue", "echoue"),
    defaultValue: "en_attente",
  },
  methode: {
    type: DataTypes.STRING, // "carte", "virement", "especes", "a_definir"
    allowNull: true,
  },
  date_paiement: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Paiement;