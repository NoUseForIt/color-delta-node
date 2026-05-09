# Installation & Configuration — Color Delta V5

## Prérequis

- **Node.js**: v20.x ou supérieur (testé avec v24.15.0)
- **npm**: v9.x ou supérieur (testé avec v11.12.1)
- **Git**: Pour cloner le dépôt

## Installation complète

### 1. Cloner le dépôt

```bash
git clone https://github.com/NoUseForIt/color-delta-node.git
cd color-delta-node
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

**Éditer `.env` si nécessaire:**
```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Lancer:**
```bash
npm run dev
```

Backend accessible sur: http://localhost:3000

### 3. Frontend

**Dans un nouveau terminal:**
```bash
cd frontend
npm install
npm run dev
```

Frontend accessible sur: http://localhost:5173

## Vérification

1. Ouvrir http://localhost:5173
2. Vérifier message "Backend connecté"
3. Tester health check: http://localhost:3000/health

## Production

```bash
# Frontend: build
cd frontend
npm run build

# Backend: copier dist/ dans backend/public
cp -r dist ../backend/public

# Lancer en production
cd ../backend
NODE_ENV=production npm start
```

## Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Troubleshooting

**Port déjà utilisé:**
```bash
# Changer PORT dans backend/.env
# Changer port dans frontend/vite.config.js
```

**CORS errors:**
- Vérifier `CORS_ORIGIN` dans backend/.env
- Vérifier proxy dans frontend/vite.config.js

**Modules manquants:**
```bash
rm -rf node_modules package-lock.json
npm install
```
