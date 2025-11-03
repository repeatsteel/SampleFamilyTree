# FamilyTree4 Global Management Script
# Provides clean, build, push commands to simplify project management
param(
  [Parameter(Position=0)] [ValidateSet("clean","build","push")] [string] $Command = "help"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host ("[INFO] " + $msg) -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host ("[WARN] " + $msg) -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host ("[ERROR] " + $msg) -ForegroundColor Red }

# Path definitions
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir   = Split-Path -Parent $ScriptDir
$DocsDir   = Join-Path $RootDir "docs"
$HexoDir   = Join-Path $RootDir "hexo_site"
$HexoPublicDir = Join-Path $HexoDir "public"

# Project module paths
$IndexFile = Join-Path $RootDir "index.html"
$CssDir    = Join-Path $RootDir "css"
$JsDir     = Join-Path $RootDir "js"
$LibDir    = Join-Path $RootDir "lib"
$FontsDir  = Join-Path $RootDir "fonts"
$DataDir   = Join-Path $RootDir "Data"

# Git remote configuration (can be overridden by environment variables)
$GitRemote = if($env:FT4_REMOTE){ $env:FT4_REMOTE } else { 'origin' }
$GitBranch = if($env:FT4_BRANCH){ $env:FT4_BRANCH } else { 'main' }

function Ensure-Command($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if(-not $cmd) { throw "Required command '$name' not found in PATH." }
}

function Ensure-Exists($path, $desc) {
  if(-not (Test-Path $path)) { throw "$desc not found: $path" }
}

# Clean command: Clean project files
function Invoke-Clean() {
  Write-Info "Cleaning project files..."
  # Clean docs directory
  if(Test-Path $DocsDir) {
    Write-Info "  - Removing docs directory"
    Remove-Item $DocsDir -Recurse -Force
  }
  # Clean Hexo database
  if(Test-Path (Join-Path $HexoDir "db.json")) {
    Write-Info "  - Removing Hexo database"
    Remove-Item (Join-Path $HexoDir "db.json") -Force
  }
  # Clean Hexo generated files
  if(Test-Path $HexoPublicDir) {
    Write-Info "  - Removing Hexo generated files"
    Remove-Item $HexoPublicDir -Recurse -Force
  }
  Write-Info "Clean completed."
}

# Build command: Build entire project
function Invoke-Build() {
  Write-Info "Building project..."
  
  # 1. Generate Hexo content
  Write-Info "1. Generating Hexo story content"
  Ensure-Command "npx"
  Ensure-Exists $HexoDir "Hexo directory"
  Push-Location $HexoDir
  try {
    npx hexo generate
    Ensure-Exists $HexoPublicDir "Hexo generated files"
  } finally { Pop-Location }
  
  # 2. Prepare docs directory
  Write-Info "2. Preparing docs directory"
  if(Test-Path $DocsDir) { Remove-Item $DocsDir -Recurse -Force }
  New-Item -ItemType Directory -Path $DocsDir | Out-Null
  
  # 3. Copy basic files
  Write-Info "3. Copying basic files"
  Ensure-Exists $IndexFile "index.html"
  Copy-Item -Path $IndexFile -Destination $DocsDir -Force
  if(Test-Path $CssDir) { Copy-Item -Path $CssDir -Destination $DocsDir -Recurse -Force }
  
  # 4. Copy necessary lib files
  Write-Info "4. Copying necessary lib files"
  if(Test-Path $LibDir) {
    $DestLib = Join-Path $DocsDir "lib"
    New-Item -ItemType Directory -Path $DestLib -Force | Out-Null
    foreach($name in @("font-awesome.min.css","familytree.js","tailwindcss.min.js")) {
      $src = Join-Path $LibDir $name
      if(Test-Path $src) { Copy-Item -Path $src -Destination $DestLib -Force }
    }
  }
  
  # 5. Copy font files
  if(Test-Path $FontsDir) { Copy-Item -Path $FontsDir -Destination $DocsDir -Recurse -Force }
  
  # 6. Copy member data
  Write-Info "5. Copying member data"
  if(Test-Path $DataDir) { Copy-Item -Path $DataDir -Destination $DocsDir -Recurse -Force }
  
  # 7. Copy JavaScript files
  Write-Info "6. Copying JavaScript files"
  if(Test-Path $JsDir) {
    New-Item -ItemType Directory -Path (Join-Path $DocsDir "js") -Force | Out-Null
    Copy-Item -Path (Join-Path $JsDir "members_db.js") -Destination (Join-Path $DocsDir "js") -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $JsDir "app.js") -Destination (Join-Path $DocsDir "js") -Force -ErrorAction SilentlyContinue
  }
  
  # 8. Copy Hexo generated content to docs
  Write-Info "7. Copying Hexo generated content"
  $DestStories = Join-Path $DocsDir "hexo_site\public"
  New-Item -ItemType Directory -Path $DestStories -Force | Out-Null
  Copy-Item -Path (Join-Path $HexoPublicDir '*') -Destination $DestStories -Recurse -Force
  
  # 9. Create .nojekyll file
  New-Item -ItemType File -Path (Join-Path $DocsDir ".nojekyll") -Force | Out-Null
  
  # 10. Update iframe src to relative path
  Write-Info "8. Updating iframe src path"
  $DocsAppJs = Join-Path $DocsDir "js\app.js"
  if(Test-Path $DocsAppJs) {
    $content = [System.IO.File]::ReadAllText($DocsAppJs, [System.Text.Encoding]::UTF8)
    $targetRel = "hexo_site/public/index.html"
    $content = $content -replace '/hexo_site/public/index.html', $targetRel
    $content = $content -replace '/docs/index.html', $targetRel
    [System.IO.File]::WriteAllText($DocsAppJs, $content, [System.Text.Encoding]::UTF8)
  }
  
  Write-Info "Build completed! Output directory: $DocsDir"
}

