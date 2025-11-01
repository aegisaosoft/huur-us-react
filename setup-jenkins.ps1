# Jenkins Setup Script for Windows
param(
    [switch]$Force = $false
)

Write-Host "🚀 Setting up Jenkins with Node.js for Huur-US project" -ForegroundColor Green

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Build custom Jenkins image with Node.js
Write-Host "🔨 Building custom Jenkins image with Node.js..." -ForegroundColor Yellow
docker build -f Dockerfile.jenkins -t huur-jenkins:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build Jenkins image" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Custom Jenkins image built successfully" -ForegroundColor Green

# Create jenkins_home directory
Write-Host "📁 Creating Jenkins home directory..." -ForegroundColor Yellow
if (!(Test-Path "jenkins_home")) {
    New-Item -ItemType Directory -Path "jenkins_home" | Out-Null
}

# Start Jenkins using Docker Compose
Write-Host "🚀 Starting Jenkins..." -ForegroundColor Yellow
docker-compose -f docker-compose.jenkins.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Jenkins" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for Jenkins to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Get initial admin password
$passwordFile = "jenkins_home\secrets\initialAdminPassword"
if (Test-Path $passwordFile) {
    Write-Host "🔑 Jenkins initial admin password:" -ForegroundColor Cyan
    Get-Content $passwordFile
    Write-Host ""
}

Write-Host "✅ Jenkins setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Jenkins at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:8080 in your browser"
Write-Host "   2. Use the initial admin password shown above"
Write-Host "   3. Install suggested plugins"
Write-Host "   4. Create your first admin user"
Write-Host "   5. Create a new Pipeline job pointing to your GitHub repository"
Write-Host ""
Write-Host "🔧 Jenkins includes:" -ForegroundColor Green

try {
    $nodeVersion = docker exec huur-jenkins node --version
    $npmVersion = docker exec huur-jenkins npm --version
    Write-Host "   ✅ Node.js $nodeVersion" -ForegroundColor Green
    Write-Host "   ✅ NPM $npmVersion" -ForegroundColor Green
    Write-Host "   ✅ Git" -ForegroundColor Green
    Write-Host "   ✅ Required Jenkins plugins" -ForegroundColor Green
} catch {
    Write-Host "   ⏳ Jenkins is still starting up..." -ForegroundColor Yellow
}
