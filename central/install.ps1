$ErrorActionPreference = 'Stop'
$launcher = Join-Path $PSScriptRoot 'start-hidden.vbs'
if (-not (Test-Path -LiteralPath $launcher)) { throw 'Central launcher is missing.' }
$action = New-ScheduledTaskAction -Execute "$env:WINDIR\System32\wscript.exe" -Argument ('"' + $launcher + '"') -WorkingDirectory $PSScriptRoot
$user = "$env:USERDOMAIN\$env:USERNAME"
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Dolphin Central' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Private Dolphin Central answer engine. Reads the one NAS knowledge library and serves the local office page.' -Force | Out-Null
Start-ScheduledTask -TaskName 'Dolphin Central'
Write-Output 'Dolphin Central is configured to start at sign-in.'
