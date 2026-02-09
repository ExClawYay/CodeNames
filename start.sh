#!/bin/bash

# CodeNames Duet - Quick Start Script
# Usage: ./start.sh

set -e

echo "🎮 CodeNames Duet - Docker Deployment"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp deployment/.env.example .env
    echo ""
    echo "📝 Please edit .env with your Firebase credentials:"
    echo "   nano .env"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if SSL certs exist for HTTPS
if [ ! -f deployment/ssl/cert.pem ] || [ ! -f deployment/ssl/key.pem ]; then
    echo "⚠️  SSL certificates not found. Creating self-signed certificates..."
    mkdir -p deployment/ssl
    openssl req -x509 -newkey rsa:4096 \
        -keyout deployment/ssl/key.pem \
        -out deployment/ssl/cert.pem \
        -days 365 -nodes \
        -subj "/CN=localhost"
    echo "✅ Self-signed certificates created"
fi

echo "📦 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "✅ CodeNames Duet is running!"
echo ""
echo "📍 Access your game:"
echo "   Frontend: http://localhost"
echo "   API: http://localhost:8080/api"
echo ""
echo "🔧 Useful commands:"
echo "   docker-compose logs -f          # View logs"
echo "   docker-compose ps               # Container status"
echo "   docker-compose restart          # Restart"
echo "   docker-compose down             # Stop all"
echo ""
echo "💡 First time setup:"
echo "   1. Open http://localhost in your browser"
echo "   2. Create a room with a nickname"
echo "   3. Share the room code with your friend"
echo "   4. They join the room"
echo "   5. Start playing!"
echo ""
