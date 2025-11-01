# AWS Amplify Hosting Deployment Guide

This guide provides comprehensive instructions for deploying the Huur-US React application to AWS Amplify Hosting using Jenkins CI/CD pipeline.

## Overview

AWS Amplify Hosting provides a fully managed hosting service for web applications with built-in CI/CD capabilities. This setup includes:

- **Frontend**: React application hosted on AWS Amplify
- **Backend**: AWS Lambda functions and AppSync GraphQL API
- **CI/CD**: Jenkins pipeline for automated deployments
- **Monitoring**: Built-in AWS CloudWatch integration

## Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured
- AWS Amplify CLI installed

### 2. Jenkins Setup
- Jenkins server with AWS CLI plugin
- AWS credentials configured in Jenkins
- Node.js plugin installed

### 3. Required Tools
- Node.js 18+
- npm
- Git
- AWS CLI
- Amplify CLI

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd huur-us-react

# Run the setup script
./scripts/setup-amplify.sh
# Or on Windows:
scripts\setup-amplify.bat
```

### 2. Configure Environment Variables

Update `.env.amplify` with your actual values:

```bash
# AWS Amplify Configuration
AMPLIFY_APP_ID=your-amplify-app-id
AMPLIFY_BRANCH=main
AMPLIFY_ENV=prod
AWS_REGION=us-east-1

# API Configuration
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod
REACT_APP_GRAPHQL_URL=https://your-appsync-url.appsync-api.us-east-1.amazonaws.com/graphql
REACT_APP_GRAPHQL_API_KEY=your-appsync-api-key
```

### 3. Deploy to Amplify

```bash
# Deploy using the script
./scripts/deploy-amplify.sh
# Or on Windows:
scripts\deploy-amplify.bat
```

## Jenkins Pipeline Configuration

### 1. Create Jenkins Job

1. Create a new Pipeline job in Jenkins
2. Configure the pipeline to use `Jenkinsfile.Amplify`
3. Set up the following credentials in Jenkins:
   - `aws-access-key-id`: AWS Access Key ID
   - `aws-secret-access-key`: AWS Secret Access Key
   - `amplify-app-id`: AWS Amplify App ID

### 2. Pipeline Stages

The Jenkins pipeline includes the following stages:

1. **Checkout**: Clone the repository
2. **Setup AWS CLI**: Install and configure AWS CLI
3. **Install Dependencies**: Install Node.js dependencies
4. **Lint & Test**: Run ESLint, TypeScript checks, and unit tests
5. **Build Client**: Build the React application
6. **Prepare Amplify Deployment**: Prepare deployment package
7. **Deploy to AWS Amplify**: Deploy backend and frontend
8. **Update Amplify App**: Update app configuration
9. **Health Check**: Verify deployment
10. **Create Deployment Artifacts**: Generate deployment summary

### 3. Environment Variables

Configure these environment variables in Jenkins:

```bash
NODE_VERSION=18
NPM_CONFIG_LOGLEVEL=error
NODE_ENV=production
AWS_REGION=us-east-1
AMPLIFY_APP_ID=your-amplify-app-id
AMPLIFY_BRANCH=main
AMPLIFY_ENV=prod
```

## AWS Amplify Configuration

### 1. Build Settings (amplify.yml)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - cd client
        - npm ci
    build:
      commands:
        - echo "Building React application..."
        - npm run build
        - echo "Build completed successfully"
  artifacts:
    baseDirectory: client/build
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
      - node_modules/**/*
```

### 2. Backend Configuration

The backend includes:
- **AppSync GraphQL API**: For data management
- **Lambda Functions**: For serverless compute
- **DynamoDB**: For data storage (optional)

### 3. Environment Variables

Set these in the Amplify Console:

```bash
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
REACT_APP_API_URL=https://your-api-url
REACT_APP_GRAPHQL_URL=https://your-graphql-url
```

## Deployment Scripts

### 1. Setup Script (`scripts/setup-amplify.sh`)

Creates the initial AWS Amplify project:

```bash
./scripts/setup-amplify.sh
```

Features:
- Creates Amplify app
- Sets up main branch
- Configures build settings
- Sets up custom domain (optional)
- Creates environment files

### 2. Deployment Script (`scripts/deploy-amplify.sh`)

Deploys the application to Amplify:

```bash
./scripts/deploy-amplify.sh
```

Features:
- Checks prerequisites
- Installs dependencies
- Runs tests and linting
- Builds the application
- Deploys to Amplify
- Performs health checks

### 3. Rollback Script (`scripts/rollback-amplify.sh`)

Rolls back to a previous deployment:

```bash
./scripts/rollback-amplify.sh
```

Features:
- Lists recent deployments
- Interactive rollback process
- Monitors rollback progress
- Creates rollback summary

## Monitoring and Troubleshooting

### 1. AWS Amplify Console

Monitor your deployment in the AWS Amplify Console:
- View build logs
- Check deployment status
- Monitor performance metrics
- View error logs

### 2. CloudWatch Logs

Access detailed logs in AWS CloudWatch:
- Lambda function logs
- API Gateway logs
- Application logs

### 3. Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs in Amplify Console

**Deployment Failures:**
- Verify AWS credentials
- Check IAM permissions
- Review Amplify app configuration

**Runtime Errors:**
- Check environment variables
- Verify API endpoints
- Review browser console for errors

## Security Considerations

### 1. IAM Permissions

Ensure Jenkins has the following permissions:
- `amplify:*`
- `lambda:*`
- `appsync:*`
- `iam:PassRole`

### 2. Environment Variables

- Never commit sensitive data to version control
- Use Jenkins credentials for sensitive information
- Rotate AWS credentials regularly

### 3. Network Security

- Use HTTPS for all communications
- Configure CORS properly
- Implement proper authentication

## Best Practices

### 1. CI/CD Pipeline

- Run tests before deployment
- Use feature branches for development
- Implement automated rollback
- Monitor deployment metrics

### 2. Code Quality

- Use ESLint and Prettier
- Implement TypeScript
- Write unit tests
- Use code coverage tools

### 3. Performance

- Optimize bundle size
- Use CDN for static assets
- Implement caching strategies
- Monitor performance metrics

## Rollback Procedures

### 1. Automatic Rollback

Configure automatic rollback triggers:
- Failed health checks
- High error rates
- Performance degradation

### 2. Manual Rollback

Use the rollback script:

```bash
./scripts/rollback-amplify.sh interactive
```

### 3. Emergency Rollback

In case of critical issues:
1. Go to AWS Amplify Console
2. Navigate to your app
3. Select a previous deployment
4. Click "Redeploy this version"

## Support and Resources

### 1. Documentation

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Jenkins AWS Plugin](https://plugins.jenkins.io/aws-cli/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

### 2. Community

- [AWS Amplify Community](https://amplify.aws/community/)
- [Jenkins Community](https://community.jenkins.io/)

### 3. Support

For issues specific to this deployment:
1. Check the deployment logs
2. Review AWS CloudWatch logs
3. Consult the troubleshooting section
4. Contact the development team

## Conclusion

This AWS Amplify deployment setup provides a robust, scalable solution for hosting the Huur-US React application. The Jenkins CI/CD pipeline ensures reliable deployments, while the rollback capabilities provide safety nets for production environments.

For questions or issues, please refer to the troubleshooting section or contact the development team.
