#!/bin/bash

# FANZ Production Deployment Script
# This script handles the complete deployment process for FANZ

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DOMAIN=${2:-fanz.network}
SSL_EMAIL=${3:-admin@fanz.network}

echo -e "${BLUE}🚀 Starting FANZ deployment for ${ENVIRONMENT} environment${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose installation
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating required directories..."
mkdir -p logs uploads nginx/ssl monitoring ai-models database

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your production values before continuing."
        read -p "Press Enter to continue after editing .env file..."
    else
        print_error ".env.example file not found. Please create environment configuration."
        exit 1
    fi
fi

# Build the application
print_status "Building FANZ application..."
npm run build

# Pull latest images
print_status "Pulling latest Docker images..."
if command -v docker-compose &> /dev/null; then
    docker-compose pull
else
    docker compose pull
fi

# Stop existing containers
print_status "Stopping existing containers..."
if command -v docker-compose &> /dev/null; then
    docker-compose down
else
    docker compose down
fi

# Run database migrations
print_status "Running database migrations..."
if command -v docker-compose &> /dev/null; then
    docker-compose run --rm app npm run db:push
else
    docker compose run --rm app npm run db:push
fi

# Start the services
print_status "Starting FANZ services..."
if [ "$ENVIRONMENT" = "production" ]; then
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d --profile monitoring --profile ai-enabled
    else
        docker compose up -d --profile monitoring --profile ai-enabled
    fi
else
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Health checks
print_status "Performing health checks..."

# Check if main app is responding
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "Main application is healthy"
else
    print_error "Main application health check failed"
    exit 1
fi

# Check if database is ready
if command -v docker-compose &> /dev/null; then
    docker-compose exec postgres pg_isready -U fanz_user -d fanz_production > /dev/null
else
    docker compose exec postgres pg_isready -U fanz_user -d fanz_production > /dev/null
fi

if [ $? -eq 0 ]; then
    print_status "Database is ready"
else
    print_error "Database connection failed"
    exit 1
fi

# Check if Redis is ready
if command -v docker-compose &> /dev/null; then
    docker-compose exec redis redis-cli ping > /dev/null
else
    docker compose exec redis redis-cli ping > /dev/null
fi

if [ $? -eq 0 ]; then
    print_status "Redis is ready"
else
    print_error "Redis connection failed"
    exit 1
fi

# SSL Certificate setup (if in production)
if [ "$ENVIRONMENT" = "production" ] && [ ! -z "$DOMAIN" ]; then
    print_status "Setting up SSL certificates..."
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        print_warning "Certbot not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Get SSL certificate
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $SSL_EMAIL --agree-tos --non-interactive
    
    if [ $? -eq 0 ]; then
        print_status "SSL certificates installed successfully"
    else
        print_warning "SSL certificate installation failed. Continuing without SSL."
    fi
fi

# Display service status
print_status "Deployment completed successfully!"
echo
echo -e "${BLUE}📊 Service Status:${NC}"

if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo
echo -e "${GREEN}🎉 FANZ is now running!${NC}"
echo
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  • Main Application: http://localhost:3000"
echo -e "  • Monitoring (Grafana): http://localhost:3001"
echo -e "  • Metrics (Prometheus): http://localhost:9090"

if [ "$ENVIRONMENT" = "production" ] && [ ! -z "$DOMAIN" ]; then
    echo -e "  • Production URL: https://$DOMAIN"
fi

echo
echo -e "${YELLOW}💡 Useful Commands:${NC}"
echo -e "  • View logs: docker-compose logs -f app"
echo -e "  • Stop services: docker-compose down"
echo -e "  • Restart services: docker-compose restart"
echo -e "  • Update application: ./scripts/deploy.sh $ENVIRONMENT"

echo
print_status "Deployment completed successfully! 🚀"