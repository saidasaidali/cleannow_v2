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


// =====================================
// ÉTAPE 4 : Ajouter au userController.js
// =====================================
// Copiez-collez ces 4 nouvelles fonctions à la FIN de controllers/userController.js :

// ── UPDATE PROFIL (utilisateur standard) ──────────────
const updateProfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone, adresse, disponibilite } = req.body;

    // L'utilisateur ne peut modifier que son propre profil, sauf les admins
    if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Non autorisé." });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

    // Vérifier unicité email
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }
    }

    const updates = {};
    if (nom) updates.nom = nom;
    if (email) updates.email = email;
    if (telephone) updates.telephone = telephone;
    if (adresse) updates.adresse = adresse;
    if (disponibilite) updates.disponibilite = disponibilite; // fournisseur seulement

    await user.update(updates);

    res.json({
      message: "Profil mis à jour avec succès.",
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        disponibilite: user.disponibilite,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── CHANGER MOT DE PASSE (utilisateur standard) ──────
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // L'utilisateur ne peut changer que son propre mot de passe
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: "Non autorisé." });
    }

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: "Ancien et nouveau mot de passe requis. Minimum 6 caractères.",
      });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

    // Vérifier ancien mot de passe
    const isMatch = await require("bcrypt").compare(oldPassword, user.mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ error: "Ancien mot de passe incorrect." });
    }

    // Hasher nouveau mot de passe
    const hash = await require("bcrypt").hash(newPassword, 10);
    await user.update({ mot_de_passe: hash });

    res.json({ message: "Mot de passe changé avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET DEMANDES HISTORIQUE (fournisseur) ──────────────
const getHistoriqueFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.query; // optionnel : filtrer par statut

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
    if (user.role !== "fournisseur") {
      return res.status(400).json({ error: "Cet utilisateur n'est pas un fournisseur." });
    }

    const { DemandeService, Service, Evaluation } = require("../models/associations");

    const where = { fournisseur_id: id };
    if (statut) where.statut = statut;

    const demandes = await DemandeService.findAll({
      where,
      include: [
        { model: Service, attributes: ["nom", "prix"] },
        { model: Evaluation, attributes: ["note", "commentaire"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Statistiques
    const stats = {
      total_demandes: demandes.length,
      completees: demandes.filter((d) => d.statut === "completee").length,
      en_cours: demandes.filter((d) => d.statut === "en_cours").length,
      revenue_total: demandes
        .filter((d) => d.statut === "completee")
        .reduce((sum, d) => sum + (d.Service?.prix || 0), 0),
      note_moyenne: demandes
        .filter((d) => d.Evaluation)
        .reduce((sum, d) => sum + (d.Evaluation?.note || 0), 0) / demandes.filter((d) => d.Evaluation).length || 0,
    };

    res.json({ demandes, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET NOTIFICATIONS FOURNISSEUR ──────────────────────
const getNotificationsFournisseur = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
    if (user.role !== "fournisseur") {
      return res.status(400).json({ error: "Cet utilisateur n'est pas un fournisseur." });
    }

    const { DemandeService } = require("../models/associations");

    // Demandes NON LUES (en attente d'action)
    const demandesNonLues = await DemandeService.findAll({
      where: {
        fournisseur_id: id,
        statut: "en_attente", // demande reçue mais pas encore acceptée/refusée
      },
      attributes: ["id", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    // Demandes à valider par le client
    const demandesAValider = await DemandeService.findAll({
      where: {
        fournisseur_id: id,
        statut: "pret_validation", // fournisseur a marqué terminé, attend confirmation client
      },
      attributes: ["id", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const unreadCount = demandesNonLues.length + demandesAValider.length;

    res.json({
      unreadCount,
      demandesNonLues,
      demandesAValider,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// N'oubliez pas d'exporter les nouvelles fonctions !
// Remplacez module.exports par :
module.exports = {
  registerUser, loginUser,
  getAllUsers, getUserById,
  createUser, updateUser, deleteUser,
  validerFournisseur, rejeterFournisseur,
  updateProfil, changePassword, getHistoriqueFournisseur, getNotificationsFournisseur,
};
