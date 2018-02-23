#Remove all jobs
Get-Job | Remove-Job
$MaxThreads = 8
$repoFullPath = $(Get-Item .).fullName
$pathToScript = Join-Path -Path $repoFullPath -ChildPath "bin\getTagStats.js"

$block = {
    Param([string] $pathToScript, [string] $jsonName)
    & node $pathToScript $jsonName
}

$commentJsonsDir = Join-Path -Path $repoFullPath -ChildPath "data\docComments"
$commentJsons = Get-ChildItem -File $commentJsonsDir
foreach ($commentJson in $commentJsons) {
    While ($(Get-Job -state running).count -ge $MaxThreads) {
        Start-Sleep -Milliseconds 3
    }
    # & node $pathToScript $commentJson.name
    # working directory is changed by start job, so we supply an unqualified path.
    Start-Job -Scriptblock $block -ArgumentList $pathToScript, $commentJson.name
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

