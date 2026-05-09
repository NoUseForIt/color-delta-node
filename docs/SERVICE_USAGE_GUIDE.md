# Guide d'Utilisation des Services Backend

## 🎯 Vue d'Ensemble

Les services backend de Color Delta V5 sont organisés en 3 modules principaux :

1. **cctParser** — Parsing/export fichiers CCT
2. **labCalculations** — Calculs colorimétriques
3. **colorCorrection** — Logique métier correction RIP

---

## 📖 Exemples d'Utilisation

### 1. Parser un fichier CCT

```javascript
const { parseXML } = require('./services/cctParser.service');
const fs = require('fs');

// Lire fichier CCT
const xmlContent = fs.readFileSync('palette.cct', 'utf8');

// Parser
const { colors, warnings } = parseXML(xmlContent);

console.log(`${colors.length} couleurs trouvées`);
if (warnings.length > 0) {
  console.warn('Avertissements:', warnings);
}

// Exemple de couleur retournée
// {
//   name: 'Cyan',
//   L: '50.0',
//   a: '-20.5',
//   b: '-30.2'
// }
```

### 2. Calculer deltaE2000 entre deux couleurs

```javascript
const { deltaE2000 } = require('./services/labCalculations.service');

// Couleur cible (bench)
const bench = { L: 50, a: 20, b: -10 };

// Couleur mesurée (scan)
const scan = { L: 48, a: 22, b: -12 };

// Calculer distance colorimétrique
const de = deltaE2000(
  bench.L, bench.a, bench.b,
  scan.L, scan.a, scan.b
);

console.log(`ΔE2000 = ${de.toFixed(2)}`);

// Interprétation
if (de < 1) {
  console.log('Différence imperceptible');
} else if (de < 2) {
  console.log('Limite de perception');
} else {
  console.log('Différence visible');
}
```

### 3. Calculer correction RIP complète

```javascript
const { 
  computeDerive, 
  computeNewRip 
} = require('./services/colorCorrection.service');

const color = {
  rip: { L: '50', a: '20', b: '-10' },       // Valeurs actuelles RIP
  nuancier: { L: '52', a: '18', b: '-12' },  // Cible bench
  scanPrint: { L: '51', a: '19', b: '-11' }  // Résultat mesuré
};

// 1. Calculer dérive (bench - scan)
const derive = computeDerive(color.nuancier, color.scanPrint);
console.log('Dérive:', derive);
// { L: 1, a: -1, b: -1 }

// 2. Appliquer correction (rip + derive)
const newRip = computeNewRip(color.rip, derive);
console.log('Nouvelles valeurs RIP:', newRip);
// { L: 51, a: 19, b: -11 }
```

### 4. Gestion correction substrate

```javascript
const {
  computeDeltaWP,
  effectiveScanPrint
} = require('./services/labCalculations.service');

const {
  computeSubstrateAlert
} = require('./services/colorCorrection.service');

// Points blancs
const wpBench = { L: '95', a: '-1', b: '2' };        // Support nuancier
const wpImpression = { L: '93', a: '1', b: '-1' };   // Support destination

// Calculer delta WP
const deltaWP = computeDeltaWP(wpBench, wpImpression);
console.log('ΔWP:', deltaWP);
// { L: 2, a: -2, b: 3 }

// Vérifier si correction nécessaire pour une couleur
const nuancier = { L: '80', a: '5', b: '10' };  // Couleur claire
const alert = computeSubstrateAlert(nuancier, deltaWP);

if (alert === 'warn') {
  console.log('⚠️ Impact substrate perceptible probable');
} else if (alert === 'danger') {
  console.log('🔴 Compensation partielle probable');
}

// Appliquer correction sur scan print
const color = {
  scanPrint: { L: '79', a: '7', b: '8' },
  substrateCorrection: true  // Toggle activé
};

const corrected = effectiveScanPrint(color, deltaWP);
console.log('Scan corrigé:', corrected);
// scanPrint - deltaWP = (79,7,8) - (2,-2,3) = (77,9,5)
```

### 5. Export CCT corrigé

```javascript
const { buildCCT } = require('./services/cctParser.service');
const fs = require('fs');

// Fichier CCT original
const sourceXML = fs.readFileSync('palette_original.cct', 'utf8');

// Couleurs avec corrections
const colors = [
  {
    name: 'Cyan',
    id: 'c1',
    rip: { L: '50', a: '-20', b: '-30' },
    nuancier: { L: '52', a: '-18', b: '-32' },
    scanPrint: { L: '51', a: '-19', b: '-31' },
    substrateCorrection: false
  },
  // ... autres couleurs
];

// Générer CCT mis à jour
const updatedCCT = buildCCT(sourceXML, colors, null);

// Sauvegarder
fs.writeFileSync('palette_corrected.cct', updatedCCT);
console.log('CCT mis à jour généré');
```

### 6. Historique et meilleures itérations

