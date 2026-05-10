# Color Delta V5 - Phase 3 : API RESTful

## ✅ Phase 3 Complétée (2026-05-09)

**API REST fonctionnelle** avec Express, 4 endpoints opérationnels, middlewares upload/validation/erreurs, tests intégration passés.

---

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Lancer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

### Mode développement (auto-reload)

```bash
npm run dev
```

### Lancer les tests

```bash
# Tous les tests avec coverage
npm test

# Tests unitaires seulement
npm run test:unit

# Tests intégration seulement
npm run test:integration

# Mode watch (développement)
npm run test:watch
```

---

## 📡 Endpoints API

### GET /api/health

Healthcheck serveur

**Response 200:**
```json
{
  "status": "ok",
  "version": "5.0.0",
  "timestamp": "2026-05-09T14:30:22.123Z"
}
```

---

### POST /api/parse-cct

Parse un fichier `.cct` ColorGATE et extrait les couleurs.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (fichier .cct)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "colors": [
      {
        "name": "ColorName",
        "bench": { "L": 50, "a": 10, "b": 20 },
        "rip": { "L": 50, "a": 10, "b": 20 },
        "scanPrint": null,
        "css": "rgb(142, 105, 81)"
      }
    ],
    "warnings": []
  }
}
```

**Errors:**
- 400: Pas de fichier / fichier non .cct
- 500: XML malformé

---

### POST /api/compute-corrections

Calcule les corrections colorimétriques (dérives, newRip, deltaE).

**Request:**
```json
{
  "colors": [
    {
      "name": "ColorName",
      "bench": { "L": 50, "a": 10, "b": 20 },
      "rip": { "L": 49, "a": 11, "b": 19 },
      "scanPrint": { "L": 48, "a": 12, "b": 18 }
    }
  ],
  "deltaWP": { "dL": 0.5, "da": 0.2, "db": -0.1 }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "colors": [
      {
        "name": "ColorName",
        "bench": { "L": 50, "a": 10, "b": 20 },
        "rip": { "L": 49, "a": 11, "b": 19 },
        "scanPrint": { "L": 48, "a": 12, "b": 18 },
        "scanPrintCorrected": { "L": 47.5, "a": 11.8, "b": 18.1 },
        "derive": { "L": 2.5, "a": -1.8, "b": 1.9 },
        "newRip": { "L": 51.5, "a": 9.2, "b": 20.9 },
        "deltaE": 3.42,
        "substrateAlert": "warn"
      }
    ]
  }
}
```

**Errors:**
- 400: Validation (colors vide, Lab hors range)

---

### POST /api/export-cct

Génère un fichier `.cct` corrigé téléchargeable.

**Request:**
```json
{
  "sourceXML": "<ColorTable xmlns=\"urn:schemas-colorgate-com:colortable\">...</ColorTable>",
  "colors": [
    {
      "name": "ColorName",
      "bench": { "L": 50, "a": 10, "b": 20 },
      "rip": { "L": 49, "a": 11, "b": 19 },
      "scanPrint": { "L": 48, "a": 12, "b": 18 }
    }
  ],
  "deltaWP": { "dL": 0.5, "da": 0.2, "db": -0.1 }
}
```

**Response 200:**
- Headers:
  - `Content-Type: application/xml`
  - `Content-Disposition: attachment; filename="corrected_20260509_143022.cct"`
- Body: Fichier .cct XML

**Errors:**
- 400: sourceXML manquant / colors vide

---

## 📁 Structure Projet

```
backend/
├── server.js                      # Serveur Express principal
├── routes/
│   └── api.routes.js              # Routes API
├── controllers/
│   └── color.controller.js        # Controllers métier
├── middleware/
│   ├── upload.middleware.js       # Multer upload .cct
│   ├── validate.middleware.js     # Joi validation
│   └── error.middleware.js        # Error handler global
├── services/                      # Services Phase 2
│   ├── cctParser.service.js
│   ├── labCalculations.service.js
│   └── colorCorrection.service.js
├── tests/
│   ├── services/                  # Tests unitaires services
│   └── integration/
│       └── api.test.js            # Tests API (18 tests)
└── uploads/                       # Dossier upload temporaire
```

---

## 🧪 Tests

### Résultats Phase 3

- ✅ **18/18 tests passent**
- **Coverage API :**
  - Controllers : 95.65%
  - Middlewares : 92.68%
  - Routes : 100%

### Scénarios testés

**Health check**
- ✓ Retourne 200 + status ok

**Parse CCT**
- ✓ Upload valide → 200 + colors
- ✓ Pas de fichier → 400
- ✓ Fichier non .cct → 400
- ✓ XML malformé → 500

**Compute corrections**
- ✓ Données valides → 200 + corrections
- ✓ Avec deltaWP → 200 + substrateAlert
- ✓ Colors vide → 400
- ✓ Lab invalide → 400

**Export CCT**
- ✓ Export valide → 200 + fichier
- ✓ Avec deltaWP → 200
- ✓ sourceXML manquant → 400
- ✓ Colors vide → 400

---

## 🔧 Technologies

### Production
- `express` ^4.18.0 - Framework web
- `multer` ^1.4.5 - Upload fichiers
- `joi` ^17.13.0 - Validation schémas
- `cors` ^2.8.5 - CORS headers
- `helmet` ^8.0.0 - Sécurité headers
- `@xmldom/xmldom` ^0.9.10 - Parser XML

### Développement
- `jest` ^30.4.2 - Tests unitaires
- `supertest` ^7.0.0 - Tests API HTTP

---

## 🎯 Prochaines Étapes

**Phase 4 : Frontend React**
- Interface utilisateur
- Gestion projets/sessions
- Visualisation corrections
- Historique itérations

---

## 📝 Notes Maintenance

### Ajouter un nouvel endpoint

1. Créer route dans `routes/api.routes.js`
2. Créer controller dans `controllers/color.controller.js`
3. Ajouter schéma validation Joi si nécessaire
4. Créer tests dans `tests/integration/api.test.js`

### Modifier validation

Modifier schémas dans `middleware/validate.middleware.js`

### Gestion erreurs

Errors HTTP standards :
- 200 : Success
- 400 : Bad request (validation)
- 500 : Internal server error

Format uniforme :
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": ["Detail 1", "Detail 2"]
  }
}
```

---

## 🐛 Debugging

### Console vide ou errors

Vérifier :
1. Services Phase 2 correctement importés
2. Format données match services (nuancier vs bench)
3. Middlewares dans bon ordre (validation avant controller)

### Tests échouent

```bash
# Mode verbose
npx jest --verbose

# Test spécifique
npx jest -t "nom du test"
```

---

## 🤝 Contribution

Ce projet suit les conventions :
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
- **Code** : CommonJS (require/module.exports)
- **Tests** : Coverage ≥ 80% pour nouveaux endpoints

---

**Développé avec ❤️ pour Color Delta V5**  
**Phase 3 complétée** : 2026-05-09
