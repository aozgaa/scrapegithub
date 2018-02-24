$block = {
    Param([string] $pathToScript, [string] $scrapeDataPath, [string] $ownerName)
    & node $pathToScript $scrapeDataPath $ownerName
}
#Remove all jobs
Get-Job | Remove-Job
$MaxThreads = 8
$repoFullPath = $(Get-Item .).fullName
$pathToScript = Join-Path -Path $repoFullPath -ChildPath "bin\getDocComments.js"
$scrapeDataPath = Join-Path -Path $repoFullPath -ChildPath "data"

$dirObjs = Get-ChildItem -Directory .\data\repos
foreach ($dirObj in $dirObjs) {
    While ($(Get-Job -state running).count -ge $MaxThreads) {
        Start-Sleep -Milliseconds 3
    }

    # working directory is changed by start job, so we supply an unqualified paths.
    Start-Job -Scriptblock $block -ArgumentList $pathToScript, $scrapeDataPath, $dirObj.name
}
#Wait for all jobs to finish.
While ($(Get-Job -State Running).count -gt 0) {
    start-sleep 1
}
#Get information from each job.
foreach ($job in Get-Job) {
    $info = Receive-Job -Id ($job.Id)
    Write-Output $info
}
#Remove all jobs created.
Get-Job | Remove-Job
