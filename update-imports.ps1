# Update client imports script
$filePaths = Get-ChildItem -Path ".\apps\client\src" -Recurse -Include *.ts,*.tsx | Select-Object -ExpandProperty FullName

foreach ($filePath in $filePaths) {
    $content = Get-Content -Path $filePath -Raw
    
    # Replace @meal-planner/shared imports with shared imports
    $updatedContent = $content -replace "from\s+['""']@meal-planner\/shared['""']", "from 'shared'"
    
    # Replace @meal-planner/shared/something imports
    $updatedContent = $updatedContent -replace "from\s+['""']@meal-planner\/shared\/([^'""]+)['""']", "from 'shared/`$1'"
    
    if ($content -ne $updatedContent) {
        Set-Content -Path $filePath -Value $updatedContent -NoNewline
        Write-Host "Updated imports in $filePath"
    }
}

Write-Host "Import update process completed"
