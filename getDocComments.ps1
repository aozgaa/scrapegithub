$block = {
    Param([string] $pathToScript, [string] $ownerName)
    & node $pathToScript $ownerName
}
#Remove all jobs
Get-Job | Remove-Job
$MaxThreads = 8
$repoFullPath = $(Get-Item .).fullName
$pathToScript = Join-Path -Path $repoFullPath -ChildPath "out\getDocComments.js"

$dirObjs = Get-ChildItem -Directory .\repos
foreach ($dirObj in $dirObjs) {
    While ($(Get-Job -state running).count -ge $MaxThreads) {
        Start-Sleep -Milliseconds 3
    }

    # working directory is changed by start job, so we supply an unqualified path.
    Start-Job -Scriptblock $Block -ArgumentList $pathToScript $dirObj.name
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

