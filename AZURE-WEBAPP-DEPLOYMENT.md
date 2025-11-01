# Azure Web App Deployment Guide

## 🚀 Deploy Docker Image to Azure Web App

This guide shows you how to deploy your `huur-us-azure:latest` Docker image to Azure Web App.

## 📋 Prerequisites

- Azure CLI installed (`az --version`)
- Docker image: `huur-us-azure.tar` (185.5 MB) or `huur-us-azure.tar.zip` (56.8 MB)
- Azure subscription with appropriate permissions

## 🎯 Method 1: Azure CLI (Recommended)

### Step 1: Login to Azure
```bash
az login
```

### Step 2: Create Resource Group
```bash
# Create resource group
az group create --name huur-us-rg --location "East US"

# Or use existing resource group
az group list --output table
```

### Step 3: Create App Service Plan
```bash
# Create App Service Plan (Linux)
az appservice plan create \
  --name huur-us-plan \
  --resource-group huur-us-rg \
  --sku B1 \
  --is-linux
```

### Step 4: Create Web App
```bash
# Create Web App with container
az webapp create \
  --resource-group huur-us-rg \
  --plan huur-us-plan \
  --name huur-us-app \
  --deployment-local-git
```

### Step 5: Configure Container Settings
```bash
# Configure the container
az webapp config container set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --docker-custom-image-name huur-us-azure:latest
```

## 🎯 Method 2: Azure Portal (GUI)

### Step 1: Create Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Web App"
3. Fill in details:
   - **Name**: `huur-us-app`
   - **Resource Group**: `huur-us-rg`
   - **Runtime stack**: `Docker`
   - **Operating System**: `Linux`
   - **Region**: `East US`

### Step 2: Configure Container
1. Go to your Web App
2. Navigate to "Deployment Center"
3. Choose "Container Registry" or "Docker Hub"
4. Set image: `huur-us-azure:latest`

## 🎯 Method 3: Using Docker Registry

### Step 1: Create Azure Container Registry
```bash
# Create ACR
az acr create \
  --resource-group huur-us-rg \
  --name huurusregistry \
  --sku Basic
```

### Step 2: Load and Push Image
```bash
# Load Docker image
docker load -i huur-us-azure.tar

# Tag for ACR
docker tag huur-us-azure:latest huurusregistry.azurecr.io/huur-us-azure:latest

# Login to ACR
az acr login --name huurusregistry

# Push to ACR
docker push huurusregistry.azurecr.io/huur-us-azure:latest
```

### Step 3: Configure Web App to Use ACR
```bash
# Configure Web App to use ACR
az webapp config container set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --docker-custom-image-name huurusregistry.azurecr.io/huur-us-azure:latest
```

## ⚙️ Configuration

### Environment Variables
```bash
# Set environment variables
az webapp config appsettings set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    API_BASE_URL=/api
```

### Application Settings
```bash
# Configure app settings
az webapp config set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --startup-file "node server/index.js"
```

## 🔧 Advanced Configuration

### Custom Domain
```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name huur-us-app \
  --resource-group huur-us-rg \
  --hostname your-domain.com
```

### SSL Certificate
```bash
# Configure SSL
az webapp config ssl bind \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --certificate-thumbprint YOUR_THUMBPRINT
```

## 📊 Monitoring and Logs

### View Logs
```bash
# Stream logs
az webapp log tail \
  --name huur-us-app \
  --resource-group huur-us-rg

# Download logs
az webapp log download \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --log-file logs.zip
```

### Application Insights
```bash
# Enable Application Insights
az monitor app-insights component create \
  --app huur-us-insights \
  --location "East US" \
  --resource-group huur-us-rg

# Connect to Web App
az webapp config appsettings set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY=YOUR_KEY
```

## 🚀 Deployment Commands

### Quick Deploy Script
```bash
#!/bin/bash
# Quick deployment script

# Variables
RESOURCE_GROUP="huur-us-rg"
APP_NAME="huur-us-app"
PLAN_NAME="huur-us-plan"
LOCATION="East US"

# Create resource group
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Create App Service Plan
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN_NAME \
  --name $APP_NAME \
  --deployment-local-git

# Configure container
az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name huur-us-azure:latest

# Set environment variables
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV=production \
    PORT=8080

echo "Deployment complete! Visit: https://$APP_NAME.azurewebsites.net"
```

## 🔍 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   az webapp log tail --name huur-us-app --resource-group huur-us-rg
   ```

2. **Image not found**
   ```bash
   # Verify image exists
   docker images | grep huur-us-azure
   ```

3. **Port configuration**
   ```bash
   # Set correct port
   az webapp config appsettings set \
     --name huur-us-app \
     --resource-group huur-us-rg \
     --settings PORT=8080
   ```

### Health Check
```bash
# Test the application
curl https://huur-us-app.azurewebsites.net/health
```

## 📈 Scaling

### Scale Up
```bash
# Change to higher tier
az appservice plan update \
  --name huur-us-plan \
  --resource-group huur-us-rg \
  --sku S1
```

### Scale Out
```bash
# Enable auto-scaling
az monitor autoscale create \
  --resource huur-us-plan \
  --resource-group huur-us-rg \
  --resource-type Microsoft.Web/serverfarms \
  --name huur-us-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

## 💰 Cost Optimization

- **B1 Plan**: ~$13/month (1 vCPU, 1.75GB RAM)
- **S1 Plan**: ~$55/month (1 vCPU, 1.75GB RAM)
- **P1V2 Plan**: ~$73/month (1 vCPU, 3.5GB RAM)

## 🎉 Success Checklist

- [ ] Resource group created
- [ ] App Service Plan created
- [ ] Web App created
- [ ] Docker image configured
- [ ] Environment variables set
- [ ] Application accessible
- [ ] Health check passing
- [ ] Logs streaming correctly

## 🔗 Useful Links

- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Docker on Azure](https://docs.microsoft.com/en-us/azure/container-instances/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/webapp)
- [App Service Pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/)
