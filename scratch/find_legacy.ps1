# Search for the used-oil-centrifuge PAGE (not attachment, not plant)
$lines = Get-Content 'LW.xml'
$totalLines = $lines.Count

for ($i = 0; $i -lt $totalLines; $i++) {
    if ($lines[$i] -match '<title>.*Used Oil Centrifuge.*</title>' -and $lines[$i] -notmatch 'plant' -and $lines[$i] -notmatch 'Reconditioned' -and $lines[$i] -notmatch 'MAPX') {
        $start = [Math]::Max(0, $i - 2)
        $end = [Math]::Min($totalLines - 1, $i + 80)
        Write-Output "=== FOUND at line $($i+1) ==="
        for ($j = $start; $j -le $end; $j++) {
            $line = $lines[$j]
            if ($line.Length -gt 500) { $line = $line.Substring(0, 500) + "..." }
            Write-Output "L$($j+1): $line"
        }
        Write-Output "=== END ==="
        Write-Output ""
    }
}
