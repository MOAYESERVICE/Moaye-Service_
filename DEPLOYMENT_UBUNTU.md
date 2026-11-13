# 🚀 DÉPLOYER MOAYE-SERVICE SUR UBUNTU

**Guide complet pour mettre en production sur un serveur Ubuntu**

---

## 📋 PRÉ-REQUIS

Tu dois avoir:
- [ ] Serveur Ubuntu 22.04 ou 24.04 (Linux)
- [ ] Accès SSH (root ou sudo)
- [ ] Domaine (optionnel mais recommandé)
- [ ] Certificat SSL (Let's Encrypt gratuit)

---

## 🔧 ÉTAPE 1: PRÉPARER LE SERVEUR UBUNTU

### 1.1 Connexion SSH
```bash
ssh root@ton_ip_serveur
# ou
ssh user@ton_ip_serveur
```

### 1.2 Mettre à jour le système
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Installer les dépendances de base
```bash
sudo apt install -y curl wget git build-essential
```

---

## 🟢 ÉTAPE 2: INSTALLER NODE.JS

### 2.1 Installer Node.js v20 (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2.2 Vérifier l'installation
```bash
node --version    # v20.x.x
npm --version     # 10.x.x
```

### 2.3 Installer PM2 (pour garder l'app active)
```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

---

## 🐘 ÉTAPE 3: INSTALLER POSTGRESQL

### 3.1 Installer PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### 3.2 Démarrer PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.3 Créer la base de données
```bash
sudo -u postgres psql
```

Dans le shell PostgreSQL:
```sql
CREATE DATABASE moeye_service_prod;
CREATE USER moeye_user WITH PASSWORD 'ton_mot_de_passe_complexe';
ALTER ROLE moeye_user SET client_encoding TO 'utf8';
ALTER ROLE moeye_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE moeye_user SET default_transaction_deferrable TO on;
ALTER ROLE moeye_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE moeye_service_prod TO moeye_user;
\q
```

---

## 📁 ÉTAPE 4: CLONER LE PROJET

### 4.1 Créer le dossier de l'app
```bash
sudo mkdir -p /var/www/moaye-service
sudo chown $USER:$USER /var/www/moaye-service
cd /var/www/moaye-service
```

### 4.2 Cloner depuis GitHub
```bash
git clone https://github.com/ton_username/moaye-service.git .
# ou copier directement les fichiers
```

### 4.3 Naviguer au dossier
```bash
cd /var/www/moaye-service
```

---

## ⚙️ ÉTAPE 5: CONFIGURER LE BACKEND

### 5.1 Aller au dossier backend
```bash
cd backend
```

### 5.2 Créer le fichier .env
```bash
nano .env
```

Ajouter (remplace les valeurs):
```env
# Database
DATABASE_URL="postgresql://moeye_user:ton_mot_de_passe@localhost:5432/moeye_service_prod"

# JWT
JWT_SECRET="ta_clé_secrète_très_longue_et_aléatoire"

# Environment
NODE_ENV=production
PORT=3000

# AI Services (optionnel)
CLAUDE_API_KEY="sk_votre_clé"
OPENAI_API_KEY="sk_votre_clé"
GROQ_API_KEY="votre_clé"

# Email (optionnel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre_email@gmail.com"
SMTP_PASSWORD="votre_mot_de_passe"
SMTP_FROM="noreply@moaye-service.com"
```

### 5.3 Installer les dépendances
```bash
npm install
```

### 5.4 Créer les migrations Prisma
```bash
npx prisma migrate deploy
```

### 5.5 Générer le client Prisma
```bash
npx prisma generate
```

### 5.6 Tester le backend
```bash
npm run dev
# ou
npm start
```

Si ça fonctionne, Ctrl+C pour arrêter.

---

## 🎨 ÉTAPE 6: CONFIGURER LE FRONTEND

### 6.1 Aller au dossier frontend
```bash
cd ../frontend
```

### 6.2 Créer le fichier .env.local
```bash
nano .env.local
```

Ajouter:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# ou si tu as un domaine:
# NEXT_PUBLIC_API_URL=https://api.tondomaine.com/api
```

### 6.3 Installer les dépendances
```bash
npm install
```

### 6.4 Build pour la production
```bash
npm run build
```

### 6.5 Tester le frontend
```bash
npm run start
```

Si ça fonctionne, Ctrl+C pour arrêter.

---

## 🚀 ÉTAPE 7: LANCER AVEC PM2

### 7.1 Créer l'écosystème PM2
```bash
cd /var/www/moaye-service
nano ecosystem.config.js
```

Ajouter:
```javascript
module.exports = {
  apps: [
    {
      name: 'moaye-backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'moaye-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### 7.2 Lancer avec PM2
```bash
pm2 start ecosystem.config.js
```

### 7.3 Sauvegarder la configuration
```bash
pm2 save
pm2 startup
```

### 7.4 Vérifier le statut
```bash
pm2 status
pm2 logs
```

---

## 🌐 ÉTAPE 8: CONFIGURER NGINX (REVERSE PROXY)

### 8.1 Installer Nginx
```bash
sudo apt install -y nginx
```

### 8.2 Créer la config Nginx
```bash
sudo nano /etc/nginx/sites-available/moaye-service
```

Ajouter:
```nginx
upstream backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:3001;
}

