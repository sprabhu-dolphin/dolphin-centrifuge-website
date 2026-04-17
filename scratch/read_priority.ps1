$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open("C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\page-priority-tracker.xlsx")
$ws = $wb.Sheets.Item(1)

for ($row = 1; $row -le 30; $row++) {
    $c1 = $ws.Cells.Item($row, 1).Text
    $c2 = $ws.Cells.Item($row, 2).Text
    $c3 = $ws.Cells.Item($row, 3).Text
    $c4 = $ws.Cells.Item($row, 4).Text
    if ($c1 -eq '' -and $row -gt 2) { break }
    Write-Output "$c1 | $c2 | $c3 | $c4"
}

$wb.Close($false)
$excel.Quit()
