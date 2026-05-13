$response = Invoke-RestMethod -Uri 'http://localhost:3001/api/AllCommandes' -Method Get
Write-Output ($response | ConvertTo-Json -Depth 5)
