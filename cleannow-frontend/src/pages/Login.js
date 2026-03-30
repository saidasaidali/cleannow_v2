import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />

      <div style={styles.card}>
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>◈</span>
          <h1 style={styles.logoText}>Clean<span style={{ color: 'var(--sky)' }}>Now</span></h1>
          <p style={styles.subtitle}>Connectez-vous à votre espace</p>
        </div>

        {error && (
          <div style={styles.errorBox}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Adresse email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="vous@exemple.com"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? <span style={styles.spinner} /> : '→ Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.link}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, position: 'relative', overflow: 'hidden',
  },
  bgBlob1: {
    position: 'fixed', top: -200, left: -200,
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgBlob2: {
    position: 'fixed', bottom: -200, right: -200,
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(14,165,233,0.2)',
    borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 440,
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    position: 'relative', zIndex: 1,
  },
  logoArea: { textAlign: 'center', marginBottom: 36 },
  logoIcon: { fontSize: 40, color: 'var(--sky)', display: 'block', marginBottom: 8 },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 },
  subtitle: { color: 'var(--muted)', fontSize: 14 },
  errorBox: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#f43f5e', marginBottom: 20,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)', letterSpacing: '0.5px' },
  input: {
    background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)',
    borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14,
    outline: 'none', transition: 'border 0.2s',
  },
  btn: {
    marginTop: 8,
    background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))',
    border: 'none', borderRadius: 10, padding: '14px',
    color: '#fff', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'var(--font-display)',
    letterSpacing: '0.5px', transition: 'opacity 0.2s',
  },
  spinner: {
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--muted)' },
  link: { color: 'var(--sky)', textDecoration: 'none', fontWeight: 600 },
};
