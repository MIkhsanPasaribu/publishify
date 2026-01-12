# Deploy Fix Upload to VM
# PowerShell script untuk deploy via SSH

$VM_HOST = "103.127.134.84"
$VM_USER = "root"
$PROJECT_PATH = "/root/publishify"
$BRANCH = "feature/deployment-scripts"

Write-Host "🚀 Deploying fix upload naskah ke VM..." -ForegroundColor Cyan
Write-Host ""

# Deploy commands
$DEPLOY_SCRIPT = @"
set -e
cd $PROJECT_PATH
echo '� Setting git remote to fork...'
git remote set-url origin https://github.com/daffarobbani18/publishify.git || git remote add origin https://github.com/daffarobbani18/publishify.git
echo '📥 Pulling latest changes from fork...'
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

echo '🔨 Building backend...'
cd $PROJECT_PATH/backend
bun install
bun run build

echo '🔨 Building frontend...'
cd $PROJECT_PATH/frontend
bun install
bun run build

echo '♻️ Restarting services...'
pm2 restart publishify-backend
pm2 restart publishify-frontend

echo '✅ Checking status...'
pm2 status

echo ''
echo '🎉 Deploy completed!'
echo ''
echo 'Testing URL: https://publishify.me/penulis/ajukan-draf'
"@

Write-Host "📝 Deploy script ready. Execute this in VM:" -ForegroundColor Yellow
Write-Host ""
Write-Host "SSH Command:" -ForegroundColor Green
Write-Host "ssh $VM_USER@$VM_HOST" -ForegroundColor White
Write-Host ""
Write-Host "Then paste this script:" -ForegroundColor Green
Write-Host $DEPLOY_SCRIPT -ForegroundColor White
Write-Host ""

# Alternative: Use plink if available
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "Alternative: Using plink..." -ForegroundColor Cyan
    $password = Read-Host "Enter VM password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    # Execute via plink
    $commands = $DEPLOY_SCRIPT -replace "'", "\\'"
    echo $plainPassword | plink -ssh -batch -pw $plainPassword $VM_USER@$VM_HOST $commands
} else {
    Write-Host "⚠️ PuTTY/plink not found. Please use manual SSH deployment." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 See DEPLOY-FIX-UPLOAD.md for manual steps" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
