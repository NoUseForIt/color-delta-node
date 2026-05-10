# 🔧 FAQ & Troubleshooting — Color Delta V5

**Guide de résolution problèmes courants**

---

## 🚨 Erreurs Upload

### ❌ "Type de fichier non supporté"

**Message exact :**
```
Error: Only .cct files are allowed
```

**Cause :**
- Fichier n'a pas extension `.cct`
- Extension cachée (Windows : `.cct.txt`)

**Solutions :**

1. **Vérifier extension réelle :**
   ```bash
   # Windows : Afficher extensions fichiers
   Explorateur → Affichage → Cocher "Extensions noms fichiers"
   
   # Mac/Linux
   ls -la votrefichier.cct
   ```

2. **Renommer correctement :**
   - Supprimer double extension si présente
   - Format correct : `monNuancier.cct`

3. **Re-exporter depuis RIP :**
   - ColorGATE : Fichier → Exporter → Color Table (.cct)
   - Vérifier option "XML format"

---

### ❌ "Fichier trop volumineux"

**Message exact :**
```
Error: File size exceeds 10MB limit
```

**Cause :**
- Fichier .cct > 10MB (rare, indique problème)

**Solutions :**

1. **Vérifier contenu fichier :**
   - Ouvrir dans éditeur texte
   - Chercher données corrompues ou répétées

2. **Réduire nombre couleurs :**
   - Exporter seulement couleurs problématiques
   - Ou diviser en plusieurs fichiers

3. **Augmenter limite (avancé) :**
   ```javascript
   // backend/middleware/upload.middleware.js
   limits: { fileSize: 20 * 1024 * 1024 } // 20MB
   ```

---

### ❌ "Parsing XML failed"

**Message exact :**
```
Error: Failed to parse CCT file - Invalid XML structure
```

**Causes possibles :**

1. **Balises XML non fermées**
   ```xml
   <!-- MAUVAIS -->
   <ColorEntry Name="Cyan">
     <ColorOut>
       <ComponentValues>50 -30 -40
     </ColorOut>
   <!-- Manque </ColorEntry> -->
   ```

2. **Caractères spéciaux nom couleur**
   ```xml
   <!-- MAUVAIS -->
   <ColorEntry Name="Cyan & Magenta">
   <!-- '&' doit être &amp; -->
   ```

3. **Encoding incorrect**
   - Fichier pas UTF-8

**Solutions :**

1. **Validation XML :**
   - Copier contenu fichier
   - Coller dans validateur : https://www.xmlvalidation.com
   - Corriger erreurs indiquées

2. **Re-export depuis RIP :**
   - Souvent plus rapide que debug manuel

3. **Vérifier encoding :**
   ```bash
   file -i votrefichier.cct
   # Doit afficher: charset=utf-8
   ```

---

## 🎨 Problèmes Affichage Couleurs

### ⚠️ "Couleurs affichées ne matchent pas impression"

**Cause :**
- Différence écran RGB vs impression Lab
- Profil ICC écran pas calibré

**Explications :**

Color Delta affiche **approximation sRGB** des valeurs Lab.
- **BUT** : Visualisation comparative, pas matching exact
- Votre écran n'est pas calibré Lab D50

**Solutions :**

1. **Ne PAS se fier aux couleurs affichées**
   - Utiliser uniquement valeurs Lab numériques
   - Se fier au ΔE, pas au visuel écran

2. **Calibration écran (optionnel) :**
   - Sonde colorimétrique (ex: X-Rite i1Display)
   - Profil ICC D50 si critique

---

### ⚠️ "ΔE calculé incohérent"

**Exemple :**
```
Bench : L=50 a=0 b=0
Scan  : L=50 a=0 b=0
ΔE    : 12.5 ???
```

**Causes possibles :**

1. **Confusion Bench/RIP/Scan**
   - Vérifier vous avez uploadé bonnes valeurs
   - Scan Print ≠ RIP values

2. **Données corrompues fichier**
   - Valeurs Lab hors plages valides
   - L > 100 ou a/b > 127

3. **Bug calcul (rare)**
   - Vérifier console navigateur (F12)
   - Signaler bug GitHub avec fichier .cct

**Solutions :**

1. **Re-vérifier mesures spectro :**
   - Illuminant D50 ?
   - Observateur 2° ?
   - Pas de valeurs XYZ par erreur ?

2. **Tester avec fichier exemple :**
   ```bash
   # Utiliser fichier test fourni
   exemples/01-cyan-magenta-yellow.cct
   ```

3. **Vérifier ranges Lab :**
   - L : 0-100
   - a : -127 à +127
   - b : -127 à +127

---

## ⚙️ Problèmes Backend

### ❌ "Cannot connect to server"

**Message :**
```
Network Error: Failed to fetch
ERR_CONNECTION_REFUSED
```

**Cause :** Backend pas démarré ou mauvais port

**Solutions :**

1. **Vérifier backend running :**
   ```bash
   # Terminal backend doit afficher :
   Server running on port 5000
   ```

2. **Redémarrer backend :**
   ```bash
   cd backend
   npm start
   ```

3. **Vérifier port correct :**
   ```bash
   # Test manuel API
   curl http://localhost:5000/api/health
   # Doit retourner : {"status":"ok"}
   ```

4. **Firewall bloque port :**
   - Windows : Autoriser Node.js dans pare-feu
   - Mac : System Preferences → Security

