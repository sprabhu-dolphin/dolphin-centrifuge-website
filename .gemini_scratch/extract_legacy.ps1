$x = [xml](Get-Content 'LW.xml' -Raw)
foreach($i in $x.rss.channel.item) {
    if($i.link -match 'alfa-laval-industrial-centrifuges') {
        $i.OuterXml | Out-File '.gemini_scratch\legacy-alfa-laval-industrial-centrifuges.txt' -Encoding UTF8
    }
}
