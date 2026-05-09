# 🎉 Phase 2 TERMINÉE — Instructions de Maintenance

## ✅ CE QUI A ÉTÉ CRÉÉ

### Services Backend (3 modules)
```
backend/services/
├── cctParser.service.js          # Parse/export fichiers CCT ColorGATE
├── labCalculations.service.js    # Calculs Lab, deltaE2000, conversions
└── colorCorrection.service.js    # Logique métier correction RIP
```

### Tests Unitaires (71 tests, 93.55% coverage)
```
backend/tests/services/
├── cctParser.service.test.js
├── labCalculations.service.test.js
├── colorCorrection.service.test.js
└── cctBuild.test.js
```

### Documentation
```
docs/
├── PHASE2_COMPLETED.md          # Détails techniques complets
└── SERVICE_USAGE_GUIDE.md       # Guide utilisation + exemples
```

---

## 🚀 COMMANDES ESSENTIELLES

### Lancer les tests
```bash
npm test                  # Tous les tests + coverage
npm run test:watch        # Mode watch (développement)
npm run test:unit         # Tests services uniquement
```

### Vérifier la couverture
```bash
npm test
# Rapport dans: coverage/lcov-report/index.html
# Ouvrir avec navigateur pour détails
```

---

## 📦 COMMENT MAINTENIR LE PROJET

### 1. Ajouter une nouvelle fonction à un service

**Exemple** : Ajouter fonction `calculateChroma()` à `labCalculations.service.js`

```javascript
// 1. Ajouter la fonction dans backend/services/labCalculations.service.js
function calculateChroma(a, b) {
  const an = num(a);
  const bn = num(b);
  if (an === null || bn === null) return null;
  return Math.sqrt(an ** 2 + bn ** 2);
}

// 2. Exporter
module.exports = {
  // ... autres exports
  calculateChroma
};

// 3. Créer test dans backend/tests/services/labCalculations.service.test.js
describe('calculateChroma', () => {
  it('should calculate chroma from a and b', () => {
    expect(calculateChroma(30, 40)).toBeCloseTo(50, 2);
  });
  
  it('should return null for invalid values', () => {
    expect(calculateChroma(null, 40)).toBeNull();
  });
});

// 4. Lancer tests
npm test
```

### 2. Ajouter un nouveau service

```bash
# 1. Créer fichier service
touch backend/services/monService.service.js

# 2. Structure de base
cat > backend/services/monService.service.js << 'EOF'
/**
 * Mon Service
 * Description du service
 */

function maFonction(param) {
  // Logic here
  return result;
}

module.exports = {
  maFonction
};
EOF

# 3. Créer fichier test
touch backend/tests/services/monService.service.test.js

# 4. Structure test
cat > backend/tests/services/monService.service.test.js << 'EOF'
const { maFonction } = require('../../services/monService.service');

describe('Mon Service', () => {
  describe('maFonction', () => {
    it('should do something', () => {
      const result = maFonction('param');
      expect(result).toBe('expected');
    });
  });
});
EOF

# 5. Lancer tests
npm test
```

### 3. Débugger un test qui échoue

```bash
# Lancer un seul fichier de test
npm test -- cctParser

# Lancer un seul test
npm test -- -t "should parse valid CCT XML"

# Mode verbose
npm test -- --verbose

# Voir stack trace complète
npm test -- --no-coverage
```

### 4. Mettre à jour la documentation

```bash
# Après ajout de fonctionnalités
# 1. Éditer docs/SERVICE_USAGE_GUIDE.md
# 2. Ajouter exemple d'utilisation
# 3. Mettre à jour README.md si nécessaire
```

---

## 🔍 STRUCTURE DU CODE

### Pattern de chaque service

```javascript
/**
 * Docstring descriptif
 * @param {Type} param - Description
 * @returns {Type} Description
 */
function nomFonction(param) {
  // Validation entrées
  if (!param) return null;
  
  // Logique métier
  const result = compute(param);
  
  // Return
  return result;
}

module.exports = { nomFonction };
```

### Pattern de chaque test

```javascript
describe('Service Name', () => {
  describe('functionName', () => {
    it('should handle normal case', () => {
      expect(fn(input)).toBe(expected);
    });
    
    it('should handle edge case', () => {
      expect(fn(edge)).toBe(expectedEdge);
    });
    
    it('should handle error case', () => {
      expect(fn(invalid)).toBeNull();
    });
  });
});
```

---

## 🐛 PROBLÈMES COURANTS

### Tests échouent après modification

```bash
# 1. Vérifier qu'aucune dépendance circulaire
npm test -- --detectOpenHandles

# 2. Nettoyer cache Jest
npm test -- --clearCache

# 3. Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
```

### Coverage en dessous de 80%

```bash
# 1. Identifier fichiers non couverts
npm test

# 2. Regarder rapport détaillé
open coverage/lcov-report/index.html

# 3. Ajouter tests manquants pour branches/lignes non couvertes
```

### Import ne fonctionne pas

```javascript
// ❌ MAUVAIS
import { fn } from './service';

// ✅ BON (CommonJS)
const { fn } = require('./service');
```

---

## 📋 CHECKLIST AVANT COMMIT

- [ ] `npm test` passe (71+ tests)
- [ ] Coverage ≥ 93% (ou justifier baisse)
- [ ] Pas de console.log oubliés
- [ ] Documentation mise à jour si nouvelle feature
- [ ] Message commit descriptif (Conventional Commits)

```bash
# Commit pattern
git add .
git commit -m "feat(service): description courte

Détails si nécessaire.

Resolves #issue-number"
```

---

## 🌐 PUSHER SUR GITHUB

```bash
# 1. Créer repo sur GitHub (si pas déjà fait)
# https://github.com/NoUseForIt/color-delta-node

# 2. Ajouter remote
git remote add origin https://github.com/NoUseForIt/color-delta-node.git

# 3. Push
git push -u origin master

# 4. Créer branche pour nouvelle feature
git checkout -b feature/ma-feature
# ... développer
git push -u origin feature/ma-feature
# Créer Pull Request sur GitHub
```

---

## 📚 RESSOURCES

### Documentation
- **Phase 2 Completed** : `docs/PHASE2_COMPLETED.md`
- **Usage Guide** : `docs/SERVICE_USAGE_GUIDE.md`
- **README** : `README.md`

### Tests
- **Jest Docs** : https://jestjs.io/docs/getting-started
- **Coverage Report** : `coverage/lcov-report/index.html`

### Standards
- **Conventional Commits** : https://www.conventionalcommits.org/
- **CIEDE2000** : Standard colorimétrique utilisé

---

## 🎯 PROCHAINE ÉTAPE : PHASE 3

**API Routes & Controllers** (3 jours estimés)

### Objectifs
- Routes Express (POST/GET)
- Upload/download fichiers CCT
- Validation données (Joi)
- Middleware gestion erreurs
- Tests intégration API

### Dépendances à installer
```bash
npm install express multer joi cors helmet
npm install --save-dev supertest
```

### Structure à créer
```
backend/
├── routes/
│   └── api.routes.js
├── controllers/
│   └── color.controller.js
├── middleware/
│   ├── validate.middleware.js
│   └── error.middleware.js
└── tests/
    └── integration/
        └── api.test.js
```

---

**✅ PHASE 2 COMPLÉTÉE — Projet prêt pour Phase 3**  
**Dernière mise à jour : 2026-05-09**
