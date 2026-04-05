// =====================================
// ÉTAPE 13 : Composant Profil
// =====================================
// Créez src/pages/ProfilPage.jsx :

import React, { useState, useEffect } from 'react';
import { usersAPI, profilAPI } from '../api/axios';
import Alert from '../components/Alert';

export default function ProfilPage() {
  const currentUser = JSON.parse(localStorage.getItem('cleannow_user') || '{}');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await usersAPI.getOne(currentUser.id);
      setUser(res.data);
      setFormData({
        nom: res.data.nom,
        email: res.data.email,
        telephone: res.data.telephone || '',
        adresse: res.data.adresse || '',
      });
      setLoading(false);
    } catch (err) {
      setAlert({ type: 'error', message: 'Erreur lors du chargement du profil.' });
      setLoading(false);
    }
  };

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    try {
      await profilAPI.updateProfil(currentUser.id, formData);
      setAlert({ type: 'success', message: 'Profil mis à jour !' });
      setEditMode(false);
      fetchUser();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erreur' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'Le mot de passe doit faire au moins 6 caractères.' });
      return;
    }

    try {
      await profilAPI.changePassword(currentUser.id, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setAlert({ type: 'success', message: 'Mot de passe changé !' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erreur' });
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>;
  if (!user) return <div style={{ padding: 20 }}>Erreur</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <h2>Mon Profil</h2>
      
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      {/* SECTION PROFIL */}
      <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 10, marginBottom: 30 }}>
        {editMode ? (
          <form onSubmit={handleUpdateProfil} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom"
              style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
            />
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="Téléphone"
              style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
            />
            <textarea
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              placeholder="Adresse"
              style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5, minHeight: 80 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: 10,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                style={{
                  flex: 1,
                  padding: 10,
                  background: '#ccc',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#666' }}>Nom</label>
              <p style={{ margin: '5px 0 0 0', fontSize: 16, fontWeight: 'bold' }}>{user.nom}</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#666' }}>Email</label>
              <p style={{ margin: '5px 0 0 0', fontSize: 16 }}>{user.email}</p>
            </div>
            {user.telephone && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Téléphone</label>
                <p style={{ margin: '5px 0 0 0', fontSize: 16 }}>{user.telephone}</p>
              </div>
            )}
            {user.adresse && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Adresse</label>
                <p style={{ margin: '5px 0 0 0', fontSize: 16 }}>{user.adresse}</p>
              </div>
            )}
            <button
              onClick={() => setEditMode(true)}
              style={{
                width: '100%',
                marginTop: 15,
                padding: 10,
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ✏️ Modifier
            </button>
          </>
        )}
      </div>

      {/* SECTION MOT DE PASSE */}
      <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 10 }}>
        <h3>Changer le mot de passe</h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
            placeholder="Ancien mot de passe"
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
            required
          />
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            placeholder="Nouveau mot de passe"
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
            required
          />
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            placeholder="Confirmer le mot de passe"
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
            required
          />
          <button
            type="submit"
            style={{
              padding: 10,
              background: '#f43f5e',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Changer le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}