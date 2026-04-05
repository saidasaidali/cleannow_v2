// =====================================
// ÉTAPE 14 : Composant HistoriqueFournisseur
// =====================================
// Créez src/pages/HistoriqueFournisseur.jsx :

import React, { useState, useEffect } from 'react';
import { profilAPI } from '../api/axios';
import Alert from '../components/Alert';

export default function HistoriqueFournisseur() {
  const currentUser = JSON.parse(localStorage.getItem('cleannow_user') || '{}');
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filtre, setFiltre] = useState('all'); // all, completee, en_cours, etc.

  useEffect(() => {
    fetchHistorique();
    // Refresh toutes les 30 secondes
    const interval = setInterval(fetchHistorique, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistorique = async () => {
    try {
      const res = await profilAPI.getHistoriqueFournisseur(currentUser.id);
      setDemandes(res.data.demandes);
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      setAlert({ type: 'error', message: 'Erreur lors du chargement de l\'historique.' });
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>;

  const demandesFiltrees = filtre === 'all' 
    ? demandes 
    : demandes.filter(d => d.statut === filtre);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <h2>📊 Historique et statistiques</h2>
      
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      {/* STATISTIQUES */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 15, marginBottom: 30 }}>
          <div style={{ background: '#e0f2fe', padding: 15, borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#666' }}>Total demandes</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#0ea5e9' }}>{stats.total_demandes}</p>
          </div>
          <div style={{ background: '#dcfce7', padding: 15, borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#666' }}>Complétées</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{stats.completees}</p>
          </div>
          <div style={{ background: '#fef3c7', padding: 15, borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#666' }}>En cours</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>{stats.en_cours}</p>
          </div>
          <div style={{ background: '#fce7f3', padding: 15, borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#666' }}>Revenu total</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#ec4899' }}>
              {stats.revenue_total.toFixed(2)} DH
            </p>
          </div>
          <div style={{ background: '#f3e8ff', padding: 15, borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#666' }}>Note moyenne</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#a855f7' }}>
              {stats.note_moyenne.toFixed(1)} ⭐
            </p>
          </div>
        </div>
      )}

      {/* FILTRES */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {['all', 'completee', 'en_cours', 'pret_validation', 'refusee'].map((s) => (
          <button
            key={s}
            onClick={() => setFiltre(s)}
            style={{
              padding: '8px 16px',
              background: filtre === s ? '#0ea5e9' : '#e5e7eb',
              color: filtre === s ? 'white' : '#666',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              fontWeight: filtre === s ? 'bold' : 'normal',
            }}
          >
            {s === 'all' ? 'Toutes' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* LISTE DEMANDES */}
      {demandesFiltrees.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>Aucune demande trouvée.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {demandesFiltrees.map((demande) => (
            <div
              key={demande.id}
              style={{
                border: '1px solid #ddd',
                padding: 15,
                borderRadius: 10,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: 16 }}>
                    {demande.Service?.nom}
                  </p>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: 14 }}>
                    Créé le {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>
                    {demande.Service?.prix} DH
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '5px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 'bold',
                      background:
                        demande.statut === 'completee' ? '#dcfce7' :
                        demande.statut === 'en_cours' ? '#fef3c7' :
                        demande.statut === 'pret_validation' ? '#fce7f3' :
                        demande.statut === 'refusee' ? '#fee2e2' :
                        '#e5e7eb',
                      color:
                        demande.statut === 'completee' ? '#10b981' :
                        demande.statut === 'en_cours' ? '#f59e0b' :
                        demande.statut === 'pret_validation' ? '#ec4899' :
                        demande.statut === 'refusee' ? '#ef4444' :
                        '#666',
                    }}
                  >
                    {demande.statut}
                  </span>
                </div>
              </div>

              {/* ÉVALUATION */}
              {demande.Evaluation && (
                <div style={{ marginTop: 10, padding: 10, background: '#f0f0f0', borderRadius: 5 }}>
                  <p style={{ margin: 0, fontSize: 14 }}>
                    ⭐ {demande.Evaluation.note}/5 - {demande.Evaluation.commentaire}
                  </p>
                </div>
              )}

              {/* MOT DE PASSE REJETÉ */}
              {demande.motif_rejet_validation && (
                <div style={{ marginTop: 10, padding: 10, background: '#fee2e2', borderRadius: 5 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#ef4444' }}>
                    ⚠️ Motif rejet : {demande.motif_rejet_validation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}