# 📖 Guide Utilisateur — Color Delta V5

**Guide non-technique pour opérateurs impression**

---

## 🎯 Qu'est-ce que Color Delta ?

Color Delta est un outil qui vous aide à **corriger automatiquement les couleurs** de vos impressions RIP (ColorGATE/Caldera).

### Problème résolu

Quand vous imprimez un nuancier :
- Les couleurs imprimées ne matchent pas toujours la cible
- Vous devez ajuster manuellement les valeurs dans le RIP
- Plusieurs essais sont nécessaires pour obtenir le bon résultat

**Color Delta fait le calcul automatique pour vous !**

---

## 🚀 Démarrage Rapide (5 étapes)

### 1️⃣ Préparation

**Vous avez besoin de :**
- ✅ Un fichier `.cct` exporté depuis votre RIP ColorGATE
- ✅ Les mesures spectrophotométriques de votre nuancier imprimé
- ✅ Les mesures spectrophotométriques de votre nuancier de référence (bench)

### 2️⃣ Lancement Application

**Sur votre ordinateur :**

```bash
# Ouvrir 2 fenêtres de terminal

# Terminal 1 - Backend
cd color-delta-node/backend
npm start

# Terminal 2 - Frontend
cd color-delta-node/frontend
npm start
```

**Dans votre navigateur :** Aller sur `http://localhost:3000`

### 3️⃣ Upload Fichier .cct

1. Cliquer sur **"Choisir fichier"** ou glisser-déposer
2. Sélectionner votre fichier `.cct`
3. ✅ Les couleurs s'affichent automatiquement

![Upload Screenshot](./screenshots/01-upload.png)

### 4️⃣ Analyser Dérives

L'application calcule automatiquement :
- **ΔE** (différence colorimétrique) pour chaque couleur
- **Alertes** si dérives importantes détectées
- **Correction substrate** si papier différent

**Légende des couleurs :**
- 🟢 Vert : ΔE < 1 (excellent)
- 🟡 Jaune : ΔE 1-2 (acceptable)
- 🔴 Rouge : ΔE > 2 (correction nécessaire)

![Analyse Screenshot](./screenshots/02-analyse.png)

### 5️⃣ Appliquer Corrections & Exporter

1. Cliquer **"Appliquer corrections"**
2. Vérifier nouvelles valeurs RIP
3. Cliquer **"Exporter .cct"**
4. ✅ Fichier `corrected_YYYYMMDD.cct` téléchargé
5. Réimporter ce fichier dans votre RIP ColorGATE

![Export Screenshot](./screenshots/03-export.png)

---

## 📊 Comprendre l'Interface

### Carte Couleur

Chaque couleur affiche :

```
┌─────────────────────────────────┐
│ 🎨 Cyan                   ΔE 1.5│
├─────────────────────────────────┤
│ Bench :  L=54.2  a=-37.5  b=-50│
│ RIP   :  L=54.0  a=-38.0  b=-51│
│ Scan  :  L=53.5  a=-37.8  b=-50│
│ ───────────────────────────────│
│ Nouveau RIP (corrigé):         │
│ L=54.5  a=-37.0  b=-49.5       │
└─────────────────────────────────┘
```

- **Bench** : Valeur cible (mesure nuancier référence)
- **RIP** : Valeur actuelle dans fichier .cct
- **Scan** : Valeur mesurée sur impression
- **Nouveau RIP** : Valeur calculée pour correction

### Alerte Substrate

Si vous voyez ⚠️ **ALERTE SUBSTRATE** :

- Votre papier est trop différent du bench
- La correction peut ne pas être parfaite
- **Solution** : Re-calibrer bench avec même papier

---

## 🔄 Workflow Multi-Itérations

Pour obtenir un résultat parfait (ΔE < 1) :

```
1. Export .cct depuis RIP → Upload Color Delta
   ↓
2. Color Delta calcule corrections
   ↓
3. Export .cct corrigé → Import dans RIP
   ↓
4. Imprimer nouveau nuancier → Mesurer
   ↓
5. Recommencer étapes 1-4 jusqu'à ΔE < 1
```

**Nombre d'itérations typique :** 2-3 maximum

### Historique Itérations

L'application garde l'historique :
- Cliquer **"Voir historique"**
- Voir évolution ΔE par itération
- Comparer valeurs RIP successives

---

## ❓ FAQ & Troubleshooting

### ❌ "Fichier format invalide"

**Cause :** Fichier n'est pas un `.cct` ColorGATE

**Solution :**
1. Vérifier extension fichier : doit être `.cct`
2. Re-exporter depuis RIP ColorGATE
3. Ne pas modifier fichier manuellement

### ❌ "Erreur parsing XML"

**Cause :** Fichier `.cct` corrompu

**Solution :**
1. Ouvrir fichier dans éditeur texte
2. Vérifier balises XML fermées correctement
3. Re-exporter fichier depuis RIP

### ⚠️ "ΔE très élevé (>10)"

**Cause :** Mesures spectrométriques incorrectes ou mauvais profil ICC

**Solution :**
1. Re-vérifier calibration spectrophotomètre
2. Vérifier illuminant D50 utilisé
3. Vérifier profil ICC RIP correct

### ⚠️ "Substrate Alert ΔWP > 5"

**Cause :** Papier impression très différent du bench

**Solution :**
1. **Recommandé :** Re-mesurer bench sur même papier
2. Alternativement : Accepter précision réduite

### 🐌 "Application lente"

**Cause :** Fichier .cct très volumineux (>1000 couleurs)

**Solution :**
1. Fermer autres applications
2. Réduire nombre couleurs si possible
3. Augmenter RAM serveur

---

## 🎨 Exemples Fichiers Test

Des fichiers `.cct` d'exemple sont fournis :

```
exemples/
├── 01-cyan-magenta-yellow.cct    (3 couleurs primaires)
├── 02-nuancier-complet.cct       (50 couleurs)
└── 03-edge-cases.cct              (valeurs limites Lab)
```

**Usage :**
1. Upload fichier exemple
2. Tester workflow sans risque
3. Comprendre interface

---

## 🔧 Configuration Avancée

### Changer Port Serveur

Par défaut : Backend `5000`, Frontend `3000`

**Modifier :**

```bash
# Backend
export PORT=8000
npm start

# Frontend
# Modifier vite.config.js :
server: { port: 8080 }
```

### Mode Production

```bash
# Build frontend optimisé
cd frontend
npm run build

# Servir build statique
npm install -g serve
serve -s dist -l 3000
```

---

## 📞 Support

### Problème technique ?

1. **Vérifier logs console :**
   - Backend : terminal où `npm start` tourne
   - Frontend : F12 → Console dans navigateur

2. **Créer issue GitHub :**
   - https://github.com/NoUseForIt/color-delta-node/issues
   - Joindre logs + fichier .cct problématique

3. **Documentation développeur :**
   - `README_PHASE3.md` (API)
   - `MAINTENANCE_GUIDE.md` (technique)

---

## ✅ Checklist Succès

Avant de valider votre correction :

- [ ] ΔE moyen < 1.5
- [ ] Pas de valeurs rouges (ΔE > 2)
- [ ] Substrate alert < 2.5 si possible
- [ ] Test impression visuel satisfaisant
- [ ] Fichier .cct réimporté dans RIP sans erreur

---

**Version :** 5.0.0  
**Dernière mise à jour :** Phase 5 (Mai 2026)  
**Auteur :** NoUseForIt
