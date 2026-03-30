const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Evaluation = sequelize.define("Evaluation", {
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Evaluation;