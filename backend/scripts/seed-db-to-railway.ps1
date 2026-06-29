# Seed local PostgreSQL data to Railway.
# Usage:
#   .\scripts\seed-db-to-railway.ps1
#   .\scripts\seed-db-to-railway.ps1 -MigrateOnly
#   .\scripts\seed-db-to-railway.ps1 -SkipMigrate

param(
    [switch]$SkipMigrate,
    [switch]$MigrateOnly,
    [string]$EnvFile = ".env.railway"
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location $RootDir

# #region agent log
function Write-DebugLog {
    param(
        [string]$HypothesisId,
        [string]$Location,
        [string]$Message,
        [hashtable]$Data
    )
    $logPath = Join-Path (Split-Path $RootDir -Parent) "debug-f8e050.log"
    $entry = [ordered]@{
        sessionId    = "f8e050"
        runId        = "pre-fix"
        hypothesisId = $HypothesisId
        location     = $Location
        message      = $Message
        data         = $Data
        timestamp    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    } | ConvertTo-Json -Compress
    Add-Content -Path $logPath -Value $entry -Encoding utf8
}
# #endregion

function Get-DumpFileDiagnostics {
    param([string]$Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    $first16 = @()
    foreach ($b in $bytes[0..([Math]::Min(15, $bytes.Length - 1))]) {
        $first16 += ('{0:X2}' -f $b)
    }
    $firstLine = ""
    if ($bytes.Length -gt 0) {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes[0..([Math]::Min(63, $bytes.Length - 1))])
        $firstLine = ($text -split "`n")[0]
    }
    return @{
        fileSize    = $bytes.Length
        first16Hex  = ($first16 -join ' ')
        hasUtf8Bom  = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
        firstLine   = $firstLine
        psVersion   = $PSVersionTable.PSVersion.ToString()
    }
}

function Load-EnvFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "Env file not found: $Path. Copy .env.railway.example to .env.railway and fill in credentials."
    }
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
        $parts = $_ -split '=', 2
        if ($parts.Count -eq 2) {
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

function Parse-PostgresUrl {
    param([string]$Url)
    $clean = ($Url -split '\?')[0]
    if ($clean -notmatch '^postgres(?:ql)?://([^:]+):([^@]+)@([^:/]+):(\d+)/([^/]+)$') {
        throw "Invalid PostgreSQL URL: $Url"
    }
    return @{
        User     = $Matches[1]
        Password = $Matches[2]
        Host     = $Matches[3]
        Port     = $Matches[4]
        Database = $Matches[5]
    }
}

function Invoke-RemotePsql {
    param(
        [hashtable]$Db,
        [string]$Sql,
        [string]$File
    )
    $prevPassword = $env:PGPASSWORD
    $env:PGPASSWORD = $Db.Password
    try {
        $args = @(
            "-h", $Db.Host,
            "-p", $Db.Port,
            "-U", $Db.User,
            "-d", $Db.Database,
            "-v", "ON_ERROR_STOP=1"
        )
        if ($Sql) {
            & psql @args -c $Sql
        } elseif ($File) {
            & psql @args -f $File
        }
        if ($LASTEXITCODE -ne 0) { throw "psql failed (exit $LASTEXITCODE)" }
    } finally {
        $env:PGPASSWORD = $prevPassword
    }
}

function Invoke-LocalPgDump {
    param([string]$OutFile)
    $container = $env:LOCAL_DB_CONTAINER
    if ($container -and (docker ps --format '{{.Names}}' | Select-String -Quiet "^${container}$")) {
        Write-Host "Dumping local data via docker exec ($container)..."
        $containerDump = "/tmp/sihp-seed-dump.sql"
        # #region agent log
        Write-DebugLog -HypothesisId "A" -Location "seed-db-to-railway.ps1:Invoke-LocalPgDump" -Message "dump_via_docker_cp_start" -Data @{ container = $container; outFile = $OutFile; method = "docker_cp" }
        # #endregion
        docker exec -e PGPASSWORD=postgres $container sh -c "pg_dump -U postgres -d sihp --schema=sihp --data-only --no-owner --no-acl --disable-triggers > $containerDump"
        if ($LASTEXITCODE -ne 0) { throw "pg_dump via docker failed" }
        docker cp "${container}:${containerDump}" $OutFile
        if ($LASTEXITCODE -ne 0) { throw "docker cp failed" }
        docker exec $container rm -f $containerDump | Out-Null
        # #region agent log
        $diag = Get-DumpFileDiagnostics -Path $OutFile
        $diag.runId = "post-fix"
        Write-DebugLog -HypothesisId "A,B,C" -Location "seed-db-to-railway.ps1:Invoke-LocalPgDump" -Message "dump_via_docker_cp_done" -Data $diag
        # #endregion
        return
    }

    $localUrl = $env:LOCAL_DATABASE_URL
    if (-not $localUrl) { $localUrl = "postgresql://postgres:postgres@localhost:5435/sihp" }
    Write-Host "Dumping local data via pg_dump..."
    & pg_dump "$localUrl" --schema=sihp --data-only --no-owner --no-acl --disable-triggers -f $OutFile
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed (exit $LASTEXITCODE)" }
}

function Invoke-RemoteMigrate {
    param([hashtable]$Db)
    $runtimeConfig = Join-Path $RootDir "migration\dbconfig.railway.runtime.yml"
    @"
railway:
  dialect: postgres
  datasource: host=$($Db.Host) dbname=$($Db.Database) user=$($Db.User) password=$($Db.Password) sslmode=require port=$($Db.Port)
  dir: files
  table: migrations
"@ | Set-Content -Path $runtimeConfig -Encoding utf8

    if (-not (Get-Command sql-migrate -ErrorAction SilentlyContinue)) {
        Write-Host "sql-migrate not found, installing..."
        go install github.com/rubenv/sql-migrate/...@latest
    }

    Push-Location (Join-Path $RootDir "migration")
    try {
        Write-Host "Running migrations on Railway..."
        sql-migrate up -config="dbconfig.railway.runtime.yml" -env=railway
        if ($LASTEXITCODE -ne 0) { throw "sql-migrate failed (exit $LASTEXITCODE)" }
    } finally {
        Pop-Location
    }
}

function Invoke-EnsureRemoteDatabase {
    param([hashtable]$Db)
    Write-Host "Ensuring database '$($Db.Database)' exists on Railway..."
    $prevPassword = $env:PGPASSWORD
    $env:PGPASSWORD = $Db.Password
    $env:PGSSLMODE = "require"
    try {
        $raw = & psql -h $Db.Host -p $Db.Port -U $Db.User -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$($Db.Database)';"
        if ($LASTEXITCODE -ne 0) { throw "Failed to check remote database (exit $LASTEXITCODE)" }
        $check = if ($null -eq $raw) { "" } else { ($raw | Out-String).Trim() }
        if ($check -ne "1") {
            Write-Host "Creating database '$($Db.Database)'..."
            & psql -h $Db.Host -p $Db.Port -U $Db.User -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE $($Db.Database);"
            if ($LASTEXITCODE -ne 0) { throw "CREATE DATABASE failed (exit $LASTEXITCODE)" }
        }
    } finally {
        $env:PGPASSWORD = $prevPassword
    }
}

function Invoke-RemoteTruncate {
    param([hashtable]$Db)
    Write-Host "Truncating remote sihp schema tables..."
    $sql = @"
DO `$`$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'sihp') LOOP
    EXECUTE 'TRUNCATE TABLE sihp.' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
  END LOOP;
END `$`$;
"@
    Invoke-RemotePsql -Db $Db -Sql $sql
}

