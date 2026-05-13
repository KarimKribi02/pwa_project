$json = '{"id_commande":1,"id_utilisateur":2}'
Set-Content -Path .\tmp_invoice2.json -Value $json
$body = Get-Content -Path .\tmp_invoice2.json -Raw

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/addFacture' -Method Post -ContentType 'application/json' -Body $body
    Write-Output 'SUCCESS - Invoice created'
    Write-Output "Invoice ID: $($response.id)"
    Write-Output "Invoice Number: $($response.numero_facture)"
} catch {
    Write-Output 'ERROR'
    Write-Output $_.Exception.Message
}

Remove-Item .\tmp_invoice2.json