server {
    listen 80;
    server_name tondomaine.com www.tondomaine.com;

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.3 Activer la config
```bash
sudo ln -s /etc/nginx/sites-available/moaye-service /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # optionnel
```

### 8.4 Tester la config Nginx
```bash
sudo nginx -t
```

### 8.5 Redémarrer Nginx
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 ÉTAPE 9: SSL/HTTPS AVEC LET'S ENCRYPT

### 9.1 Installer Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Générer le certificat SSL
```bash
sudo certbot --nginx -d tondomaine.com -d www.tondomaine.com
```

### 9.3 Auto-renouvellement
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📊 ÉTAPE 10: MONITORING & LOGS

### 10.1 Voir les logs PM2
```bash
pm2 logs moaye-backend
pm2 logs moaye-frontend
pm2 monit
```

### 10.2 Voir les logs Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 10.3 Voir les logs PostgreSQL
```bash
sudo tail -f /var/log/postgresql/postgresql.log
```

---

## 🔄 ÉTAPE 11: METTRE À JOUR L'APP

Quand tu as du nouveau code:

```bash
cd /var/www/moaye-service

# Récupérer le code
git pull origin main

# Backend
cd backend
npm install
npx prisma migrate deploy
cd ..

# Frontend
cd frontend
npm install
npm run build
cd ..

# Redémarrer
pm2 restart ecosystem.config.js
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

```
[ ] Serveur Ubuntu prêt
[ ] Node.js installé
[ ] PostgreSQL installé et configuré
[ ] Projet cloné
[ ] Backend .env configuré
[ ] Frontend .env.local configuré
[ ] PM2 lancé et fonctionnel
[ ] Nginx configuré
[ ] SSL/HTTPS actif
[ ] Backend accessible sur port 3000
[ ] Frontend accessible sur port 3001
[ ] Domain pointe vers le serveur
[ ] Logs sans erreurs
[ ] Tests fonctionnels réussis
[ ] Auto-redémarrage activé (PM2)
[ ] Backups configurés
```

---

## 🐛 DÉPANNAGE

### Backend ne démarre pas
```bash
pm2 logs moaye-backend
# Vérifier .env
# Vérifier database connection
```

### PostgreSQL connexion refusée
```bash
sudo -u postgres psql
# Vérifier les permissions
```

### Nginx 502 Bad Gateway
```bash
# Vérifier que le backend tourne
pm2 status
# Vérifier la config Nginx
sudo nginx -t
```

### Port déjà utilisé
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

---

## 💰 COÛTS

**Pour un MVP:**
- Serveur VPS: 5-10€/mois (Digital Ocean, Linode, Hetzner)
- Domaine: 10-15€/an
- SSL: GRATUIT (Let's Encrypt)
- PostgreSQL: Inclus dans le VPS
- **Total: ~10€/mois**

---

## 🎯 RÉSUMÉ RAPIDE (2 min)

```bash
# 1. SSH
ssh root@ip_serveur

# 2. Install
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx certbot
sudo npm install -g pm2

# 3. Database
sudo -u postgres createdb moeye_service_prod
# (configure user)

# 4. Clone & Config
cd /var/www/moaye-service
git clone ...
# Configure .env files

# 5. Install & Build
cd backend && npm install && npx prisma migrate deploy
cd ../frontend && npm install && npm run build

# 6. Launch
cd /var/www/moaye-service
pm2 start ecosystem.config.js

# 7. Nginx + SSL
# (configure nginx)
sudo certbot --nginx

# Done! 🚀
```

---

**Des questions? Besoin d'aide pour une étape?** Dis-moi! 👇
