# ⚠️ CORRECTIONS API - Phase 4 Frontend

## 🔧 Problème Résolu

Le frontend Phase 4 appelait des endpoints incorrects qui ne correspondaient pas à l'API Phase 3.

## 📝 Changements Effectués

### Fichiers Modifiés

1. **src/services/colorService.js**
2. **src/hooks/useColorAPI.js**
3. **src/pages/ColorDashboard.jsx**

---

## 🔄 Endpoints Corrigés

### ❌ AVANT (Incorrects)
```
POST /api/colors/upload
POST /api/colors/analyze
POST /api/colors/correct
POST /api/colors/export
```

### ✅ APRÈS (Conformes Phase 3)
```
POST /api/parse-cct
POST /api/compute-corrections
POST /api/export-cct
```

---

## 📦 Mapping Frontend ↔ Backend

### 1. Upload & Parse

**Frontend appelle :**
```javascript
colorService.uploadCCT(file)
```

**Backend endpoint :**
```
POST /api/parse-cct
Input: FormData avec file
Output: { colors: [...], sourceXML: "...", css: [...] }
```

**Adaptation :**
```javascript
return {
  colors: response.data.colors,
  whitePoint: response.data.colors[0]?.bench,
  metadata: {
    sourceXML: response.data.sourceXML,
    css: response.data.css,
  },
};
```

### 2. Compute Corrections

**Frontend appelle :**
```javascript
colorService.computeCorrections(colors, deltaWP)
```

**Backend endpoint :**
```
POST /api/compute-corrections
Input: { colors: [...], deltaWP: {dL, da, db} }
Output: { corrections: [{name, bench, rip, scanPrint, derive, newRip, alerts}] }
```

**Adaptation :**
- Extrait analyse from corrections
- Calcule statistiques (excellent/good/acceptable/poor)
- Crée couleurs corrigées avec newRip

### 3. Export CCT

**Frontend appelle :**
```javascript
colorService.exportCCT(sourceXML, colors, deltaWP)
```

**Backend endpoint :**
```
POST /api/export-cct
Input: { sourceXML: "...", colors: [...], deltaWP: {dL, da, db} }
Output: Blob (fichier .cct)
```

---

## 🎯 Workflow Complet

```
1. Upload .cct
   → POST /api/parse-cct
   → Store: colors + sourceXML

2. Auto-compute (sans deltaWP)
   → POST /api/compute-corrections {colors, deltaWP: null}
   → Store: analysis (ΔE initial)

3. Corriger (avec deltaWP)
   → POST /api/compute-corrections {colors, deltaWP: {dL, da, db}}
   → Store: correctedColors (avec newRip)

4. Export
   → POST /api/export-cct {sourceXML, colors, deltaWP}
   → Download automatique fichier .cct
```

---

## 🚀 Pour Utiliser

### 1. Assure-toi que le Backend tourne

```bash
cd backend/
npm start
# Serveur sur http://localhost:5000
```

### 2. Lance le Frontend

```bash
cd frontend/
npm run dev
# Interface sur http://localhost:3000
```

### 3. Teste

1. Upload un fichier .cct
2. Vérifier analyse automatique
3. Cliquer "Corriger" si ΔE WP > 1.0
4. Comparer onglets Original/Corrigé
5. Exporter .cct corrigé

---

## 🐛 Debug

### Console Navigateur (F12)

**Onglet Network** → Voir requêtes API :
- `/api/parse-cct` → Status 200 ?
- `/api/compute-corrections` → Status 200 ?
- `/api/export-cct` → Status 200 ?

**Onglet Console** → Voir erreurs JS

### Backend Logs

Le terminal backend affiche :
```
POST /api/parse-cct 200 125ms
POST /api/compute-corrections 200 45ms
POST /api/export-cct 200 78ms
```

### Erreurs Fréquentes

**Erreur upload fichier**
→ Backend pas lancé sur port 5000

**CORS error**
→ Backend doit avoir `cors()` middleware

**sourceXML undefined**
→ Fichier pas uploadé ou métadonnées perdues

---

## ✅ Fichiers à Remplacer

Si tu avais déjà téléchargé le frontend Phase 4 :

**Remplace ces 3 fichiers :**
1. `src/services/colorService.js`
2. `src/hooks/useColorAPI.js`
3. `src/pages/ColorDashboard.jsx`

**Ou télécharge tout le dossier** `phase4-frontend` à nouveau.

---

**Les corrections sont appliquées** ✅  
**Le frontend est maintenant compatible avec l'API Phase 3** 🚀
