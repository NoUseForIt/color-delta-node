# 🚀 Phase 5 — Tests E2E + Déploiement Production

**Color Delta V5 - Finalisation & Production Ready**

---

## 📋 Vue d'Ensemble Phase 5

Phase 5 complète le projet avec :
1. **Tests End-to-End** (Playwright)
2. **Documentation Utilisateur** (non-technique)
3. **Configuration Production** (scripts, env)
4. **Containerisation** (Docker)
5. **CI/CD** (GitHub Actions)

---

## 📂 Structure Livrée

```
phase5-setup/
├── e2e/                        # Tests End-to-End Playwright
│   ├── fixtures/
│   │   ├── sample-valid.cct    # Fichier test valide
│   │   └── sample-invalid.cct  # Fichier test erreurs
│   └── workflow.spec.js        # 13 scénarios E2E
│
├── docs/                       # Documentation
│   ├── USER_GUIDE.md           # Guide utilisateur final
│   ├── FAQ_TROUBLESHOOTING.md  # FAQ + résolution problèmes
│   └── DOCKER_GUIDE.md         # Guide Docker complet
│
├── config/                     # Configuration production
│   ├── .env.example            # Variables env backend
│   └── .env.frontend.example   # Variables env frontend
│
├── scripts/                    # Scripts démarrage
│   ├── start-backend.sh        # Démarrage backend (dev/prod)
│   ├── start-frontend.sh       # Démarrage frontend (dev/prod)
│   └── healthcheck.sh          # Vérification santé services
│
├── docker/                     # Containerisation
│   ├── Dockerfile.backend      # Image backend optimisée
│   ├── Dockerfile.frontend     # Image frontend multi-stage
│   ├── nginx.conf              # Config nginx frontend
│   └── docker-compose.yml      # Stack complète
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Pipeline GitHub Actions
│
├── playwright.config.js        # Config Playwright
├── package.json                # Dépendances E2E
└── README_PHASE5.md            # Ce fichier
```

---

## ✅ Livrables Détaillés

### 1️⃣ Tests E2E Playwright

**Fichier :** `e2e/workflow.spec.js`

**13 tests couvrant :**
- Upload fichier .cct valide/invalide
- Calcul analyse automatique
- Application corrections 1-clic
- Export fichier corrigé
- Historique itérations
- Workflow multi-itérations complet
- Gestion erreurs (fichier wrong type, XML malformé)
- Visualisation couleurs
- Tri par ΔE
- Responsive mobile

**Coverage :** >80% workflows critiques

**Commandes :**
```bash
# Installation
npm install
npx playwright install chromium firefox

# Run tests
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Debug
npm run test:e2e:debug

# Rapport HTML
npm run test:e2e:report
```

**Configuration :**
- Auto-start backend (port 5000) + frontend (port 3000)
- Screenshots en cas d'échec
- Vidéos tests failed
- Traces debugging
- Multi-browser (Chrome, Firefox)

---

### 2️⃣ Documentation Utilisateur

#### **USER_GUIDE.md** (Guide Non-Technique)

Contenu :
- Explication workflow correction couleurs
- Démarrage rapide 5 étapes
- Comprendre interface (cartes couleurs, ΔE)
- Workflow multi-itérations
- FAQ troubleshooting
- Exemples fichiers test
- Checklist succès

**Public cible :** Opérateurs impression sans compétences techniques

#### **FAQ_TROUBLESHOOTING.md** (Guide Résolution Problèmes)

Sections :
- Erreurs upload (type fichier, taille, parsing XML)
- Problèmes affichage couleurs
- Erreurs backend (connection refused, 500)
- Problèmes scientifiques (substrate alert, convergence)
- Performance (lenteur, memory leak)
- Erreurs export
- Sécurité (CORS)

**Format :** Questions/réponses avec solutions concrètes

#### **DOCKER_GUIDE.md** (Déploiement Docker)

Sections :
- Installation Docker
- Démarrage rapide Docker Compose
- Configuration variables env
- Debug & logs
- Mise à jour images
- Production deployment
- Sécurité
- Monitoring
- Troubleshooting Docker

---

### 3️⃣ Configuration Production

#### **Variables Environnement**

