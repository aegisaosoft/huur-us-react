# Create Azure Static Web App

## Method 1: Azure Portal (Recommended)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Resource** → Search "Static Web Apps"
3. **Create Static Web App**:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `huur-us-app` (or any name you prefer)
   - **Plan Type**: Free
   - **Region**: Choose closest to you
   - **Source**: GitHub
   - **GitHub Account**: Connect your account
   - **Organization**: Your GitHub username
   - **Repository**: `huur-us-react`
   - **Branch**: `main`
   - **Build Presets**: Custom
   - **App Location**: `/client/build`
   - **API Location**: `/api`
   - **Output Location**: (leave empty)

4. **Review + Create** → **Create**

## Method 2: Azure CLI

```bash
# Install Azure CLI
# Then run:
az staticwebapp create \
  --name "huur-us-app" \
  --resource-group "your-resource-group" \
  --source "https://github.com/aegisaosoft/huur-us-react" \
  --location "eastus2" \
  --branch "main" \
  --app-location "/client/build" \
  --api-location "/api"
```

## Method 3: GitHub Actions (Alternative)

If you prefer to use a different approach, we can:
1. Deploy to Azure App Service instead
2. Use Azure Container Instances
3. Use a different Static Web App configuration

## After Creating the Static Web App

1. **Get the deployment token** from Azure Portal
2. **Add it to GitHub Secrets**:
   - Repository → Settings → Secrets and variables → Actions
   - Add secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_ASHY_FOREST_035B62D0F`
   - Value: Your deployment token

3. **Update the workflow file** if the name changes
