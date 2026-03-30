import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, demandesAPI, paiementsAPI, evaluationsAPI, usersAPI } from '../api/axios';

export default function Dashboard() {
  const { user, isAdmin, isBeneficiaire, isFournisseur } = useAuth();
  const [stats, setStats] = useState({
    services: 0, demandes: 0, paiements: 0, evaluations: 0,
    fournisseurs: 0, beneficiaires: 0,
    demandesEnAttente: 0, demandesEnCours: 0, demandesTerminees: 0,
    paiementsEffectues: 0, paiementsEnAttente: 0,
    noteMoyenne: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const calls = [
          servicesAPI.getAll(),
          demandesAPI.getAll(),
          paiementsAPI.getAll(),
          evaluationsAPI.getAll(),
        ];
        if (isAdmin) {
          calls.push(usersAPI.getAll('fournisseur'));
          calls.push(usersAPI.getAll('beneficiaire'));
        }
        const results = await Promise.allSettled(calls);
        const get = (i) => results[i]?.value?.data || [];

        const demandes  = get(1);
        const paiements = get(2);
        const evals     = get(3);

        setStats({
          services:            get(0).length,
          demandes:            demandes.length,
          paiements:           paiements.length,
          evaluations:         evals.length,
          fournisseurs:        isAdmin ? get(4).length : 0,
          beneficiaires:       isAdmin ? get(5).length : 0,
          demandesEnAttente:   demandes.filter((d) => d.statut === 'en_attente').length,
          demandesEnCours:     demandes.filter((d) => d.statut === 'en_cours').length,
          demandesTerminees:   demandes.filter((d) => d.statut === 'termine').length,
          paiementsEffectues:  paiements.filter((p) => p.statut === 'effectue').length,
          paiementsEnAttente:  paiements.filter((p) => p.statut === 'en_attente').length,
          noteMoyenne:         evals.length
            ? (evals.reduce((s, e) => s + (Number(e.note) || 0), 0) / evals.length).toFixed(1)
            : 0,
        });
      } catch (_) {}
      setLoading(false);
    };
    fetchStats();
  }, [isAdmin]);

  // Cards selon le rôle
  const mainCards = isAdmin ? [
    { label: 'Services',      value: stats.services,      icon: '✦', color: '#0ea5e9', to: '/services' },
    { label: 'Demandes',      value: stats.demandes,      icon: '📋', color: '#f59e0b', to: '/demandes' },
    { label: 'Fournisseurs',  value: stats.fournisseurs,  icon: '🔧', color: '#10b981', to: '/utilisateurs' },
    { label: 'Bénéficiaires', value: stats.beneficiaires, icon: '👤', color: '#a855f7', to: '/utilisateurs' },
  ] : isBeneficiaire ? [
    { label: 'Services dispo', value: stats.services,          icon: '✦',  color: '#0ea5e9', to: '/services' },
    { label: 'Mes demandes',   value: stats.demandes,          icon: '📋', color: '#f59e0b', to: '/mes-demandes' },
    { label: 'Paiements',      value: stats.paiements,         icon: '💳', color: '#10b981', to: '/paiements' },
    { label: 'Mes avis',       value: stats.evaluations,       icon: '★',  color: '#a855f7', to: '/evaluations' },
  ] : [
    { label: 'En attente',  value: stats.demandesEnAttente, icon: '⏳', color: '#f59e0b', to: '/demandes-a-traiter' },
    { label: 'En cours',    value: stats.demandesEnCours,   icon: '⚙️', color: '#0ea5e9', to: '/demandes-a-traiter' },
    { label: 'Terminées',   value: stats.demandesTerminees, icon: '✅', color: '#10b981', to: '/demandes-a-traiter' },
    { label: 'Paiements',   value: stats.paiementsEffectues,icon: '💳', color: '#a855f7', to: '/paiements' },
  ];

  const quickActions = isAdmin ? [
    { label: 'Gérer les fournisseurs',  icon: '🔧', to: '/utilisateurs',      color: '#0ea5e9' },
    { label: 'Voir toutes les demandes',icon: '📋', to: '/demandes',           color: '#f59e0b' },
    { label: 'Gérer les paiements',     icon: '💳', to: '/paiements',          color: '#10b981' },
    { label: 'Lire les évaluations',    icon: '★',  to: '/evaluations',        color: '#a855f7' },
    { label: 'Ajouter un service',      icon: '✦',  to: '/services',           color: '#f43f5e' },
  ] : isBeneficiaire ? [
    { label: 'Explorer les services',   icon: '✦',  to: '/services',           color: '#0ea5e9' },
    { label: 'Créer une demande',       icon: '📋', to: '/mes-demandes',       color: '#f59e0b' },
    { label: 'Mes paiements',           icon: '💳', to: '/paiements',          color: '#10b981' },
    { label: 'Laisser un avis',         icon: '★',  to: '/evaluations',        color: '#a855f7' },
  ] : [
    { label: 'Demandes à traiter',      icon: '📋', to: '/demandes-a-traiter', color: '#f59e0b' },
    { label: 'Voir les paiements reçus',icon: '💳', to: '/paiements',          color: '#10b981' },
    { label: 'Voir les évaluations',    icon: '★',  to: '/evaluations',        color: '#a855f7' },
  ];

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroBlob} />
        <div style={styles.heroContent}>
          <span style={styles.greeting}>Bonjour, {user?.nom || user?.email} 👋</span>
          <h1 style={styles.title}>
            Tableau de <span style={{ color: 'var(--sky)' }}>bord</span>
          </h1>
          <p style={styles.desc}>
            Espace {isAdmin ? 'administrateur' : isFournisseur ? 'fournisseur' : 'bénéficiaire'} — CleanNow
          </p>
        </div>
      </div>

      {/* Stats principales */}
      <div style={styles.statsGrid}>
        {mainCards.map((c) => (
          <Link key={c.label} to={c.to} style={styles.statCard}>
            <div style={{ ...styles.statIcon, color: c.color, background: `${c.color}18` }}>{c.icon}</div>
            <div>
              <div style={{ ...styles.statValue, color: c.color }}>{loading ? '—' : c.value}</div>
              <div style={styles.statLabel}>{c.label}</div>
            </div>
            <div style={{ ...styles.statArrow, color: c.color }}>→</div>
          </Link>
        ))}
      </div>

      {/* Stats détaillées admin */}
      {isAdmin && !loading && (
        <div style={styles.detailGrid}>
          {[
            { label: 'Demandes en attente', value: stats.demandesEnAttente, color: '#f59e0b', icon: '⏳' },
            { label: 'Demandes en cours',   value: stats.demandesEnCours,   color: '#0ea5e9', icon: '⚙️' },
            { label: 'Demandes terminées',  value: stats.demandesTerminees, color: '#10b981', icon: '✅' },
            { label: 'Paiements reçus',     value: stats.paiementsEffectues,color: '#10b981', icon: '💰' },
            { label: 'Paiements en attente',value: stats.paiementsEnAttente,color: '#f59e0b', icon: '⏳' },
            { label: 'Note moyenne',        value: `${stats.noteMoyenne}/5`, color: '#f59e0b', icon: '★' },
          ].map((s) => (
            <div key={s.label} style={styles.detailCard}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div>
                <div style={{ ...styles.detailValue, color: s.color }}>{s.value}</div>
                <div style={styles.detailLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions rapides */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Actions rapides</h2>
        <div style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} style={{ ...styles.actionCard, borderColor: `${a.color}30` }}>
              <span style={{ ...styles.actionIcon, color: a.color }}>{a.icon}</span>
              <span style={styles.actionLabel}>{a.label}</span>
              <span style={{ color: a.color, marginLeft: 'auto' }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  hero: { position: 'relative', overflow: 'hidden', background: 'rgba(30,41,59,0.5)', borderRadius: 24, padding: '48px 40px', marginBottom: 32, border: '1px solid rgba(14,165,233,0.1)' },
  heroBlob: { position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  heroContent: { position: 'relative' },
  greeting: { fontSize: 14, color: 'var(--muted)', display: 'block', marginBottom: 8 },
  title: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 12 },
  desc: { fontSize: 15, color: 'var(--muted)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: { display: 'flex', alignItems: 'center', gap: 16, padding: 24, background: 'rgba(30,41,59,0.7)', borderRadius: 16, border: '1px solid rgba(14,165,233,0.1)', textDecoration: 'none' },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  statValue: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 },
  statLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 2 },
  statArrow: { marginLeft: 'auto', fontSize: 18, opacity: 0.6 },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 },
  detailCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(15,23,42,0.4)', borderRadius: 12, border: '1px solid rgba(14,165,233,0.08)' },
  detailValue: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 },
  detailLabel: { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  section: { marginBottom: 32 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 16 },
  actionsGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  actionCard: { display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', background: 'rgba(30,41,59,0.5)', borderRadius: 12, border: '1px solid', textDecoration: 'none' },
  actionIcon: { fontSize: 20 },
  actionLabel: { fontSize: 15, fontWeight: 500, color: '#fff' },
};