import React, { useEffect, useState } from 'react';
import { demandesAPI, servicesAPI } from '../api/axios';
import CardDemande from '../components/CardDemande';
import Alert from '../components/Alert';

export default function MesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ serviceId: '', adresse: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [filterStatut, setFilterStatut] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const sRes = await servicesAPI.getAll();
      setServices(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (err) {
      console.error('Erreur chargement services:', err);
    }
    try {
      const dRes = await demandesAPI.getMine();
      setDemandes(Array.isArray(dRes.data) ? dRes.data : []);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const serviceId = parseInt(form.serviceId, 10);
    if (!form.serviceId || isNaN(serviceId)) {
      setAlert({ type: 'error', message: 'Veuillez choisir un service.' });
      return;
    }
    if (!form.adresse.trim()) {
      setAlert({ type: 'error', message: 'Veuillez saisir votre adresse.' });
      return;
    }
    setSaving(true);
    try {
      await demandesAPI.create({ serviceId, adresse: form.adresse.trim(), notes: form.notes.trim() });
      setAlert({ type: 'success', message: 'Demande créée avec succès !' });
      setShowModal(false);
      setForm({ serviceId: '', adresse: '', notes: '' });
      load();
    } catch (err) {
      console.error('Erreur création:', err.response?.data || err.message);
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erreur lors de la création.' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = demandes.filter((d) => filterStatut === 'all' || d.statut === filterStatut);
  const statusCount = (s) => demandes.filter((d) => d.statut === s).length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mes Demandes</h1>
          <p style={styles.subtitle}>{demandes.length} demande{demandes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>
          + Nouvelle demande
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={styles.tabs}>
        {[
          { value: 'all',        label: 'Toutes',       count: demandes.length },
          { value: 'en_attente', label: '⏳ En attente', count: statusCount('en_attente') },
          { value: 'en_cours',   label: '⚙️ En cours',  count: statusCount('en_cours') },
          { value: 'termine',    label: '✅ Terminées',  count: statusCount('termine') },
          { value: 'annule',     label: '✕ Annulées',   count: statusCount('annule') },
        ].map((t) => (
          <button key={t.value} onClick={() => setFilterStatut(t.value)}
            style={{ ...styles.tab, ...(filterStatut === t.value ? styles.tabActive : {}) }}>
            {t.label}<span style={styles.tabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.center}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>📋</span>
          <p>Aucune demande{filterStatut !== 'all' ? ' dans cette catégorie' : ''}</p>
          <button onClick={() => setShowModal(true)} style={styles.emptyBtn}>+ Créer une demande</button>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((d) => (
            <CardDemande key={d.id} demande={d} isFournisseur={false} isAdmin={false} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✦ Nouvelle demande</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={styles.form}>

              {/* Service */}
              <div style={styles.field}>
                <label style={styles.label}>Service souhaité *</label>
                {services.length === 0 ? (
                  <p style={{ color: '#f59e0b', fontSize: 13 }}>⚠️ Aucun service disponible.</p>
                ) : (
                  <select
                    value={form.serviceId}
                    onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">— Choisir un service —</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom} — {s.prix} MAD
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Adresse */}
              <div style={styles.field}>
                <label style={styles.label}>Adresse d'intervention *</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  placeholder="Ex: 12 Rue Mohammed V, Rabat"
                  style={styles.input}
                />
              </div>

              {/* Notes optionnelles */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Notes <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(facultatif)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  maxLength={300}
                  placeholder="Précisez vos besoins, contraintes horaires, accès..."
                  style={{ ...styles.input, resize: 'vertical' }}
                />
                <span style={styles.charCount}>{form.notes.length}/300</span>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  style={{ ...styles.saveBtn, opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? '⏳ Envoi...' : '→ Envoyer la demande'}
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
  tabs: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  tabActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  tabCount: { background: 'rgba(14,165,233,0.2)', color: 'var(--sky)', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  emptyBtn: { background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 10, padding: '10px 24px', color: 'var(--sky)', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal: { background: '#1e293b', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  select: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  charCount: { fontSize: 11, color: 'var(--muted)', textAlign: 'right' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 },
  saveBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: 14 },
};