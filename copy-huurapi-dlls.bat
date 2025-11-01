@echo off
echo Copying HuurApi DLLs to HuurUS.Web\bin\Debug\net8.0...

if not exist "HuurUS.Web\bin\Debug\net8.0" (
    echo Creating directory HuurUS.Web\bin\Debug\net8.0
    mkdir "HuurUS.Web\bin\Debug\net8.0"
)

copy "libs\*.dll" "HuurUS.Web\bin\Debug\net8.0\"
copy "libs\*.xml" "HuurUS.Web\bin\Debug\net8.0\"
copy "libs\*.deps.json" "HuurUS.Web\bin\Debug\net8.0\"

echo.
echo DLLs copied successfully!
echo.
echo Files copied:
dir "HuurUS.Web\bin\Debug\net8.0\HuurApi*"
echo.
pause