# --- main ---
Load-EnvFile (Join-Path $RootDir $EnvFile)

$remoteUrl = $env:DATABASE_PUBLIC_URL
if (-not $remoteUrl) {
    throw "DATABASE_PUBLIC_URL is required in $EnvFile"
}

$remoteDb = Parse-PostgresUrl -Url $remoteUrl
$env:PGSSLMODE = "require"

Write-Host "=== SIHP DB Seeder: Local -> Railway ===" -ForegroundColor Cyan
Write-Host "Remote: $($remoteDb.Host):$($remoteDb.Port)/$($remoteDb.Database)"

if (-not $SkipMigrate) {
    Invoke-EnsureRemoteDatabase -Db $remoteDb
    Invoke-RemoteMigrate -Db $remoteDb
}

if ($MigrateOnly) {
    Write-Host "MigrateOnly: done." -ForegroundColor Green
    exit 0
}

$dumpFile = Join-Path $RootDir "scripts\.seed-dump.sql"
try {
    Invoke-LocalPgDump -OutFile $dumpFile

    # #region agent log
    $beforeRestore = Get-DumpFileDiagnostics -Path $dumpFile
    $beforeRestore.runId = "post-fix"
    Write-DebugLog -HypothesisId "A,E" -Location "seed-db-to-railway.ps1:main" -Message "before_psql_restore" -Data $beforeRestore
    # #endregion

    Write-Host "Testing remote connection..."
    Invoke-RemotePsql -Db $remoteDb -Sql "SELECT 1;"

    Invoke-RemoteTruncate -Db $remoteDb

    Write-Host "Restoring data to Railway..."
    Invoke-RemotePsql -Db $remoteDb -File $dumpFile

    Write-Host "Done. Local sihp schema data copied to Railway." -ForegroundColor Green
} finally {
    if (Test-Path $dumpFile) {
        Remove-Item $dumpFile -Force
    }
}
