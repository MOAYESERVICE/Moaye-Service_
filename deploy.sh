#!/bin/bash

##############################################################################
# MOAYE-SERVICE - DEPLOYMENT SCRIPT FOR UBUNTU
# 
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/.../deploy.sh | bash
# 
# Or locally:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# This script:
# 1. Updates system
# 2. Installs Node.js, PostgreSQL, Nginx
# 3. Clones MOAYE-SERVICE
# 4. Configures .env files
# 5. Installs dependencies
# 6. Runs migrations
# 7. Builds frontend
# 8. Configures PM2 + Nginx + SSL
# 9. Starts everything
#
##############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

##############################################################################
# STEP 1: VERIFY REQUIREMENTS
##############################################################################
log_info "Vérification des prérequis..."

if [ "$EUID" -ne 0 ]; then 
    log_error "Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

# Check if Ubuntu
if [ ! -f /etc/os-release ] || ! grep -q "Ubuntu" /etc/os-release; then
    log_warning "Ce script est optimisé pour Ubuntu. Votre OS peut être différent."
fi

log_success "Vérifications passées"

##############################################################################
# STEP 2: UPDATE SYSTEM
##############################################################################
log_info "Mise à jour du système..."
apt-get update
apt-get upgrade -y
apt-get install -y curl wget git build-essential software-properties-common

log_success "Système à jour"

##############################################################################
# STEP 3: INSTALL NODE.JS 20 LTS
##############################################################################
log_info "Installation de Node.js 20 LTS..."

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log_success "Node.js installé: $(node --version)"
else
    log_warning "Node.js déjà installé: $(node --version)"
fi

# Install PM2 globally
npm install -g pm2
pm2 startup
pm2 save

log_success "PM2 installé et configuré"

##############################################################################
# STEP 4: INSTALL POSTGRESQL
##############################################################################
log_info "Installation de PostgreSQL..."

if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    log_success "PostgreSQL installé et lancé"
else
    log_warning "PostgreSQL déjà installé"
fi

##############################################################################
# STEP 5: CREATE DATABASE & USER
##############################################################################
log_info "Création de la base de données..."

# Generate strong password
DB_PASSWORD=$(openssl rand -base64 32)

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE moeye_service_prod;
CREATE USER moeye_user WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE moeye_user SET client_encoding TO 'utf8';
ALTER ROLE moeye_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE moeye_user SET default_transaction_deferrable TO on;
ALTER ROLE moeye_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE moeye_service_prod TO moeye_user;
EOF

log_success "Base de données créée"
log_warning "Password de DB: $DB_PASSWORD (sauvegardez-le!)"

##############################################################################
# STEP 6: CLONE PROJECT
##############################################################################
log_info "Clonage du projet MOAYE-SERVICE..."

APP_DIR="/var/www/moaye-service"
mkdir -p "$APP_DIR"

# If git repo URL not provided, use GitHub default
GIT_REPO="${1:-https://github.com/ton_username/moaye-service.git}"

if [ ! -d "$APP_DIR/.git" ]; then
    git clone "$GIT_REPO" "$APP_DIR"
    log_success "Projet cloné"
else
    log_warning "Répertoire $APP_DIR existe déjà, on skip le clone"
fi

cd "$APP_DIR"

##############################################################################
# STEP 7: CONFIGURE BACKEND .ENV
##############################################################################
log_info "Configuration du backend..."

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create .env if not exists
if [ ! -f "backend/.env" ]; then
    cat > "backend/.env" << EOF
# Database
DATABASE_URL="postgresql://moeye_user:$DB_PASSWORD@localhost:5432/moeye_service_prod"

# JWT
JWT_SECRET="$JWT_SECRET"

# Environment
NODE_ENV=production
PORT=3000

# AI Services (optionnel)
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GROQ_MODEL=openai/gpt-oss-20b

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@moaye-service.com

# CORS
CORS_ORIGIN=https://tondomaine.com

# Logging
LOG_LEVEL=info
EOF
    log_success "Backend .env créé"
else
    log_warning "Backend .env existe déjà, on le met à jour partiellement"
    # Update DATABASE_URL if needed
    if ! grep -q "DATABASE_URL" "backend/.env"; then
        echo "DATABASE_URL=\"postgresql://moeye_user:$DB_PASSWORD@localhost:5432/moeye_service_prod\"" >> "backend/.env"
    fi
fi

