const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const { connectDB, sequelize } = require("./config/db");
const { User, Service, DemandeService, Paiement, Evaluation } = require("./models/associations");

// Routes
const authRoutes      = require("./routes/auth");
const serviceRoutes   = require("./routes/services");
const demandeRoutes   = require("./routes/demandes");
const paiementRoutes  = require("./routes/paiements");
const evaluationRoutes = require("./routes/evaluations");
const userRoutes      = require("./routes/users");

const app = express();

// ── CORS ─────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://cleannow-sable.vercel.app",  // ← votre frontend Vercel
  process.env.FRONTEND_URL,             // ← variable Railway si besoin
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, Railway shell, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué pour : ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Middleware ────────────────────────────────────────
app.use(express.json());

// ── Connexion DB ──────────────────────────────────────
connectDB();

// ── Synchronisation tables ────────────────────────────
sequelize.sync({ alter: true })
  .then(() => console.log("✅ Toutes les tables sont synchronisées !"))
  .catch((err) => console.error("❌ Erreur de synchronisation :", err));

// ── Routes ────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/services",    serviceRoutes);
app.use("/api/demandes",    demandeRoutes);
app.use("/api/paiements",   paiementRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/users",       userRoutes);

// ── Route de test ─────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "API CleanNow fonctionne 🚀", version: "1.0.0" });
});

// ── ROUTE TEMPORAIRE — créer admin ────────────────────
// À SUPPRIMER après avoir créé le compte admin
app.get("/setup-admin", async (req, res) => {
  try {
    const bcrypt = require("bcrypt");
    const { User } = require("./models/associations");

    // Vérifier si admin existe déjà
    const existing = await User.findOne({ where: { email: "admin@cleannow.ma" } });
    if (existing) {
      return res.json({ message: "Admin existe déjà", email: existing.email });
    }

    const hash = await bcrypt.hash("Admin1234!", 10);
    const user = await User.create({
      nom:          "Administrateur",
      email:        "admin@cleannow.ma",
      mot_de_passe: hash,
      role:         "admin",
      statut:       "actif",
    });
    res.json({ message: "✅ Admin créé avec succès !", email: user.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Démarrage serveur ─────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});