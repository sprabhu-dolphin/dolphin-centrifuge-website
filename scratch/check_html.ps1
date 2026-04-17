$html = (Invoke-WebRequest -Uri 'http://localhost:4321/used-oil-centrifuge/' -UseBasicParsing).Content

if ($html -match 'Rated Capacity') { Write-Output "FAIL: 'Rated Capacity' still present" } else { Write-Output "OK: 'Rated Capacity' removed" }
if ($html -match 'gt;gt;gt;') { Write-Output "OK: '>>>' present" } else { Write-Output "FAIL: '>>>' missing" }
if ($html -match '180 F') { Write-Output "OK: '180 F' correct" } else { Write-Output "FAIL: '180 F' missing" }
if ($html -match 'distinction matters') { Write-Output "FAIL: invented paragraph still there" } else { Write-Output "OK: invented paragraph gone" }
if ($html -match 'Click to Enlarge') { Write-Output "FAIL: 'Click to Enlarge' still there" } else { Write-Output "OK: 'Click to Enlarge' gone" }
if ($html -match 'Two-Stage Process Flow') { Write-Output "FAIL: Process cards still there" } else { Write-Output "OK: Process cards gone" }
