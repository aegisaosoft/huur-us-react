# Huur-US Application Restart Guide

This guide provides comprehensive instructions for restarting the Huur-US application using Jenkins CI/CD pipeline and manual scripts.

## Overview

The Huur-US application restart functionality includes:

- **Automated Restart**: Jenkins pipeline automatically restarts the app during deployment
- **Manual Restart**: Scripts for manual application restart
- **Service Management**: Systemd (Linux) and Windows Service management
- **Health Monitoring**: Built-in health checks and verification
- **Rollback Support**: Ability to rollback to previous versions

## Jenkins Pipeline Restart Features

The main `Jenkinsfile` now includes comprehensive restart functionality:

### Pipeline Stages for Restart

1. **Stop Application**: Gracefully stops the running application
2. **Deploy Application**: Deploys new code and configurations
3. **Configure Services**: Sets up systemd/Windows services
4. **Start Application**: Starts the application with new code
5. **Verify Deployment**: Performs health checks and verification

### Environment Variables

```bash
SERVICE_NAME=huur-us          # Service name
APP_PORT=5000                 # Application port
DEPLOY_DIR=/var/www/huur-us   # Deployment directory
SERVER_DIR=/var/www/huur-us/server  # Server directory
```

## Manual Restart Scripts

### Linux/Mac Restart Script

**File**: `scripts/restart-app.sh`

```bash
# Make executable
chmod +x scripts/restart-app.sh

# Restart application
sudo ./scripts/restart-app.sh restart

# Stop application
sudo ./scripts/restart-app.sh stop

# Start application
sudo ./scripts/restart-app.sh start

# Check status
./scripts/restart-app.sh status

# View logs
./scripts/restart-app.sh logs

# Health check
./scripts/restart-app.sh health

# Verify deployment
./scripts/restart-app.sh verify
```

### Windows Restart Script

**File**: `scripts/restart-app.bat`

```cmd
REM Run as Administrator

REM Restart application
scripts\restart-app.bat

REM Check service status
sc query "Huur-US Application"

REM Start service
sc start "Huur-US Application"

REM Stop service
sc stop "Huur-US Application"
```

## Service Management

### Linux/Mac (systemd)

```bash
# Service management commands
systemctl status huur-us          # Check status
systemctl start huur-us           # Start service
systemctl stop huur-us            # Stop service
systemctl restart huur-us         # Restart service
systemctl enable huur-us          # Enable auto-start
systemctl disable huur-us         # Disable auto-start

# View logs
journalctl -u huur-us -f          # Follow logs
journalctl -u huur-us --no-pager  # View recent logs
```

### Windows Service

```cmd
REM Service management commands
sc query "Huur-US Application"           # Check status
sc start "Huur-US Application"           # Start service
sc stop "Huur-US Application"            # Stop service
sc delete "Huur-US Application"          # Delete service

REM View logs in Event Viewer
eventvwr.msc
```

## Health Checks

### Application Health Endpoints

- **Health Check**: `http://localhost:5000/health`
- **Main Application**: `http://localhost:5000/`
- **API Endpoints**: `http://localhost:5000/api/*`

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

## Restart Process Flow

### 1. Pre-Restart Checks

- Verify service is running
- Check application health
- Create backup of current deployment
- Validate new deployment artifacts

### 2. Stop Application

- Gracefully stop systemd/Windows service
- Kill any remaining processes on the application port
- Verify application is completely stopped

### 3. Deploy New Code

- Copy new server files
- Copy new client build
- Install dependencies
- Set proper permissions

### 4. Configure Services

- Install/update systemd service file
- Configure nginx (if applicable)
- Reload system configurations

### 5. Start Application

- Start the service
- Wait for service to be ready
- Perform health checks
- Verify all endpoints are responding

### 6. Post-Restart Verification

- Check service status
- Verify port is listening
- Test all endpoints
- Review application logs

## Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check service status
systemctl status huur-us

# View detailed logs
journalctl -u huur-us --no-pager -l

# Check for port conflicts
netstat -tlnp | grep :5000

