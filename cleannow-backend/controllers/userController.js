const { User } = require("../models/associations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ── REGISTER ──────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { nom, email, password, role, telephone, adresse } = req.body;

    // Bloquer création admin via register public
    if (role === 'admin') {
      return res.status(403).json({
        error: "La création d'un compte administrateur n'est pas autorisée via l'inscription publique."
      });
    }

    const hash = await bcrypt.hash(password, 10);

    // Fournisseur → en_attente (validation admin requise)
    // Bénéficiaire → actif direct
    const statut = role === 'fournisseur' ? 'en_attente' : 'actif';

    const user = await User.create({
      nom, email, mot_de_passe: hash,
      role: role || 'beneficiaire',
      statut,
      telephone: telephone || null,
      adresse: adresse || null,
    });

    const message = role === 'fournisseur'
      ? "Compte créé ! Votre profil est en attente de validation par un administrateur."
      : "Compte créé avec succès !";

    res.status(201).json({
      message,
      statut,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role, statut: user.statut },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(password, user.mot_de_passe);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect." });

    // Bloquer les comptes en attente ou suspendus
    if (user.statut === 'en_attente') {
      return res.status(403).json({
        error: "Votre compte est en attente de validation par un administrateur. Vous serez notifié par email.",
        statut: 'en_attente',
      });
    }
    if (user.statut === 'suspendu') {
      return res.status(403).json({
        error: "Votre compte a été suspendu. Contactez l'administrateur.",
        statut: 'suspendu',
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Connecté !",
      token,
      user: {
        id: user.id, nom: user.nom, email: user.email,
        role: user.role, statut: user.statut,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET ALL USERS ─────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, statut } = req.query;
    const where = {};
    if (role) where.role = role;
    if (statut) where.statut = statut;

    const users = await User.findAll({
      where,
      attributes: { exclude: ["mot_de_passe"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET USER BY ID ────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["mot_de_passe"] },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── CREATE USER (admin) ───────────────────────────────
const createUser = async (req, res) => {
  try {
    const { nom, email, password, role, telephone, adresse } = req.body;
    if (!['fournisseur', 'beneficiaire', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide." });
    }
    const hash = await bcrypt.hash(password || "CleanNow2024!", 10);
    // Admin crée directement avec statut actif
    const user = await User.create({
      nom, email, mot_de_passe: hash, role,
      statut: 'actif',
      telephone: telephone || null,
      adresse: adresse || null,
    });
    res.status(201).json({
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role, statut: user.statut },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── UPDATE USER (admin) ───────────────────────────────
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
    const { nom, email, role, password, statut, telephone, adresse } = req.body;
    const updates = { nom, email, role, statut, telephone, adresse };
    if (password) updates.mot_de_passe = await bcrypt.hash(password, 10);
    await user.update(updates);
    res.json({ id: user.id, nom: user.nom, email: user.email, role: user.role, statut: user.statut });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE USER (admin) ───────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
    await user.destroy();
    res.json({ message: "Utilisateur supprimé." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── VALIDER FOURNISSEUR (admin) ───────────────────────
const validerFournisseur = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
    if (user.role !== 'fournisseur') {
      return res.status(400).json({ error: "Cet utilisateur n'est pas un fournisseur." });
    }
    await user.update({ statut: 'actif' });
    res.json({ message: `Fournisseur ${user.nom} validé avec succès.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── REJETER FOURNISSEUR (admin) ───────────────────────
const rejeterFournisseur = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
    await user.update({ statut: 'suspendu' });
    res.json({ message: `Fournisseur ${user.nom} rejeté.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser, loginUser,
  getAllUsers, getUserById,
  createUser, updateUser, deleteUser,
  validerFournisseur, rejeterFournisseur,
};