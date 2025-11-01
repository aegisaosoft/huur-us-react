# Azure Web App Direct Deployment Guide

## 🚀 Deploy React + Node.js App Directly to Azure Web App

This guide shows you how to deploy your full-stack application directly to Azure Web App without Docker.

## 📋 Prerequisites

- Azure CLI installed (`az --version`)
- Node.js 18+ installed locally
- Git repository with your code
- Azure subscription

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
# Create App Service Plan (Windows for Node.js)
az appservice plan create \
  --name huur-us-plan \
  --resource-group huur-us-rg \
  --sku B1 \
  --is-linux false
```

### Step 4: Create Web App
```bash
# Create Web App with Node.js runtime
az webapp create \
  --resource-group huur-us-rg \
  --plan huur-us-plan \
  --name huur-us-app \
  --runtime "NODE:18-lts"
```

### Step 5: Configure Application Settings
```bash
# Set Node.js environment
az webapp config appsettings set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    WEBSITE_NODE_DEFAULT_VERSION=18.18.0 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

## 🎯 Method 2: Azure Portal (GUI)

### Step 1: Create Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Web App"
3. Fill in details:
   - **Name**: `huur-us-app`
   - **Resource Group**: `huur-us-rg`
   - **Runtime stack**: `Node 18 LTS`
   - **Operating System**: `Windows`
   - **Region**: `East US`
   - **Pricing Plan**: `B1`

### Step 2: Configure Deployment
1. Go to your Web App
2. Navigate to "Deployment Center"
3. Choose "Local Git" or "GitHub"
4. Follow the deployment instructions

## 🚀 Deployment Methods

### Method A: Git Deployment (Recommended)

#### 1. Initialize Git Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Azure deployment"
```

#### 2. Add Azure Remote
```bash
# Get deployment URL from Azure Portal or CLI
az webapp deployment source config-local-git \
  --name huur-us-app \
  --resource-group huur-us-rg

# Add remote (replace with your URL)
git remote add azure https://huur-us-app.scm.azurewebsites.net/huur-us-app.git
```

#### 3. Deploy
```bash
# Push to Azure
git push azure main
```

### Method B: ZIP Deployment

#### 1. Create Deployment Package
```bash
# Install Azure CLI extension
az extension add --name webapp

# Create deployment package
az webapp deployment source config-zip \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --src deployment.zip
```

#### 2. Build and Package Locally
```bash
# Install dependencies
npm install

# Build client
npm run build

# Create deployment package
powershell Compress-Archive -Path * -DestinationPath deployment.zip -Force
```

### Method C: FTP Deployment

#### 1. Get FTP Credentials
```bash
# Get publishing profile
az webapp deployment list-publishing-profiles \
  --name huur-us-app \
  --resource-group huur-us-rg
```

#### 2. Upload Files
Use FTP client (FileZilla, WinSCP) to upload your files to `/site/wwwroot/`

## ⚙️ Configuration Files

### web.config (Already Created)
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticContent">
          <action type="Rewrite" url="client/build{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode watchedFiles="web.config;*.js"/>
  </system.webServer>
</configuration>
```

### package.json (Updated)
```json
{
  "name": "huur-us-react",
  "version": "1.0.0",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "build": "cd client && npm run build",
    "install-client": "cd client && npm install",
    "build-client": "cd client && npm run build",
    "postinstall": "npm run install-client && npm run build-client"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

## 🔧 Server Configuration

### Update server/index.js for Azure
```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// API routes
app.use('/api', require('./routes/api'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/huur', require('./routes/huurApi'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 📊 Environment Variables

### Required Settings
```bash
# Set in Azure Portal or via CLI
az webapp config appsettings set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    WEBSITE_NODE_DEFAULT_VERSION=18.18.0 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    WEBSITE_RUN_FROM_PACKAGE=0
```

### Optional Settings
```bash
# Add your API keys and secrets
az webapp config appsettings set \
  --name huur-us-app \
  --resource-group huur-us-rg \
  --settings \
    API_BASE_URL=https://your-api-url.com \
    DATABASE_URL=your-database-connection \
    JWT_SECRET=your-jwt-secret
```

## 🚀 Quick Deployment Script

### PowerShell Script
```powershell
# deploy-to-azure.ps1
$resourceGroup = "huur-us-rg"
$appName = "huur-us-app"
$planName = "huur-us-plan"
$location = "East US"

# Login to Azure
az login

# Create resource group
az group create --name $resourceGroup --location $location

# Create App Service Plan
az appservice plan create `
  --name $planName `
  --resource-group $resourceGroup `
  --sku B1 `
  --is-linux false

# Create Web App
az webapp create `
  --resource-group $resourceGroup `
  --plan $planName `
  --name $appName `
  --runtime "NODE:18-lts"

# Configure settings
az webapp config appsettings set `
  --name $appName `
  --resource-group $resourceGroup `
  --settings `
    NODE_ENV=production `
    PORT=8080 `
    WEBSITE_NODE_DEFAULT_VERSION=18.18.0 `
    SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Get deployment URL
$deploymentUrl = az webapp deployment source config-local-git `
  --name $appName `
  --resource-group $resourceGroup `
  --query "url" `
  --output tsv

Write-Host "Deployment URL: $deploymentUrl"
Write-Host "Add this as remote: git remote add azure $deploymentUrl"
Write-Host "Deploy with: git push azure main"
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build logs
   az webapp log tail --name huur-us-app --resource-group huur-us-rg
   ```

2. **Node.js Version Issues**
   ```bash
   # Set specific Node.js version
   az webapp config appsettings set \
     --name huur-us-app \
     --resource-group huur-us-rg \
     --settings WEBSITE_NODE_DEFAULT_VERSION=18.18.0
   ```

3. **Static Files Not Loading**
   - Ensure `web.config` is in root directory
   - Check that React build files are in `client/build/`
   - Verify rewrite rules in `web.config`

4. **API Routes Not Working**
   - Check server routes are properly configured
   - Verify CORS settings
   - Check API base URL configuration

### Health Check
```bash
# Test the application
curl https://huur-us-app.azurewebsites.net/health
curl https://huur-us-app.azurewebsites.net/api/health
```

## 📈 Monitoring

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

### Log Streaming
```bash
# Stream logs in real-time
az webapp log tail --name huur-us-app --resource-group huur-us-rg
```

## 💰 Cost Optimization

- **B1 Plan**: ~$13/month (1 vCPU, 1.75GB RAM)
- **S1 Plan**: ~$55/month (1 vCPU, 1.75GB RAM)
- **P1V2 Plan**: ~$73/month (1 vCPU, 3.5GB RAM)

## 🎉 Success Checklist

- [ ] Resource group created
- [ ] App Service Plan created
- [ ] Web App created with Node.js runtime
- [ ] Application settings configured
- [ ] Code deployed successfully
- [ ] Application accessible at `https://huur-us-app.azurewebsites.net`
- [ ] Health check passing
- [ ] Static files loading correctly
- [ ] API routes working

## 🔗 Useful Links

- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/webapp)
- [App Service Pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/)
