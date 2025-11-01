# Jenkins Setup Guide for Huur-US Project

## Current Issue
Your Jenkins container doesn't have Node.js installed, which is required to build the React application.

## Solution Options

### Option 1: Quick Fix - Install Node.js in Current Container

**Windows (PowerShell as Administrator):**
```powershell
.\install-nodejs-jenkins.ps1
```

**Linux/Mac:**
```bash
chmod +x install-nodejs-jenkins.sh
./install-nodejs-jenkins.sh
```

**Manual Installation:**
```bash
# Find your Jenkins container
docker ps

# Install Node.js (replace CONTAINER_ID with your Jenkins container ID)
docker exec -u root CONTAINER_ID bash -c "
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &&
    apt-get install -y nodejs
"

# Verify installation
docker exec CONTAINER_ID node --version
docker exec CONTAINER_ID npm --version
```

### Option 2: Custom Jenkins with Node.js (Recommended)

This creates a new Jenkins instance with Node.js pre-installed:

**Windows:**
```powershell
.\setup-jenkins.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-jenkins.sh
./setup-jenkins.sh
```

## After Installing Node.js

1. **Restart Jenkins Pipeline** - Your pipeline should now work
2. **Check Pipeline Output** - Look for successful Node.js and NPM version detection
3. **Download Artifacts** - After successful build, download the deployment package

## Pipeline Features

✅ **Prerequisites Check** - Verifies Node.js and NPM availability  
✅ **Build Process** - Installs dependencies and builds React app  
✅ **Linting & Type Checking** - Runs ESLint and TypeScript checks  
✅ **Deployment Package** - Creates ready-to-deploy package  
✅ **Configuration Files** - Generates Nginx and systemd configs  
✅ **Artifact Archive** - Downloads deployment package from Jenkins  

## Troubleshooting

**If Node.js installation fails:**
- Ensure Docker container has internet access
- Try running as root user in container
- Check container logs: `docker logs CONTAINER_ID`

**If pipeline still fails:**
- Verify Node.js installation: `docker exec CONTAINER_ID node --version`
- Check Jenkins logs for detailed error messages
- Ensure GitHub credentials are properly configured

## Next Steps After Successful Build

1. **Download** the deployment package from Jenkins artifacts
2. **Upload** to your Ubuntu server
3. **Run** the deployment script: `./deploy.sh`
4. **Access** your application at your server's IP address
