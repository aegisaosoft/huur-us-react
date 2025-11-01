# Azure Service Principal Setup for GitHub Actions

## 🔐 Create Azure Service Principal for GitHub Deployment

Since basic authentication is disabled, we'll use Azure Service Principal instead.

## 🎯 Step 1: Create Service Principal

### Option A: Azure Portal (Easiest)
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"App registrations"**
3. Click **"New registration"**
4. Fill in:
   - **Name**: `huur-webapp-github-sp`
   - **Supported account types**: `Accounts in this organizational directory only`
   - Click **"Register"**

5. **Note down these values:**
   - **Application (client) ID** - Copy this
   - **Directory (tenant) ID** - Copy this

6. **Create Client Secret:**
   - Go to **"Certificates & secrets"**
   - Click **"New client secret"**
   - **Description**: `GitHub Actions Secret`
   - **Expires**: `24 months`
   - Click **"Add"**
   - **Copy the secret value** (you won't see it again!)

### Option B: Azure CLI (if available)
```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac --name "huur-webapp-github-sp" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.Web/sites/{app-name} --sdk-auth
```

## 🔑 Step 2: Configure GitHub Secrets

Go to your GitHub repository: `https://github.com/aegisaosoft/huur-us-react`

1. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
2. Add these secrets:

### Secret 1: AZURE_CREDENTIALS
**Name**: `AZURE_CREDENTIALS`
**Value**: 
```json
{
  "clientId": "YOUR_APPLICATION_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "subscriptionId": "750fed38-d899-41fb-b048-587517dd796d",
  "tenantId": "YOUR_TENANT_ID",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### Secret 2: AZURE_SUBSCRIPTION_ID
**Name**: `AZURE_SUBSCRIPTION_ID`
**Value**: `750fed38-d899-41fb-b048-587517dd796d`

## 🚀 Step 3: Update GitHub Workflow

I've created a new workflow file: `.github/workflows/azure-webapp-deploy-sp.yml`

This uses Service Principal authentication instead of publish profile.

## 📋 Step 4: Deploy

```bash
# Add the new workflow
git add .github/workflows/azure-webapp-deploy-sp.yml
git commit -m "Add Service Principal deployment workflow"
git push origin main
```

## 🔍 Step 5: Monitor Deployment

1. Go to GitHub → **"Actions"** tab
2. You'll see the new workflow running
3. Check logs for any issues

## 🎯 Alternative: Enable Basic Authentication

If you prefer to use publish profile:

1. **In Azure Portal:**
   - Go to your Web App: `huur-web-us-2025`
   - Click **"Configuration"**
   - Scroll to **"General settings"**
   - Set **"FTP / FTPS state"** to **"All allowed"**
   - Set **"Basic authentication"** to **"On"**
   - Click **"Save"**

2. **Then download publish profile:**
   - Click **"Download publish profile"**
   - Add to GitHub secrets as `AZURE_WEBAPP_PUBLISH_PROFILE`

## 🔧 Troubleshooting

### Common Issues:

1. **Permission Denied**
   - Ensure Service Principal has Contributor role
   - Check subscription ID is correct

2. **Authentication Failed**
   - Verify all secrets are correctly set
   - Check client secret hasn't expired

3. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify app name matches: `huur-web-us-2025`

## 🎉 Success Checklist

- [ ] Service Principal created
- [ ] GitHub secrets configured
- [ ] Workflow file updated
- [ ] Code pushed to GitHub
- [ ] Deployment triggered
- [ ] App accessible at Azure URL

## 🔗 Useful Links

- [Azure Service Principal Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals)
- [GitHub Actions Azure Login](https://github.com/Azure/login)
- [Azure Web Apps Deploy Action](https://github.com/Azure/webapps-deploy)
