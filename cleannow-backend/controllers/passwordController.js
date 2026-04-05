// =====================================
// ÉTAPE 3 : Créer le controller password
// =====================================
// Créez controllers/passwordController.js :

const { User } = require("../models/associations");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// ── Configuration mail ────────────────────────────────
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── REQUEST PASSWORD RESET ────────────────────────────
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requis." });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Ne pas révéler si l'email existe (sécurité)
      return res.status(200).json({
        message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    }

    // Générer token unique (32 caractères)
    const resetToken = crypto.randomBytes(16).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 heure

    await user.update({
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires,
    });

    // URL du frontend
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendURL}/reset-password?token=${resetToken}`;

    // Envoyer email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "CleanNow - Réinitialiser votre mot de passe",
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous (valide 1 heure) :</p>
        <a href="${resetLink}" style="background: #0ea5e9; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ou copiez ce lien :</p>
        <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${resetLink}
        </p>
        <p>Si vous n'avez pas demandé cela, ignorez cet email.</p>
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Erreur envoi email :", err);
        return res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
      }
      res.json({
        message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    });
  } catch (err) {
    console.error("Erreur :", err);
    res.status(500).json({ error: err.message });
  }
};

// ── RESET PASSWORD ────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    const user = await User.findOne({
      where: { reset_token: token },
    });

    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré." });
    }

    // Vérifier que le token n'a pas expiré
    if (user.reset_token_expires < new Date()) {
      await user.update({
        reset_token: null,
        reset_token_expires: null,
      });
      return res.status(400).json({ error: "Token expiré. Demandez une nouvelle réinitialisation." });
    }

    // Hasher le nouveau mot de passe
    const hash = await bcrypt.hash(password, 10);

    await user.update({
      mot_de_passe: hash,
      reset_token: null,
      reset_token_expires: null,
    });

    res.json({ message: "Mot de passe réinitialisé avec succès !" });
  } catch (err) {
    console.error("Erreur :", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};