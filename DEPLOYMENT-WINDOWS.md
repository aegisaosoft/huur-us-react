# Huur-US Windows Server Deployment Guide

This guide covers deploying the Huur-US Toll Management Platform on Windows Server using Jenkins or PowerShell.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Option 1: Jenkins Pipeline (Windows)](#option-1-jenkins-pipeline-windows)
  - [Option 2: PowerShell Script](#option-2-powershell-script)
  - [Option 3: Manual Deployment](#option-3-manual-deployment)
- [Windows Server Configuration](#windows-server-configuration)
- [IIS Configuration](#iis-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **OS**: Windows Server 2016+ or Windows 10/11
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended
- **Network**: Internet access for package installation

### Software Dependencies

- **Node.js**: Version 18.x
- **NPM**: Version 8.x+
- **IIS**: Windows Server with IIS enabled
- **URL Rewrite Module**: For IIS
- **PowerShell**: Version 5.1+ (Windows Server 2016+)

## Deployment Options

### Option 1: Jenkins Pipeline (Windows)

The `Jenkinsfile.windows` provides a complete CI/CD pipeline for Windows Server deployment.

#### Setup Jenkins on Windows

1. **Install Jenkins**:
   ```powershell
   # Download Jenkins Windows installer
   Invoke-WebRequest -Uri "https://get.jenkins.io/windows-stable/jenkins.msi" -OutFile "jenkins.msi"
   
   # Install Jenkins
   Start-Process msiexec -ArgumentList "/i jenkins.msi /quiet" -Wait
   
   # Start Jenkins service
   Start-Service jenkins
   ```

2. **Configure Jenkins**:
   - Access Jenkins at `http://your-windows-server:8080`
   - Install required plugins:
     - Pipeline
     - NodeJS Plugin
     - Git Plugin
     - Build Timeout
     - Timestamper

3. **Create Pipeline Job**:
   - Create new "Pipeline" job
   - Configure Git repository
   - Set Jenkinsfile path to `Jenkinsfile.windows`
   - Configure build triggers

#### Jenkins Pipeline Features

- ✅ **Windows Service Management**: Creates and manages Windows services
- ✅ **IIS Configuration**: Automatic IIS setup with URL rewriting
- ✅ **Firewall Configuration**: Windows Firewall rules
- ✅ **PowerShell Integration**: Native Windows commands
- ✅ **Service Monitoring**: Health checks and status monitoring
- ✅ **Log Management**: Windows Event Log integration

### Option 2: PowerShell Script

Use the provided `deploy-windows.ps1` script for manual deployment.

#### Quick Start

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy-windows.ps1

# Or use specific commands
.\deploy-windows.ps1 -Action restart  # Restart service
.\deploy-windows.ps1 -Action status  # Check status
.\deploy-windows.ps1 -Action logs    # View logs
```

#### Script Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `-Action` | Action to perform (deploy, restart, stop, start, status, logs) | deploy |
| `-DeployPath` | Deployment directory | C:\inetpub\wwwroot\huur-us |
| `-NodeVersion` | Node.js version | 18 |
| `-Port` | Application port | 5000 |

### Option 3: Manual Deployment

For step-by-step manual deployment:

1. **Install Node.js**:
   ```powershell
   Invoke-WebRequest -Uri "https://nodejs.org/dist/v18.0.0/node-v18.0.0-x64.msi" -OutFile "nodejs.msi"
   Start-Process msiexec -ArgumentList "/i nodejs.msi /quiet" -Wait
   ```

2. **Enable IIS**:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures -All
   ```

3. **Install URL Rewrite Module**:
   ```powershell
   Invoke-WebRequest -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi" -OutFile "rewrite.msi"
   Start-Process msiexec -ArgumentList "/i rewrite.msi /quiet" -Wait
   ```

## Windows Server Configuration

### Enable Required Features

```powershell
# Enable IIS features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DirectoryBrowsing -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45 -All -NoRestart
```

### Configure Windows Firewall

```powershell
# Allow HTTP traffic
New-NetFirewallRule -DisplayName "Huur-US HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Huur-US API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow

# Allow HTTPS traffic (if SSL is configured)
New-NetFirewallRule -DisplayName "Huur-US HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

### Set Directory Permissions

```powershell
# Set permissions for IIS
icacls "C:\inetpub\wwwroot\huur-us" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\huur-us" /grant "IUSR:(OI)(CI)F" /T
```

## IIS Configuration

### Application Pool Settings

- **Name**: HuurUSAppPool
- **.NET CLR Version**: No Managed Code
- **Managed Pipeline Mode**: Integrated
- **Identity**: ApplicationPoolIdentity
- **Idle Timeout**: 20 minutes
- **Recycling**: Disable overlapped recycling

### Website Configuration

- **Name**: Huur-US
- **Port**: 80
- **Physical Path**: C:\inetpub\wwwroot\huur-us\public
- **Application Pool**: HuurUSAppPool

### URL Rewrite Rules

The deployment automatically creates `web.config` with:

1. **API Proxy Rule**: Routes `/api/*` to `http://localhost:5000/api/*`
2. **React Router Rule**: Routes all other requests to `/` for client-side routing
3. **Compression**: Gzip compression for static assets
4. **Caching**: 1-year cache for static assets

## Monitoring & Maintenance

### Service Management

```powershell
# Check service status
Get-Service "Huur-US Application"

# Start service
Start-Service "Huur-US Application"

# Stop service
Stop-Service "Huur-US Application"

# Restart service
Restart-Service "Huur-US Application" -Force
```

### Log Management

```powershell
# View application logs
Get-EventLog -LogName Application -Source "Huur-US*" -Newest 20

# View IIS logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Tail 20

# Clean up old logs
.\C:\inetpub\wwwroot\huur-us\cleanup-logs.bat
```

### Performance Monitoring

```powershell
# Check system resources
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
Get-Counter "\Memory\Available MBytes"
Get-Counter "\Processor(_Total)\% Processor Time"

# Check application health
Invoke-WebRequest -Uri "http://localhost:5000/health"
Invoke-WebRequest -Uri "http://localhost/"
```

### Backup Strategy

```powershell
# Create backup
.\C:\inetpub\wwwroot\huur-us\backup-app.bat

# Manual backup
$backupDir = "C:\Backups\Huur-US\$(Get-Date -Format 'yyyy-MM-dd')"
New-Item -ItemType Directory -Path $backupDir -Force
Copy-Item -Path "C:\inetpub\wwwroot\huur-us" -Destination $backupDir -Recurse
```

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

```powershell
# Check service status
Get-Service "Huur-US Application"

# Check service logs
Get-EventLog -LogName Application -Source "Huur-US*" -Newest 10

# Check if port is in use
netstat -an | findstr :5000
```

#### 2. IIS Configuration Issues

```powershell
# Test IIS configuration
Import-Module WebAdministration
Get-Website -Name "Huur-US"
Get-IISAppPool -Name "HuurUSAppPool"

# Check URL Rewrite module
Get-Module -ListAvailable | Where-Object {$_.Name -like "*Rewrite*"}
```

#### 3. Permission Issues

```powershell
# Fix ownership
icacls "C:\inetpub\wwwroot\huur-us" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\huur-us" /grant "IUSR:(OI)(CI)F" /T

# Check permissions
icacls "C:\inetpub\wwwroot\huur-us"
```

#### 4. Node.js Issues

```powershell
# Check Node.js installation
node --version
npm --version

# Reinstall Node.js if needed
Invoke-WebRequest -Uri "https://nodejs.org/dist/v18.0.0/node-v18.0.0-x64.msi" -OutFile "nodejs.msi"
Start-Process msiexec -ArgumentList "/i nodejs.msi /quiet" -Wait
```

### Health Check Endpoints

- **Application Health**: `http://localhost:5000/health`
- **IIS Status**: `http://localhost/`
- **API Status**: `http://localhost/api/health`

### Performance Optimization

1. **Enable Gzip Compression**: Already configured in web.config
2. **Set Cache Headers**: Static assets cached for 1 year
3. **Optimize Application Pool**: Configured for Node.js
4. **Monitor Memory Usage**: Set appropriate limits

### Security Considerations

- Change default passwords
- Keep Windows Server updated
- Use HTTPS in production
- Regular security audits
- Monitor access logs
- Implement proper backup strategy
- Use Windows Defender or third-party antivirus

## Advanced Configuration

### SSL Certificate Setup

```powershell
# Install SSL certificate
Import-Certificate -FilePath "certificate.pfx" -CertStoreLocation Cert:\LocalMachine\My

# Configure HTTPS binding
New-WebBinding -Name "Huur-US" -Protocol https -Port 443 -SslFlags 1
```

### Load Balancing

For high-traffic deployments:

1. **Application Load Balancer**: Use multiple application instances
2. **Database**: Consider external database service
3. **CDN**: Use CloudFlare or AWS CloudFront
4. **Monitoring**: Implement APM tools (New Relic, DataDog)

### Scaling Considerations

- **Multiple Instances**: Run multiple Node.js processes
- **Process Manager**: Use PM2 for process management
- **Database**: External database service
- **Caching**: Redis for session storage
- **Monitoring**: Comprehensive monitoring solution

## Support

For deployment issues:

1. Check the Windows Event Viewer
2. Verify service status: `Get-Service "Huur-US Application"`
3. Test connectivity: `Invoke-WebRequest http://localhost:5000/health`
4. Review this documentation
5. Check IIS logs in `C:\inetpub\logs\LogFiles\`

## Security Notes

- Run as Administrator only when necessary
- Use service accounts for production
- Keep Windows Server updated
- Use HTTPS in production
- Regular security audits
- Monitor access logs
- Implement proper backup strategy
