# Color Delta Tool - Frontend React

Interface utilisateur moderne pour l'analyse et la correction des dérives colorimétriques.

## 🚀 Stack Technique

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Styling utility-first
- **React Query** - Gestion des appels API
- **Zustand** - State management léger
- **Axios** - Client HTTP
- **Lucide React** - Icônes modernes

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── FileUploader.jsx
│   │   ├── ColorCard.jsx
│   │   ├── AnalysisPanel.jsx
│   │   └── HistoryPanel.jsx
│   ├── pages/           # Pages principales
│   │   └── ColorDashboard.jsx
│   ├── services/        # Appels API
│   │   ├── apiClient.js
│   │   └── colorService.js
│   ├── stores/          # State Zustand
│   │   └── colorStore.js
│   ├── hooks/           # Hooks React Query
│   │   └── useColorAPI.js
│   ├── utils/           # Helpers
│   │   └── formatters.js
│   ├── App.jsx          # Composant racine
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── public/              # Assets statiques
├── index.html           # Template HTML
├── package.json         # Dépendances
├── vite.config.js       # Config Vite
├── tailwind.config.js   # Config Tailwind
└── postcss.config.js    # Config PostCSS
```

## 🛠️ Installation

### Prérequis
- Node.js 18+ et npm

### Étapes

1. **Installer les dépendances**
```bash
cd frontend
npm install
```

2. **Configurer l'API** (optionnel)
```bash
cp .env.example .env
# Éditer .env si l'API n'est pas sur localhost:5000
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Scripts Disponibles

```bash
# Développement avec hot-reload
npm run dev

# Build production
npm run build

# Preview du build production
npm run preview

# Linter
npm run lint
```

## 🎯 Fonctionnalités

### 1. Upload de fichier .cct
- Drag & drop ou sélection
- Validation format et taille (max 5MB)
- Parsing automatique

### 2. Visualisation des couleurs
- Grid responsive avec patches couleur
- Affichage Lab, XYZ, RGB
- Calcul automatique des ΔE

### 3. Analyse des dérives
- Dérive du point blanc (ΔE WP)
- Statistiques des ΔE couleurs
- Classification par sévérité

### 4. Correction colorimétrique
- Application de l'algorithme CAT02
- Préservation de la structure des couleurs
- Comparaison avant/après

### 5. Historique des itérations
- Sauvegarde automatique
- Restauration d'itérations précédentes
- Métadonnées (timestamp, ΔE WP)

### 6. Export .cct
- Génération fichier corrigé
- Téléchargement automatique
- Métadonnées préservées

## 🔌 Connexion avec l'API Backend

Le frontend communique avec l'API REST via 4 endpoints :

- `POST /api/colors/upload` - Upload fichier
- `POST /api/colors/analyze` - Analyse couleurs
- `POST /api/colors/correct` - Correction couleurs
- `POST /api/colors/export` - Export .cct

Configuration dans `src/services/apiClient.js` :
```javascript
baseURL: 'http://localhost:5000/api'
```

Le proxy Vite redirige `/api/*` vers le backend en développement.

## 🎨 Architecture du State

### Zustand Store (`colorStore.js`)
```javascript
{
  currentFile: File | null,
  colors: Array,
  whitePoint: Object,
  analysis: Object,
  correctedColors: Array,
  history: Array,
  isLoading: boolean,
  error: string | null
}
```

### React Query Cache
- Gestion automatique des mutations
- Invalidation intelligente du cache
- Retry sur erreurs réseau

## 📊 Gestion des Erreurs

- Validation côté client (format fichier, taille)
- Affichage clair des erreurs API
- Rollback automatique en cas d'échec
- Logs console pour debug

## 🚢 Build Production

```bash
npm run build
```

Génère un dossier `dist/` optimisé :
- Minification JS/CSS
- Tree-shaking
- Code-splitting
- Assets optimisés

Servir avec :
```bash
npm run preview
# ou avec n'importe quel serveur statique
npx serve dist
```

## 🔄 Intégration avec GitHub

### Setup du repo

```bash
# Dans le dossier frontend/
git init
git add .
git commit -m "Phase 4: Frontend React initial"
git branch -M main
git remote add origin https://github.com/NoUseForIt/color-delta-tool.git
git push -u origin main
```

### Structure recommandée du repo global

```
color-delta-tool/
├── backend/          # API Node.js (Phase 3)
├── frontend/         # React App (Phase 4)
├── services/         # Services métier (Phase 2)
├── tests/            # Tests
└── README.md         # Documentation globale
```

## 🐛 Debug

### Console navigateur
- Ouvrir DevTools (F12)
- Onglet Console pour logs
- Onglet Network pour requêtes API

### React DevTools
- Installer extension React DevTools
- Inspecter state Zustand et React Query

### Vite logs
```bash
# Mode verbose
npm run dev -- --debug
```

## 📝 Notes pour Débutants

### Commandes de base
```bash
# Vérifier version Node.js
node --version  # Doit être 18+

# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Arrêter le serveur
Ctrl+C
```

### Modifier l'URL de l'API
1. Ouvrir `.env`
2. Changer `VITE_API_URL=http://localhost:5000/api`
3. Redémarrer `npm run dev`

### Déployer
1. Build : `npm run build`
2. Le dossier `dist/` contient l'app complète
3. Uploader sur Netlify, Vercel, ou n'importe quel hébergeur

## 🔗 Liens Utiles

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

## 📄 Licence

Projet éducatif - Libre d'utilisation
