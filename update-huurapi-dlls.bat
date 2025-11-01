@echo off
echo Updating HuurApi DLLs from huur-api repository...
echo.

powershell -ExecutionPolicy Bypass -File "update-huurapi-dlls.ps1"

echo.
echo Update complete!
pause
