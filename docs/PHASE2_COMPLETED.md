# Phase 2 : Backend Services + Tests — TERMINÉE ✅

## 🎯 Objectifs Atteints

✅ **Services métier créés** (3 modules)  
✅ **Tests unitaires complets** (71 tests, 93.55% coverage)  
✅ **Logique colorimétrique validée** (CIEDE2000, Lab, substrate)  
✅ **Parsing XML/CCT opérationnel**

---

## 📁 Structure Backend

```
backend/
├── services/
│   ├── cctParser.service.js          # Parse/génère fichiers CCT
│   ├── labCalculations.service.js    # Calculs Lab, deltaE2000
│   └── colorCorrection.service.js    # Logique correction RIP
└── tests/
    └── services/
        ├── cctParser.service.test.js
        ├── labCalculations.service.test.js
        ├── colorCorrection.service.test.js
        └── cctBuild.test.js
```

---

## 🧪 Tests & Couverture

### Résultats
```
Test Suites: 4 passed, 4 total
Tests:       71 passed, 71 total
Coverage:    93.55% statements | 85.86% branches | 100% functions
```

### Couverture par Service
| Service                     | Statements | Branches | Functions | Lines   |
|-----------------------------|------------|----------|-----------|---------|
| cctParser.service.js        | 87.17%     | 75%      | 100%      | 94.33%  |
| labCalculations.service.js  | 97.84%     | 91.13%   | 100%      | 97.64%  |
| colorCorrection.service.js  | 97.64%     | 90%      | 100%      | 100%    |

### Exécuter les tests

```bash
# Tous les tests avec couverture
npm test

# Mode watch (développement)
npm run test:watch

# Tests services uniquement
npm run test:unit
```

---

## 📦 Services Créés

### 1️⃣ **cctParser.service.js** — Parsing & Export CCT

#### Fonctions principales

**`parseXML(xmlText)`**
- Parse fichiers CCT ColorGATE (XML)
- Extrait valeurs Lab par couleur
- Valide plages (L: 0-100, a/b: -127-127)
- Retourne `{ colors: [...], warnings: [...] }`

**`parseCCTCandidates(xmlText)`**
- Parse pour sélection point blanc (WP picker)
- Retourne liste complète des couleurs

**`buildCCT(sourceText, colors, deltaWP)`**
- Génère CCT mis à jour avec nouvelles valeurs RIP
- Applique correction substrate si deltaWP fourni
- Conserve structure XML originale

**`buildCCTFromSnapshot(sourceText, colors, snapshot, deltaWP)`**
- Export depuis snapshot historique spécifique
- Restaure valeurs RIP d'une itération passée

**`buildFilename(projectName, printNum, ext)`**
- Génère noms fichiers sécurisés
- Format: `MAJ palette {projet} scan print {num}.{ext}`

---

### 2️⃣ **labCalculations.service.js** — Calculs Colorimétriques

#### Fonctions principales

**`num(v)`**
- Parse valeurs numériques (accepte virgule/point)
- Retourne `number | null`

**`labToCSS(L, a, b)`**
- Convertit Lab → sRGB CSS (`rgb(r,g,b)`)
- Illuminant D50, gamma sRGB
- Pour aperçu couleurs dans UI

**`deltaE2000(L1, a1, b1, L2, a2, b2)`**
- **CIEDE2000** : standard industriel impression
- Mesure distance perceptuelle couleurs
- < 1 = imperceptible | 1-2 = limite | > 2 = visible

**`effectiveScanPrint(color, deltaWP)`**
- Applique correction substrate si active
- Formule: `scanPrint - deltaWP`
- Neutralise influence teinte support

**`computeDeltaWP(wpBench, wpImpression)`**
- Calcule delta point blanc : `WP_bench - WP_impression`
- Quantifie différence chromatique supports

**`isDeltaWPDefined(deltaWP)`**
- Vérifie si correction substrate disponible

**Helpers de formatage**
- `fmtNum(v)` : Affichage 2 décimales ou "—"
- `fmtDerive(v)` : Avec signe `+5.00` / `-3.20`

---

### 3️⃣ **colorCorrection.service.js** — Logique Métier RIP

#### Fonctions principales

**`computeDerive(nuancier, scanPrint)`**
- Calcule dérive : `bench - scan`
- Écart entre cible et résultat mesuré

