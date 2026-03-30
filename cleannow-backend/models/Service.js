const { DataTypes } = require("sequelize"); // ✅ depuis sequelize
const { sequelize } = require("../config/db");

const Service = sequelize.define("Service", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prix: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = Service;