---

### ❌ "Internal Server Error 500"

**Cause :** Erreur côté serveur

**Solutions :**

1. **Lire logs backend :**
   ```bash
   # Terminal où backend tourne
   # Chercher stack trace erreur
   ```

2. **Erreurs courantes :**

   **a) Module manquant :**
   ```bash
   Error: Cannot find module 'express'
   ```
   **Solution :**
   ```bash
   cd backend
   npm install
   ```

   **b) Port déjà utilisé :**
   ```bash
   Error: listen EADDRINUSE :::5000
   ```
   **Solution :**
   ```bash
   # Changer port
   export PORT=5001
   npm start
   ```

---

## 🔬 Problèmes Scientifiques

### ⚠️ "Substrate Alert ΔWP > 5"

**Signification :**
- Point blanc bench très différent de point blanc impression
- Correction substrate peut être imparfaite

**Cause :**
- Papier/support impression différent du bench
- Profil ICC RIP incorrect

**Impact :**
- Couleurs claires moins précises
- ΔE final peut rester > 1 malgré corrections

**Solutions :**

1. **Option A : Re-mesurer bench sur bon papier**
   - **Recommandé** pour précision maximale
   - Imprimer nuancier vierge sur papier cible
   - Mesurer comme nouveau bench

2. **Option B : Accepter imprécision**
   - Si ΔWP entre 2.5-5 : généralement acceptable
   - Tester impression visuelle

3. **Option C : Profil ICC adapté**
   - Vérifier RIP utilise profil ICC correct
   - Re-linéariser si nécessaire

---

### ⚠️ "Convergence lente (>5 itérations)"

**Symptôme :**
- Malgré corrections, ΔE ne baisse pas
- Ou oscille autour même valeur

**Causes possibles :**

1. **Instabilité impression :**
   - Température/humidité variable
   - Encres pas stabilisées
   - **Solution :** Laisser machine chauffer 30min

2. **Profil ICC non-linéaire :**
   - RIP applique corrections non-proportionnelles
   - **Solution :** Désactiver gestion couleur RIP temporairement

3. **Mesures spectro inconsistantes :**
   - Positionnement spectrophotomètre
   - **Solution :** Utiliser guide de mesure

---

## 🖥️ Problèmes Performance

### 🐌 "Application lente / freeze"

**Symptômes :**
- Upload prend >30s
- Calculs bloquent interface
- Export timeout

**Solutions :**

1. **Fichier trop gros :**
   - Limiter à 500 couleurs max
   - Diviser en plusieurs sessions

2. **RAM insuffisante :**
   ```bash
   # Vérifier usage mémoire
   # Fermer autres apps
   # Minimum recommandé : 4GB RAM
   ```

3. **Browser cache :**
   - Vider cache navigateur
   - Tester en navigation privée

---

### 🔥 "Memory leak / crash après plusieurs heures"

**Cause :** Fichiers uploadés non nettoyés

**Solution :**

```bash
# Nettoyer dossier uploads manuellement
cd backend/uploads
rm *.cct

# Ou script automatique (Linux/Mac)
find backend/uploads -name "*.cct" -mtime +1 -delete
```

---

## 📊 Problèmes Export

### ❌ "Export failed - Invalid XML"

**Cause :** 
- Fichier source .cct manquant ou corrompu
- Nouvelles valeurs Lab hors plages

**Solutions :**

1. **Vérifier sourceXML présent :**
   - Application doit garder XML original en mémoire
   - Si perdu : re-upload fichier

2. **Vérifier nouvelles valeurs Lab :**
   - Aucune ne doit dépasser plages valides
   - Si oui : bug calcul, signaler GitHub

---

### ❌ "Downloaded file corrupted"

**Symptôme :**
- Fichier .cct téléchargé illisible dans RIP

**Solutions :**

1. **Vérifier encoding :**
   ```bash
   file -i corrected.cct
   # Doit être UTF-8
   ```

2. **Re-télécharger :**
   - Cache browser parfois corrompt
   - Utiliser "Download again"

3. **Ouvrir dans éditeur texte :**
   - Vérifier structure XML valide
   - Comparer avec fichier original

---

## 🔐 Problèmes Sécurité

### ⚠️ "CORS error in browser console"

**Message :**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause :** Backend CORS mal configuré

**Solution :**

```javascript
// backend/server.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
```

---

## 📞 Contacter Support

Si problème persiste après troubleshooting :

### 1. Préparer infos

```bash
# Collecter logs
cd backend
npm start > backend-logs.txt 2>&1

# Console navigateur
F12 → Console → Copier erreurs
```

### 2. Créer GitHub Issue

https://github.com/NoUseForIt/color-delta-node/issues

**Template :**
```markdown
**Environnement**
- OS : [Windows 11 / macOS 14 / Ubuntu 22.04]
- Node.js version : [node --version]
- Browser : [Chrome 120 / Firefox 115]

**Problème**
[Description détaillée]

**Steps to Reproduce**
1. Step 1
2. Step 2
3. ...

**Expected vs Actual**
Expected: [...]
Actual: [...]

**Logs**
[Coller logs backend + console]

**Fichier .cct**
[Joindre si possible]
```

---

**Dernière mise à jour :** Phase 5 (Mai 2026)  
**Version :** 5.0.0