**Backend (`.env.example`) :**
- SERVER : NODE_ENV, PORT, HOST
- CORS : origins autorisées
- UPLOAD : max size, directory
- LOGS : level, file
- SÉCURITÉ : helmet, rate limiting
- PERFORMANCE : timeout, compression
- MONITORING : health check interval

**Frontend (`.env.frontend.example`) :**
- API : base URL, timeout
- FEATURES FLAGS : debug, history, multi-export
- UI CONFIG : max colors display, seuils ΔE
- ANALYTICS : Google Analytics, Sentry (optionnel)
- BUILD : base URL si sous-dossier

#### **Scripts Démarrage**

**`start-backend.sh`** :
- Vérifie Node.js version ≥18
- Install dependencies si manquantes
- Crée .env depuis example si besoin
- Prépare directories (uploads, logs)
- Démarre en mode dev (nodemon) ou prod (PM2)

**`start-frontend.sh`** :
- Vérifie Node.js version
- Install dependencies
- Crée .env si manquant
- Mode dev (Vite) ou prod (build + serve)

**`healthcheck.sh`** :
- Vérifie backend /api/health
- Vérifie frontend accessible
- Exit code 0 (OK) ou 1 (FAIL)
- Utilisable dans cron/monitoring

**Permissions :**
```bash
chmod +x scripts/*.sh
```

---

### 4️⃣ Docker

#### **Dockerfile.backend**

Caractéristiques :
- Multi-stage build (builder + production)
- Base image : `node:20-alpine`
- Non-root user (`nodejs:1001`)
- Production dependencies uniquement
- Volumes : uploads, logs
- Health check intégré
- Expose port 5000

**Build :**
```bash
docker build -f docker/Dockerfile.backend -t color-delta-backend .
```

#### **Dockerfile.frontend**

Caractéristiques :
- Multi-stage build (builder + nginx)
- Build Vite production optimisé
- Serve avec nginx:1.25-alpine
- Non-root user (nginx)
- Gzip compression
- Security headers
- SPA routing config
- Health check endpoint
- Expose port 3000

**Build :**
```bash
docker build -f docker/Dockerfile.frontend -t color-delta-frontend .
```

#### **docker-compose.yml**

Services :
- `backend` : API Express
- `frontend` : React + nginx

Features :
- Depends_on avec health checks
- Volumes persistants (uploads, logs)
- Network bridge isolé
- Environment variables
- Auto-restart policy

