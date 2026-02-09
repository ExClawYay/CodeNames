# Deployment Guide

## Prerequisites

- VPS with Ubuntu 22.04 LTS (or similar)
- Docker & Docker Compose installed
- Domain name (optional, for HTTPS)
- Firebase project setup
- Minimum specs: 2GB RAM, 2 vCPU, 20GB storage

## Step 1: Setup VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/ExClawYay/CodeNames.git
cd CodeNames

# Copy and configure .env
cp deployment/.env.example .env
nano .env

# Add your Firebase credentials and other settings
```

## Step 3: Build & Run

```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Step 4: SSL Certificate (HTTPS)

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy to deployment folder
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deployment/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deployment/ssl/key.pem
sudo chown $USER:$USER deployment/ssl/*
```

### Self-Signed Certificate (Development)

```bash
mkdir -p deployment/ssl
openssl req -x509 -newkey rsa:4096 -keyout deployment/ssl/key.pem -out deployment/ssl/cert.pem -days 365 -nodes
```

## Step 5: Configure Firewall

```bash
# UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## Step 6: Monitor & Maintain

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update containers
docker-compose pull
docker-compose up -d

# Clean up unused containers
docker-compose down
docker system prune
```

## Troubleshooting

### Backend not connecting to Firebase

- Verify `FIREBASE_CREDENTIALS` in `.env`
- Check Firebase permissions
- Review backend logs: `docker-compose logs backend`

### Frontend not loading

- Ensure `VITE_API_URL` points to backend
- Check CORS settings in backend
- Review frontend logs: `docker-compose logs frontend`

### WebSocket connection issues

- Verify `/api/ws/` proxy in nginx.conf
- Check firewall rules
- Review nginx logs: `docker-compose logs nginx`

## Backup & Recovery

```bash
# Backup data
docker-compose exec backend mysqldump -u root -p database > backup.sql

# Restore
docker-compose exec -T backend mysql -u root -p database < backup.sql
```

## Security Checklist

- [ ] Update `.env` with secure credentials
- [ ] Enable HTTPS with valid certificate
- [ ] Configure firewall rules
- [ ] Set strong database passwords
- [ ] Enable automatic backups
- [ ] Monitor logs regularly
- [ ] Update Docker images monthly
- [ ] Setup fail2ban for SSH protection

## Support

For issues, check:
1. Logs: `docker-compose logs -f`
2. GitHub Issues: https://github.com/ExClawYay/CodeNames/issues
3. Documentation: `/docs`
