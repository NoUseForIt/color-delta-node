# Backend API - Color Delta Tool (Phase 3)

## 🚀 Installation Rapide

```bash
# 1. Installer dépendances
npm install

# 2. Lancer le serveur
npm start

# Le serveur démarre sur http://localhost:5000
```

## 📋 Endpoints API

### GET /api/health
Healthcheck serveur

**Response 200:**
```json
{ "status": "ok", "timestamp": "2026-05-10T..." }
```

### POST /api/parse-cct
Upload et parse fichier .cct

**Request:** FormData avec `file`

**Response 200:**
```json
{
  "colors": [{
    "name": "Cyan",
    "bench": {"L": 50, "a": -30, "b": -50},
    "rip": {"L": 49, "a": -31, "b": -51}
  }],
  "sourceXML": "<?xml...",
  "css": ["Cyan", "Magenta", ...]
}
```

### POST /api/compute-corrections
Calcule corrections

**Request:**
```json
{
  "colors": [{
    "name": "Cyan",
    "bench": {"L": 50, "a": -30, "b": -50},
    "rip": {"L": 49, "a": -31, "b": -51},
    "scanPrint": {"L": 48, "a": -32, "b": -52}
  }],
  "deltaWP": {"dL": 0.5, "da": 0.2, "db": -0.1}
}
```

**Response 200:**
```json
{
  "corrections": [{
    "name": "Cyan",
    "bench": {...},
    "rip": {...},
    "scanPrint": {...},
    "derive": {
      "deltaE": 2.5,
      "dL": 1.0,
      "da": 0.5,
      "db": 0.3
    },
    "newRip": {"L": 48.5, "a": -31.8, "b": -51.7},
    "alerts": {
      "substrateLimit": false,
      "message": ""
    }
  }]
}
```

### POST /api/export-cct
Export fichier .cct corrigé

**Request:**
```json
{
  "sourceXML": "<?xml...",
  "colors": [...],
  "deltaWP": {"dL": 0.5, "da": 0.2, "db": -0.1}
}
```

**Response 200:** Fichier .cct (application/xml)

## 📁 Structure

```
backend/
├── server.js                  # Serveur Express
├── routes/
│   └── api.routes.js          # Routes API
├── controllers/
│   └── color.controller.js    # Controllers
├── middleware/
│   ├── upload_middleware.js   # Multer upload
│   ├── validate_middleware.js # Joi validation
│   └── error.middleware.js    # Error handler
├── services/                  # Services Phase 2
│   ├── cctParser_service.js
│   ├── labCalculations_service.js
│   └── colorCorrection_service.js
├── tests/
│   └── integration/
│       └── api.test.js        # Tests API
├── uploads/                   # Upload temp
├── package.json
└── README.md
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests API seulement
npm run test:integration
```

## 🔧 Configuration

### Port
Par défaut: `5000`

Modifier via variable d'environnement:
```bash
PORT=3000 npm start
```

### CORS
Configuré pour accepter toutes les origins en dev.

Production: Éditer `server.js` ligne 10:
```javascript
app.use(cors({
  origin: 'https://ton-frontend.com'
}));
```

## 📝 Dépendances

- express: ^4.18.0
- cors: ^2.8.5
- helmet: ^8.0.0
- multer: ^1.4.5
- joi: ^17.13.0
- @xmldom/xmldom: ^0.9.10

## 🐛 Debug

### Erreur "ENOENT: no such file or directory"
→ Crée le dossier `uploads/`: `mkdir uploads`

### Port déjà utilisé
→ Change le port: `PORT=3001 npm start`

### CORS error depuis frontend
→ Vérifie que cors est activé dans `server.js`

## 📚 Documentation Complète

Voir `PHASE3_SUMMARY.md` pour détails techniques complets.
