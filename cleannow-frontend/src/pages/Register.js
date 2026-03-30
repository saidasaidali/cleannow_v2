import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/axios';
import Alert from '../components/Alert';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '', email: '', password: '', confirmPassword: '',
    role: 'beneficiaire', telephone: '', adresse: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setAlert({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (form.password.length < 6) {
      setAlert({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        nom: form.nom, email: form.email,
        password: form.password, role: form.role,
        telephone: form.telephone, adresse: form.adresse,
      });

      if (form.role === 'fournisseur') {
        // Fournisseur → message d'attente, pas de redirection
        setSuccess(true);
        setAlert({ type: 'success', message: res.data.message });
      } else {
        // Bénéficiaire → redirection login
        setAlert({ type: 'success', message: 'Compte créé ! Vous pouvez maintenant vous connecter.' });
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erreur lors de l\'inscription.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
            <h2 style={{ ...styles.title, fontSize: 24, marginBottom: 12 }}>Inscription reçue !</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Votre demande en tant que <strong style={{ color: '#0ea5e9' }}>fournisseur</strong> a été envoyée.<br />
              Un administrateur va vérifier vos informations et vous notifier.
            </p>
            <div style={styles.waitBox}>
              <p style={{ fontSize: 13, color: '#f59e0b', margin: 0 }}>
                ⏳ Votre compte est en attente de validation.
              </p>
            </div>
            <Link to="/login" style={styles.backBtn}>← Retour à la connexion</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logo}>✦ CleanNow</span>
        </div>
        <h1 style={styles.title}>Créer un compte</h1>
        <p style={styles.subtitle}>Rejoignez la plateforme CleanNow</p>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Choix du rôle — PAS d'option admin */}
          <div style={styles.roleSelector}>
            {[
              { value: 'beneficiaire', label: '👤 Bénéficiaire', desc: 'Je cherche un service de nettoyage' },
              { value: 'fournisseur',  label: '🔧 Fournisseur',  desc: 'Je propose des services de nettoyage' },
            ].map((r) => (
              <button key={r.value} type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                style={{ ...styles.roleBtn, ...(form.role === r.value ? styles.roleBtnActive : {}) }}>
                <span style={styles.roleIcon}>{r.label}</span>
                <span style={styles.roleDesc}>{r.desc}</span>
              </button>
            ))}
          </div>

          {/* Message info fournisseur */}
          {form.role === 'fournisseur' && (
            <div style={styles.infoBox}>
              ℹ️ Les comptes fournisseurs nécessitent une <strong>validation par l'administrateur</strong> avant d'être activés.
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Nom complet *</label>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required placeholder="Prénom Nom" style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              required placeholder="votre@email.com" style={styles.input} />
          </div>

          {/* Champs supplémentaires pour fournisseur */}
          {form.role === 'fournisseur' && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Téléphone *</label>
                <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  required placeholder="+212 6XX XXX XXX" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Adresse / Zone d'intervention *</label>
                <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  required placeholder="Ex: Casablanca, Hay Hassani" style={styles.input} />
              </div>
            </>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              required placeholder="Minimum 6 caractères" style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirmer le mot de passe *</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required placeholder="Répétez le mot de passe" style={styles.input} />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}>
            {loading ? '⏳ Création...' : form.role === 'fournisseur' ? '📋 Soumettre ma candidature' : '→ Créer mon compte'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--sky)' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' },
  card: { background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' },
  logoRow: { textAlign: 'center', marginBottom: 24 },
  logo: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--sky)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  roleSelector: { display: 'flex', gap: 10, marginBottom: 4 },
  roleBtn: { flex: 1, padding: '12px 10px', borderRadius: 12, border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(15,23,42,0.4)', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4 },
  roleBtnActive: { border: '1px solid rgba(14,165,233,0.6)', background: 'rgba(14,165,233,0.1)' },
  roleIcon: { fontSize: 13, fontWeight: 700, color: '#fff' },
  roleDesc: { fontSize: 11, color: 'var(--muted)' },
  infoBox: { background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
  waitBox: { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  submitBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  loginLink: { textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' },
  backBtn: { display: 'inline-block', marginTop: 16, color: 'var(--sky)', fontSize: 14, textDecoration: 'none' },
};