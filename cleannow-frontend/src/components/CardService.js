import React from 'react';

const ICONS = ['🧹', '🪣', '🧽', '🏠', '🪟', '🧴', '✨', '🌿'];

export default function CardService({ service, onEdit, onDelete, onSelect, isAdmin, selected }) {
  const icon = ICONS[service.id % ICONS.length] || '✦';

  return (
    <div
      style={{
        ...styles.card,
        ...(selected ? styles.cardSelected : {}),
        cursor: onSelect ? 'pointer' : 'default',
      }}
      onClick={() => onSelect && onSelect(service)}
    >
      <div style={styles.iconWrapper}>
        <span style={styles.icon}>{icon}</span>
      </div>
      <div style={styles.body}>
        <h3 style={styles.title}>{service.nom || service.name}</h3>
        <p style={styles.desc}>{service.description}</p>
        <div style={styles.footer}>
          <span style={styles.price}>
            {service.prix ? `${service.prix} MAD` : 'Sur devis'}
          </span>
          {service.duree && (
            <span style={styles.tag}>⏱ {service.duree}</span>
          )}
        </div>
      </div>
      {isAdmin && (
        <div style={styles.actions}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(service); }} style={styles.editBtn}>
            ✏️
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(service.id); }} style={styles.deleteBtn}>
            🗑
          </button>
        </div>
      )}
      {selected && <div style={styles.selectedBadge}>✓ Sélectionné</div>}
    </div>
  );
}

const styles = {
  card: {
    background: 'rgba(30,41,59,0.7)',
    border: '1px solid rgba(14,165,233,0.12)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    border: '1px solid var(--sky)',
    background: 'rgba(14,165,233,0.08)',
    boxShadow: '0 0 0 1px var(--sky)',
  },
  iconWrapper: {
    width: 52, height: 52, borderRadius: 14,
    background: 'rgba(14,165,233,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 26 },
  body: { flex: 1 },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
    color: '#fff', marginBottom: 8,
  },
  desc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 },
  footer: { display: 'flex', alignItems: 'center', gap: 10 },
  price: {
    fontFamily: 'var(--font-display)', fontWeight: 700,
    color: 'var(--sky)', fontSize: 18,
  },
  tag: {
    fontSize: 12, padding: '3px 10px', borderRadius: 20,
    background: 'rgba(14,165,233,0.1)', color: 'var(--sky-light)',
  },
  actions: {
    position: 'absolute', top: 16, right: 16,
    display: 'flex', gap: 6,
  },
  editBtn: {
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 14,
  },
  deleteBtn: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 14,
  },
  selectedBadge: {
    position: 'absolute', bottom: 12, right: 16,
    fontSize: 12, color: 'var(--sky)', fontWeight: 600,
  },
};
