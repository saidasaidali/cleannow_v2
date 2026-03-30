import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  admin: [
    { to: '/dashboard', label: 'Tableau de bord', icon: '⊞' },
    { to: '/services', label: 'Services', icon: '✦' },
    { to: '/demandes', label: 'Demandes', icon: '📋' },
    { to: '/paiements', label: 'Paiements', icon: '💳' },
    { to: '/evaluations', label: 'Évaluations', icon: '★' },
  ],
  beneficiaire: [
    { to: '/dashboard', label: 'Accueil', icon: '⊞' },
    { to: '/services', label: 'Services', icon: '✦' },
    { to: '/mes-demandes', label: 'Mes Demandes', icon: '📋' },
    { to: '/paiements', label: 'Paiements', icon: '💳' },
    { to: '/evaluations', label: 'Évaluations', icon: '★' },
  ],
  fournisseur: [
    { to: '/dashboard', label: 'Tableau de bord', icon: '⊞' },
    { to: '/demandes-a-traiter', label: 'À traiter', icon: '📋' },
    { to: '/paiements', label: 'Paiements', icon: '💳' },
  ],
};

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV_LINKS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = { admin: '#f59e0b', beneficiaire: '#0ea5e9', fournisseur: '#10b981' };
  const roleColor = roleColors[user?.role] || '#64748b';

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>Clean<span style={{ color: 'var(--sky)' }}>Now</span></span>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                ...styles.link,
                ...(location.pathname === l.to ? styles.linkActive : {}),
              }}
            >
              <span style={styles.linkIcon}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>

        {/* User info + logout */}
        <div style={styles.userArea}>
          <div style={styles.userBadge}>
            <div style={{ ...styles.avatar, background: roleColor }}>
              {user?.nom?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.nom || user?.email}</span>
              <span style={{ ...styles.userRole, color: roleColor }}>{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Déconnexion">
            ⇤
          </button>
          {/* Burger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.burger}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              <span>{l.icon}</span> {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={styles.mobileLinkBtn}>
            ⇤ Déconnexion
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(15,23,42,0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(14,165,233,0.15)',
    boxShadow: '0 2px 32px rgba(0,0,0,0.4)',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 24px',
    display: 'flex', alignItems: 'center', height: 64, gap: 32,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none', flexShrink: 0,
  },
  logoIcon: { fontSize: 22, color: 'var(--sky)' },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  links: { display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' },
  link: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    borderRadius: 8, textDecoration: 'none', color: 'var(--muted)',
    fontSize: 14, fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  linkActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)' },
  linkIcon: { fontSize: 14 },
  userArea: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  userBadge: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 15, color: '#fff',
  },
  userInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  userName: { fontSize: 13, fontWeight: 600, color: '#fff' },
  userRole: { fontSize: 11, textTransform: 'capitalize' },
  logoutBtn: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
    color: '#f43f5e', borderRadius: 8, padding: '6px 10px',
    cursor: 'pointer', fontSize: 16, transition: 'all 0.2s',
  },
  burger: {
    display: 'none', background: 'none', border: 'none',
    color: '#fff', fontSize: 22, cursor: 'pointer',
    '@media(max-width:768px)': { display: 'block' },
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column', gap: 4,
    padding: '12px 24px 20px',
    borderTop: '1px solid rgba(14,165,233,0.1)',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8, textDecoration: 'none',
    color: 'var(--light)', fontSize: 15,
  },
  mobileLinkBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8, textAlign: 'left',
    background: 'rgba(244,63,94,0.1)', border: 'none',
    color: '#f43f5e', fontSize: 15, cursor: 'pointer',
  },
};
