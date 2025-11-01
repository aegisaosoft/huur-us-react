# Azure Full-Stack Deployment Guide

## Overview
This guide explains how to deploy both your React client and Node.js server simultaneously on Azure Static Web Apps.

## Architecture
- **Frontend**: React app served as static files
- **Backend**: Node.js API running as Azure Functions
- **Domain**: `https://ashy-forest-035b62d0f.3.azurestaticapps.net`

## Configuration Files

### 1. GitHub Workflow (`.github/workflows/azure-static-web-apps-ashy-forest-035b62d0f.yml`)
- Builds React client
- Builds API functions
- Deploys both to Azure Static Web Apps

### 2. Static Web App Config (`staticwebapp.config.json`)
- Routes `/api/*` to Azure Functions
- Routes `/*` to React app
- Configures CORS and security headers

### 3. API Functions (`/api/` directory)
- `index.js` - Main Azure Function handler
- `function.json` - Function configuration
- `package.json` - Dependencies
- `host.json` - Runtime configuration

## How It Works

### Client-Side (React)
1. React app builds to static files
2. Served from Azure CDN
3. Routes handled by React Router
4. API calls go to `/api/*` endpoints

### Server-Side (Node.js API)
1. Express server wrapped in Azure Function
2. All routes prefixed with `/api/`
3. Runs serverless on Azure Functions
4. Scales automatically

## API Endpoints

Your server API will be available at:
- `https://ashy-forest-035b62d0f.3.azurestaticapps.net/api/auth/*`
- `https://ashy-forest-035b62d0f.3.azurestaticapps.net/api/huur/*`
- `https://ashy-forest-035b62d0f.3.azurestaticapps.net/api/*`
- `https://ashy-forest-035b62d0f.3.azurestaticapps.net/health`

## Environment Variables

Set these in Azure Static Web Apps settings:
```
SESSION_SECRET=your-super-secure-session-secret
NODE_ENV=production
CORS_ORIGIN=https://ashy-forest-035b62d0f.3.azurestaticapps.net
```

## Testing Your Deployment

1. **Client**: Visit `https://ashy-forest-035b62d0f.3.azurestaticapps.net`
2. **Health Check**: `https://ashy-forest-035b62d0f.3.azurestaticapps.net/health`
3. **API Test**: `https://ashy-forest-035b62d0f.3.azurestaticapps.net/api`

## Benefits

✅ **Cost Effective**: Pay only for what you use
✅ **Scalable**: Auto-scales with traffic
✅ **Fast**: CDN for static files, serverless for API
✅ **Secure**: Built-in HTTPS and security headers
✅ **Simple**: Single deployment for both client and server

## Troubleshooting

### If API doesn't work:
1. Check Azure Functions logs in Azure Portal
2. Verify environment variables are set
3. Test API endpoints directly

### If client doesn't work:
1. Check static file serving
2. Verify React Router configuration
3. Check browser console for errors

## Next Steps

1. Commit and push your changes
2. Azure will automatically deploy
3. Test both client and server functionality
4. Configure custom domain if needed
