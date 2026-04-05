import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }     from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute }   from './routes/ProtectedRoute';
import Navbar    from './components/Navbar';
import Footer    from './components/Footer';

// ── Pages existantes ─────────────────────────────────────
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import Services         from './pages/Services';
import MesDemandes      from './pages/MesDemandes';
import DemandesATraiter from './pages/DemandesATraiter';
import Demandes         from './pages/Demandes';
import Paiements        from './pages/Paiements';
import Evaluations      from './pages/Evaluations';
import Utilisateurs     from './pages/Utilisateurs';

// ── ✨ NOUVELLES PAGES (Priorité haute) ──────────────────
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import ProfilPage from './pages/ProfilPage';
import HistoriqueFournisseur from './pages/HistoriqueFournisseur';


const globalCSS = `
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  .spinner { display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(14,165,233,0.2); border-top-color: var(--sky); border-radius: 50%; animation: spin 0.8s linear infinite; }
  input:focus, textarea:focus, select:focus { border-color: rgba(14,165,233,0.6) !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.1) !important; outline: none; }
  button:hover { opacity: 0.88; }
  a:hover { opacity: 0.85; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(14,165,233,0.5); }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; overflow-x: hidden; }

  @media (max-width: 768px) {
    input, textarea, select { font-size: 16px !important; }
    table { min-width: 500px; }
    .table-wrapper, .tableWrapper { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
    h1 { font-size: 24px !important; }
    h2 { font-size: 20px !important; }
    .spinner { width: 28px; height: 28px; }
  }

  @media (hover: none) and (pointer: coarse) {
    button { min-height: 44px; }
    input, select, textarea { min-height: 44px; }
  }
`;

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, animation: 'fadeIn 0.3s ease' }}>{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Routes publiques (sans navbar/footer) ────────────────────────── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* ✨ Routes mot de passe (sans navbar/footer) */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Redirection par défaut ──────────────────────────────────────── */}
      <Route path="/"         element={<Navigate to="/dashboard" replace />} />

      {/* ── Routes protégées (avec navbar/footer) - Tous les utilisateurs ──── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"   element={<Layout><Dashboard /></Layout>} />
        <Route path="/services"    element={<Layout><Services /></Layout>} />
        <Route path="/paiements"   element={<Layout><Paiements /></Layout>} />
        <Route path="/evaluations" element={<Layout><Evaluations /></Layout>} />
        
        {/* ✨ Routes profil (disponibles pour tous) */}
        <Route path="/profil"      element={<Layout><ProfilPage /></Layout>} />
      </Route>

      {/* ── Routes protégées - Bénéficiaire ───────────────────────────────── */}
      <Route element={<ProtectedRoute roles={['beneficiaire']} />}>
        <Route path="/mes-demandes" element={<Layout><MesDemandes /></Layout>} />
      </Route>

      {/* ── Routes protégées - Fournisseur & Admin ─────────────────────────── */}
      <Route element={<ProtectedRoute roles={['fournisseur', 'admin']} />}>
        <Route path="/demandes-a-traiter" element={<Layout><DemandesATraiter /></Layout>} />
        
        {/* ✨ Historique du fournisseur */}
        <Route path="/historique" element={<Layout><HistoriqueFournisseur /></Layout>} />
      </Route>

      {/* ── Routes protégées - Admin uniquement ──────────────────────────── */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/demandes"     element={<Layout><Demandes /></Layout>} />
        <Route path="/utilisateurs" element={<Layout><Utilisateurs /></Layout>} />
      </Route>

      {/* ── Fallback (page non trouvée) ──────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalCSS;
    document.head.appendChild(style);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('SW registered:', reg.scope))
          .catch(err => console.warn('SW failed:', err));
      });
    }
    return () => document.head.removeChild(style);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}