[xml]$xml = Get-Content 'LW.xml' -Raw
$items = $xml.rss.channel.item | Where-Object {
    $_.post_type -eq 'page' -and
    $_.link -match '/used-oil-centrifuge/' -and
    $_.link -notmatch 'used-oil-centrifuge-plant'
}

foreach ($item in $items) {
    Write-Output "=== TITLE ==="
    Write-Output $item.title
    Write-Output "=== LINK ==="
    Write-Output $item.link
    Write-Output ""

    Write-Output "=== ALL POSTMETA KEYS ==="
    foreach ($pm in $item.postmeta) {
        $key = $pm.meta_key
        if ($key -match 'desc|title|seo|rank_math|yoast|focus') {
            Write-Output "$key = $($pm.meta_value)"
        }
    }
    Write-Output ""

    Write-Output "=== CONTENT (first 3000 chars) ==="
    $content = $item.encoded.'#cdata-section'
    if (-not $content) { $content = $item.encoded }
    if ($content) {
        Write-Output $content.Substring(0, [Math]::Min(3000, $content.Length))
    }
    Write-Output ""
    Write-Output "=== STATUS ==="
    Write-Output $item.status
}
