@echo off
title Push Update to GitHub Actions
echo ===================================================
echo     PUSHING UPDATE TO GITHUB ACTIONS
echo ===================================================
echo.
echo Moving to project directory...
cd /d "C:\Users\oob\.gemini\antigravity\scratch\radial-stream"

echo.
echo Committing new files...
git add .
git commit -m "Update GitHub Actions workflow"

echo.
echo Pushing code to GitHub...
echo [!] A browser window may open asking you to sign in to GitHub!
git push origin main

echo.
echo ===================================================
echo DONE!
echo Your site will deploy automatically via GitHub Actions!
echo ===================================================
pause
