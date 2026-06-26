@echo off
TITLE Radial Stream Launcher - DEBUG MODE
CLS

ECHO [STEP 1] Checking for Node.js...
WHERE node
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO [CRITICAL ERROR] Node.js is NOT found in your PATH.
    ECHO.
    ECHO If you just installed it, you might need to RESTART YOUR COMPUTER completely.
    ECHO Please try restarting Windows, then try this again.
    ECHO.
    PAUSE
    EXIT /B
)

ECHO [STEP 2] Node.js found. Setting working directory...
CD /D "%~dp0"
ECHO Working directory is: %CD%

IF NOT EXIST "node_modules" (
    ECHO.
    ECHO [STEP 3] Installing dependencies...
    ECHO This may take a few minutes. Please don't close this window.
    call npm install
    IF %ERRORLEVEL% NEQ 0 (
        ECHO.
        ECHO [ERROR] npm install failed.
        PAUSE
        EXIT /B
    )
)

ECHO.
ECHO [STEP 4] Starting the website...
ECHO.
call npm run dev

ECHO.
ECHO [STOPPED] The website process has ended.
PAUSE
