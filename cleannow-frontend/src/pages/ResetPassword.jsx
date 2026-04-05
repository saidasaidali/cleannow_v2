// =====================================
// ÉTAPE 11 : Composant ResetPassword
// =====================================
// Créez src/pages/ResetPassword.jsx :

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { passwordAPI } from '../api/axios';
import Alert from '../components/Alert';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setAlert({ type: 'error', message: 'Token manquant !' });
      return;
    }
    
    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    
    if (password.length < 6) {
      setAlert({ type: 'error', message: 'Le mot de passe doit faire au moins 6 caractères.' });
      return;
    }

    setLoading(true);
    try {
      const res = await passwordAPI.resetPassword(token, password);
      setAlert({ type: 'success', message: res.data.message });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erreur lors de la réinitialisation.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <h2>Réinitialiser votre mot de passe</h2>
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
          required
        />
        <input
          type="password"
          placeholder="Confirmez le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Réinitialisation...' : 'Réinitialiser'}
        </button>
      </form>
    </div>
  );
}