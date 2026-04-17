# Search for rank_math_schema near the used-oil-centrifuge page (post_id 13530)
# The FAQ shortcode references: [rank_math_rich_snippet id="s-bf07c4af-12bb-452f-833f-21a608b7552e"]
$lines = Get-Content 'LW.xml'
$totalLines = $lines.Count

# Search for rank_math_schema near post 13530 area (lines 122530-122800)
for ($i = 122530; $i -lt [Math]::Min($totalLines, 122900); $i++) {
    if ($lines[$i] -match 'rank_math_schema' -or $lines[$i] -match 'rich_snippet' -or $lines[$i] -match 'bf07c4af') {
        $start = [Math]::Max(0, $i - 1)
        $end = [Math]::Min($totalLines - 1, $i + 5)
        for ($j = $start; $j -le $end; $j++) {
            $line = $lines[$j]
            if ($line.Length -gt 800) { $line = $line.Substring(0, 800) + "..." }
            Write-Output "L$($j+1): $line"
        }
        Write-Output "---"
    }
}

# Also search broadly for that specific snippet ID
Write-Output ""
Write-Output "=== BROAD SEARCH for bf07c4af ==="
for ($i = 0; $i -lt $totalLines; $i++) {
    if ($lines[$i] -match 'bf07c4af') {
        $line = $lines[$i]
        if ($line.Length -gt 500) { $line = $line.Substring(0, 500) + "..." }
        Write-Output "L$($i+1): $line"
    }
}

Write-Output ""
Write-Output "=== SEARCH for 'used oil centrifuge' + 'FAQ' in rank_math_schema ==="
for ($i = 0; $i -lt $totalLines; $i++) {
    if ($lines[$i] -match 'rank_math_schema' -and $i -gt 122530 -and $i -lt 122900) {
        $line = $lines[$i]
        if ($line.Length -gt 1000) { $line = $line.Substring(0, 1000) + "..." }
        Write-Output "L$($i+1): $line"
    }
}
