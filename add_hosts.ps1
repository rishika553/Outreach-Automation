$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$entries = @(
    "",
    "# Supabase DNS fix",
    "104.18.38.10 zimxfyrgjohimdpyszuz.supabase.co",
    "104.18.38.10 postgres.zimxfyrgjohimdpyszuz.supabase.co",
    "52.74.252.201 aws-0-ap-southeast-1.pooler.supabase.com"
)
foreach ($line in $entries) {
    Add-Content -Path $hostsPath -Value $line
}
Write-Host "Hosts file updated successfully"
