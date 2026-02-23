@echo off
echo Stopping all EventHub services...
echo.
echo Stopping Docker containers...
docker-compose down
echo.
echo Done! All services stopped.
echo Note: Stop backend and frontend manually with Ctrl+C in their terminals
pause
