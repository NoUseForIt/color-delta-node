# 📋 INSTRUCTIONS : Fichiers Cachés

## ⚠️ Fichiers à Renommer

Tu trouveras 2 fichiers `.txt` à renommer :

### 1. gitignore.txt → .gitignore

**Windows (Invite de commandes)**
```cmd
cd frontend
ren gitignore.txt .gitignore
```

**Windows (PowerShell)**
```powershell
cd frontend
Rename-Item gitignore.txt .gitignore
```

**Mac/Linux**
```bash
cd frontend
mv gitignore.txt .gitignore
```

**Manuellement**
1. Ouvrir `gitignore.txt` dans ton éditeur
2. Sauvegarder sous le nom `.gitignore` (avec le point au début)
3. Supprimer `gitignore.txt`

### 2. env-example.txt → .env.example

**Windows (Invite de commandes)**
```cmd
cd frontend
ren env-example.txt .env.example
```

**Windows (PowerShell)**
```powershell
cd frontend
Rename-Item env-example.txt .env.example
```

**Mac/Linux**
```bash
cd frontend
mv env-example.txt .env.example
```

**Manuellement**
1. Ouvrir `env-example.txt` dans ton éditeur
2. Sauvegarder sous le nom `.env.example` (avec le point au début)
3. Supprimer `env-example.txt`

### 3. Créer ton .env (optionnel)

**Une fois .env.example créé :**

```bash
# Copier le fichier
cp .env.example .env

# Ou manuellement : dupliquer .env.example et renommer en .env
```

## ✅ Vérification

Après renommage, dans ton dossier `frontend/` tu devrais avoir :
- `.gitignore` (fichier caché)
- `.env.example` (fichier caché)
- `.env` (fichier caché, optionnel)

**Pour voir les fichiers cachés :**
- **Windows** : Affichage → Cocher "Éléments masqués"
- **Mac** : Cmd+Shift+. dans Finder
- **Linux** : Ctrl+H dans gestionnaire fichiers

## 🎯 Pourquoi Ces Fichiers ?

**`.gitignore`**
- Empêche Git de tracker `node_modules/`, `.env`, etc.
- Essentiel pour ne pas polluer ton repo GitHub

**`.env.example`**
- Template de configuration
- Partageable sur GitHub (pas de secrets)

**`.env`**
- Ta config locale (URL API personnalisée)
- Jamais commité sur Git (dans .gitignore)

## 🚀 Après Renommage

```bash
cd frontend
npm install
npm run dev
```

---

**C'est tout ! Les fichiers .txt sont juste les versions visibles des fichiers cachés.**
