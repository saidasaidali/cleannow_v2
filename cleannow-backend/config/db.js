const { Sequelize } = require("sequelize");
require("dotenv").config();


console.log("DEBUG DB PASSWORD:", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASSWORD), // <-- ajoute .toString()
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), // utilise la variable d'env
    dialect: "postgres",
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connecté !");
  } catch (error) {
    console.error("❌ Erreur DB :", error);
  }
};

module.exports = { sequelize, connectDB };