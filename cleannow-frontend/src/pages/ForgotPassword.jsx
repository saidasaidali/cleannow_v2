// =====================================
// ÉTAPE 12 : Composant ForgotPassword
// =====================================
// Créez src/pages/ForgotPassword.jsx :

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordAPI } from '../api/axios';
import Alert from '../components/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setAlert({ type: 'error', message: 'Veuillez entrer votre email.' });
      return;
    }

    setLoading(true);
    try {
      const res = await passwordAPI.forgotPassword(email);
      setAlert({ type: 'success', message: res.data.message });
      setSent(true);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erreur lors de la demande.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <h2>Réinitialiser votre mot de passe</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
      
      {!sent ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 10,
              background: loading ? '#ccc' : '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
      ) : (
        <div style={{ background: 'rgba(16,185,129,0.1)', padding: 15, borderRadius: 5 }}>
          <p style={{ color: '#10b981', marginBottom: 10 }}>
            ✅ Email envoyé ! Vérifiez votre boîte de réception (et vos spams).
          </p>
          <p style={{ color: '#666', fontSize: 14 }}>
            Le lien expire dans 1 heure.
          </p>
        </div>
      )}

      <p style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
        <Link to="/login" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}