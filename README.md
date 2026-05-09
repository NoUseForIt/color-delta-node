# Δ Color Delta V5 — Node.js Edition

**Outil professionnel de correction colorimétrique pour RIP ColorGATE/Caldera**

Version 5.0.0 - Portage HTML monolithe → Architecture Node.js/Express + React

---

## 🎯 Projet

Calcul de dérive Lab, historique d'itérations, correction teinte support, gestion de sessions multi-projets.

## 🏗️ Stack Technique

- **Backend**: Node.js v24.x, Express, Vitest
- **Frontend**: React 18, Vite
- **Formats**: XML (CCT ColorGATE), JSON (sessions)
- **Calculs**: CIEDE2000, Lab ↔ sRGB, corrections substrat

## 📂 Structure

```
color-delta-node/
├── backend/          # API Express + services métier
├── frontend/         # Interface React (Vite)
├── docs/audit/       # Documentation technique (10 fichiers MD)
└── README.md
```

## 🚀 Quick Start

**Installation:**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

**Accès:** http://localhost:5173

## 📖 Documentation

- [Installation complète](docs/audit/06_MAINTENANCE_DEPLOYMENT_GUIDE.md)
- [Spécifications API](docs/audit/03_AUDIT_API_SERVICES.md)
- [Guide utilisateur](docs/audit/05_AUDIT_SPECIFICATIONS_FONCTIONNELLES.md)

## 🧪 Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## 📝 Changelog

**V5.0.0** (2025) - Portage complet Node.js
- Architecture backend/frontend séparée
- API REST 30+ endpoints
- Gestion multi-projets avec stockage local
- Tests unitaires & intégration

**V3** (HTML monolithe) - Base de référence

---

**Auteur:** NoUseForIt  
**License:** MIT  
**Repo:** https://github.com/NoUseForIt/color-delta-node