##############################################################################
# STEP 8: CONFIGURE FRONTEND .ENV
##############################################################################
log_info "Configuration du frontend..."

if [ ! -f "frontend/.env.local" ]; then
    cat > "frontend/.env.local" << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
    log_success "Frontend .env.local créé"
else
    log_warning "Frontend .env.local existe déjà"
fi

##############################################################################
# STEP 9: INSTALL DEPENDENCIES
##############################################################################
log_info "Installation des dépendances backend..."
cd "$APP_DIR/backend"
npm install
log_success "Backend dependencies OK"

log_info "Installation des dépendances frontend..."
cd "$APP_DIR/frontend"
npm install
log_success "Frontend dependencies OK"

##############################################################################
# STEP 10: DATABASE MIGRATIONS
##############################################################################
log_info "Exécution des migrations Prisma..."
cd "$APP_DIR/backend"
npx prisma migrate deploy
npx prisma generate
log_success "Migrations OK"

##############################################################################
# STEP 11: BUILD FRONTEND
##############################################################################
log_info "Build du frontend..."
cd "$APP_DIR/frontend"
npm run build
log_success "Frontend build OK"

##############################################################################
# STEP 12: CONFIGURE PM2
##############################################################################
log_info "Configuration de PM2..."

cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
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
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
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
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
EOF

cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save

log_success "PM2 démarré"
pm2 status

##############################################################################
# STEP 13: CONFIGURE NGINX
##############################################################################
log_info "Installation et configuration de Nginx..."

apt-get install -y nginx

# Determine domain (default to localhost)
DOMAIN="${2:-localhost}"

# Create Nginx config
cat > "/etc/nginx/sites-available/moaye-service" << EOF
upstream backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:3001;
}

server {
    listen 80;
    server_name $DOMAIN;

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 30s;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/moaye-service /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Start Nginx
systemctl restart nginx
systemctl enable nginx

log_success "Nginx configuré et lancé"

##############################################################################
# STEP 14: SSL/HTTPS WITH CERTBOT (IF DOMAIN PROVIDED)
##############################################################################
if [ "$DOMAIN" != "localhost" ]; then
    log_info "Installation de Certbot pour SSL..."
    apt-get install -y certbot python3-certbot-nginx
    
    log_info "Génération du certificat SSL..."
    certbot --nginx -d "$DOMAIN" --agree-tos -m admin@$DOMAIN --non-interactive || log_warning "Certbot skipped"
    
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    log_success "SSL/HTTPS configuré"
else
    log_warning "Domaine non fourni, SSL non configuré. À faire manuellement."
fi

##############################################################################
# STEP 15: FIREWALL CONFIGURATION
##############################################################################
log_info "Configuration du firewall..."

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    log_success "Firewall configuré"
else
    log_warning "UFW not available, firewall not configured"
fi

##############################################################################
# SUMMARY
##############################################################################
log_success "✅ DÉPLOIEMENT TERMINÉ!"

echo ""
echo "======================================"
echo "📊 INFORMATIONS DE DÉPLOIEMENT"
echo "======================================"
echo ""
echo "App Directory: $APP_DIR"
echo "Database: moeye_service_prod"
echo "DB User: moeye_user"
echo "DB Password: $DB_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
echo ""
echo "Backend URL: http://localhost:3000 (or http://$DOMAIN/api)"
echo "Frontend URL: http://localhost:3001 (or http://$DOMAIN)"
echo ""
echo "======================================"
echo "📝 PROCHAINES ÉTAPES"
echo "======================================"
echo ""
echo "1. Mettez à jour backend/.env:"
echo "   - GROQ_API_KEY (ou autre provider AI)"
echo "   - SMTP_* (si vous voulez les emails)"
echo "   - Autres configs"
echo ""
echo "2. Redémarrez le backend:"
echo "   pm2 restart moaye-backend"
echo ""
echo "3. Vérifiez que ça fonctionne:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "4. Visualisez les logs:"
echo "   pm2 logs"
echo ""
echo "5. Pour ajouter votre domaine SSL:"
echo "   sudo certbot --nginx -d tondomaine.com"
echo ""
echo "======================================"
echo "🔐 SÉCURITÉ"
echo "======================================"
echo ""
echo "⚠️  SAUVEGARDEZ CES IDENTIFIANTS:"
echo "   - Database password"
echo "   - JWT secret"
echo "   - Backend .env"
echo ""
log_success "Merci d'utiliser MOAYE-SERVICE! 🚀"
