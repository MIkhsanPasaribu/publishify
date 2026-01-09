@echo off
echo ========================================
echo  Publishify - Upload ke VM
echo ========================================

echo [1/4] Creating publishify directory on VM...
plink -ssh sumatrans@135.235.165.131 -pw "Sumatrans9988!" "mkdir -p /home/sumatrans/publishify && echo 'Directory created'"

echo.
echo [2/4] Uploading backend files...
pscp -r -pw "Sumatrans9988!" backend sumatrans@135.235.165.131:/home/sumatrans/publishify/

echo.
echo [3/4] Uploading frontend files...
pscp -r -pw "Sumatrans9988!" frontend sumatrans@135.235.165.131:/home/sumatrans/publishify/

echo.
echo [4/4] Uploading deployment scripts...
pscp -r -pw "Sumatrans9988!" deploy sumatrans@135.235.165.131:/home/sumatrans/publishify/

echo.
echo ========================================
echo  Upload Complete!
echo ========================================
echo.
echo Next steps:
echo 1. SSH to VM: ssh sumatrans@135.235.165.131
echo 2. Run setup: cd ~/publishify/deploy ^&^& chmod +x *.sh ^&^& ./setup-vm.sh
echo 3. Deploy app: ./deploy-app.sh
echo.
pause
