import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <span style={styles.logo}>◈ CleanNow</span>
        <span style={styles.copy}>© {new Date().getFullYear()} CleanNow — Tous droits réservés</span>
        <span style={styles.version}>v1.0.0 PWA</span>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(14,165,233,0.1)',
    background: 'rgba(15,23,42,0.8)',
    padding: '16px 24px',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 8,
  },
  logo: { fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--sky)', fontSize: 16 },
  copy: { fontSize: 13, color: 'var(--muted)' },
  version: { fontSize: 12, color: 'rgba(100,116,139,0.6)', fontFamily: 'monospace' },
};
