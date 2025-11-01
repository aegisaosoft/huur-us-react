# Huur-US Client & Server Setup Guide

This guide explains how to set up and run both the React client and Node.js server components of the Huur-US application.

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)
- **Docker** (optional, for containerized deployment)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **OS**: Windows 10/11, macOS, or Linux

## 🏗️ Architecture Overview

```
Huur-US Application
├── Client (React Frontend)     - Port 3000 (development)
│   ├── React 18 + TypeScript
│   ├── Bootstrap + Tailwind CSS
│   ├── React Router
│   └── Axios for API calls
│
└── Server (Node.js Backend)    - Port 5000
    ├── Express.js
    ├── Authentication (JWT)
    ├── API Routes
    └── External API Integration
```

## 🚀 Quick Start (Development)

### 1. Install All Dependencies

```bash
# Install root dependencies (server)
npm install

# Install client dependencies
cd client
npm install
cd ..

# Or use the convenience script
npm run install-all
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
# Update .env with your settings
```

### 3. Start Development Servers

```bash
# Start both client and server concurrently
npm run dev

# Or start them separately:
npm run server    # Server only (port 5000)
npm run client    # Client only (port 3000)
```

## 🔧 Detailed Setup Instructions

### Server Setup (Node.js Backend)

#### 1. Server Dependencies
```bash
npm install
```

**Key Dependencies:**
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `helmet` - Security middleware
- `jsonwebtoken` - JWT authentication
- `axios` - HTTP client for external APIs
- `dotenv` - Environment variables

#### 2. Server Configuration

**Environment Variables (.env):**
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Security
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# External APIs
HUUR_API_BASE_URL=https://agsm-huur-production-api.azurewebsites.net
AZURE_API_BASE_URL=https://agsm-back.azurewebsites.net

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000
```

#### 3. Server Structure
```
server/
├── index.js           # Main server file
├── routes/
│   ├── auth.js        # Authentication routes
│   ├── api.js         # General API routes
│   └── huurApi.js     # Huur-specific API routes
```

#### 4. Start Server
```bash
# Development (with auto-restart)
npm run server

# Production
npm run start-server
```

**Server will be available at:** `http://localhost:5000`

### Client Setup (React Frontend)

#### 1. Client Dependencies
```bash
cd client
npm install
```

**Key Dependencies:**
- `react` & `react-dom` - React framework
- `typescript` - TypeScript support
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `react-hook-form` - Form handling
- `bootstrap` - UI components
- `tailwindcss` - Utility-first CSS

#### 2. Client Configuration

**Environment Variables (client/.env.local):**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=Huur-US
REACT_APP_VERSION=1.0.0
```

#### 3. Client Structure
```
client/src/
├── components/        # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── DataTable.tsx
│   └── ui/           # UI components
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── EzPass.tsx
│   └── ...
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── services/         # API services
│   └── api.ts
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

#### 4. Start Client
```bash
cd client

# Development server
npm start

# Build for production
npm run build
```

**Client will be available at:** `http://localhost:3000`

## 🔗 Client-Server Communication

### API Configuration

The client communicates with the server through REST APIs:

**Client API Setup (`client/src/services/api.ts`):**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Proxy Configuration

In development, the client uses a proxy to avoid CORS issues:

**Client package.json:**
```json
{
  "proxy": "http://localhost:5000"
}
```

### Authentication Flow

1. **Login**: Client sends credentials to `/api/auth/login`
2. **Token Storage**: JWT token stored in localStorage
3. **API Requests**: Token included in Authorization header
4. **Auto-logout**: Client redirects to login on 401 responses

## 📝 Available Scripts

### Root Level (Server + Client)
```bash
npm run dev          # Start both client and server
npm run start        # Start both (production mode)
npm run server       # Start server only
npm run client       # Start client only
npm run build        # Build client for production
npm run install-all  # Install all dependencies
```

### Client Specific
```bash
cd client
npm start           # Development server
npm run build       # Production build
npm test            # Run tests
npm run tailwind    # Build Tailwind CSS
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Huur APIs
- `GET /api/huur/violations` - Get violations
- `GET /api/huur/ezpass` - Get EZ-Pass data
- `GET /api/huur/parking-violations` - Get parking violations
- `GET /api/huur/nyc-violations` - Get NYC violations
- `GET /api/huur/payments/completed` - Get completed payments
- `GET /api/huur/payments/failed` - Get failed payments

### General
- `GET /api/health` - Health check
- `GET /api/config` - App configuration

## 🔧 Development Workflow

### 1. Daily Development
```bash
# Start development environment
npm run dev

# This starts:
# - Server on http://localhost:5000
# - Client on http://localhost:3000
```

### 2. Making Changes
- **Server changes**: Automatically restart with nodemon
- **Client changes**: Hot reload in browser
- **Environment changes**: Restart both servers

### 3. Testing
```bash
# Test client
cd client && npm test

# Manual testing
# - Health check: http://localhost:5000/api/health
# - Client app: http://localhost:3000
```

## 🚀 Production Deployment

### 1. Build Client
```bash
npm run build
```

### 2. Set Production Environment
```bash
export NODE_ENV=production
```

### 3. Start Production Server
```bash
npm run start-server
```

### 4. Docker Deployment
```bash
# Build production image
./build-production.bat

# Deploy to Azure Web App (see AZURE-WEBAPP-DIRECT-DEPLOYMENT.md)
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 5000
netstat -ano | findstr :5000
taskkill /f /pid <PID>

# Or use different port
PORT=5001 npm run server
```

#### CORS Errors
- Check `ALLOWED_ORIGINS` in server .env
- Verify proxy setting in client package.json
- Ensure client uses correct API URL

#### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For client
cd client
rm -rf node_modules package-lock.json
npm install
```

#### Build Failures
```bash
# Clear cache
npm cache clean --force

# Rebuild
npm run build
```

### Debugging

#### Server Debugging
- Check server logs in terminal
- Use `console.log()` in server code
- Check `/api/health` endpoint

#### Client Debugging
- Open browser DevTools (F12)
- Check Console and Network tabs
- Use React DevTools extension

## 📊 Performance Optimization

### Development
- Use `npm run dev` for hot reloading
- Enable React DevTools
- Use browser caching

### Production
- Build with `npm run build`
- Enable compression middleware
- Use CDN for static assets
- Implement caching strategies

## 🔒 Security Considerations

### Development
- Use HTTPS in production
- Validate all inputs
- Sanitize user data
- Use environment variables for secrets

### Production
- Change default secrets
- Enable rate limiting
- Use helmet for security headers
- Regular security updates

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Getting Help

1. Check this setup guide
2. Review error messages carefully
3. Check browser DevTools
4. Verify environment variables
5. Test API endpoints manually

---

**Next Steps:**
1. Follow this setup guide
2. Test both client and server
3. Review the codebase structure
4. Start development!
