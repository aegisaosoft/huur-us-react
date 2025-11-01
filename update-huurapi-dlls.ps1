# Simple script to update HuurApi DLLs from huur-api repository
$HuurApiRepoPath = "C:\Users\Alexander\OneDrive\Documents\GitHub\huur-api"
$CurrentLibsPath = "libs"

Write-Host "Checking for newer HuurApi DLLs..." -ForegroundColor Green

# Check if huur-api repository exists
if (!(Test-Path $HuurApiRepoPath)) {
    Write-Host "ERROR: HuurApi repository not found!" -ForegroundColor Red
    exit 1
}

$updatedCount = 0

# Main HuurApi DLL
$sourceDll = "$HuurApiRepoPath\HuurApi\bin\Debug\net8.0\HuurApi.dll"
$targetDll = "$CurrentLibsPath\HuurApi.dll"

if (Test-Path $sourceDll) {
    $sourceFile = Get-Item $sourceDll
    $shouldUpdate = $false
    
    if (Test-Path $targetDll) {
        $targetFile = Get-Item $targetDll
        if ($sourceFile.Length -ne $targetFile.Length -or $sourceFile.LastWriteTime -gt $targetFile.LastWriteTime) {
            $shouldUpdate = $true
            Write-Host "UPDATE NEEDED: HuurApi.dll" -ForegroundColor Yellow
            Write-Host "  Source: $($sourceFile.Length) bytes, $($sourceFile.LastWriteTime)" -ForegroundColor Gray
            Write-Host "  Target: $($targetFile.Length) bytes, $($targetFile.LastWriteTime)" -ForegroundColor Gray
        } else {
            Write-Host "UP TO DATE: HuurApi.dll" -ForegroundColor Green
        }
    } else {
        $shouldUpdate = $true
        Write-Host "NEW FILE: HuurApi.dll" -ForegroundColor Blue
    }
    
    if ($shouldUpdate) {
        Copy-Item $sourceDll $targetDll -Force
        Write-Host "  Copied: HuurApi.dll" -ForegroundColor Green
        $updatedCount++
    }
}

# Copy other related files
$files = @(
    "$HuurApiRepoPath\HuurApi\bin\Debug\net8.0\HuurApi.deps.json",
    "$HuurApiRepoPath\HuurApi\bin\Debug\net8.0\HuurApi.xml"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        $targetFile = "$CurrentLibsPath\$fileName"
        Copy-Item $file $targetFile -Force
        Write-Host "  Copied: $fileName" -ForegroundColor Cyan
    }
}

Write-Host "Update Summary:" -ForegroundColor Cyan
Write-Host "  Updated: $updatedCount files" -ForegroundColor Green

if ($updatedCount -gt 0) {
    Write-Host "Copying updated DLLs to build output..." -ForegroundColor Yellow
    
    # Run the existing copy script
    if (Test-Path "copy-huurapi-dlls.ps1") {
        & powershell -ExecutionPolicy Bypass -File "copy-huurapi-dlls.ps1"
    }
    
    Write-Host "DLLs updated successfully!" -ForegroundColor Green
} else {
    Write-Host "No updates needed." -ForegroundColor Green
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host
