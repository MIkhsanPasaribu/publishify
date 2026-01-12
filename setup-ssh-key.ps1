# Setup SSH Key untuk Publishify VM
# Script ini akan copy SSH public key ke VM agar tidak perlu password

$VM_HOST = "74.225.221.140"
$VM_USER = "publishify"
$VM_PASSWORD = "123456789Publishify"
$SSH_PUBLIC_KEY = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"

Write-Host "=== Setup SSH Key ke VM Publishify ===" -ForegroundColor Cyan
Write-Host "Host: $VM_USER@$VM_HOST" -ForegroundColor Yellow

# Buat temporary script untuk dijalankan di VM
$remoteScript = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$SSH_PUBLIC_KEY' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo 'SSH key berhasil ditambahkan'
"@

# Simpan ke file temporary
$tempScript = [System.IO.Path]::GetTempFileName()
$remoteScript | Out-File -FilePath $tempScript -Encoding ASCII

Write-Host "`nCopying SSH key ke VM..." -ForegroundColor Yellow
Write-Host "Anda akan diminta password sekali lagi: $VM_PASSWORD" -ForegroundColor Green

# Upload dan execute script
Write-Host "`nJalankan command berikut di terminal terpisah:" -ForegroundColor Cyan
Write-Host "scp $tempScript ${VM_USER}@${VM_HOST}:/tmp/setup-ssh.sh" -ForegroundColor White
Write-Host "ssh ${VM_USER}@${VM_HOST} 'bash /tmp/setup-ssh.sh && rm /tmp/setup-ssh.sh'" -ForegroundColor White

Write-Host "`nAtau gunakan command ini (akan diminta password):" -ForegroundColor Cyan
$manualCommand = @"
ssh $VM_USER@$VM_HOST "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$SSH_PUBLIC_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'Setup selesai'"
"@

Write-Host $manualCommand -ForegroundColor White

# Cleanup
Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host "`n=== Setelah setup, test koneksi tanpa password: ===" -ForegroundColor Cyan
Write-Host "ssh $VM_USER@$VM_HOST" -ForegroundColor White
