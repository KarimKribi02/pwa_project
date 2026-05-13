$json = '{"id_commande":1,"id_utilisateur":1}'
Set-Content -Path .\tmp_invoice.json -Value $json
$body = Get-Content -Path .\tmp_invoice.json -Raw

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/addFacture' -Method Post -ContentType 'application/json' -Body $body
    Write-Output 'SUCCESS'
    Write-Output $response
} catch {
    Write-Output 'ERROR'
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Output $reader.ReadToEnd()
    }
}

Remove-Item .\tmp_invoice.json
