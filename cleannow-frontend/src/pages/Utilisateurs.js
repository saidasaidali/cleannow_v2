import React, { useEffect, useState } from 'react';
import { usersAPI } from '../api/axios';
import Alert from '../components/Alert';

const ROLE_CONFIG = {
  fournisseur:  { label: 'Fournisseur',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  icon: '🔧' },
  beneficiaire: { label: 'Bénéficiaire', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '👤' },
  admin:        { label: 'Admin',        color: '#a855f7', bg: 'rgba(168,85,247,0.1)',   icon: '⚙️' },
};

const STATUT_CONFIG = {
  actif:      { label: 'Actif',      color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '✅' },
  en_attente: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏳' },
  suspendu:   { label: 'Suspendu',   color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  icon: '🚫' },
};

export default function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'fournisseur', telephone: '', adresse: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('tous'); // 'tous' | 'validation'

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAlert({ type: 'error', message: 'Impossible de charger les utilisateurs.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ nom: '', email: '', password: '', role: 'fournisseur', telephone: '', adresse: '' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ nom: user.nom, email: user.email, password: '', role: user.role, telephone: user.telephone || '', adresse: user.adresse || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        await usersAPI.update(editUser.id, form);
        setAlert({ type: 'success', message: 'Utilisateur mis à jour ✅' });
      } else {
        await usersAPI.create(form);
        setAlert({ type: 'success', message: 'Utilisateur créé ✅' });
      }
      setShowModal(false);
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erreur.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer ${nom} ?`)) return;
    try {
      await usersAPI.delete(id);
      setAlert({ type: 'success', message: 'Utilisateur supprimé.' });
      load();
    } catch {
      setAlert({ type: 'error', message: 'Erreur lors de la suppression.' });
    }
  };

  const handleValider = async (id, nom) => {
    try {
      await usersAPI.valider(id);
      setAlert({ type: 'success', message: `✅ ${nom} validé et activé !` });
      load();
    } catch {
      setAlert({ type: 'error', message: 'Erreur lors de la validation.' });
    }
  };

  const handleRejeter = async (id, nom) => {
    if (!window.confirm(`Rejeter la candidature de ${nom} ?`)) return;
    try {
      await usersAPI.rejeter(id);
      setAlert({ type: 'error', message: `🚫 ${nom} rejeté.` });
      load();
    } catch {
      setAlert({ type: 'error', message: 'Erreur lors du rejet.' });
    }
  };

  const enAttente = users.filter((u) => u.role === 'fournisseur' && u.statut === 'en_attente');

  const filtered = users
    .filter((u) => filterRole === 'all' || u.role === filterRole)
    .filter((u) => filterStatut === 'all' || u.statut === filterStatut)
    .filter((u) => !search ||
      u.nom?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  const count = (r) => users.filter((u) => u.role === r).length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestion des utilisateurs</h1>
          <p style={styles.subtitle}>{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} style={styles.addBtn}>+ Ajouter un utilisateur</button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Stats */}
      <div style={styles.statsGrid}>
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div key={role} style={{ ...styles.statCard, borderColor: `${cfg.color}30` }}>
            <span style={{ fontSize: 28 }}>{cfg.icon}</span>
            <div>
              <div style={{ ...styles.statNum, color: cfg.color }}>{count(role)}</div>
              <div style={styles.statLabel}>{cfg.label}s</div>
            </div>
          </div>
        ))}
        {enAttente.length > 0 && (
          <div style={{ ...styles.statCard, borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.05)' }}>
            <span style={{ fontSize: 28 }}>⏳</span>
            <div>
              <div style={{ ...styles.statNum, color: '#f59e0b' }}>{enAttente.length}</div>
              <div style={styles.statLabel}>En attente validation</div>
            </div>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div style={styles.mainTabs}>
        <button onClick={() => setActiveTab('tous')}
          style={{ ...styles.mainTab, ...(activeTab === 'tous' ? styles.mainTabActive : {}) }}>
          👥 Tous les utilisateurs
        </button>
        <button onClick={() => setActiveTab('validation')}
          style={{ ...styles.mainTab, ...(activeTab === 'validation' ? styles.mainTabActive : {}), ...(enAttente.length > 0 ? styles.mainTabUrgent : {}) }}>
          ⏳ Fournisseurs à valider
          {enAttente.length > 0 && <span style={styles.badge}>{enAttente.length}</span>}
        </button>
      </div>

      {/* ── TAB VALIDATION ── */}
      {activeTab === 'validation' && (
        <div>
          {enAttente.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: 48 }}>✅</span>
              <p>Aucun fournisseur en attente de validation</p>
            </div>
          ) : (
            <div style={styles.validationGrid}>
              {enAttente.map((u) => (
                <div key={u.id} style={styles.validationCard}>
                  <div style={styles.validationHeader}>
                    <div style={{ ...styles.avatar, background: '#0ea5e9', width: 52, height: 52, fontSize: 20 }}>
                      {(u.nom || 'F')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.validationName}>{u.nom}</div>
                      <div style={styles.validationEmail}>{u.email}</div>
                    </div>
                    <span style={{ ...styles.statutBadge, color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                      ⏳ En attente
                    </span>
                  </div>
                  <div style={styles.validationInfo}>
                    {u.telephone && <div style={styles.infoRow}><span>📞</span><span>{u.telephone}</span></div>}
                    {u.adresse   && <div style={styles.infoRow}><span>📍</span><span>{u.adresse}</span></div>}
                    <div style={styles.infoRow}>
                      <span>📅</span>
                      <span>Inscrit le {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
                    </div>
                  </div>
                  <div style={styles.validationActions}>
                    <button onClick={() => handleValider(u.id, u.nom)} style={styles.validerBtn}>
                      ✅ Valider et activer
                    </button>
                    <button onClick={() => handleRejeter(u.id, u.nom)} style={styles.rejeterBtn}>
                      🚫 Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB TOUS ── */}
      {activeTab === 'tous' && (
        <>
          <div style={styles.toolbar}>
            <div style={styles.tabs}>
              {[
                { value: 'all', label: 'Tous', count: users.length },
                { value: 'fournisseur', label: '🔧 Fournisseurs', count: count('fournisseur') },
                { value: 'beneficiaire', label: '👤 Bénéficiaires', count: count('beneficiaire') },
                { value: 'admin', label: '⚙️ Admins', count: count('admin') },
              ].map((t) => (
                <button key={t.value} onClick={() => setFilterRole(t.value)}
                  style={{ ...styles.tab, ...(filterRole === t.value ? styles.tabActive : {}) }}>
                  {t.label} <span style={styles.tabCount}>{t.count}</span>
                </button>
              ))}
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher..." style={styles.search} />
          </div>

          {loading ? (
            <div style={styles.center}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}><span style={{ fontSize: 48 }}>👥</span><p>Aucun utilisateur trouvé</p></div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['#', 'Nom', 'Email', 'Rôle', 'Statut', 'Inscrit le', 'Actions'].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.beneficiaire;
                    const scfg = STATUT_CONFIG[u.statut] || STATUT_CONFIG.actif;
                    const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—';
                    return (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}><span style={styles.idTag}>#{u.id}</span></td>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={{ ...styles.avatar, background: cfg.color }}>
                              {(u.nom || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>{u.nom}</div>
                              {u.telephone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.telephone}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}><span style={styles.emailText}>{u.email}</span></td>
                        <td style={styles.td}>
                          <span style={{ ...styles.roleBadge, color: cfg.color, background: cfg.bg }}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statutBadge, color: scfg.color, background: scfg.bg }}>
                            {scfg.icon} {scfg.label}
                          </span>
                        </td>
                        <td style={styles.td}><span style={styles.date}>{date}</span></td>
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            {u.statut === 'en_attente' && (
                              <button onClick={() => handleValider(u.id, u.nom)} style={styles.validerBtnSm}>✅</button>
                            )}
                            <button onClick={() => openEdit(u)} style={styles.editBtn}>✏️</button>
                            <button onClick={() => handleDelete(u.id, u.nom)} style={styles.deleteBtn}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editUser ? '✏️ Modifier' : '+ Ajouter'} un utilisateur</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Nom *</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required placeholder="Prénom Nom" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required placeholder="email@exemple.com" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Téléphone</label>
                <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="+212 6XX XXX XXX" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Adresse</label>
                <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  placeholder="Ville, Quartier" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Mot de passe {editUser && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(vide = inchangé)</span>}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editUser} placeholder={editUser ? 'Nouveau mot de passe...' : 'Mot de passe *'} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Rôle *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={styles.select}>
                  <option value="fournisseur">🔧 Fournisseur</option>
                  <option value="beneficiaire">👤 Bénéficiaire</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" disabled={saving}
                  style={{ ...styles.saveBtn, opacity: saving ? 0.5 : 1 }}>
                  {saving ? '⏳...' : editUser ? '✅ Mettre à jour' : '+ Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  addBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 },
  statCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: 'rgba(30,41,59,0.7)', borderRadius: 14, border: '1px solid' },
  statNum: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 },
  statLabel: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  mainTabs: { display: 'flex', gap: 8, marginBottom: 20 },
  mainTab: { padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 },
  mainTabActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  mainTabUrgent: { borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b' },
  badge: { background: '#f59e0b', color: '#000', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 800 },
  validationGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  validationCard: { background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 24 },
  validationHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  validationName: { fontSize: 16, fontWeight: 700, color: '#fff' },
  validationEmail: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  validationInfo: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  infoRow: { display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', alignItems: 'center' },
  validationActions: { display: 'flex', gap: 10 },
  validerBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  rejeterBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)', color: '#f43f5e', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  validerBtnSm: { padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#10b981', cursor: 'pointer', fontSize: 14 },
  toolbar: { display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 },
  tabActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  tabCount: { background: 'rgba(14,165,233,0.2)', color: 'var(--sky)', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 },
  search: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: 14, outline: 'none', minWidth: 220 },
  tableWrapper: { overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(14,165,233,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(14,165,233,0.1)' },
  tr: { borderBottom: '1px solid rgba(14,165,233,0.06)' },
  td: { padding: '14px 20px', verticalAlign: 'middle' },
  idTag: { fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 },
  userName: { fontSize: 14, fontWeight: 600, color: '#fff' },
  emailText: { fontSize: 13, color: 'var(--muted)' },
  roleBadge: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 },
  statutBadge: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 },
  date: { fontSize: 13, color: 'var(--muted)' },
  actions: { display: 'flex', gap: 6 },
  editBtn: { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 8, padding: '6px 10px', color: '#0ea5e9', fontSize: 14, cursor: 'pointer' },
  deleteBtn: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, padding: '6px 10px', color: '#f43f5e', fontSize: 14, cursor: 'pointer' },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal: { background: '#1e293b', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  select: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 },
  saveBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
};