# Docker Compose Deployment Guide

Everything runs in Docker containers. One command to deploy!

## Prerequisites

- Docker & Docker Compose installed on your VPS
- Firebase project with credentials
- Domain name (optional, for HTTPS)

## Quick Start (5 minutes)

### 1. Clone Repository

```bash
git clone https://github.com/ExClawYay/CodeNames.git
cd CodeNames
```

### 2. Configure Environment

```bash
cp deployment/.env.example .env
```

Edit `.env` with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key-from-json
FIREBASE_CLIENT_EMAIL=your-service-account@appspot.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 3. Generate SSL Certificate (Optional but Recommended)

For HTTPS with Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy to deployment folder
mkdir -p deployment/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deployment/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deployment/ssl/key.pem
sudo chown -R $USER:$USER deployment/ssl/
```

For self-signed (development only):

```bash
mkdir -p deployment/ssl
openssl req -x509 -newkey rsa:4096 -keyout deployment/ssl/key.pem -out deployment/ssl/cert.pem -days 365 -nodes
```

### 4. Update Nginx Config

Edit `deployment/nginx.conf` and replace:
- `yourdomain.com` with your actual domain
- `http://localhost:3000` to `https://yourdomain.com` in CORS

### 5. Start Everything

```bash
docker-compose up -d
```

That's it! Your game is now running at:
- **Frontend:** http://localhost (or https://yourdomain.com)
- **Backend:** http://localhost:8080/api
- **WebSocket:** ws://localhost/api/ws

## Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test health
curl http://localhost:8080/api/health
```

## Common Commands

```bash
# View logs
docker-compose logs -f [service-name]

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Rebuild containers
docker-compose build --no-cache

# Update & restart
docker-compose pull
docker-compose up -d
```

## Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| `FIREBASE_PROJECT_ID` | Yes | `my-game-project` |
| `FIREBASE_PRIVATE_KEY` | Yes | `-----BEGIN PRIVATE KEY-----...` |
| `FIREBASE_CLIENT_EMAIL` | Yes | `firebase@project.iam.gserviceaccount.com` |
| `FIREBASE_DATABASE_URL` | Yes | `https://my-project.firebaseio.com` |
| `CORS_ALLOWED_ORIGINS` | No | `https://yourdomain.com` |

## Troubleshooting

### Backend not starting
```bash
docker-compose logs backend
```
Check Firebase credentials in `.env`

### Frontend not loading
```bash
docker-compose logs frontend
```
Verify Nginx is routing correctly

### WebSocket connection issues
Check Nginx `/api/ws` proxy config points to `backend:8080`

### SSL certificate errors
Regenerate certificate or use self-signed for testing

### Port already in use
```bash
# Find what's using port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Kill process
kill -9 <PID>
```

## Scaling to Production

### 1. Use a Reverse Proxy Load Balancer
- AWS ALB, GCP Load Balancer, or DigitalOcean App Platform
- Points to Nginx on your VPS

### 2. Enable Auto-Restart
Already configured with `restart: unless-stopped`

### 3. Monitor Container Health
```bash
# Setup monitoring (optional)
docker stats
```

### 4. Backup Data
Since we're using Firebase, no local data to backup. But export Firebase data regularly:
```bash
firebase firestore:delete --all
```

### 5. Update Process
```bash
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Your VPS (1 server)           │
├─────────────────────────────────────────┤
│  Docker Compose (3 containers)          │
│  ┌──────────────────────────────────┐   │
│  │ Nginx (reverse proxy)            │   │
│  │ :80/:443 → backend & frontend    │   │
│  └──────────────────────────────────┘   │
│  ┌──────────┬──────────────────────┐   │
│  │ Backend  │ Frontend             │   │
│  │ Node.js  │ React (SPA)          │   │
│  │ :8080    │ :3000                │   │
│  │ Express  │ Vite                 │   │
│  │ WebSocket│ (built dist served)  │   │
│  └──────────┴──────────────────────┘   │
├─────────────────────────────────────────┤
│ Volumes: SSL certs, nginx config        │
└─────────────────────────────────────────┘
        ↓
   Firebase Cloud
   (auth, database)
```

## Performance Notes

- **Memory:** ~400MB total (3 containers)
- **CPU:** Minimal, scales with players
- **Disk:** ~500MB (images + code)
- **Network:** ~100KB per game session

Runs comfortably on a **1GB VPS** 🚀

---

**Questions?** Check the main README.md or docs/