# Verify file permissions
ls -la /var/www/huur-us/server/
```

#### Application Not Responding

```bash
# Check if port is listening
netstat -tlnp | grep :5000

# Test health endpoint
curl -f http://localhost:5000/health

# Check application logs
journalctl -u huur-us -f

# Verify service is running
systemctl is-active huur-us
```

#### Permission Issues

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/huur-us

# Fix permissions
sudo chmod -R 755 /var/www/huur-us
sudo chmod +x /var/www/huur-us/server/index.js
```

### Windows Issues

#### Service Creation Failed

```cmd
REM Check if node-windows is installed
npm list -g node-windows

REM Install node-windows
npm install -g node-windows

REM Run service installation manually
cd C:\inetpub\wwwroot\huur-us\server
node install-service.js
```

#### Port Already in Use

```cmd
REM Find process using port 5000
netstat -ano | find "5000"

REM Kill the process
taskkill /f /pid <PID>
```

## Monitoring and Logging

### Application Logs

**Linux/Mac**:
```bash
# Follow logs in real-time
journalctl -u huur-us -f

# View recent logs
journalctl -u huur-us --no-pager -n 100

# View logs from specific time
journalctl -u huur-us --since "1 hour ago"
```

**Windows**:
- Open Event Viewer (`eventvwr.msc`)
- Navigate to Windows Logs > Application
- Filter by source "Huur-US Application"

### Performance Monitoring

```bash
# Check system resources
htop
top
df -h

# Check application performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/health
```

## Rollback Procedures

### Automatic Rollback

The Jenkins pipeline includes automatic rollback triggers:
- Failed health checks
- Service startup failures
- Application not responding

### Manual Rollback

```bash
# Stop current application
sudo systemctl stop huur-us

# Restore from backup
sudo cp -r /var/www/huur-us.backup.YYYYMMDD_HHMMSS/* /var/www/huur-us/

# Start application
sudo systemctl start huur-us

# Verify rollback
curl -f http://localhost:5000/health
```

## Best Practices

### 1. Pre-Restart Checklist

- [ ] Verify all tests pass
- [ ] Check deployment artifacts
- [ ] Confirm backup is available
- [ ] Notify users of maintenance window
- [ ] Monitor system resources

### 2. During Restart

- [ ] Monitor service status
- [ ] Watch application logs
- [ ] Perform health checks
- [ ] Verify all endpoints
- [ ] Check system performance

### 3. Post-Restart

- [ ] Confirm application is healthy
- [ ] Test critical functionality
- [ ] Monitor error rates
- [ ] Update monitoring dashboards
- [ ] Document any issues

## Security Considerations

### 1. Service Permissions

- Run service as non-root user (`www-data`)
- Set proper file permissions (755 for directories, 644 for files)
- Restrict access to sensitive configuration files

### 2. Network Security

- Use firewall rules to restrict access
- Implement HTTPS for production
- Configure proper CORS settings

### 3. Log Security

- Rotate logs regularly
- Monitor for suspicious activity
- Implement log aggregation and analysis

## Support and Maintenance

### Regular Maintenance Tasks

1. **Daily**:
   - Check application health
   - Review error logs
   - Monitor performance metrics

2. **Weekly**:
   - Review system resources
   - Clean up old logs
   - Update dependencies

3. **Monthly**:
   - Perform security updates
   - Review and update configurations
   - Test backup and restore procedures

### Emergency Procedures

1. **Application Down**:
   - Check service status
   - Review recent logs
   - Restart service
   - Escalate if needed

2. **Performance Issues**:
   - Check system resources
   - Review application metrics
   - Scale resources if needed
   - Optimize code if necessary

3. **Security Incidents**:
   - Isolate affected systems
   - Review access logs
   - Update security configurations
   - Notify stakeholders

## Conclusion

The Huur-US application restart functionality provides a robust, automated solution for deploying and managing the application. The Jenkins pipeline ensures reliable deployments, while the manual scripts provide flexibility for maintenance and troubleshooting.

For questions or issues, please refer to the troubleshooting section or contact the development team.