# Push command: Commit and push changes to GitHub
function Invoke-Push() {
  # First ensure docs directory exists
  if(-not (Test-Path $DocsDir)) {
    Write-Warn "Docs directory does not exist, please run build command first."
    return
  }
  
  Write-Info "Committing and pushing changes to GitHub..."
  Ensure-Command 'git'
  
  Push-Location $RootDir
  try {
    # Ensure git repository exists
    if(-not (Test-Path (Join-Path $RootDir ".git"))) {
      Write-Warn "No git repository detected, initializing..."
      git init
      git branch -M $GitBranch
      
      # Configure remote repository
      Write-Warn "Adding remote repository: $GitRemote"
      git remote add origin $GitRemote
    }
    
    # Check .gitignore file
    if(Test-Path (Join-Path $RootDir ".gitignore")) {
      $gi = Get-Content (Join-Path $RootDir ".gitignore") -ErrorAction SilentlyContinue
      if($gi -and ($gi | Where-Object { $_ -match '^docs\/?$' }).Count -gt 0) {
        Write-Warn "docs/ appears in .gitignore, please remove this line to allow deployment."
      }
    }
    
    # Add and commit changes
    git add docs
    $status = git status --porcelain | Out-String
    
    if([string]::IsNullOrWhiteSpace($status)) {
      Write-Info "No changes to commit."
    } else {
      $ts = Get-Date -Format 'yyyy-MM-dd HH:mm'
      git commit -m "Publish site (docs) $ts"
      
      # Push changes
      Write-Info "Pushing to $GitRemote $GitBranch"
      git push -u origin $GitBranch
      
      Write-Info "Push completed! Please set Pages source to: $GitBranch /docs in GitHub"
    }
  } catch {
    Write-Err $_.Exception.Message
    throw
  } finally {
    Pop-Location
  }
}

# Show help information
function Show-Help() {
  Write-Host "FamilyTree4 Global Management Script" -ForegroundColor Green
  Write-Host "Usage:" -ForegroundColor Green
  Write-Host "  .\scripts\global_manage.ps1 clean  # Clean project files (docs directory, Hexo database and generated files)" -ForegroundColor Green
  Write-Host "  .\scripts\global_manage.ps1 build  # Build entire project (generate Hexo content, copy all necessary files to docs)" -ForegroundColor Green
  Write-Host "  .\scripts\global_manage.ps1 push   # Commit and push changes to GitHub (automatically handle git repository and remote config)" -ForegroundColor Green
  Write-Host "" -ForegroundColor Green
  Write-Host "Environment variables:" -ForegroundColor Green
  Write-Host "  FT4_REMOTE  # Custom Git remote repository name (default: origin)" -ForegroundColor Green
  Write-Host "  FT4_BRANCH  # Custom Git branch name (default: main)" -ForegroundColor Green
}

# Execute command
try {
  switch ($Command.ToLower()) {
    "clean" { Invoke-Clean }
    "build" { Invoke-Build }
    "push"  { Invoke-Push }
    default { Show-Help }
  }
} catch {
  Write-Err $_.Exception.Message
  exit 1
}