param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

function Get-ToolNamespaceCounts {
    param(
        [string]$CacheFile
    )

    if (-not (Test-Path $CacheFile)) {
        return [pscustomobject]@{
            Exists = $false
            File = $CacheFile
            LastWriteTime = $null
            TotalTools = 0
            Namespaces = @{}
        }
    }

    $raw = Get-Content -Raw $CacheFile | ConvertFrom-Json
    $tools = @($raw.tools)
    $groups = @{}

    foreach ($group in ($tools | Group-Object tool_namespace)) {
        $groups[$group.Name] = $group.Count
    }

    return [pscustomobject]@{
        Exists = $true
        File = $CacheFile
        LastWriteTime = (Get-Item $CacheFile).LastWriteTime
        TotalTools = $tools.Count
        Namespaces = $groups
    }
}

function Get-CodexProcessSummary {
    $processes = @(Get-Process | Where-Object { $_.ProcessName -match '^codex$|^Codex$' } | Sort-Object StartTime)
    if (-not $processes.Count) {
        return [pscustomobject]@{
            Count = 0
            OldestStart = $null
            NewestStart = $null
            OldestAgeHours = $null
        }
    }

    $oldest = $processes[0].StartTime
    $newest = $processes[-1].StartTime

    return [pscustomobject]@{
        Count = $processes.Count
        OldestStart = $oldest
        NewestStart = $newest
        OldestAgeHours = [math]::Round(((Get-Date) - $oldest).TotalHours, 2)
    }
}

function Test-WhamAppsReachability {
    param(
        [string]$AccessToken
    )

    $uri = "https://chatgpt.com/backend-api/wham/apps"
    $headers = @{
        Authorization = "Bearer $AccessToken"
        Accept = "application/json"
    }

    try {
        $response = Invoke-WebRequest -Method Get -Uri $uri -Headers $headers -TimeoutSec 20 -ErrorAction Stop
        return [pscustomobject]@{
            Reachable = $true
            StatusCode = [int]$response.StatusCode
            Detail = "Unexpected success from GET; endpoint is reachable."
        }
    } catch {
        $statusCode = $null
        $detail = $_.Exception.Message

        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $detail = "HTTP $statusCode"
        }

        $reachable = $statusCode -in @(200, 401, 403, 405)

        return [pscustomobject]@{
            Reachable = $reachable
            StatusCode = $statusCode
            Detail = $detail
        }
    }
}

$codexHome = Join-Path $HOME ".codex"
$authFile = Join-Path $codexHome "auth.json"
$cacheDir = Join-Path $codexHome "cache\codex_apps_tools"
$cacheFile = $null

if (Test-Path $cacheDir) {
    $cacheFile = (Get-ChildItem $cacheDir | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
}

$result = [ordered]@{
    checked_at = (Get-Date).ToString("s")
    auth_file = $authFile
    auth_mode = $null
    last_refresh = $null
    wham_apps = $null
    codex_processes = $null
    tool_cache = $null
    interpretation = @()
}

if (-not (Test-Path $authFile)) {
    $result.interpretation += "Missing ~/.codex/auth.json. Codex local auth state is not available."
} else {
    $auth = Get-Content -Raw $authFile | ConvertFrom-Json
    $result.auth_mode = $auth.auth_mode
    $result.last_refresh = $auth.last_refresh

    if ($auth.tokens.access_token) {
        $result.wham_apps = Test-WhamAppsReachability -AccessToken $auth.tokens.access_token
    } else {
        $result.wham_apps = [pscustomobject]@{
            Reachable = $false
            StatusCode = $null
            Detail = "No access_token found in auth.json"
        }
    }
}

$result.codex_processes = Get-CodexProcessSummary

if ($cacheFile) {
    $result.tool_cache = Get-ToolNamespaceCounts -CacheFile $cacheFile
} else {
    $result.tool_cache = [pscustomobject]@{
        Exists = $false
        File = $null
        LastWriteTime = $null
        TotalTools = 0
        Namespaces = @{}
    }
}

if ($result.wham_apps -and $result.wham_apps.Reachable) {
    $result.interpretation += "The wham/apps endpoint is reachable with the current local auth token. That points away from a simple no-internet failure."
} else {
    $result.interpretation += "The wham/apps endpoint was not confirmed reachable from this script. That points to auth, network, proxy, or backend trouble."
}

$gmailCount = 0
if ($result.tool_cache.Exists -and $result.tool_cache.Namespaces.ContainsKey("codex_apps__gmail")) {
    $gmailCount = [int]$result.tool_cache.Namespaces["codex_apps__gmail"]
}

if ($gmailCount -gt 0) {
    $result.interpretation += "The local codex_apps tool cache includes Gmail tools. Cached Gmail tools do not prove the live Codex app session is healthy."
} else {
    $result.interpretation += "No Gmail tools were found in the local codex_apps cache."
}

$result.interpretation += "The only reliable live-session proof is a fresh Gmail get_profile call from Codex itself."
$result.interpretation += "If this script says wham/apps is reachable but Codex get_profile still fails, the best fit is a stale Codex desktop connector session. Restart Codex first."

if ($Json) {
    $result | ConvertTo-Json -Depth 6
    exit 0
}

Write-Output "Codex Gmail Health Check"
Write-Output "Checked: $($result.checked_at)"
Write-Output ""
Write-Output "Auth"
Write-Output "  Mode: $($result.auth_mode)"
Write-Output "  Last refresh: $($result.last_refresh)"
Write-Output ""
Write-Output "wham/apps probe"
Write-Output "  Reachable: $($result.wham_apps.Reachable)"
Write-Output "  Status: $($result.wham_apps.StatusCode)"
Write-Output "  Detail: $($result.wham_apps.Detail)"
Write-Output ""
Write-Output "Codex processes"
Write-Output "  Count: $($result.codex_processes.Count)"
Write-Output "  Oldest start: $($result.codex_processes.OldestStart)"
Write-Output "  Newest start: $($result.codex_processes.NewestStart)"
Write-Output "  Oldest age hours: $($result.codex_processes.OldestAgeHours)"
Write-Output ""
Write-Output "Tool cache"
Write-Output "  Exists: $($result.tool_cache.Exists)"
Write-Output "  File: $($result.tool_cache.File)"
Write-Output "  Last write: $($result.tool_cache.LastWriteTime)"
Write-Output "  Total tools: $($result.tool_cache.TotalTools)"
foreach ($name in ($result.tool_cache.Namespaces.Keys | Sort-Object)) {
    Write-Output "  $name : $($result.tool_cache.Namespaces[$name])"
}
Write-Output ""
Write-Output "Interpretation"
foreach ($line in $result.interpretation) {
    Write-Output "  - $line"
}
