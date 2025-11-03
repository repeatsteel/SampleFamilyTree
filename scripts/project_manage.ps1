# FamilyTree4 项目管理脚本（Hexo + GitHub Pages）
# - 提供 clean/generate/prepare/deploy/all 命令，面向 main/docs 部署
# - 结合 SSH 远程与 .nojekyll，配合 Pages 源：main /docs
param(
  [Parameter(Position=0)] [string] $Command = "help"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg){ Write-Host ("[INFO] " + $msg) -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host ("[WARN] " + $msg) -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host ("[ERROR] " + $msg) -ForegroundColor Red }

# Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir   = Split-Path -Parent $ScriptDir
$HexoDir   = Join-Path $RootDir "hexo_site"
$PublicDir = Join-Path $HexoDir "public"
$DocsDir   = Join-Path $RootDir "docs"

# Configure your repo SSH URL here (or ensure 'origin' remote is already set)
# Example: git@github.com:yourname/FamilyTree4.git
$RepoSSH   = "git@github.com:yourname/FamilyTree4.git"

function Ensure-Command($name){
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if(-not $cmd){ throw "Required command '$name' not found in PATH." }
}

function Invoke-HexoClean(){
  Write-Info "Running: hexo clean"
  Ensure-Command "npx"
  if(-not (Test-Path $HexoDir)){ throw "Hexo directory not found: $HexoDir" }
  Push-Location $HexoDir
  try{
    npx hexo clean
    Write-Info "Clean done (public folder removed, db cleared)."
  } finally { Pop-Location }
}

function Invoke-HexoGenerate(){
  Write-Info "Running: hexo generate"
  Ensure-Command "npx"
  if(-not (Test-Path $HexoDir)){ throw "Hexo directory not found: $HexoDir" }
  Push-Location $HexoDir
  try{
    npx hexo generate
    if(-not (Test-Path $PublicDir)){ throw "Hexo generate finished but public folder missing: $PublicDir" }
    Write-Info "Generate done: $PublicDir"
  } finally { Pop-Location }
}

function Copy-Public-To-Docs(){
  Write-Info "Preparing docs directory: $DocsDir"
  if(Test-Path $DocsDir){
    Write-Info "Removing existing docs directory"
    Remove-Item $DocsDir -Recurse -Force
  }
  New-Item -ItemType Directory -Path $DocsDir | Out-Null
  if(-not (Test-Path $PublicDir)){ throw "Public folder not found: $PublicDir (run 'generate' first)" }
  Write-Info "Copying hexo_site/public => docs"
  Copy-Item -Path (Join-Path $PublicDir '*') -Destination $DocsDir -Recurse -Force
  # Ensure GitHub Pages uses raw files and not Jekyll processing
  New-Item -ItemType File -Path (Join-Path $DocsDir ".nojekyll") -Force | Out-Null
  Write-Info "Docs prepared."
}

function Ensure-Git-Repo(){
  Ensure-Command "git"
  Push-Location $RootDir
  try{
    if(-not (Test-Path (Join-Path $RootDir ".git"))){
      Write-Warn "No git repo detected. Initializing new repository at $RootDir"
      git init
      # Ensure main branch
      git branch -M main
    }
    # Configure remote origin if missing
    $remotes = git remote | Out-String
    if($remotes -notmatch "(^|\n)origin(\n|$)"){
      Write-Warn "No 'origin' remote found. Adding origin: $RepoSSH"
      git remote add origin $RepoSSH
    }
  } finally { Pop-Location }
}

function Invoke-Deploy(){
  Write-Info "Deploying to GitHub Pages (main/docs) via SSH and native git"
  Copy-Public-To-Docs
  Ensure-Git-Repo
  Push-Location $RootDir
  try{
    # Ensure docs not ignored
    if(Test-Path (Join-Path $RootDir ".gitignore")){
      $gi = Get-Content (Join-Path $RootDir ".gitignore") -ErrorAction SilentlyContinue
      if($gi -and ($gi | Where-Object { $_ -match '^docs\/?$' }).Count -gt 0){
        Write-Warn "docs/ appears in .gitignore. Please remove that line to allow deployment."
      }
    }
    git add docs
    $status = git status --porcelain | Out-String
    if([string]::IsNullOrWhiteSpace($status)){
      Write-Info "No changes to commit."
    } else {
      git commit -m "chore(deploy): publish docs from hexo_site/public"
    }
    Write-Info "Pushing to origin main (SSH)"
    git push -u origin main
    Write-Info "Deploy finished. Configure GitHub Pages Source: main /docs"
  } finally { Pop-Location }
}

function Show-Help(){
  Write-Host "Project Manager (Hexo + GitHub Pages main/docs)" -ForegroundColor Green
  Write-Host "Usage:" -ForegroundColor Green
  Write-Host "  .\\scripts\\project_manage.ps1 clean      # hexo clean (remove hexo_site/public)"
  Write-Host "  .\\scripts\\project_manage.ps1 generate   # hexo generate (build hexo_site/public)"
  Write-Host "  .\\scripts\\project_manage.ps1 prepare    # copy public => docs only (no git)"
  Write-Host "  .\\scripts\\project_manage.ps1 deploy     # copy public => docs and push to main via SSH"
  Write-Host "  .\\scripts\\project_manage.ps1 all        # clean -> generate -> deploy"
  Write-Host "Notes:" -ForegroundColor Green
  Write-Host "  - Set Repo SSH URL in script variable: `$RepoSSH (default: git@github.com:yourname/FamilyTree4.git)"
  Write-Host "  - Ensure 'origin' remote is configured or the script will add it with `$RepoSSH"
  Write-Host "  - On GitHub, set Pages Source to: main /docs"
}

try{
  switch ($Command.ToLower()){
    "clean"    { Invoke-HexoClean }
    "generate" { Invoke-HexoGenerate }
    "prepare"  { Copy-Public-To-Docs }
    "deploy"   { Invoke-Deploy }
    "all"      { Invoke-HexoClean; Invoke-HexoGenerate; Invoke-Deploy }
    default    { Show-Help }
  }
} catch {
  Write-Err $_.Exception.Message
  exit 1
}