**Usage :**
```bash
# Start
cd docker
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### 5️⃣ CI/CD GitHub Actions

**Fichier :** `.github/workflows/ci-cd.yml`

**6 Jobs :**

1. **test-backend** :
   - Install dependencies
   - Run unit tests
   - Upload coverage Codecov

2. **test-frontend** :
   - Install dependencies
   - Run tests
   - Build production

3. **test-e2e** :
   - Install Playwright
   - Start backend + frontend
   - Run E2E tests
   - Upload test reports

4. **lint** :
   - ESLint backend
   - ESLint frontend

5. **build-docker** :
   - Build backend image
   - Build frontend image
   - Push to Docker Hub (main branch)
   - Multi-platform support

6. **deploy** :
   - Deploy production (optionnel)
   - Manual approval required

**Triggers :**
- Push sur main/develop
- Pull requests vers main

**Cache :**
- npm dependencies
- Docker layers (buildx cache)

**Secrets requis :**
- `DOCKER_USERNAME`
- `DOCKER_TOKEN`

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- Docker (optionnel)
- Git

### Installation Complète

```bash
# 1. Copier fichiers Phase 5 dans projet
cd color-delta-node
cp -r /path/to/phase5-setup/* .

# 2. Backend
cd backend
cp ../config/.env.example .env
# Éditer .env avec vos valeurs
npm install
npm start

# 3. Frontend
cd ../frontend
cp ../config/.env.frontend.example .env
# Éditer .env
npm install
npm run dev

# 4. Tests E2E
cd ..
npm install
npx playwright install chromium
npm run test:e2e
```

### Démarrage Docker

```bash
# 1. Copier docker-compose.yml
cd color-delta-node/docker

# 2. Build et start
docker-compose up -d

# 3. Vérifier
docker-compose ps
curl http://localhost:5000/api/health
curl http://localhost:3000

# 4. Logs
docker-compose logs -f
```

---

## 📊 Tests & Qualité

### Tests Unitaires (Phase 2)

```bash
cd backend
npm test
# 71 tests - 93% coverage
```

### Tests Intégration API (Phase 3)

```bash
cd backend
npm run test:integration
# 18 tests API - 95%+ coverage
```

### Tests E2E (Phase 5)

```bash
npm run test:e2e
# 13 scénarios workflow complet
```

### Coverage Global

| Composant | Tests | Coverage |
|-----------|-------|----------|
| Services Backend | 71 | 93% |
| API Controllers | 18 | 95% |
| E2E Workflows | 13 | 80%+ |

---

## 🔧 Maintenance

### Mettre à jour dépendances

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

### Nettoyer uploads

```bash
# Manuel
cd backend/uploads
rm *.cct

# Automatique (cron)
0 2 * * * find /path/to/backend/uploads -name "*.cct" -mtime +7 -delete
```

### Backup volumes Docker

```bash
docker run --rm \
  -v docker_uploads-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz /data
```

---

## 📦 Déploiement Production

### Option 1 : VPS Classique

```bash
# SSH vers serveur
ssh user@server.com

# Clone repo
git clone https://github.com/NoUseForIt/color-delta-node.git
cd color-delta-node

# Configure env
cp config/.env.example backend/.env
cp config/.env.frontend.example frontend/.env
# Éditer avec valeurs production

# Start avec scripts
./scripts/start-backend.sh prod
./scripts/start-frontend.sh prod

# Vérifier
./scripts/healthcheck.sh
```

### Option 2 : Docker Compose

```bash
# Sur serveur
docker-compose -f docker/docker-compose.yml up -d

# Monitoring
docker-compose logs -f
docker stats
```

### Option 3 : Kubernetes (avancé)

Créer manifests k8s :
- Deployment backend
- Deployment frontend
- Service LoadBalancer
- Persistent Volume Claims
- ConfigMap/Secrets

---

## 📞 Support & Contribution

### Signaler Bug

1. Créer issue GitHub : https://github.com/NoUseForIt/color-delta-node/issues
2. Template :
   - Environnement (OS, Node version)
   - Steps to reproduce
   - Expected vs Actual
   - Logs backend + console
   - Fichier .cct si applicable

### Proposer Amélioration

1. Fork repo
2. Créer branche feature : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m "feat: description"`
4. Push : `git push origin feature/ma-feature`
5. Créer Pull Request

---

## ✅ Checklist Mise en Production

Avant déploiement production :

- [ ] Tests E2E passent 100%
- [ ] Coverage global >80%
- [ ] Variables .env configurées (pas de valeurs dev)
- [ ] CORS origins restreints (pas `*`)
- [ ] Helmet security headers activés
- [ ] Rate limiting configuré
- [ ] Logs niveau INFO (pas DEBUG)
- [ ] Health checks fonctionnels
- [ ] Backup strategy définie
- [ ] Monitoring configuré
- [ ] SSL/TLS certificats (HTTPS)
- [ ] Firewall configuré
- [ ] Documentation à jour

---

## 🎯 Prochaines Étapes (Phase 6+)

Améliorations futures :
- [ ] Base de données (PostgreSQL) pour sessions
- [ ] Authentification utilisateurs (JWT)
- [ ] Multi-projets simultanés
- [ ] API versioning (v2)
- [ ] WebSocket pour updates temps réel
- [ ] Export formats additionnels (JSON, CSV)
- [ ] Intégration RIP directe (API ColorGATE)
- [ ] Mobile app (React Native)

---

## 📚 Documentation Complète

### Phase 5

- `README_PHASE5.md` (ce fichier)
- `docs/USER_GUIDE.md`
- `docs/FAQ_TROUBLESHOOTING.md`
- `docs/DOCKER_GUIDE.md`

### Phases Précédentes

- `PHASE2_SUMMARY.md` (Services backend)
- `PHASE3_SUMMARY.md` (API REST)
- `PROJECT_CONTEXT.md` (Vue d'ensemble)
- `MAINTENANCE_GUIDE.md` (Maintenance technique)

---

## 📄 Licence

MIT License - Copyright (c) 2026 NoUseForIt

---

**Version :** 5.0.0  
**Phase :** 5 - Tests E2E + Déploiement  
**Date :** Mai 2026  
**Status :** ✅ PRODUCTION READY  
**Auteur :** NoUseForIt  
**GitHub :** https://github.com/NoUseForIt/color-delta-node
