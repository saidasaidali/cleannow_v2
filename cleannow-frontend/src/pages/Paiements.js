import React, { useEffect, useState } from 'react';
import { paiementsAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const STATUS_CONFIG = {
  effectue:   { label: 'Effectué',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '✅' },
  en_attente: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏳' },
  echoue:     { label: 'Échoué',     color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  icon: '✕' },
};

const METHODES = [
  { value: 'carte',    label: '💳 Carte bancaire' },
  { value: 'virement', label: '🏦 Virement' },
  { value: 'especes',  label: '💵 Espèces' },
];

export default function Paiements() {
  const { isAdmin, isFournisseur, isBeneficiaire } = useAuth();
  const [paiements, setPaiements]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [alert, setAlert]                   = useState(null);
  const [filterStatut, setFilterStatut]     = useState('all');
  const [updating, setUpdating]             = useState(null);
  const [showPayModal, setShowPayModal]     = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [methode, setMethode]               = useState('carte');

  const load = async () => {
    setLoading(true);
    try {
      const res = await paiementsAPI.getAll();
      setPaiements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Impossible de charger les paiements.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openPayModal = (paiement) => {
    setSelectedPaiement(paiement);
    setMethode('carte');
    setShowPayModal(true);
  };

  const handlePayer = async () => {
    if (!selectedPaiement) return;
    setUpdating(selectedPaiement.id);
    try {
      await paiementsAPI.update(selectedPaiement.id, {
        statut: 'effectue',
        methode,
        date_paiement: new Date().toISOString(),
      });
      setAlert({ type: 'success', message: '✅ Paiement effectué avec succès !' });
      setShowPayModal(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors du paiement.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setUpdating(null);
    }
  };

  const filtered = paiements.filter(p => filterStatut === 'all' || p.statut === filterStatut);
  const total          = paiements.reduce((s, p) => s + (parseFloat(p.montant) || 0), 0);
  const totalEffectue  = paiements.filter(p => p.statut === 'effectue').reduce((s, p) => s + (parseFloat(p.montant) || 0), 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Paiements</h1>
          <p style={styles.subtitle}>{paiements.length} paiement{paiements.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Résumé */}
      <div style={styles.summaryGrid}>
        {[
          { icon: '💰', value: `${total.toFixed(2)} MAD`,               label: 'Total',      color: '#fff',    border: 'rgba(14,165,233,0.15)' },
          { icon: '✅', value: `${totalEffectue.toFixed(2)} MAD`,       label: 'Payé',       color: '#10b981', border: 'rgba(16,185,129,0.3)'  },
          { icon: '⏳', value: `${(total - totalEffectue).toFixed(2)} MAD`, label: 'En attente', color: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
          { icon: '📊', value: `${total > 0 ? Math.round((totalEffectue / total) * 100) : 0}%`, label: 'Taux payé', color: '#0ea5e9', border: 'rgba(14,165,233,0.3)' },
        ].map(c => (
          <div key={c.label} style={{ ...styles.summaryCard, borderColor: c.border }}>
            <span style={styles.summaryIcon}>{c.icon}</span>
            <div>
              <div style={{ ...styles.summaryValue, color: c.color }}>{c.value}</div>
              <div style={styles.summaryLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { value: 'all',        label: 'Tous' },
          { value: 'en_attente', label: '⏳ En attente' },
          { value: 'effectue',   label: '✅ Effectués' },
          { value: 'echoue',     label: '✕ Échoués' },
        ].map(t => (
          <button key={t.value} onClick={() => setFilterStatut(t.value)}
            style={{ ...styles.tab, ...(filterStatut === t.value ? styles.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.center}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>💳</span>
          <p>Aucun paiement trouvé</p>
          {isBeneficiaire && (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Les paiements apparaissent automatiquement quand un fournisseur accepte votre demande.
            </p>
          )}
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Service', 'Client', 'Fournisseur', 'Montant', 'Méthode', 'Date', 'Statut', 'Action'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = STATUS_CONFIG[p.statut] || STATUS_CONFIG.en_attente;
                const date = p.date_paiement
                  ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
                  : p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—';
                const serviceNom     = p.DemandeService?.Service?.nom || '—';
                const clientNom      = p.DemandeService?.Beneficiaire?.nom || '—';
                const fournisseurNom = p.DemandeService?.Fournisseur?.nom || '—';
                const demandeStatut  = p.DemandeService?.statut;

                return (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}><span style={styles.idTag}>#{p.id}</span></td>
                    <td style={styles.td}><span style={styles.serviceNom}>{serviceNom}</span></td>
                    <td style={styles.td}><span style={styles.personNom}>{clientNom}</span></td>
                    <td style={styles.td}><span style={styles.personNom}>{fournisseurNom}</span></td>
                    <td style={styles.td}><span style={styles.montant}>{parseFloat(p.montant || 0).toFixed(2)} MAD</span></td>
                    <td style={styles.td}><span style={styles.methode}>{p.methode && p.methode !== 'a_definir' ? p.methode : '—'}</span></td>
                    <td style={styles.td}><span style={styles.date}>{date}</span></td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, color: st.color, background: st.bg }}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {/* CLIENT : bouton Payer uniquement si prestation terminée */}
                      {isBeneficiaire && p.statut === 'en_attente' && (
                        demandeStatut === 'termine' ? (
                          <button
                            onClick={() => openPayModal(p)}
                            disabled={updating === p.id}
                            style={styles.payBtn}
                          >
                            💳 Payer
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#f59e0b' }}>⏳ Prestation en cours</span>
                        )
                      )}

                      {/* FOURNISSEUR : lecture seule */}
                      {isFournisseur && p.statut === 'en_attente' && (
                        <span style={{ fontSize: 12, color: '#f59e0b' }}>⏳ En attente client</span>
                      )}

                      {/* ADMIN : lecture seule */}
                      {isAdmin && p.statut === 'en_attente' && (
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>—</span>
                      )}

                      {p.statut === 'effectue' && (
                        <span style={{ color: '#10b981', fontSize: 13 }}>✅ Payé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal paiement client */}
      {showPayModal && selectedPaiement && (
        <div style={styles.overlay} onClick={() => setShowPayModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>💳 Confirmer le paiement</h2>
              <button onClick={() => setShowPayModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.payDetails}>
              <div style={styles.payRow}>
                <span style={styles.payLabel}>Service</span>
                <span style={styles.payValue}>{selectedPaiement.DemandeService?.Service?.nom || '—'}</span>
              </div>
              <div style={styles.payRow}>
                <span style={styles.payLabel}>Montant</span>
                <span style={{ ...styles.payValue, color: '#0ea5e9', fontSize: 22, fontWeight: 800 }}>
                  {parseFloat(selectedPaiement.montant).toFixed(2)} MAD
                </span>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Méthode de paiement</label>
              <div style={styles.methodeGrid}>
                {METHODES.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethode(m.value)}
                    style={{ ...styles.methodeBtn, ...(methode === m.value ? styles.methodeBtnActive : {}) }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setShowPayModal(false)} style={styles.cancelBtn}>Annuler</button>
              <button
                onClick={handlePayer}
                disabled={updating !== null}
                style={{ ...styles.payConfirmBtn, opacity: updating !== null ? 0.5 : 1 }}
              >
                {updating !== null ? '⏳ Traitement...' : `✅ Payer ${parseFloat(selectedPaiement.montant).toFixed(2)} MAD`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:          { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title:         { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle:      { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  summaryGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 },
  summaryCard:   { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'rgba(30,41,59,0.7)', borderRadius: 16, border: '1px solid' },
  summaryIcon:   { fontSize: 28 },
  summaryValue:  { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 },
  summaryLabel:  { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  tabs:          { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab:           { padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 },
  tabActive:     { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  tableWrapper:  { overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(14,165,233,0.1)' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(14,165,233,0.1)' },
  tr:            { borderBottom: '1px solid rgba(14,165,233,0.06)' },
  td:            { padding: '16px 20px', verticalAlign: 'middle' },
  idTag:         { fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' },
  serviceNom:    { fontSize: 14, color: '#fff', fontWeight: 600 },
  personNom:     { fontSize: 13, color: 'var(--light)' },
  montant:       { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff' },
  methode:       { fontSize: 13, color: 'var(--muted)', textTransform: 'capitalize' },
  date:          { fontSize: 13, color: 'var(--muted)' },
  badge:         { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 },
  payBtn:        { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  center:        { display: 'flex', justifyContent: 'center', padding: 60 },
  empty:         { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal:         { background: '#1e293b', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  modalHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle:    { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff' },
  closeBtn:      { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' },
  payDetails:    { background: 'rgba(15,23,42,0.5)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  payRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  payLabel:      { fontSize: 13, color: 'var(--muted)' },
  payValue:      { fontSize: 15, fontWeight: 600, color: '#fff' },
  field:         { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  label:         { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  methodeGrid:   { display: 'flex', flexDirection: 'column', gap: 8 },
  methodeBtn:    { padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, textAlign: 'left' },
  methodeBtnActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  modalActions:  { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  cancelBtn:     { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 },
  payConfirmBtn: { background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
};