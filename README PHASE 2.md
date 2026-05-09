# Color Delta V5 🎨

**Outil professionnel de correction colorimétrique RIP pour l'impression industrielle**

Système de gestion itérative des dérives colorimétriques entre nuanciers de référence et résultats d'impression. Intègre correction substrate, historique complet et calculs CIEDE2000.

[![Tests](https://img.shields.io/badge/tests-71%20passed-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-93.55%25-brightgreen)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)]()

---

## 📋 Table des Matières

- [Caractéristiques](#-caractéristiques)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Tests](#-tests)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)
- [Contribution](#-contribution)

---

## ✨ Caractéristiques

### Phase 2 (COMPLÉTÉE ✅)

- ✅ **Parsing CCT** — Import/export fichiers ColorGATE XML
- ✅ **Calculs Lab** — Conversions Lab↔sRGB, deltaE2000 (CIEDE2000)
- ✅ **Correction RIP** — Calcul dérive, nouvelles valeurs itératives
- ✅ **Substrate** — Correction teinte support, alertes warn/danger
- ✅ **Historique** — Snapshots itérations, rappel meilleures versions
- ✅ **Tests** — 71 tests unitaires, 93.55% coverage

### Phase 3 (À venir)

- ⏳ API REST Express
- ⏳ Routes upload/download
- ⏳ Validation données (Joi)
- ⏳ Tests intégration

### Phase 4 (À venir)

- ⏳ Frontend React
- ⏳ Interface correction couleurs
- ⏳ Gestion projets/sessions
- ⏳ Visualisation deltaE2000

---

## 🏗️ Architecture

```
color-delta-v5/
├── backend/
│   ├── services/               # Logique métier
│   │   ├── cctParser.service.js
│   │   ├── labCalculations.service.js
│   │   └── colorCorrection.service.js
│   ├── tests/
│   │   └── services/           # Tests unitaires
│   └── server.js               # (Phase 3)
├── frontend/                   # (Phase 4)
├── docs/
│   ├── PHASE2_COMPLETED.md
│   └── SERVICE_USAGE_GUIDE.md
├── package.json
├── jest.config.js
└── README.md
```

---

## 🚀 Installation

### Prérequis

- Node.js ≥ 18.0.0
- npm ≥ 8.0.0

### Setup Projet

```bash
# Cloner le repository
git clone https://github.com/NoUseForIt/color-delta-node.git
cd color-delta-node

# Installer dépendances
npm install

# Lancer tests
npm test
```

---

## 🧪 Tests

### Exécution

```bash
# Tous les tests avec couverture
npm test

# Mode watch (développement)
npm run test:watch

# Tests services uniquement
npm run test:unit
```

### Couverture

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   93.55 |    85.86 |     100 |   97.02 |
 cctParser.service.js       |   87.17 |       75 |     100 |   94.33 |
 labCalculations.service.js |   97.84 |    91.13 |     100 |   97.64 |
 colorCorrection.service.js |   97.64 |       90 |     100 |     100 |
----------------------------|---------|----------|---------|---------|
```

Rapport HTML : `coverage/lcov-report/index.html`

---

## 📚 Documentation

### Guides Disponibles

- **[Phase 2 Completed](docs/PHASE2_COMPLETED.md)** — Détails backend services
- **[Service Usage Guide](docs/SERVICE_USAGE_GUIDE.md)** — Exemples utilisation

### Exemples Rapides

#### Parser fichier CCT

```javascript
const { parseXML } = require('./backend/services/cctParser.service');
const fs = require('fs');

const xml = fs.readFileSync('palette.cct', 'utf8');
const { colors, warnings } = parseXML(xml);

console.log(`${colors.length} couleurs trouvées`);
```

#### Calculer deltaE2000

```javascript
const { deltaE2000 } = require('./backend/services/labCalculations.service');

const de = deltaE2000(50, 20, -10, 48, 22, -12);
console.log(`ΔE2000 = ${de.toFixed(2)}`);
// Interprétation: <1 imperceptible | 1-2 limite | >2 visible
```

#### Correction RIP

```javascript
const { computeDerive, computeNewRip } = require('./backend/services/colorCorrection.service');

// Dérive = bench - scan
const derive = computeDerive(
  { L: '52', a: '18', b: '-12' },  // Cible
  { L: '51', a: '19', b: '-11' }   // Mesuré
);

// Nouvelles valeurs = rip + dérive
const newRip = computeNewRip(
  { L: '50', a: '20', b: '-10' },
  derive
);
```

---

## 🗺️ Roadmap

### ✅ Phase 1 : Setup (TERMINÉE)
- Structure projet
- Git configuré
- Dépendances installées

### ✅ Phase 2 : Backend Services (TERMINÉE)
- Services métier
- Tests unitaires
- Documentation

### ⏳ Phase 3 : API Routes & Controllers (Prochaine)
**Objectif : 3 jours**

- Routes REST Express
- Middleware validation
- Upload/download fichiers
- Tests intégration API

### ⏳ Phase 4 : Frontend React
**Objectif : 5 jours**

- Interface correction couleurs
- State management
- Composants réutilisables
- Tests E2E

### ⏳ Phase 5 : Déploiement
**Objectif : 2 jours**

- Docker containerisation
- CI/CD GitHub Actions
- Documentation utilisateur finale

---

## 🤝 Contribution

### Workflow Git

```bash
# Créer branche feature
git checkout -b feature/ma-feature

# Commit changes
git add .
git commit -m "feat: description"

# Push
git push origin feature/ma-feature

# Créer Pull Request sur GitHub
```

### Conventions

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` nouvelle fonctionnalité
  - `fix:` correction bug
  - `test:` ajout/modification tests
  - `docs:` documentation
  - `refactor:` refactorisation code

- **Tests** : Coverage ≥ 80% requis
- **Linting** : (à venir Phase 3)

---

## 📦 Dépendances

### Production
```json
{
  "@xmldom/xmldom": "^0.9.10"
}
```

### Développement
```json
{
  "jest": "^30.4.2",
  "@types/jest": "^30.0.0"
}
```

---

## 🔬 Validations Scientifiques

### CIEDE2000
✅ Standard industriel impression (CIE Technical Report)  
✅ Tests symétrie, identité, seuils perceptuels  
✅ Précision ±0.01 ΔE

### Lab Color Space
✅ Illuminant D50  
✅ Gamma sRGB 2.4  
✅ Plages validées : L[0-100], a/b[-127-127]

### Correction Substrate
✅ Formule : `effectiveScan = scanPrint - deltaWP`  
✅ Seuils alertes calibrés (THRESH_WARN=2.5, THRESH_DANGER=5.0)

---

## 📄 License

MIT License - voir fichier LICENSE

---

## 🏢 Contexte Projet

**Outil professionnel** développé pour workflows impression industrielle ColorGATE/Caldera.

**Workflow type** :
1. Export .cct depuis RIP
2. Scan nuancier bench
3. Import analyse post-print
4. Calcul dérive Lab
5. Export .cct corrigé → RIP
6. Itération jusqu'à convergence (ΔE2000 < 1)

---

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/NoUseForIt/color-delta-node/issues)
- **Docs** : `/docs` folder
- **Tests** : `npm test` pour validation locale

---

**Version actuelle : 5.0.0-alpha (Phase 2)**  
**Dernière mise à jour : 2026-05-09**  
**Prochaine release : Phase 3 (API Routes)**
