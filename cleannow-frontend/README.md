# CleanNow — Frontend React PWA

Application frontend complète pour la plateforme de services de nettoyage **CleanNow**.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js ≥ 16
- npm ou yarn
- Backend CleanNow en cours d'exécution

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'URL du backend
cp .env.example .env
# Éditer .env et renseigner REACT_APP_API_URL

# 3. Lancer en développement
npm start
```

L'app sera disponible sur **http://localhost:3000**

### Build production

```bash
npm run build
```

---

## 📁 Structure du projet

```
src/
├── api/
│   └── axios.js          # Instance Axios + tous les appels API
├── components/
│   ├── Navbar.js          # Barre de navigation responsive
│   ├── Footer.js          # Pied de page
│   ├── CardService.js     # Carte service réutilisable
│   ├── CardDemande.js     # Carte demande réutilisable
│   └── Alert.js           # Composant alerte
├── context/
│   └── AuthContext.js     # Contexte d'authentification + JWT
├── pages/
│   ├── Login.js           # Connexion
│   ├── Register.js        # Inscription (3 rôles)
│   ├── Dashboard.js       # Tableau de bord
│   ├── Services.js        # Liste + CRUD services (admin)
│   ├── MesDemandes.js     # Demandes du bénéficiaire
│   ├── DemandesATraiter.js# File de travail fournisseur
│   ├── Demandes.js        # Vue admin de toutes les demandes
│   ├── Paiements.js       # Gestion des paiements
│   └── Evaluations.js     # Avis et notes
├── routes/
│   └── ProtectedRoute.js  # Guard par rôle
├── App.js                  # Router principal
└── index.js
public/
├── index.html
├── manifest.json          # PWA manifest
└── service-worker.js      # Cache + offline
```

---

## 👥 Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **admin** | Services (CRUD), toutes les demandes, paiements, évaluations |
| **beneficiaire** | Consulter services, créer/suivre demandes, payer, évaluer |
| **fournisseur** | Demandes à traiter (statut), paiements |

---

## 🔌 Endpoints consommés

| Endpoint | Méthodes |
|----------|----------|
| `/api/auth/login` | POST |
| `/api/auth/register` | POST |
| `/api/services` | GET, POST, PUT, DELETE |
| `/api/demandes` | GET, POST, PATCH |
| `/api/paiements` | GET, POST, PATCH |
| `/api/evaluations` | GET, POST, PUT |

---

## 📱 PWA

- **Service Worker** : cache des assets statiques, fallback offline pour les appels API
- **manifest.json** : installation sur mobile (Add to Home Screen)
- **Theme color** : `#0ea5e9`

---

## 🔐 Authentification JWT

1. L'utilisateur se connecte → le backend retourne `{ token, user }`
2. Le token est stocké dans `localStorage` sous la clé `cleannow_token`
3. Chaque requête Axios ajoute automatiquement `Authorization: Bearer <token>`
4. En cas de 401, l'utilisateur est redirigé vers `/login`

---

## ⚙️ Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `REACT_APP_API_URL` | URL base du backend | `http://localhost:8000` |

---

## 🎨 Design System

- **Couleurs** : Navy `#0f172a`, Sky `#0ea5e9`, Emerald `#10b981`, Amber `#f59e0b`
- **Polices** : Syne (display) + DM Sans (body)
- **Thème** : Dark mode uniforme
