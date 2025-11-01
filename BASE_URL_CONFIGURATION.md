# Base URL Configuration Guide

This document explains how to configure the base URL for the Huur-US React application.

## Environment Variables

The application supports the following environment variables:

### `REACT_APP_BASE_URL`
- **Default**: `/`
- **Purpose**: Sets the base path for React Router
- **Examples**:
  - Root deployment: `REACT_APP_BASE_URL=/`
  - Subdirectory deployment: `REACT_APP_BASE_URL=/huur-app/`
  - Subdomain deployment: `REACT_APP_BASE_URL=/`

### `REACT_APP_API_URL`
- **Default**: `/api`
- **Purpose**: Sets the API endpoint base URL
- **Examples**:
  - Local development: `REACT_APP_API_URL=http://localhost:5000/api`
  - Production: `REACT_APP_API_URL=/api`
  - External API: `REACT_APP_API_URL=https://api.example.com/api`

## Configuration Files

### Development (`client/env.local`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=/
GENERATE_SOURCEMAP=false
```

### Production
Create a `.env.production` file in the `client/` directory:
```env
REACT_APP_API_URL=/api
REACT_APP_BASE_URL=/
GENERATE_SOURCEMAP=false
```

### Subdirectory Deployment
For deployment in a subdirectory (e.g., `https://example.com/huur-app/`):
```env
REACT_APP_API_URL=/huur-app/api
REACT_APP_BASE_URL=/huur-app/
GENERATE_SOURCEMAP=false
```

## Deployment Examples

### 1. Root Domain Deployment
- URL: `https://huur-app.com/`
- Configuration:
  ```env
  REACT_APP_BASE_URL=/
  REACT_APP_API_URL=/api
  ```

### 2. Subdirectory Deployment
- URL: `https://example.com/huur-app/`
- Configuration:
  ```env
  REACT_APP_BASE_URL=/huur-app/
  REACT_APP_API_URL=/huur-app/api
  ```

### 3. Subdomain Deployment
- URL: `https://huur.example.com/`
- Configuration:
  ```env
  REACT_APP_BASE_URL=/
  REACT_APP_API_URL=/api
  ```

## Server Configuration

### Nginx Configuration
For subdirectory deployment, update your Nginx configuration:

```nginx
# Root deployment
location / {
    try_files $uri $uri/ /index.html;
}

# Subdirectory deployment
location /huur-app/ {
    alias /path/to/build/;
    try_files $uri $uri/ /huur-app/index.html;
}

# API proxy
location /api/ {
    proxy_pass http://localhost:5000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Apache Configuration
For subdirectory deployment with Apache:

```apache
# .htaccess in subdirectory
RewriteEngine On
RewriteBase /huur-app/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /huur-app/index.html [L]
```

## Build Process

The application will automatically use the environment variables during build:

```bash
# Development build
npm run build

# Production build with custom base URL
REACT_APP_BASE_URL=/huur-app/ npm run build
```

## Testing

To test different base URL configurations:

1. Update your environment file
2. Restart the development server: `npm start`
3. Verify routes work correctly with the new base URL

## Troubleshooting

### Routes not working after deployment
- Ensure `REACT_APP_BASE_URL` matches your deployment path
- Check server configuration for proper fallback to `index.html`

### API calls failing
- Verify `REACT_APP_API_URL` points to the correct API endpoint
- Check CORS configuration on your API server

### Assets not loading
- Ensure `homepage` field in `package.json` is set to `"."`
- Verify `REACT_APP_BASE_URL` includes trailing slash if needed
