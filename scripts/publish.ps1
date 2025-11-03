param(
  [ValidateSet('relative','absolute','docs')]
  [string] $PathMode = 'relative'
)

# One-click build and publish (optional push)
# Usage:
#   .\scripts\publish.ps1               # default PathMode=relative, with push
#   .\scripts\publish.ps1 docs          # build docs mode and push
#   .\scripts\publish.ps1 absolute      # build absolute mode and push
# Notes:
# - This script calls site_manage.ps1 deploy <PathMode> push
# - It will perform git add/commit/push to origin main. Ensure your remote/branch are correct.

$script = Join-Path $PSScriptRoot 'site_manage.ps1'
& $script -Command deploy -ProfileOrPathMode push -PathMode $PathMode