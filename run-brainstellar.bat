@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    if exist "C:\nvm4w\nodejs\node.exe" (
        set "PATH=C:\nvm4w\nodejs;%PATH%"
    )
)

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found on PATH.
    echo If you just installed it, close this window, open a NEW terminal
    echo ^(or log off/on once^), then double-click this file again.
    pause
    exit /b 1
)

if not exist node_modules (
    echo First run: installing dependencies, this can take a few minutes...
    call npm install
    if errorlevel 1 (
        echo npm install failed - see the output above.
        pause
        exit /b 1
    )
)

echo Starting Brainstellar locally at http://localhost:8000 ...
node node_modules\gatsby-cli\cli.js develop --open

pause
