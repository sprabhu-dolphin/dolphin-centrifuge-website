$f = "c:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\src\pages\contact-for-alfa-laval-centrifuges.astro"
$lines = [System.IO.File]::ReadAllLines($f, [System.Text.Encoding]::UTF8)
# Remove lines 509-519 (0-indexed: 508-518) — the duplicate location section
$keep = $lines[0..507] + $lines[518..($lines.Length-1)]
[System.IO.File]::WriteAllLines($f, $keep, [System.Text.Encoding]::UTF8)
Write-Host "Duplicate location section removed. Total lines: $($keep.Length)"
