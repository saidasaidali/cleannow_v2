import React from 'react';

const STATUS_CONFIG = {
  en_attente: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏳' },
  en_cours: { label: 'En cours', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: '⚙️' },
  termine: { label: 'Terminé', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '✅' },
  annule: { label: 'Annulé', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', icon: '✕' },
};

export default function CardDemande({ demande, onUpdateStatut, isFournisseur, isAdmin }) {
  const status = STATUS_CONFIG[demande.statut] || STATUS_CONFIG.en_attente;
  const date = demande.date_creation
    ? new Date(demande.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <span style={styles.id}>#{demande.id}</span>
          <h3 style={styles.title}>{demande.service?.nom || demande.service_nom || 'Service'}</h3>
        </div>
        <span style={{ ...styles.badge, color: status.color, background: status.bg }}>
          {status.icon} {status.label}
        </span>
      </div>

      <div style={styles.meta}>
        {demande.beneficiaire_nom && (
          <span style={styles.metaItem}>👤 {demande.beneficiaire_nom}</span>
        )}
        {demande.adresse && (
          <span style={styles.metaItem}>📍 {demande.adresse}</span>
        )}
        <span style={styles.metaItem}>📅 {date}</span>
        {demande.prix_total && (
          <span style={{ ...styles.metaItem, color: 'var(--sky)' }}>💰 {demande.prix_total} MAD</span>
        )}
      </div>

      {demande.description && (
        <p style={styles.desc}>{demande.description}</p>
      )}

      {(isFournisseur || isAdmin) && demande.statut !== 'termine' && demande.statut !== 'annule' && (
        <div style={styles.actions}>
          {demande.statut === 'en_attente' && (
            <button
              style={{ ...styles.btn, background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.4)' }}
              onClick={() => onUpdateStatut(demande.id, 'en_cours')}
            >
              ⚙️ Prendre en charge
            </button>
          )}
          {demande.statut === 'en_cours' && (
            <button
              style={{ ...styles.btn, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)' }}
              onClick={() => onUpdateStatut(demande.id, 'termine')}
            >
              ✅ Marquer terminé
            </button>
          )}
          <button
            style={{ ...styles.btn, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}
            onClick={() => onUpdateStatut(demande.id, 'annule')}
          >
            ✕ Annuler
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'rgba(30,41,59,0.7)',
    border: '1px solid rgba(14,165,233,0.12)',
    borderRadius: 'var(--radius-lg)', padding: 24,
    transition: 'all 0.2s',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  id: { fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', display: 'block', marginBottom: 4 },
  title: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#fff' },
  badge: {
    fontSize: 12, fontWeight: 600, padding: '4px 12px',
    borderRadius: 20, whiteSpace: 'nowrap',
  },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  metaItem: { fontSize: 13, color: 'var(--muted)' },
  desc: { fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.6, marginBottom: 16 },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(14,165,233,0.08)' },
  btn: {
    padding: '8px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
