# 🐳 Guide Docker — Color Delta V5

**Déploiement containerisé complet**

---

## 📋 Prérequis

### Installer Docker

**Windows/Mac :**
1. Télécharger [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Installer et démarrer Docker Desktop
3. Vérifier installation :
   ```bash
   docker --version
   docker-compose --version
   ```

**Linux (Ubuntu) :**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🚀 Démarrage Rapide

### Option 1 : Docker Compose (Recommandé)

**Démarre backend + frontend en une commande :**

```bash
# Depuis racine projet
cd docker
docker-compose up -d

# Vérifier status
docker-compose ps

# Logs
docker-compose logs -f
```

**Accès :**
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- Health check : http://localhost:5000/api/health

**Arrêt :**
```bash
docker-compose down
```

### Option 2 : Build Manuel

**Backend :**
```bash
# Build image
docker build -f docker/Dockerfile.backend -t color-delta-backend .

# Run container
docker run -d \
  --name backend \
  -p 5000:5000 \
  -v $(pwd)/backend/uploads:/app/uploads \
  color-delta-backend

# Logs
docker logs -f backend
```

**Frontend :**
```bash
# Build image
docker build -f docker/Dockerfile.frontend -t color-delta-frontend .

# Run container
docker run -d \
  --name frontend \
  -p 3000:3000 \
  color-delta-frontend

# Logs
docker logs -f frontend
```

---

## 🔧 Configuration

### Variables Environnement

**Créer fichier `.env` :**

```bash
# docker/.env
BACKEND_PORT=5000
FRONTEND_PORT=3000
NODE_ENV=production
```

**Modifier `docker-compose.yml` :**

```yaml
services:
  backend:
    environment:
      - PORT=${BACKEND_PORT}
      - NODE_ENV=${NODE_ENV}
```

### Changer Ports

```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "8000:5000"  # Expose sur port 8000 au lieu de 5000
  
  frontend:
    ports:
      - "8080:3000"  # Expose sur port 8080 au lieu de 3000
```

### Volumes Persistants

Les uploads et logs sont sauvegardés dans volumes Docker :

```bash
# Voir volumes
docker volume ls

# Inspecter volume
docker volume inspect docker_uploads-data

# Backup volume
docker run --rm \
  -v docker_uploads-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz /data
```

---

## 🐛 Debug & Logs

### Logs Conteneurs

```bash
# Tous services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# Dernières 100 lignes
docker-compose logs --tail=100 backend
```

### Shell Interactif

```bash
# Backend
docker exec -it color-delta-backend sh

# Frontend
docker exec -it color-delta-frontend sh

# Vérifier fichiers
ls -la /app
cat /app/.env
```

### Health Checks

```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000/health

# Docker inspect
docker inspect color-delta-backend | grep -A 10 Health
```

---

## 🔄 Mise à Jour

### Rebuild After Code Changes

```bash
# Rebuild images
docker-compose build

# Restart services
docker-compose up -d

# Ou tout en une commande
docker-compose up -d --build
```

### Pull Latest Images

```bash
# Pull from Docker Hub
docker-compose pull

# Restart
docker-compose up -d
```

---

## 📦 Production Deployment

### Build Multi-Platform

```bash
# Setup buildx
docker buildx create --use

# Build pour Linux + ARM
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile.backend \
  -t color-delta-backend:latest \
  --push \
  .
```

### Docker Registry

```bash
# Login Docker Hub
docker login

# Tag images
docker tag color-delta-backend username/color-delta-backend:v5.0.0
docker tag color-delta-frontend username/color-delta-frontend:v5.0.0

# Push
docker push username/color-delta-backend:v5.0.0
docker push username/color-delta-frontend:v5.0.0
```

### Deploy on Server

```bash
# SSH to server
ssh user@your-server.com

# Pull docker-compose.yml
wget https://raw.githubusercontent.com/NoUseForIt/color-delta-node/main/docker/docker-compose.yml

# Start
docker-compose up -d
```

---

## 🔐 Sécurité

### Non-Root User

Les Dockerfiles utilisent déjà utilisateur non-root :

```dockerfile
# Backend
USER nodejs

# Frontend
USER nginx
```

### Scan Vulnerabilities

```bash
# Backend
docker scan color-delta-backend

# Frontend
docker scan color-delta-frontend
```

### Update Base Images

```bash
# Modifier Dockerfiles
FROM node:20-alpine  # Toujours utiliser tag spécifique

# Rebuild
docker-compose build --no-cache
```

---

## 📊 Monitoring

### Resource Usage

```bash
# Stats en temps réel
docker stats

# Limiter resources
docker-compose.yml:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M
```

### Auto-Restart

```yaml
# docker-compose.yml
services:
  backend:
    restart: unless-stopped  # Auto-restart si crash
```

---

## ❓ Troubleshooting

### ❌ Port Already in Use

```bash
# Error: bind: address already in use
# Solution: Changer port ou kill process

# Trouver process
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>
```

### ❌ Container Exits Immediately

```bash
# Voir logs erreur
docker logs color-delta-backend

# Causes courantes:
# - Erreur syntax code
# - Module manquant
# - Port déjà utilisé
```

### ❌ Cannot Connect to Backend

```bash
# Vérifier container running
docker ps

# Vérifier network
docker network inspect docker_color-delta-network

# Test depuis container frontend
docker exec -it color-delta-frontend wget -O- http://backend:5000/api/health
```

### 🐌 Build Slow

```bash
# Utiliser cache build
docker-compose build --parallel

# Ou build args
docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

---

## 🧹 Cleanup

### Supprimer Containers

```bash
# Stop et remove
docker-compose down

# Remove volumes aussi
docker-compose down -v
```

### Nettoyer Docker

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

---

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

**Version :** 5.0.0  
**Dernière mise à jour :** Phase 5 (Mai 2026)
