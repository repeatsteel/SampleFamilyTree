# FamilyTree4 站点管理脚本
# - 提供清理、构建、打包、部署与一键发布(release)命令
# - PathMode: relative(推荐，支持离线file://与GitHub Pages)、absolute(需服务器根路径)、docs(主要用于本地预览)
# - Quick-Release: clean + build + package，默认PathMode=relative
param(
  [Parameter(Position=0)] [string] $Command = "help",
  [Parameter(Position=1)] [string] $ProfileOrPathMode = "",
  [Parameter(Position=2)] [ValidateSet("relative","absolute","docs")] [string] $PathMode = "docs"
)

$ErrorActionPreference = "Stop"
# Ensure UTF-8 output in PowerShell 5 console to properly render Chinese text
try {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

function Write-Info($msg){ Write-Host ("[INFO] " + $msg) -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host ("[WARN] " + $msg) -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host ("[ERROR] " + $msg) -ForegroundColor Red }

# Paths
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

function Ensure-Command($name){
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if(-not $cmd){ throw "Required command '$name' not found in PATH." }
}

function Ensure-Exists($path, $desc){ if(-not (Test-Path $path)){ throw "$desc not found: $path" } }

function Clean-Site(){
  Write-Info "Cleaning docs and hexo public/db"
  if(Test-Path $DocsDir){ Remove-Item $DocsDir -Recurse -Force }
  if(Test-Path (Join-Path $HexoDir "db.json")){ Remove-Item (Join-Path $HexoDir "db.json") -Force }
  if(Test-Path $HexoPublicDir){ Remove-Item $HexoPublicDir -Recurse -Force }
  Write-Info "Clean completed."
}

function Build-Stories(){
  Write-Info "Generating Hexo stories"
  Ensure-Command "npx"
  Ensure-Exists $HexoDir "Hexo directory"
  Push-Location $HexoDir
  try{
    npx hexo generate
    Ensure-Exists $HexoPublicDir "Hexo public"
    Write-Info "Hexo generated: $HexoPublicDir"
  } finally { Pop-Location }
}

function Copy-Base(){
  Write-Info "Preparing docs: $DocsDir"
  if(Test-Path $DocsDir){ Remove-Item $DocsDir -Recurse -Force }
  New-Item -ItemType Directory -Path $DocsDir | Out-Null
  # Base files
  Ensure-Exists $IndexFile "index.html"
  Copy-Item -Path $IndexFile -Destination $DocsDir -Force
  if(Test-Path $CssDir){ Copy-Item -Path $CssDir -Destination $DocsDir -Recurse -Force }
  # 仅拷贝站点运行所需的lib文件，避免携带未使用库(jquery/chart/orgchart等)
  if(Test-Path $LibDir){
    $DestLib = Join-Path $DocsDir "lib"
    New-Item -ItemType Directory -Path $DestLib -Force | Out-Null
    foreach($name in @("font-awesome.min.css","familytree.js","tailwindcss.min.js")){
      $src = Join-Path $LibDir $name
      if(Test-Path $src){ Copy-Item -Path $src -Destination $DestLib -Force }
    }
  }
  if(Test-Path $FontsDir){ Copy-Item -Path $FontsDir -Destination $DocsDir -Recurse -Force }
  Write-Info "Base copied (index/css/lib selected/fonts)."
}

function Copy-Members(){
  # Members data & related JS
  if(Test-Path $DataDir){ Copy-Item -Path $DataDir -Destination $DocsDir -Recurse -Force }
  if(Test-Path $JsDir){
    New-Item -ItemType Directory -Path (Join-Path $DocsDir "js") -Force | Out-Null
    Copy-Item -Path (Join-Path $JsDir "members_db.js") -Destination (Join-Path $DocsDir "js") -Force -ErrorAction SilentlyContinue
  }
  Write-Info "Members module copied (Data + js/members_db.js)."
}

function Copy-Tree(){
  # Tree rendering JS and dependencies
  if(Test-Path $JsDir){
    New-Item -ItemType Directory -Path (Join-Path $DocsDir "js") -Force | Out-Null
    Copy-Item -Path (Join-Path $JsDir "app.js") -Destination (Join-Path $DocsDir "js") -Force -ErrorAction SilentlyContinue
  }
  Write-Info "Tree module copied (js/app.js)."
}

function Copy-Stories-To-Docs(){
  Ensure-Exists $HexoPublicDir "Hexo public"
  if(-not (Test-Path $DocsDir)){ New-Item -ItemType Directory -Path $DocsDir | Out-Null }
  $Dest = Join-Path $DocsDir "hexo_site\public"
  Write-Info "Copying Hexo public => $Dest"
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  Copy-Item -Path (Join-Path $HexoPublicDir '*') -Destination $Dest -Recurse -Force
  New-Item -ItemType File -Path (Join-Path $DocsDir ".nojekyll") -Force | Out-Null
  Write-Info "Stories copied and .nojekyll created."
}

function Patch-IframeSrc(){
  $DocsAppJs = Join-Path $DocsDir "js\app.js"
  if(-not (Test-Path $DocsAppJs)){ Write-Warn "docs/js/app.js not found; skip iframe src patch."; return }
  # Read as UTF-8 to avoid mojibake breaking JS template strings
  $content = [System.IO.File]::ReadAllText($DocsAppJs, [System.Text.Encoding]::UTF8)
  $targetRel = "hexo_site/public/index.html"
  $targetAbs = "/hexo_site/public/index.html"
  $targetDocs = "/docs/index.html"
  switch ($PathMode){
    "relative" { $newSrc = $targetRel }
    "absolute" { $newSrc = $targetAbs }
    "docs"     { $newSrc = $targetDocs }
  }
  # Replace generic paths regardless of surrounding quotes/attributes
  $content = $content -replace '/hexo_site/public/index.html', $newSrc
  $content = $content -replace '/docs/index.html', $newSrc
  # Write back as UTF-8 to preserve Chinese text
  [System.IO.File]::WriteAllText($DocsAppJs, $content, [System.Text.Encoding]::UTF8)
  Write-Info "Patched iframe src in docs/js/app.js => $newSrc"
}

function Build-All(){
  Build-Stories
  Copy-Base
  Copy-Members
  Copy-Tree
  Copy-Stories-To-Docs
  Patch-IframeSrc
  Write-Info "Full site build completed. Output: $DocsDir"
}

function Quick-Release([string] $zipName = "", [ValidateSet("relative","absolute","docs")] [string] $pathMode = "relative"){
  Write-Info "Quick release: clean + build($pathMode) + package"
  # Clean to avoid stale outputs
  Clean-Site
  # Override global PathMode for this run
  $Global:PathMode = $pathMode
  # Full build
  Build-All
  # Default zip name if not provided
  if([string]::IsNullOrWhiteSpace($zipName)){
    $zipName = ("site_{0}.zip" -f (Get-Date).ToString("yyyyMMdd_HHmm"))
  }
  # Reuse existing Package-Docs logic (reads $ProfileOrPathMode as zip name)
  $Global:ProfileOrPathMode = $zipName
  Package-Docs
  Write-Info ("Quick release done. Zip: " + (Join-Path $RootDir $zipName))
}

function Package-Docs(){
  if(-not (Test-Path $DocsDir)){ throw "docs directory not found: $DocsDir" }
  $zipName = $ProfileOrPathMode
  if([string]::IsNullOrWhiteSpace($zipName)){
    $zipName = ("site_{0}.zip" -f (Get-Date).ToString("yyyyMMdd_HHmm"))
  }
  $DestZip = Join-Path $RootDir $zipName
  if(Test-Path $DestZip){ Remove-Item $DestZip -Force }
  Write-Info "Packaging docs => $DestZip"
  Compress-Archive -Path (Join-Path $DocsDir '*') -DestinationPath $DestZip -Force
  Write-Info "Package created: $DestZip"
}

function Prepare-Stories(){
  Write-Info "Preparing only Hexo output to docs/hexo_site/public"
  Build-Stories
  Copy-Stories-To-Docs
  Write-Info "Prepare done (stories only)."
}

function Build-Profile($profile){
  if([string]::IsNullOrWhiteSpace($profile)){ throw "Profile name required" }
  switch($profile.ToLower()){
    "members+tree" {
      Copy-Members
      Copy-Tree
      Patch-IframeSrc
    }
    "basic+members+tree" {
      Copy-Base
      Copy-Members
      Copy-Tree
      Patch-IframeSrc
    }
    "stories+basic" {
      Build-Stories
      Copy-Base
      Copy-Stories-To-Docs
      Patch-IframeSrc
    }
    "basic+members" {
      Copy-Base
      Copy-Members
      Patch-IframeSrc
    }
    "members+stories" {
      Copy-Members
      Build-Stories
      Copy-Stories-To-Docs
      Patch-IframeSrc
    }
    "basic+stories+tree" {
      Copy-Base
      Build-Stories
      Copy-Stories-To-Docs
      Copy-Tree
      Patch-IframeSrc
    }
    "all" {
      Build-Stories
      Copy-Base
      Copy-Members
      Copy-Tree
      Copy-Stories-To-Docs
      Patch-IframeSrc
    }
    default { throw "Unknown profile: $profile (supported: members+tree, basic+members+tree, stories+basic, basic+members, members+stories, basic+stories+tree, all)" }
  }
  Write-Info "Profile '$profile' completed => $DocsDir"
}

function Show-Help(){
  Write-Host "Usage (简化命令):" -ForegroundColor Green
  Write-Host "  一键发布(清理+构建+打包，默认relative):" -ForegroundColor Green
  Write-Host "    .\\scripts\\site_manage.ps1 release [zipName] [relative|absolute|docs]" -ForegroundColor Green
  Write-Host "  全量构建(可选路径模式):" -ForegroundColor Green
  Write-Host "    .\\scripts\\site_manage.ps1 build [relative|absolute|docs]" -ForegroundColor Green
  Write-Host "  其他模块化命令:" -ForegroundColor Green
  Write-Host "    .\\scripts\\site_manage.ps1 clean | stories | basic | members | tree | prepare | package" -ForegroundColor Green
  Write-Host "    .\\scripts\\site_manage.ps1 profile <combo> [relative|absolute|docs]" -ForegroundColor Green
  Write-Host "    .\\scripts\\site_manage.ps1 deploy [relative|absolute|docs] [push|dry-run]" -ForegroundColor Green
}

try{
  switch ($Command.ToLower()){
    'build'   { if(-not [string]::IsNullOrWhiteSpace($ProfileOrPathMode)){ $PathMode = $ProfileOrPathMode }; Build-All }
    'release' {
      # Simplified one-liner: clean + build + package
      # If the second param PathMode is not provided, default to 'relative'
      if(-not ($PathMode -in @('relative','absolute','docs'))){ $PathMode = 'relative' }
      # If the first param equals a PathMode, treat it as PathMode and clear zip name
      if($ProfileOrPathMode -in @('relative','absolute','docs')){ $PathMode = $ProfileOrPathMode; $ProfileOrPathMode = '' }
      Quick-Release $ProfileOrPathMode $PathMode
    }
    'clean'   { Clean-Site }
    'stories' { Build-Stories }
    'basic'   { Copy-Base }
    'members' { Copy-Members }
    'tree'    { Copy-Tree }
    'prepare' { Prepare-Stories }
    'package' { Package-Docs }
    'deploy'  {
      $doPush = $false
      $dryRun = $false
      if($ProfileOrPathMode){
        $val = $ProfileOrPathMode.ToLower()
        if($val -eq 'push'){ $doPush = $true }
        elseif($val -eq 'dry-run'){ $dryRun = $true }
        elseif($ProfileOrPathMode -in @('relative','absolute','docs')){ $PathMode = $ProfileOrPathMode }
      }
      Build-All
      $remote = if($env:FT4_REMOTE){ $env:FT4_REMOTE } else { 'origin' }
      $branch = if($env:FT4_BRANCH){ $env:FT4_BRANCH } else { 'main' }
      $dryRun = $dryRun -or ($env:FT4_DRYRUN -and $env:FT4_DRYRUN.ToLower() -eq 'true')
      if($doPush -or $dryRun){
        if($dryRun){
          Write-Info 'Dry-run: would run:'
          Write-Host '  git add docs' -ForegroundColor Yellow
          Write-Host '  git commit -m "Publish site (docs) YYYY-MM-DD HH:MM"' -ForegroundColor Yellow
          Write-Host ("  git push {0} {1}" -f $remote, $branch) -ForegroundColor Yellow
        } else {
          Ensure-Command 'git'
          Push-Location $RootDir
          try{
            $status = & git status --porcelain docs
            if([string]::IsNullOrWhiteSpace($status)){
              Write-Warn 'No changes in docs/. Skip commit and push.'
            } else {
              git add docs
              $ts = Get-Date -Format 'yyyy-MM-dd HH:mm'
              git commit -m ("Publish site (docs) " + $ts)
              git push $remote $branch
              Write-Info "Pushed to $remote $branch (docs/)"
            }
          } catch {
            Write-Err $_.Exception.Message
            throw
          } finally { Pop-Location }
        }
      } else {
        Write-Warn "Push disabled. To push: .\\scripts\\site_manage.ps1 deploy push [relative|absolute|docs] (remote/branch via FT4_REMOTE/FT4_BRANCH). For dry-run: set FT4_DRYRUN=true or use 'dry-run'."
      }
    }
    'profile' { Build-Profile $ProfileOrPathMode }
    default    { Show-Help }
  }
} catch {
  Write-Err $_.Exception.Message
  exit 1
}