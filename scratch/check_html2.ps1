$html = (Invoke-WebRequest -Uri 'http://localhost:4321/used-oil-centrifuge/' -UseBasicParsing).Content

# Find the table section
$tableStart = $html.IndexOf('Centrifuge Model')
if ($tableStart -gt 0) {
    $snippet = $html.Substring($tableStart, [Math]::Min(500, $html.Length - $tableStart))
    Write-Output "TABLE SECTION:"
    Write-Output $snippet
} else {
    Write-Output "TABLE NOT FOUND in HTML"
}

# Check for Rated Capacity
$rcIdx = $html.IndexOf('Rated Capacity')
if ($rcIdx -gt 0) {
    $rcSnippet = $html.Substring([Math]::Max(0,$rcIdx-50), 200)
    Write-Output ""
    Write-Output "RATED CAPACITY FOUND AT:"
    Write-Output $rcSnippet
} else {
    Write-Output "Rated Capacity NOT in HTML"
}
