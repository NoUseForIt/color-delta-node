# 🚀 Guide Installation Backend Phase 3

## 📦 Qu'est-ce que c'est ?

Le backend Phase 3 est l'API REST Node.js/Express qui :
- Parse les fichiers .cct
- Calcule les corrections colorimétriques
- Exporte les fichiers corrigés

## ⚡ Installation (5 minutes)

### 1. Prérequis
- Node.js 18+ installé ([télécharger](https://nodejs.org))

### 2. Copier le dossier backend

Place le dossier `phase3-backend/` dans ton projet :
```
C:\Users\IA91\Projets\color-delta-node\
└── backend/          ← Place ici le contenu de phase3-backend/
```

### 3. Installer les dépendances

```bash
cd C:\Users\IA91\Projets\color-delta-node\backend
npm install
```

**Attends 1-2 minutes** pendant l'installation.

### 4. Lancer le serveur

```bash
npm start
```

✅ Tu devrais voir :
```
✅ Server running on http://localhost:5000
📡 API available at http://localhost:5000/api
```

### 5. Tester que ça marche

Ouvre ton navigateur sur `http://localhost:5000/api/health`

Tu devrais voir :
```json
{"status":"ok","timestamp":"..."}
```

## 🎯 Utilisation avec Frontend

### Backend + Frontend ensemble

**Terminal 1 : Backend**
```bash
cd C:\Users\IA91\Projets\color-delta-node\backend
npm start
```

**Terminal 2 : Frontend**
```bash
cd C:\Users\IA91\Projets\color-delta-node\frontend
npm run dev
```

**Puis ouvre** `http://localhost:3000` dans ton navigateur.

## 📁 Structure Finale du Projet

```
C:\Users\IA91\Projets\color-delta-node\
├── backend/                    ← Phase 3 (ce dossier)
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── tests/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── README.md
│
└── frontend/                   ← Phase 4
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## 🐛 Problèmes Courants

### "npm install" échoue
```bash
# Vider le cache
npm cache clean --force
npm install
```

### Port 5000 déjà utilisé
```bash
# Utiliser port 3001
PORT=3001 npm start
```

Puis dans frontend, éditer `.env` :
```
VITE_API_URL=http://localhost:3001/api
```

### Module not found
```bash
# Vérifier que tu es dans le bon dossier
cd backend
pwd   # Doit afficher .../backend

# Réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Serveur ne démarre pas
```bash
# Vérifier Node.js version
node --version   # Doit être 18+

# Regarder les erreurs complètes
npm start
```

## ✅ Vérification Complète

1. **Backend lancé** : `http://localhost:5000/api/health` → ✓
2. **Frontend lancé** : `http://localhost:3000` → ✓
3. **Upload fonctionne** : Drag & drop .cct → ✓

## 📝 Commandes Utiles

```bash
# Lancer serveur
npm start

# Lancer tests
npm test

# Arrêter serveur
Ctrl+C

# Voir les logs
npm start   # Les logs s'affichent directement
```

## 🔗 Endpoints API

- `GET /api/health` - Healthcheck
- `POST /api/parse-cct` - Parse fichier
- `POST /api/compute-corrections` - Calculer corrections
- `POST /api/export-cct` - Export fichier

Voir `README.md` pour détails complets.

---

**Bon courage ! 🚀**

Si problème, vérifie que :
1. Node.js 18+ est installé
2. Tu es dans le dossier `backend/`
3. `npm install` s'est terminé sans erreur
