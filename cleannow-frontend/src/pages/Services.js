import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, demandesAPI } from '../api/axios';
import CardService from '../components/CardService';
import Alert from '../components/Alert';

const EMPTY_FORM = { nom: '', description: '', prix: '', duree: '' };

export default function Services() {
  const { isAdmin, isBeneficiaire, user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [demandeForm, setDemandeForm] = useState({ adresse: '', description: '', date_souhaitee: '' });
  const [sendingDemande, setSendingDemande] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await servicesAPI.getAll();
      setServices(res.data);
    } catch {
      setAlert({ type: 'error', message: 'Impossible de charger les services.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (s) => {
    setEditTarget(s);
    setForm({ nom: s.nom || s.name || '', description: s.description || '', prix: s.prix || '', duree: s.duree || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await servicesAPI.update(editTarget.id, form);
        setAlert({ type: 'success', message: '✅ Service mis à jour avec succès.' });
      } else {
        await servicesAPI.create(form);
        setAlert({ type: 'success', message: '✅ Nouveau service créé avec succès.' });
      }
      setShowModal(false);
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service définitivement ?')) return;
    try {
      await servicesAPI.delete(id);
      setAlert({ type: 'success', message: '🗑 Service supprimé.' });
      load();
    } catch {
      setAlert({ type: 'error', message: 'Erreur lors de la suppression.' });
    }
  };

  const handleSelectService = (service) => {
    if (!isBeneficiaire) return;
    setSelectedService(service);
    setDemandeForm({ adresse: '', description: '', date_souhaitee: '' });
    setShowDemandeModal(true);
  };

  const handleSendDemande = async (e) => {
    e.preventDefault();
    setSendingDemande(true);
    try {
      await demandesAPI.create({ service_id: selectedService.id, ...demandeForm });
      setAlert({ type: 'success', message: `✅ Demande envoyée pour "${selectedService.nom || selectedService.name}" !` });
      setShowDemandeModal(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Erreur lors de l\'envoi.' });
    } finally {
      setSendingDemande(false);
    }
  };

  const filtered = services.filter((s) =>
    (s.nom || s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Services disponibles</h1>
          <p style={styles.subtitle}>
            {services.length} service{services.length !== 1 ? 's' : ''}
            {isBeneficiaire && <span style={styles.hint}> — Cliquez sur un service pour faire une demande</span>}
          </p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} style={styles.addBtn}>
            + Ajouter un service
          </button>
        )}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un service..."
          style={styles.searchInput}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={styles.center}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>✦</span>
          <p>Aucun service trouvé</p>
          {isAdmin && <button onClick={openCreate} style={styles.emptyBtn}>+ Créer le premier service</button>}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((s) => (
            <CardService
              key={s.id}
              service={s}
              isAdmin={isAdmin}
              isBeneficiaire={isBeneficiaire}
              onEdit={openEdit}
              onDelete={handleDelete}
              onSelect={isBeneficiaire ? handleSelectService : null}
            />
          ))}
        </div>
      )}

      {/* ── Modal Admin: Créer/Modifier service ── */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalBadge}>{editTarget ? '✏️ Modification' : '✦ Nouveau'}</span>
                <h2 style={styles.modalTitle}>{editTarget ? 'Modifier le service' : 'Ajouter un service'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Nom du service *</label>
                <input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                  placeholder="Ex: Nettoyage appartement"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Décrivez le service en détail..."
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Prix (MAD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.prix}
                    onChange={(e) => setForm({ ...form, prix: e.target.value })}
                    placeholder="0.00"
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Durée estimée</label>
                  <input
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    placeholder="Ex: 2h, 1 journée"
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? '⏳ Enregistrement...' : editTarget ? '✓ Mettre à jour' : '+ Créer le service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Bénéficiaire: Faire une demande ── */}
      {showDemandeModal && selectedService && (
        <div style={styles.overlay} onClick={() => setShowDemandeModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalBadge}>📋 Nouvelle demande</span>
                <h2 style={styles.modalTitle}>{selectedService.nom || selectedService.name}</h2>
                {selectedService.prix && (
                  <p style={styles.modalPrice}>{selectedService.prix} MAD</p>
                )}
              </div>
              <button onClick={() => setShowDemandeModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSendDemande} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Adresse d'intervention *</label>
                <input
                  value={demandeForm.adresse}
                  onChange={(e) => setDemandeForm({ ...demandeForm, adresse: e.target.value })}
                  required
                  placeholder="Votre adresse complète..."
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Date souhaitée</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={demandeForm.date_souhaitee}
                  onChange={(e) => setDemandeForm({ ...demandeForm, date_souhaitee: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Remarques / Instructions</label>
                <textarea
                  value={demandeForm.description}
                  onChange={(e) => setDemandeForm({ ...demandeForm, description: e.target.value })}
                  rows={3}
                  placeholder="Précisez vos besoins, accès, instructions spéciales..."
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowDemandeModal(false)} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" disabled={sendingDemande} style={styles.saveBtn}>
                  {sendingDemande ? '⏳ Envoi...' : '→ Envoyer la demande'}
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
  hint: { color: 'var(--sky)', fontStyle: 'italic' },
  addBtn: {
    background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none',
    borderRadius: 10, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.3px',
  },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(14,165,233,0.2)',
    borderRadius: 10, padding: '0 16px', marginBottom: 24,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '14px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  emptyBtn: { background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 10, padding: '10px 24px', color: 'var(--sky)', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal: { background: '#1e293b', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  modalBadge: { fontSize: 12, color: 'var(--sky)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' },
  modalPrice: { color: 'var(--sky)', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginTop: 4 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 },
  saveBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
};