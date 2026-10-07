$ErrorActionPreference = 'Stop'

$runtimeRoot = Join-Path $env:LOCALAPPDATA 'ParaBankIsolated'
$downloads = Join-Path $runtimeRoot 'downloads'
$sourceRoot = Join-Path $runtimeRoot 'source'
$jdkArchive = Join-Path $downloads 'temurin-21.zip'
$mavenArchive = Join-Path $downloads 'maven-3.9.11.zip'
$tomcatArchive = Join-Path $downloads 'tomcat-11.0.26.zip'
$sourceRevision = 'd9ff65e4447942c4e2b55cfa9a36ff478b032b80'
$baseUrl = 'http://127.0.0.1:8080/parabank/'

$existingListener = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($existingListener) {
  $runningInstance = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 3
  if ($runningInstance.StatusCode -eq 200) {
    Write-Output "Isolated ParaBank is already ready at $baseUrl"
    exit 0
  }
  throw "Port 8080 is occupied, but ParaBank did not respond at $baseUrl."
}

New-Item -ItemType Directory -Force -Path $runtimeRoot, $downloads | Out-Null

function Expand-PortableArchive([string]$ArchivePath, [string]$Destination, [string]$ExecutableRelativePath) {
  if (-not (Test-Path -LiteralPath $Destination)) {
    Expand-Archive -LiteralPath $ArchivePath -DestinationPath $Destination
  }
  $executable = Get-ChildItem -LiteralPath $Destination -Filter ([IO.Path]::GetFileName($ExecutableRelativePath)) -File -Recurse |
    Where-Object { $_.FullName.EndsWith($ExecutableRelativePath, [StringComparison]::OrdinalIgnoreCase) } |
    Select-Object -First 1
  if (-not $executable) {
    throw "Could not find $ExecutableRelativePath after extracting $ArchivePath"
  }
  return $executable.Directory.Parent.FullName
}

if (-not (Test-Path -LiteralPath $jdkArchive)) {
  Invoke-WebRequest -Uri 'https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse' -OutFile $jdkArchive
}
if (-not (Test-Path -LiteralPath $mavenArchive)) {
  Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.zip' -OutFile $mavenArchive
}
if (-not (Test-Path -LiteralPath $tomcatArchive)) {
  Invoke-WebRequest -Uri 'https://dlcdn.apache.org/tomcat/tomcat-11/v11.0.26/bin/apache-tomcat-11.0.26-windows-x64.zip' -OutFile $tomcatArchive
}

$jdkHome = Expand-PortableArchive $jdkArchive (Join-Path $runtimeRoot 'jdk') 'bin\java.exe'
$mavenHome = Expand-PortableArchive $mavenArchive (Join-Path $runtimeRoot 'maven') 'bin\mvn.cmd'
$tomcatHome = Expand-PortableArchive $tomcatArchive (Join-Path $runtimeRoot 'tomcat') 'bin\catalina.bat'

if (-not (Test-Path -LiteralPath $sourceRoot)) {
  git clone --no-checkout https://github.com/parasoft/parabank.git $sourceRoot
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not clone the official ParaBank source.'
  }
}
$currentRevision = (& git -C $sourceRoot rev-parse HEAD 2>$null).Trim()
if ($currentRevision -ne $sourceRevision -or -not (Test-Path -LiteralPath (Join-Path $sourceRoot 'pom.xml'))) {
  & git -C $sourceRoot checkout --detach $sourceRevision
  if ($LASTEXITCODE -ne 0) {
    throw "Could not check out ParaBank revision $sourceRevision."
  }
}

$env:JAVA_HOME = $jdkHome
$env:PATH = "$jdkHome\bin;$mavenHome\bin;$env:PATH"
Write-Output "Building official ParaBank revision $sourceRevision with Java 21."
$previousLocation = Get-Location
try {
  Set-Location -LiteralPath $sourceRoot
  & (Join-Path $mavenHome 'bin\mvn.cmd') -B '-Dmaven.test.skip=true' clean package
} finally {
  Set-Location -LiteralPath $previousLocation
}
if ($LASTEXITCODE -ne 0) {
  throw 'ParaBank Maven build failed; see Maven output above.'
}

$warPath = Get-ChildItem -LiteralPath (Join-Path $sourceRoot 'target') -Filter 'parabank-*.war' -File |
  Select-Object -First 1
if (-not $warPath) {
  throw "Build succeeded but no ParaBank WAR was found in $(Join-Path $sourceRoot 'target')"
}
Copy-Item -LiteralPath $warPath.FullName -Destination (Join-Path $tomcatHome 'webapps\parabank.war') -Force

$env:JAVA_HOME = $jdkHome
$env:JRE_HOME = $jdkHome
$env:CATALINA_HOME = $tomcatHome
$env:CATALINA_BASE = $tomcatHome
$env:PATH = "$jdkHome\bin;$env:PATH"
& (Join-Path $tomcatHome 'bin\startup.bat')

$deadline = (Get-Date).AddMinutes(4)
do {
  Start-Sleep -Seconds 3
  try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 8
    if ($response.StatusCode -eq 200) {
      Write-Output "Isolated ParaBank is ready at $baseUrl"
      Write-Output "Runtime files: $runtimeRoot"
      exit 0
    }
  } catch {
    if ((Get-Date) -ge $deadline) {
      throw "ParaBank did not become ready at $baseUrl. Check Tomcat logs under $(Join-Path $tomcatHome 'logs')."
    }
  }
} while ((Get-Date) -lt $deadline)

throw "ParaBank did not become ready at $baseUrl."
