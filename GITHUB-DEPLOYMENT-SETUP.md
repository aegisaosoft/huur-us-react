# GitHub Deployment Setup for Azure Web App

## 🚀 Complete Guide to Deploy from GitHub to Azure Web App

This guide will help you set up automatic deployment from your GitHub repository to your Azure Web App.

## 📋 Prerequisites

- GitHub repository: `https://github.com/aegisaosoft/huur-us-react`
- Azure Web App: `huur-web-us-2025`
- Azure subscription with appropriate permissions

## 🎯 Step 1: Get Azure Web App Publish Profile

### Method A: Azure Portal (Recommended)
1. Go to your Azure Web App: `huur-web-us-2025`
2. Click **"Get publish profile"** button (top right)
3. Download the `.PublishSettings` file
4. Open the file in a text editor and copy the entire content

### Method B: Azure CLI (if available)
```bash
az webapp deployment list-publishing-profiles \
  --name huur-web-us-2025 \
  --resource-group "huur web" \
  --xml
```

## 🔐 Step 2: Configure GitHub Secrets

1. Go to your GitHub repository: `https://github.com/aegisaosoft/huur-us-react`
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**
5. Add the following secret:

**Secret Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
**Secret Value**: [Paste the entire content of your .PublishSettings file]

## 📁 Step 3: GitHub Actions Workflow

I've created the workflow file: `.github/workflows/azure-webapp-deploy.yml`

This workflow will:
- ✅ Trigger on push to `main` or `master` branch
- ✅ Set up Node.js 20
- ✅ Install dependencies
- ✅ Build React app
- ✅ Deploy to Azure Web App

## 🚀 Step 4: Deploy Your Code

### Push to GitHub:
```bash
# Add the workflow file
git add .github/workflows/azure-webapp-deploy.yml
git add package.json web.config
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### Monitor Deployment:
1. Go to your GitHub repository
2. Click **"Actions"** tab
3. You'll see the deployment workflow running
4. Click on the workflow to see detailed logs

## ⚙️ Step 5: Configure Azure Web App Settings

In Azure Portal, go to your Web App and set these **Application Settings**:

```
NODE_ENV = production
PORT = 8080
WEBSITE_NODE_DEFAULT_VERSION = 20-lts
SCM_DO_BUILD_DURING_DEPLOYMENT = true
WEBSITE_RUN_FROM_PACKAGE = 0
```

## 🔧 Step 6: Alternative - Use Azure Service Principal

If you prefer using Azure Service Principal instead of Publish Profile:

### Create Service Principal:
```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac --name "huur-webapp-sp" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.Web/sites/{app-name} --sdk-auth
```

### Update GitHub Secrets:
- `AZURE_CLIENT_ID`: [from service principal output]
- `AZURE_CLIENT_SECRET`: [from service principal output]
- `AZURE_TENANT_ID`: [from service principal output]
- `AZURE_SUBSCRIPTION_ID`: [your subscription ID]

### Update Workflow:
Replace the deploy step with:
```yaml
- name: 'Login to Azure'
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: 'Deploy to Azure Web App'
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'huur-web-us-2025'
    package: '.'
```

## 🎯 Step 7: Test Deployment

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Check GitHub Actions tab for deployment status
4. Visit your app: `https://huur-web-us-2025-hcdkbgfbgbbsc5ck.canadacentral-01.azurewebsites.net`

## 🔍 Troubleshooting

### Common Issues:

1. **Deployment Fails - Build Error**
   - Check the GitHub Actions logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **App Not Starting**
   - Check Azure Web App logs
   - Verify `package.json` has correct `start` script
   - Check application settings in Azure Portal

3. **Static Files Not Loading**
   - Ensure React build is in `client/build/`
   - Check `web.config` is in root directory
   - Verify rewrite rules

### Check Logs:
```bash
# Azure Web App logs
az webapp log tail --name huur-web-us-2025 --resource-group "huur web"

# GitHub Actions logs
# Go to GitHub → Actions → Select workflow → View logs
```

## 🎉 Success Checklist

- [ ] GitHub repository connected
- [ ] Publish profile added to GitHub secrets
- [ ] GitHub Actions workflow created
- [ ] Code pushed to GitHub
- [ ] Deployment triggered automatically
- [ ] App accessible at Azure URL
- [ ] Health check passing
- [ ] Static files loading
- [ ] API routes working

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Web Apps Deploy Action](https://github.com/Azure/webapps-deploy)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs
2. Check Azure Web App logs
3. Verify all secrets are correctly set
4. Ensure application settings are correct
