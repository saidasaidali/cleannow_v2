import React, { useEffect, useState } from 'react';
import { demandesAPI } from '../api/axios';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  en_attente: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏳' },
  en_cours:   { label: 'En cours',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  icon: '⚙️' },
  termine:    { label: 'Terminé',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '✅' },
  annule:     { label: 'Refusé',     color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   icon: '✕'  },
};

function DemandeCard({ demande, onAction, isFournisseur, isAdmin, currentUserId }) {
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refusMotif, setRefusMotif]           = useState('');
  const [loadingAction, setLoadingAction]     = useState(null);

  const status = STATUS_CONFIG[demande.statut] || STATUS_CONFIG.en_attente;
  const date   = demande.date_demande || demande.createdAt
    ? new Date(demande.date_demande || demande.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const clientNom      = demande.Beneficiaire?.nom || '—';
  const fournisseurNom = demande.Fournisseur?.nom  || null;
  const isAssigned     = isFournisseur && demande.fournisseurId === currentUserId;

  const handleAction = async (statut, motif = '') => {
    setLoadingAction(statut);
    await onAction(demande.id, statut, motif);
    setLoadingAction(null);
    setShowRefuseModal(false);
  };

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div>
          <span style={styles.cardId}>Demande #{demande.id}</span>
          <h3 style={styles.cardTitle}>{demande.Service?.nom || '—'}</h3>
        </div>
        <span style={{ ...styles.badge, color: status.color, background: status.bg }}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Meta */}
      <div style={styles.cardMeta}>
        {demande.adresse && <span style={styles.metaItem}>📍 {demande.adresse}</span>}
        <span style={styles.metaItem}>📅 {date}</span>
        {demande.Service?.prix && (
          <span style={{ ...styles.metaItem, color: 'var(--sky)' }}>💰 {demande.Service.prix} MAD</span>
        )}
      </div>

      {/* Bloc admin : client ↔ fournisseur */}
      {isAdmin && (
        <div style={styles.infoBlock}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>👤 Client</span>
            <span style={styles.infoValue}>{clientNom}</span>
          </div>
          <div style={styles.infoDivider} />
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>🔧 Fournisseur assigné</span>
            <span style={{ ...styles.infoValue, color: fournisseurNom ? '#10b981' : '#f59e0b' }}>
              {fournisseurNom || 'Non assigné'}
            </span>
          </div>
        </div>
      )}

      {/* Fournisseur : voir le client */}
      {isFournisseur && (
        <div style={styles.clientLine}>
          <span style={styles.metaItem}>👤 Client : {clientNom}</span>
        </div>
      )}

      {demande.notes && <p style={styles.cardDesc}>"{demande.notes}"</p>}

      {/* ── ACTIONS — FOURNISSEUR SEULEMENT ──────────────────────── */}
      {isFournisseur && (
        <div style={styles.actions}>
          {/* Accepter / Refuser — demande en attente, tout fournisseur */}
          {demande.statut === 'en_attente' && (
            <>
              <button
                disabled={loadingAction === 'en_cours'}
                onClick={() => handleAction('en_cours')}
                style={styles.acceptBtn}
              >
                {loadingAction === 'en_cours' ? '⏳' : '✅'} Accepter
              </button>
              <button onClick={() => setShowRefuseModal(true)} style={styles.refuseBtn}>
                ✕ Refuser
              </button>
            </>
          )}

          {/* Terminer — seulement le fournisseur assigné */}
          {demande.statut === 'en_cours' && (
            isAssigned ? (
              <button
                disabled={loadingAction === 'termine'}
                onClick={() => handleAction('termine')}
                style={styles.termineBtn}
              >
                {loadingAction === 'termine' ? '⏳' : '🏁'} Marquer terminé
              </button>
            ) : (
              <span style={styles.lockedMsg}>🔒 Assignée à un autre fournisseur</span>
            )
          )}
        </div>
      )}

      {/* ADMIN : aucun bouton d'action, juste lecture */}
      {isAdmin && demande.statut === 'en_attente' && (
        <div style={styles.adminReadOnly}>
          📋 En attente d'un fournisseur
        </div>
      )}
      {isAdmin && demande.statut === 'en_cours' && (
        <div style={styles.adminReadOnly}>
          ⚙️ En cours — fournisseur : {fournisseurNom || '—'}
        </div>
      )}

      {/* Motif de refus */}
      {demande.statut === 'annule' && demande.motif_refus && (
        <div style={styles.motifBox}>
          <span style={styles.motifLabel}>Motif :</span>
          <span style={styles.motifText}>{demande.motif_refus}</span>
        </div>
      )}

      {/* Modal refus */}
      {showRefuseModal && (
        <div style={styles.miniOverlay} onClick={() => setShowRefuseModal(false)}>
          <div style={styles.miniModal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.miniTitle}>✕ Refuser la demande</h3>
            <p style={styles.miniSub}>Précisez la raison (optionnel)</p>
            <textarea
              value={refusMotif}
              onChange={e => setRefusMotif(e.target.value)}
              rows={3}
              placeholder="Ex: Hors zone, planning complet..."
              style={styles.miniTextarea}
            />
            <div style={styles.miniActions}>
              <button onClick={() => setShowRefuseModal(false)} style={styles.cancelBtn}>Annuler</button>
              <button
                onClick={() => handleAction('annule', refusMotif)}
                disabled={loadingAction === 'annule'}
                style={styles.confirmRefuseBtn}
              >
                {loadingAction === 'annule' ? '⏳' : '✕ Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemandesATraiter() {
  const { isAdmin, isFournisseur, user } = useAuth();
  const [demandes, setDemandes]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [alert, setAlert]                 = useState(null);
  const [filterStatut, setFilterStatut]   = useState('en_attente');

  const load = async () => {
    setLoading(true);
    try {
      const res = await demandesAPI.getAll();
      setDemandes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAlert({ type: 'error', message: 'Impossible de charger les demandes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, statut, motif) => {
    try {
      await demandesAPI.updateStatut(id, statut, motif);
      const messages = {
        en_cours: '✅ Demande acceptée.',
        termine:  '🏁 Demande terminée.',
        annule:   '✕ Demande refusée.',
      };
      setAlert({ type: statut === 'annule' ? 'error' : 'success', message: messages[statut] });
      load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la mise à jour.';
      setAlert({ type: 'error', message: msg });
    }
  };

  const filtered = demandes.filter(d => filterStatut === 'all' || d.statut === filterStatut);
  const count    = s => demandes.filter(d => d.statut === s).length;

  const tabs = [
    { value: 'all',        label: 'Toutes',     emoji: '📋' },
    { value: 'en_attente', label: 'En attente', emoji: '⏳', urgent: count('en_attente') > 0 },
    { value: 'en_cours',   label: 'En cours',   emoji: '⚙️' },
    { value: 'termine',    label: 'Terminées',  emoji: '✅' },
    { value: 'annule',     label: 'Refusées',   emoji: '✕'  },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {isAdmin ? 'Tableau des demandes' : 'Demandes à traiter'}
          </h1>
          <p style={styles.subtitle}>{demandes.length} demande{demandes.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={styles.kpis}>
          {[
            { label: 'En attente', val: count('en_attente'), color: '#f59e0b' },
            { label: 'En cours',   val: count('en_cours'),   color: '#0ea5e9' },
            { label: 'Terminées',  val: count('termine'),    color: '#10b981' },
          ].map((k, i, arr) => (
            <React.Fragment key={k.label}>
              <div style={styles.kpi}>
                <span style={{ ...styles.kpiNum, color: k.color }}>{k.val}</span>
                <span style={styles.kpiLabel}>{k.label}</span>
              </div>
              {i < arr.length - 1 && <div style={styles.kpiDivider} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setFilterStatut(t.value)}
            style={{ ...styles.tab, ...(filterStatut === t.value ? styles.tabActive : {}), ...(t.urgent ? styles.tabUrgent : {}) }}
          >
            {t.emoji} {t.label}
            <span style={styles.tabCount}>{t.value === 'all' ? demandes.length : count(t.value)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.center}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>📭</span>
          <p>Aucune demande{filterStatut !== 'all' ? ' dans cette catégorie' : ''}</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map(d => (
            <DemandeCard
              key={d.id}
              demande={d}
              onAction={handleAction}
              isFournisseur={isFournisseur}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page:        { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title:       { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle:    { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  kpis:        { display: 'flex', alignItems: 'center', background: 'rgba(30,41,59,0.7)', borderRadius: 14, border: '1px solid rgba(14,165,233,0.1)', overflow: 'hidden' },
  kpi:         { padding: '14px 24px', textAlign: 'center' },
  kpiNum:      { display: 'block', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 },
  kpiLabel:    { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  kpiDivider:  { width: 1, alignSelf: 'stretch', background: 'rgba(14,165,233,0.1)' },
  tabs:        { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab:         { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  tabActive:   { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  tabUrgent:   { borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b' },
  tabCount:    { background: 'rgba(14,165,233,0.2)', color: 'var(--sky)', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 },
  list:        { display: 'flex', flexDirection: 'column', gap: 16 },
  center:      { display: 'flex', justifyContent: 'center', padding: 60 },
  empty:       { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  card:        { background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 16, padding: 24, position: 'relative' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardId:      { fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', display: 'block', marginBottom: 4 },
  cardTitle:   { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff' },
  badge:       { fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap' },
  cardMeta:    { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  metaItem:    { fontSize: 13, color: 'var(--muted)' },
  cardDesc:    { fontSize: 13, color: 'rgba(148,163,184,0.8)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 16, paddingLeft: 12, borderLeft: '2px solid rgba(14,165,233,0.3)' },
  clientLine:  { marginBottom: 12 },
  infoBlock:   { display: 'flex', background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(14,165,233,0.1)', overflow: 'hidden', marginBottom: 16 },
  infoRow:     { flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 },
  infoDivider: { width: 1, background: 'rgba(14,165,233,0.1)' },
  infoLabel:   { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  infoValue:   { fontSize: 14, fontWeight: 600, color: '#fff' },
  actions:     { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(14,165,233,0.08)' },
  acceptBtn:   { padding: '10px 22px', borderRadius: 9, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  refuseBtn:   { padding: '10px 22px', borderRadius: 9, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)', color: '#f43f5e', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  termineBtn:  { padding: '10px 22px', borderRadius: 9, border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  lockedMsg:   { fontSize: 13, color: 'var(--muted)', padding: '10px 0', fontStyle: 'italic' },
  adminReadOnly: { marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(14,165,233,0.08)', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' },
  motifBox:    { marginTop: 12, padding: '10px 14px', background: 'rgba(244,63,94,0.07)', borderRadius: 8, border: '1px solid rgba(244,63,94,0.2)' },
  motifLabel:  { fontSize: 11, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 8 },
  motifText:   { fontSize: 13, color: 'rgba(244,63,94,0.8)' },
  miniOverlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24 },
  miniModal:        { background: '#1e293b', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' },
  miniTitle:        { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#f43f5e', marginBottom: 6 },
  miniSub:          { fontSize: 13, color: 'var(--muted)', marginBottom: 16 },
  miniTextarea:     { width: '100%', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 16 },
  miniActions:      { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn:        { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8, padding: '9px 18px', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 },
  confirmRefuseBtn: { background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', borderRadius: 8, padding: '9px 18px', color: '#f43f5e', fontWeight: 700, cursor: 'pointer', fontSize: 13 },
};