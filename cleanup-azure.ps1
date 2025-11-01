# Azure Cleanup Script
Write-Host "🧹 Cleaning up Azure services..." -ForegroundColor Green

# Login to Azure (if not already logged in)
# az login

# Stop the web app
Write-Host "⏹️ Stopping web app..." -ForegroundColor Yellow
az webapp stop --name huur-web-us-2025 --resource-group huur_web

# Wait a moment
Start-Sleep -Seconds 10

# Remove conflicting settings
Write-Host "🗑️ Removing conflicting settings..." -ForegroundColor Yellow
az webapp config appsettings delete --name huur-web-us-2025 --resource-group huur_web --setting-names WEBSITE_RUN_FROM_PACKAGE --output none
az webapp config appsettings delete --name huur-web-us-2025 --resource-group huur_web --setting-names SCM_DO_BUILD_DURING_DEPLOYMENT --output none

# Check for ongoing deployments and wait
Write-Host "⏳ Checking for ongoing deployments..." -ForegroundColor Yellow
$deployments = az webapp deployment list --name huur-web-us-2025 --resource-group huur_web --query "[?status=='Running'].id" --output tsv
if ($deployments) {
    Write-Host "Found running deployments, waiting..." -ForegroundColor Red
    Start-Sleep -Seconds 30
}

# Restart the web app
Write-Host "▶️ Starting web app..." -ForegroundColor Yellow
az webapp start --name huur-web-us-2025 --resource-group huur_web

# Check final status
Write-Host "✅ Final status check..." -ForegroundColor Green
az webapp show --name huur-web-us-2025 --resource-group huur_web --query "{name:name, state:state, kind:kind}" --output table

Write-Host "🎉 Cleanup completed! You can now redeploy." -ForegroundColor Green
