# Copy HuurApi DLLs to HuurUS.Web\bin\Debug\net8.0
Write-Host "Copying HuurApi DLLs to HuurUS.Web\bin\Debug\net8.0..." -ForegroundColor Green

$targetDir = "HuurUS.Web\bin\Debug\net8.0"
$libsDir = "libs"

# Create target directory if it doesn't exist
if (!(Test-Path $targetDir)) {
    Write-Host "Creating directory $targetDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Copy all DLL files
$dllFiles = Get-ChildItem "$libsDir\*.dll"
foreach ($file in $dllFiles) {
    Copy-Item $file.FullName $targetDir -Force
    Write-Host "Copied: $($file.Name)" -ForegroundColor Cyan
}

# Copy XML documentation files
$xmlFiles = Get-ChildItem "$libsDir\*.xml"
foreach ($file in $xmlFiles) {
    Copy-Item $file.FullName $targetDir -Force
    Write-Host "Copied: $($file.Name)" -ForegroundColor Cyan
}

# Copy deps.json files
$depsFiles = Get-ChildItem "$libsDir\*.deps.json"
foreach ($file in $depsFiles) {
    Copy-Item $file.FullName $targetDir -Force
    Write-Host "Copied: $($file.Name)" -ForegroundColor Cyan
}

Write-Host "`nDLLs copied successfully!" -ForegroundColor Green
Write-Host "`nFiles copied:" -ForegroundColor Yellow
Get-ChildItem "$targetDir\HuurApi*" | Select-Object Name, Length, LastWriteTime

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
