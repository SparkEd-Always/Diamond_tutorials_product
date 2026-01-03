#!/bin/bash

# AVM Tutorial Management System - Docker Deployment Script

set -e  # Exit on any error

echo "🚀 AVM Tutorial Management System - Docker Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop any existing containers
print_step "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove existing images (optional - uncomment for clean build)
# print_step "Removing existing images..."
# docker-compose down --rmi all || true

# Build and start services
print_step "Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
print_step "Waiting for services to be healthy..."
sleep 10

# Check service health
print_step "Checking service health..."

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status "✅ Backend API is healthy"
else
    print_error "❌ Backend API is not responding"
fi

# Check web admin
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Web Admin Dashboard is healthy"
else
    print_error "❌ Web Admin Dashboard is not responding"
fi

# Check mobile app
if curl -f http://localhost:19006 > /dev/null 2>&1; then
    print_status "✅ Mobile App (Web) is healthy"
else
    print_error "❌ Mobile App (Web) is not responding"
fi

# Display service URLs
echo ""
print_step "🎉 Deployment Complete!"
echo "=================================================="
print_status "Backend API:           http://localhost:8000"
print_status "API Documentation:     http://localhost:8000/docs"
print_status "Web Admin Dashboard:   http://localhost:3000"
print_status "Mobile App (Web):      http://localhost:19006"
echo ""

# Display test credentials
echo "🔑 Test Credentials:"
echo "=================================================="
echo "Admin Login:"
echo "  Email:    admin@avmtutorial.com"
echo "  Password: admin123"
echo ""
echo "Teacher Login:"
echo "  Email:    rajesh.kumar@avmtutorial.com"
echo "  Password: teacher123"
echo ""

# Display container status
print_step "Container Status:"
docker-compose ps

# Display logs command
echo ""
print_warning "To view logs: docker-compose logs -f [service-name]"
print_warning "To stop services: docker-compose down"
print_warning "To restart services: docker-compose restart"

echo ""
print_status "Happy Testing! 🎉"