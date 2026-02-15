$ErrorActionPreference = "Stop"

# Create temp directory
$tempDir = "deploy_temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy root files
Copy-Item "vps-server.js", "package.json", "package-lock.json", "ecosystem.config.cjs" -Destination $tempDir

# Copy dist (Frontend Build)
Copy-Item "dist" -Destination $tempDir -Recurse

# Copy backend
Copy-Item "backend" -Destination $tempDir -Recurse

# Remove node_modules from backend to keep it clean
if (Test-Path "$tempDir/backend/node_modules") {
    Remove-Item "$tempDir/backend/node_modules" -Recurse -Force
}

# Remove local .env from backend (security)
if (Test-Path "$tempDir/backend/.env") {
    Remove-Item "$tempDir/backend/.env" -Force
}

# Compress
$zipFile = "deploy_package.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipFile

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "✅ Deployment package created: $zipFile"
