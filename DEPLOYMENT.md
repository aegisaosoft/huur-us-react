# Huur-US Deployment Guide

This guide covers multiple deployment options for the Huur-US Toll Management Platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Option 1: Jenkins Pipeline](#option-1-jenkins-pipeline)
  - [Option 2: Manual Deployment Script](#option-2-manual-deployment-script)
  - [Option 3: Azure Web App Deployment](#option-3-azure-web-app-deployment)
- [Server Configuration](#server-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **CPU**: 2+ cores recommended
- **Network**: Internet access for package installation

### Software Dependencies

- **Node.js**: Version 18.x
- **NPM**: Version 8.x+
- **Nginx**: Version 1.18+
- **Git**: For source code management
- **Azure CLI**: For Azure Web App deployment

## Deployment Options

### Option 1: Jenkins Pipeline

The Jenkinsfile provides a complete CI/CD pipeline for automated deployment.

#### Setup Jenkins

1. **Install Jenkins**:
   ```bash
   # Ubuntu/Debian
   wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
   sudo sh -c 'echo deb https://pkg.jenkins.io/debian binary/ > /etc/apt/sources.list.d/jenkins.list'
   sudo apt update
   sudo apt install jenkins

   # Start Jenkins
   sudo systemctl start jenkins
   sudo systemctl enable jenkins
   ```

2. **Configure Jenkins**:
   - Access Jenkins at `http://your-server:8080`
   - Install required plugins:
     - Pipeline
     - NodeJS Plugin
     - Git Plugin
     - Build Timeout
     - Timestamper

3. **Create Pipeline Job**:
   - Create new "Pipeline" job
   - Configure Git repository
   - Set Jenkinsfile path to root directory
   - Configure build triggers (webhook, polling, etc.)

#### Jenkins Pipeline Features

- ✅ **Automated Build**: React app compilation
- ✅ **Dependency Management**: NPM package installation
- ✅ **Code Quality**: ESLint and TypeScript checking
- ✅ **Service Management**: Systemd service creation
- ✅ **Reverse Proxy**: Nginx configuration
- ✅ **Health Checks**: Application monitoring
- ✅ **Rollback Support**: Service restart capabilities

### Option 2: Manual Deployment Script

Use the provided `deploy.sh` script for manual deployment.

#### Quick Start

```bash
# Make script executable
chmod +x deploy.sh

# Run full deployment
./deploy.sh

# Or use specific commands
./deploy.sh restart  # Restart service
./deploy.sh status   # Check status
./deploy.sh logs     # View logs
```

#### Script Commands

| Command | Description |
|---------|-------------|
| `deploy` | Full deployment (default) |
| `restart` | Restart the service |
| `stop` | Stop the service |
| `start` | Start the service |
| `status` | Show service status |
| `logs` | Show service logs |

### Option 3: Azure Web App Deployment

For cloud deployment using Azure Web App.

#### Quick Start

```bash
# Deploy to Azure Web App
az webapp deploy \
  --name huur-web-us-2025 \
  --resource-group huur_web \
  --src-path . \
  --type zip

# Check deployment status
az webapp show --name huur-web-us-2025 --resource-group huur_web
```

#### Azure Web App Features

- ✅ **Node.js Runtime**: Native Node.js support
- ✅ **Auto-scaling**: Automatic scaling based on demand
- ✅ **SSL Certificates**: Automatic HTTPS
- ✅ **Environment Variables**: Easy configuration
- ✅ **GitHub Actions**: Automatic deployment

#### GitHub Actions Deployment

```bash
# Automatic deployment on git push
git push origin main

# Check deployment in GitHub Actions
# https://github.com/your-repo/actions
```

## Server Configuration

### Firewall Setup

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### SSL Certificate (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Environment Variables

Create `/var/www/huur-us/server/.env`:

```env
NODE_ENV=production
PORT=5000
# Add your specific environment variables here
```

## Monitoring & Maintenance

### Service Management

```bash
# Check service status
sudo systemctl status huur-us

# View logs
sudo journalctl -u huur-us -f

# Restart service
sudo systemctl restart huur-us

# Stop service
sudo systemctl stop huur-us
```

### Log Management

```bash
# View application logs
sudo journalctl -u huur-us --since "1 hour ago"

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Rotate logs
sudo logrotate -f /etc/logrotate.d/rsyslog
```

### Performance Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check application health
curl http://localhost:5000/health
curl http://localhost/

# Monitor network connections
netstat -tulpn | grep :5000
```

### Backup Strategy

```bash
# Backup application files
sudo tar -czf huur-us-backup-$(date +%Y%m%d).tar.gz /var/www/huur-us

# Backup configuration
sudo tar -czf config-backup-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/huur-us /etc/systemd/system/huur-us.service
```

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check service status
sudo systemctl status huur-us

# Check logs
sudo journalctl -u huur-us -n 50

# Check if port is in use
sudo netstat -tulpn | grep :5000
```

#### 2. Nginx Configuration Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 3. Permission Issues

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/huur-us

# Fix permissions
sudo chmod -R 755 /var/www/huur-us
```

#### 4. Memory Issues

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart service if needed
sudo systemctl restart huur-us
```

### Health Check Endpoints

- **Application Health**: `http://localhost:5000/health`
- **Nginx Status**: `http://localhost/`
- **API Status**: `http://localhost/api/health`

### Performance Optimization

1. **Enable Gzip Compression**: Already configured in Nginx
2. **Set Cache Headers**: Static assets cached for 1 year
3. **Rate Limiting**: API endpoints protected
4. **Security Headers**: XSS, CSRF protection enabled

### Scaling Considerations

For high-traffic deployments:

1. **Load Balancer**: Use multiple application instances
2. **Database**: Consider external database service
3. **CDN**: Use CloudFlare or AWS CloudFront
4. **Monitoring**: Implement APM tools (New Relic, DataDog)

## Support

For deployment issues:

1. Check the logs: `sudo journalctl -u huur-us -f`
2. Verify configuration: `sudo nginx -t`
3. Test connectivity: `curl http://localhost:5000/health`
4. Review this documentation

## Security Notes

- Change default passwords
- Keep system updated
- Use HTTPS in production
- Regular security audits
- Monitor access logs
- Implement proper backup strategy