```javascript
const {
  makeSnapshot,
  bestSnapIndex,
  snapDeltaE
} = require('./services/colorCorrection.service');

// Créer snapshot après impression
const color = {
  id: 'c1',
  name: 'Cyan',
  rip: { L: '50', a: '-20', b: '-30' },
  scanPrint: { L: '51', a: '-19', b: '-31' },
  nuancier: { L: '52', a: '-18', b: '-32' },
  substrateCorrection: false,
  history: []
};

const snapshot = makeSnapshot(color, printNum = 1, deltaWP = null);
color.history.push(snapshot);

// Après plusieurs itérations...
const bestIdx = bestSnapIndex(color.history, color.nuancier);
console.log(`Meilleure itération : #${bestIdx + 1}`);

const bestSnap = color.history[bestIdx];
const deltaE = snapDeltaE(bestSnap, color.nuancier);
console.log(`ΔE2000 = ${deltaE.toFixed(2)}`);
```

### 7. Conversion Lab → sRGB pour aperçu

```javascript
const { labToCSS } = require('./services/labCalculations.service');

const lab = { L: '50', a: '20', b: '-30' };

const css = labToCSS(lab.L, lab.a, lab.b);
console.log('Couleur CSS:', css);
// "rgb(118,126,174)"

// Utiliser dans HTML/React
const style = {
  backgroundColor: css,
  width: '50px',
  height: '50px'
};
```

---

## ⚠️ Gestion Erreurs

### Parser XML invalide

```javascript
const { parseXML } = require('./services/cctParser.service');

try {
  const result = parseXML('invalid xml');
} catch (error) {
  console.error('Erreur parsing:', error.message);
}
```

### Valeurs Lab invalides

```javascript
const { num } = require('./services/labCalculations.service');

const value = num('abc');  // Retourne null (pas d'exception)

if (value === null) {
  console.warn('Valeur invalide, utiliser valeur par défaut');
}
```

### Valeurs hors plage

```javascript
const { parseXML } = require('./services/cctParser.service');

const { colors, warnings } = parseXML(xmlContent);

warnings.forEach(w => {
  console.warn('⚠️', w);
  // "Cyan: L*=150 hors plage [0-100]"
});
```

---

## 🧪 Tests Unitaires

### Tester une fonction

```javascript
const { computeDerive } = require('./services/colorCorrection.service');

describe('computeDerive', () => {
  it('should calculate drift correctly', () => {
    const nuancier = { L: '60', a: '20', b: '-10' };
    const scanPrint = { L: '58', a: '22', b: '-12' };
    
    const result = computeDerive(nuancier, scanPrint);
    
    expect(result.L).toBe(2);   // 60 - 58
    expect(result.a).toBe(-2);  // 20 - 22
    expect(result.b).toBe(2);   // -10 - (-12)
  });
});
```

### Lancer tests

```bash
# Tous les tests
npm test

# Tests spécifiques
npm test -- labCalculations

# Mode watch
npm run test:watch
```

---

## 📊 Performance

### Benchmarks typiques

| Opération              | Temps moyen |
|------------------------|-------------|
| parseXML (50 couleurs) | ~10ms       |
| deltaE2000 (1 calcul)  | ~0.1ms      |
| buildCCT (50 couleurs) | ~50ms       |
| effectiveScanPrint     | ~0.01ms     |

### Optimisations recommandées

**Gros fichiers CCT (>1000 couleurs)**
```javascript
// Parser en streaming (future implémentation)
const stream = fs.createReadStream('huge.cct');
// TODO: Implement streaming parser
```

**Calculs massifs deltaE**
```javascript
// Paralléliser si >100 calculs
const { deltaE2000 } = require('./services/labCalculations.service');

const calculations = colors.map(c => ({
  bench: c.nuancier,
  scan: c.scanPrint
}));

// Worker threads pour calculs parallèles (future)
```

---

## 🔍 Debugging

### Activer logs détaillés

```javascript
const DEBUG = true;

if (DEBUG) {
  console.log('Nuancier:', nuancier);
  console.log('Scan:', scanPrint);
  console.log('Dérive:', derive);
  console.log('New RIP:', newRip);
}
```

### Valider plages Lab

```javascript
const { LAB_RANGE } = require('./services/labCalculations.service');

function validateLab(L, a, b) {
  const errors = [];
  
  if (L < LAB_RANGE.L.min || L > LAB_RANGE.L.max) {
    errors.push(`L*=${L} hors plage [${LAB_RANGE.L.min}-${LAB_RANGE.L.max}]`);
  }
  if (a < LAB_RANGE.a.min || a > LAB_RANGE.a.max) {
    errors.push(`a*=${a} hors plage [${LAB_RANGE.a.min}-${LAB_RANGE.a.max}]`);
  }
  if (b < LAB_RANGE.b.min || b > LAB_RANGE.b.max) {
    errors.push(`b*=${b} hors plage [${LAB_RANGE.b.min}-${LAB_RANGE.b.max}]`);
  }
  
  return errors;
}
```

---

## 📚 Références

### Standards Colorimétriques

- **CIEDE2000** : [CIE Technical Report](http://www.eci.org/_media/downloads/icc_white_papers/DeltaE2000.pdf)
- **Lab D50** : Illuminant CIE Standard
- **sRGB** : IEC 61966-2-1

### Format CCT

- ColorGATE XML Schema : `urn:schemas-colorgate-com:colortable`
- Namespace requis pour parsing

---

**Guide mis à jour : Phase 2**  
**Prochaine mise à jour : Phase 3 (API Routes)**
