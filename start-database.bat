@echo off
echo Starting MySQL Database with Docker...
echo.
docker-compose up -d
echo.
echo Waiting for database to be ready...
timeout /t 10 /nobreak
echo.
echo Checking database status...
docker ps
echo.
echo Database should be running on port 3306
echo Container name: eventhub-mysql
echo.
pause
