import React from 'react';

export default function Alert({ type = 'info', message, onClose }) {
  const config = {
    error: { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.4)', color: '#f43f5e', icon: '⚠️' },
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.4)', color: '#10b981', icon: '✅' },
    info: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.3)', color: '#0ea5e9', icon: 'ℹ️' },
  };
  const c = config[type] || config.info;

  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span>{c.icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: c.color }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.color, cursor: 'pointer', fontSize: 16 }}>✕</button>}
    </div>
  );
}
