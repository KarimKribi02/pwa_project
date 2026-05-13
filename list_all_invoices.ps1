$response = Invoke-RestMethod -Uri 'http://localhost:3001/api/AllFactures' -Method Get
Write-Output "Total invoices: $($response.Count)"
$response | ForEach-Object {
    Write-Output "Invoice: $($_.numero_facture) (ID: $($_.id))"
}
