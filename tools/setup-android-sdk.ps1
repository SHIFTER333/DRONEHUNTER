# One-time Android SDK setup for headless APK builds
$ErrorActionPreference = "Stop"
$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip"
$zipPath = "$env:TEMP\android-cmdline-tools.zip"
$extractDir = "$env:TEMP\android-cmdline-tools-extract"

Write-Host "SDK root: $sdkRoot"
New-Item -ItemType Directory -Force -Path "$sdkRoot\cmdline-tools\latest" | Out-Null

if (-not (Test-Path "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat")) {
  Write-Host "Downloading command-line tools..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
  if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
  Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
  $inner = Get-ChildItem $extractDir -Directory | Select-Object -First 1
  Copy-Item -Path "$($inner.FullName)\*" -Destination "$sdkRoot\cmdline-tools\latest" -Recurse -Force
}

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$sdkmanager = "$sdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "Installing SDK packages (may take several minutes)..."
$yes = ("y`n" * 200)
$yes | & $sdkmanager --sdk_root=$sdkRoot --licenses 2>&1 | Out-Null
& $sdkmanager --sdk_root=$sdkRoot "platform-tools" "platforms;android-35" "build-tools;35.0.0"
Write-Host "Done. ANDROID_HOME=$sdkRoot"
