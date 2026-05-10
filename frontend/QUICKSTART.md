# 🚀 Guide Démarrage Rapide - Phase 4 Frontend

## Installation et Lancement (5 minutes)

### 1. Prérequis
- Node.js 18+ installé ([télécharger](https://nodejs.org))
- Backend Phase 3 opérationnel sur port 5000

### 2. Installation

```bash
# Dans le dossier frontend/
npm install
```

**Patience** : Premier `npm install` peut prendre 2-3 minutes (téléchargement dépendances)

### 3. Lancement

```bash
npm run dev
```

✅ L'app s'ouvre sur `http://localhost:3000`

### 4. Vérification

1. Ouvrir navigateur sur `http://localhost:3000`
2. Tu dois voir "Color Delta Tool" avec zone upload
3. Si erreur API → Vérifier que backend tourne sur port 5000

## 🎯 Utilisation Basique

### Upload un fichier .cct

1. **Glisser-déposer** un fichier .cct dans la zone
2. OU **cliquer** pour sélectionner

➡️ L'app charge et analyse automatiquement

### Voir les résultats

- **Panneau Analyse** : Dérive point blanc (ΔE WP)
- **Onglet Original** : Couleurs avec leurs ΔE
- **Statistiques** : Min/Max/Moyenne des dérives

### Corriger les couleurs

1. Cliquer bouton **"Corriger"** (actif si ΔE WP > 1.0)
2. Onglet **"Couleurs corrigées"** apparaît
3. Comparer avant/après

### Exporter

Cliquer **"Exporter .cct"** → Téléchargement automatique fichier corrigé

### Historique

Le panneau **"Historique"** montre toutes les itérations  
Cliquer icône ↻ pour restaurer une itération

## 🐛 Problèmes Courants

### Port 3000 déjà utilisé
```bash
# Modifier le port dans vite.config.js
server: {
  port: 3001, // Changer ici
}
```

### API non accessible
```bash
# Vérifier que le backend tourne
cd ../backend
npm start

# Vérifier l'URL dans .env
VITE_API_URL=http://localhost:5000/api
```

### npm install échoue
```bash
# Vider le cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Page blanche
1. Ouvrir Console navigateur (F12)
2. Regarder erreurs
3. Vérifier que tous les fichiers src/ existent

## 📝 Commandes Utiles

```bash
npm run dev       # Dev avec hot-reload
npm run build     # Build production
npm run preview   # Tester le build
npm run lint      # Vérifier code

# Arrêter le serveur
Ctrl + C
```

## 🔧 Configuration Avancée

### Changer l'URL de l'API

1. Copier `.env.example` en `.env`
```bash
cp .env.example .env
```

2. Éditer `.env`
```bash
VITE_API_URL=http://autre-serveur:5000/api
```

3. Redémarrer
```bash
npm run dev
```

### Personnaliser les couleurs

Modifier `tailwind.config.js` :
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#ta-couleur',
      },
    },
  },
},
```

## 📂 Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `src/pages/ColorDashboard.jsx` | Page principale |
| `src/stores/colorStore.js` | État de l'app |
| `src/services/colorService.js` | Appels API |
| `package.json` | Dépendances |
| `.env` | Config API URL |

## 🆘 Besoin d'aide ?

1. **Lire** `README.md` complet
2. **Vérifier** Console navigateur (F12)
3. **Consulter** `PHASE4_SUMMARY.md` pour détails techniques

## ✨ Workflow Complet

```
Upload .cct
    ↓
Analyse auto
    ↓
Visualisation + ΔE
    ↓
Correction (si nécessaire)
    ↓
Comparaison avant/après
    ↓
Export .cct corrigé
    ↓
Historique sauvegardé
```

---

**Bon courage ! 🚀**  
Si ça marche pas, vérifie que le backend tourne et que Node.js est bien installé.
