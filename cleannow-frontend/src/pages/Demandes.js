import React, { useEffect, useState } from 'react';
import { demandesAPI } from '../api/axios';
import CardDemande from '../components/CardDemande';
import Alert from '../components/Alert';

export default function Demandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterStatut, setFilterStatut] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await demandesAPI.getAll();
      setDemandes(res.data);
    } catch {
      setAlert({ type: 'error', message: 'Impossible de charger les demandes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdateStatut = async (id, statut) => {
    try {
      await demandesAPI.updateStatut(id, statut);
      setAlert({ type: 'success', message: 'Statut mis à jour.' });
      load();
    } catch {
      setAlert({ type: 'error', message: 'Erreur lors de la mise à jour.' });
    }
  };

  const filtered = demandes.filter((d) => {
    const matchStatut = filterStatut === 'all' || d.statut === filterStatut;
    const matchSearch = !search || (d.beneficiaire_nom || '').toLowerCase().includes(search.toLowerCase()) || String(d.id).includes(search);
    return matchStatut && matchSearch;
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Toutes les demandes</h1>
          <p style={styles.subtitle}>{demandes.length} demande{demandes.length !== 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={styles.toolbar}>
        <div style={styles.searchBar}>
          <span>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par ID ou client..." style={styles.searchInput} />
        </div>
        <div style={styles.tabs}>
          {['all', 'en_attente', 'en_cours', 'termine', 'annule'].map((s) => (
            <button key={s} onClick={() => setFilterStatut(s)} style={{ ...styles.tab, ...(filterStatut === s ? styles.tabActive : {}) }}>
              {s === 'all' ? 'Toutes' : s.replace('_', ' ')}
              <span style={styles.tabCount}>{s === 'all' ? demandes.length : demandes.filter((d) => d.statut === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.center}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}><span style={{ fontSize: 48 }}>📭</span><p>Aucune demande trouvée</p></div>
      ) : (
        <div style={styles.list}>
          {filtered.map((d) => (
            <CardDemande key={d.id} demande={d} isAdmin onUpdateStatut={handleUpdateStatut} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header: { marginBottom: 24 },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  toolbar: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(14,165,233,0.2)',
    borderRadius: 10, padding: '0 16px', flex: 1, minWidth: 200,
  },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '12px 0' },
  tabs: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)',
    color: 'var(--muted)', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize',
  },
  tabActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  tabCount: { background: 'rgba(14,165,233,0.2)', color: 'var(--sky)', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
};