**`computeNewRip(rip, derive)`**
- Nouvelles valeurs RIP : `rip + derive`
- Correction itérative

**`computeSubstrateAlert(nuancier, deltaWP)`**
- Détecte impact substrate sur couleur
- Retourne `'warn' | 'danger' | null`
- Seuils :
  - `THRESH_WARN = 2.5` : ΔWP perceptible
  - `THRESH_DANGER = 5.0` : Compensation partielle probable

**Critères alerte**
- Couleur claire (L* > 60) OU peu saturée (chroma < 20)
- ET ΔWP chromatique significatif

**`snapLabValues(snap)`**
- Extrait Lab depuis snapshot historique
- Priorité : `scanPrintCorrected > scanPrint > rip`

**`bestSnapIndex(history, nuancier)`**
- Trouve itération la plus proche bench (ΔE2000)
- Pour fonction "Rappel meilleures itérations"

**`snapDeltaE(snap, nuancier)`**
- Calcule ΔE2000 snapshot ↔ bench
- Affichage dans historique

**Factories**
- `makeColor(name, ripL, ripA, ripB)` : Objet couleur initial
- `makeSnapshot(color, printNum, deltaWP)` : Snapshot historique

---

## 🔬 Validation Scientifique

### CIEDE2000 (deltaE2000)
✅ **Test symétrie** : `ΔE(A→B) = ΔE(B→A)`  
✅ **Test identité** : `ΔE(A→A) ≈ 0`  
✅ **Détection seuils** :
- < 1 : imperceptible ✓
- 1-2 : limite perception ✓
- > 2 : visible ✓

### Lab → sRGB (labToCSS)
✅ **Illuminant D50** conforme  
✅ **Gamma sRGB** : 2.4 correct  
✅ **Clamping** RGB [0-255]  
✅ **Valeurs extrêmes** (noir/blanc) OK

### Correction Substrate
✅ **Formule** : `effectiveScanPrint = scanPrint - deltaWP`  
✅ **Toggle par couleur** validé  
✅ **Alertes warn/danger** fonctionnelles

---

## 🧩 Dépendances

```json
{
  "dependencies": {
    "@xmldom/xmldom": "^0.9.10"  // Parser XML côté Node.js
  },
  "devDependencies": {
    "jest": "^30.4.2",
    "@types/jest": "^30.0.0"
  }
}
```

---

## 📊 Métriques Qualité

| Métrique            | Valeur  | Seuil | Status |
|---------------------|---------|-------|--------|
| Tests passés        | 71/71   | 100%  | ✅      |
| Coverage statements | 93.55%  | 80%   | ✅      |
| Coverage branches   | 85.86%  | 80%   | ✅      |
| Coverage functions  | 100%    | 80%   | ✅      |
| Bugs détectés       | 0       | 0     | ✅      |

---

## 🚀 Prochaines Étapes

### Phase 3 : API Routes & Controllers (à venir)
- Endpoints REST (parse, export, compute)
- Validation entrées (Joi/Zod)
- Gestion erreurs middleware
- Tests intégration API

### Phase 4 : Frontend React (à venir)
- Composants UI
- State management (Context/Redux)
- Upload/download fichiers
- Interface correction colorimétrique

---

## 📝 Notes Importantes

### Gestion Erreurs
- Parser XML valide format avant traitement
- `num()` retourne `null` pour valeurs invalides (pas d'exception)
- Validation ranges Lab en warnings (pas d'erreur fatale)

### Performance
- ΔE2000 : ~0.1ms par calcul (71 tests en 1s)
- Parser XML : streaming si >10MB recommandé (future optimisation)
- Cache regex dans `buildCCT` pour fichiers volumineux

### Compatibilité
- Node.js ≥ 18.0.0 requis (ES modules)
- Format CCT : ColorGATE namespace standard
- Tests compatibles Jest 30.x

---

## 🛠️ Maintenance

### Ajouter un test
```javascript
// backend/tests/services/monService.test.js
describe('Mon Service', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Lancer tests spécifiques
```bash
npm test -- cctParser  # Tests parser uniquement
npm test -- --coverage  # Avec couverture détaillée
```

### Vérifier couverture
```bash
npm test
# Rapport dans coverage/lcov-report/index.html
```

---

**Phase 2 COMPLÉTÉE ✅**  
**Prêt pour Phase 3 : API Routes & Controllers**
