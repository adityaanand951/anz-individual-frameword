$ErrorActionPreference = 'Stop'

$runtimeRoot = Join-Path $env:LOCALAPPDATA 'ParaBankIsolated'
$tomcatHome = Get-ChildItem -LiteralPath (Join-Path $runtimeRoot 'tomcat') -Directory -Filter 'apache-tomcat-*' -ErrorAction SilentlyContinue |
  Select-Object -First 1
if (-not $tomcatHome) {
  Write-Output 'The isolated ParaBank Tomcat installation was not found.'
  exit 0
}

$javaHome = Get-ChildItem -LiteralPath (Join-Path $runtimeRoot 'jdk') -Directory -Filter 'jdk-*' -ErrorAction SilentlyContinue |
  Select-Object -First 1
if (-not $javaHome) {
  throw 'The isolated Java runtime was not found; cannot stop ParaBank cleanly.'
}

$env:JAVA_HOME = $javaHome.FullName
$env:JRE_HOME = $javaHome.FullName
$env:CATALINA_HOME = $tomcatHome.FullName
$env:CATALINA_BASE = $tomcatHome.FullName
& (Join-Path $tomcatHome.FullName 'bin\catalina.bat') stop 30
if ($LASTEXITCODE -ne 0) {
  throw 'Tomcat did not stop cleanly; inspect its logs before attempting process termination.'
}

$deadline = (Get-Date).AddSeconds(35)
do {
  Start-Sleep -Seconds 1
  $listener = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
  if (-not $listener) {
    Write-Output 'Isolated ParaBank has stopped.'
    exit 0
  }
} while ((Get-Date) -lt $deadline)

throw 'Tomcat stop was requested, but port 8080 is still listening.'
