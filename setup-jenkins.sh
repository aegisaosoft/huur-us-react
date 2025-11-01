#!/bin/bash
set -e

echo "🚀 Setting up Jenkins with Node.js for Huur-US project"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Build custom Jenkins image with Node.js
echo "🔨 Building custom Jenkins image with Node.js..."
docker build -f Dockerfile.jenkins -t huur-jenkins:latest .

echo "✅ Custom Jenkins image built successfully"

# Create jenkins_home directory with proper permissions
echo "📁 Creating Jenkins home directory..."
mkdir -p jenkins_home
sudo chown -R 1000:1000 jenkins_home

# Start Jenkins using Docker Compose
echo "🚀 Starting Jenkins..."
docker-compose -f docker-compose.jenkins.yml up -d

echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Get initial admin password
if [ -f "jenkins_home/secrets/initialAdminPassword" ]; then
    echo "🔑 Jenkins initial admin password:"
    cat jenkins_home/secrets/initialAdminPassword
    echo ""
fi

echo "✅ Jenkins setup complete!"
echo ""
echo "🌐 Access Jenkins at: http://localhost:8080"
echo "📋 Next steps:"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Use the initial admin password shown above"
echo "   3. Install suggested plugins"
echo "   4. Create your first admin user"
echo "   5. Create a new Pipeline job pointing to your GitHub repository"
echo ""
echo "🔧 Jenkins includes:"
echo "   ✅ Node.js $(docker exec huur-jenkins node --version)"
echo "   ✅ NPM $(docker exec huur-jenkins npm --version)"
echo "   ✅ Git"
echo "   ✅ Required Jenkins plugins"
