function Copy-MSModule {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [ValidateScript({ Test-Path $_ })]
        [string]$SourcePath,

        [Parameter(Mandatory = $true)]
        [ValidateScript({ Test-Path $_ })]
        [string]$DestinationPath
    )

    try {
        Write-Verbose "Starting module copy from '$SourcePath' to '$DestinationPath'."

        Test-SourceFolderStructure -SourcePath $SourcePath -ErrorAction Stop
        Test-DestinationFolderStructure -SourcePath $SourcePath -DestinationPath $DestinationPath -ErrorAction Stop
        Copy-ModuleVersionFolders -SourcePath $SourcePath -DestinationPath $DestinationPath -ErrorAction Stop
        Remove-SourceFolders -SourcePath $SourcePath -ErrorAction Stop

        Write-Verbose "Module copy completed successfully from '$SourcePath' to '$DestinationPath'."
    }
    catch {
        Write-Verbose "Err: Error during module copy: $($_.Exception.Message)"
        Write-Error "Error during module copy: $($_.Exception.Message)"
    }
}

function Test-SourceFolderStructure {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$SourcePath
    )

    Write-Verbose "Validating source folder structure at '$SourcePath'..."

    $sourceFolders = Get-ChildItem -Path $SourcePath -Directory -Depth 0
    $sourceFiles = Get-ChildItem -Path $SourcePath -File

    if ($sourceFiles.Count -gt 0) {
        $errorMessage = "Source folder '$SourcePath' contains files. Only module folders are allowed."
        Write-Verbose "Err: $errorMessage"
        throw $errorMessage
    }
    Write-Verbose "No files found in '$SourcePath'."

    if ($sourceFolders.Count -eq 0) {
        $errorMessage = "Source folder '$SourcePath' is empty. At least one module folder is required."
        Write-Verbose "Err: $errorMessage"
        throw $errorMessage
    }
    Write-Verbose "Found $($sourceFolders.Count) module folders in '$SourcePath'."

    foreach ($folder in $sourceFolders) {
        if (-not ($folder.Name -match '^ms[a-zA-Z]+$')) {
            $errorMessage = "Module folder '$($folder.FullName)' does not follow naming convention (must start with 'ms' followed by alphabets)."
            Write-Verbose "Err: $errorMessage"
            throw $errorMessage
        }
        Write-Verbose "Module folder '$($folder.FullName)' follows naming convention."
        
        $versionFolders = Get-ChildItem -Path $folder.FullName -Directory
        $filesUnderVersionFolderLevel = Get-ChildItem -Path $folder.FullName -File
        if ($filesUnderVersionFolderLevel) {
            $errorMessage = "There should be only other version folders in the module folder. Files are not allowed."
            Write-Verbose "Err: $errorMessage"
            throw $errorMessage
        }
        if ($versionFolders.Count -eq 0) {
            $errorMessage = "Module folder '$($folder.FullName)' has no version subfolders."
            Write-Verbose "Err: $errorMessage"
            throw $errorMessage
        }
        Write-Verbose "Module folder '$($folder.FullName)' contains $($versionFolders.Count) version folders."

        foreach ($versionFolder in $versionFolders) {
            Test-VersionFolder -VersionFolder $versionFolder
        }
    }
}

function Test-VersionFolder {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [System.IO.DirectoryInfo]$VersionFolder
    )

    Write-Verbose "Validating version folder '$($VersionFolder.FullName)'..."

    if (-not ($VersionFolder.Name -as [version])) {
        $errorMessage = "Invalid version folder '$($VersionFolder.FullName)'. Folder name must be a valid version number."
        Write-Verbose "Err: $errorMessage"
        throw $errorMessage
    }
    Write-Verbose "Valid version folder '$($VersionFolder.FullName)'."

    $psd1File = Get-ChildItem -Path $VersionFolder.FullName -Filter *.psd1
    if (-not $psd1File) {
        $errorMessage = "Version folder '$($VersionFolder.FullName)' is missing a .psd1 file."
        Write-Verbose "Err: $errorMessage"
        throw $errorMessage
    }
    Write-Verbose "Found .psd1 file '$($psd1File.FullName)'."

    Test-Psd1Content -Psd1FilePath $psd1File.FullName -ExpectedVersion $VersionFolder.Name
}

function Test-Psd1Content {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$Psd1FilePath,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedVersion
    )

    Write-Verbose "Validating .psd1 file content in '$Psd1FilePath'..."

    try {
        $psd1Content = Import-PowerShellDataFile -Path $Psd1FilePath

        if ($psd1Content.ModuleVersion -ne $ExpectedVersion) {
            $errorMessage = "Version mismatch in '$Psd1FilePath'. Expected: '$ExpectedVersion', Found: '$($psd1Content.ModuleVersion)'."
            Write-Verbose "Err: $errorMessage"
            throw $errorMessage
        }
        Write-Verbose "Version in '$Psd1FilePath' matches expected version."
    }
    catch {
        $errorMessage = "Failed to validate .psd1 file at '$Psd1FilePath': $($_.Exception.Message)"
        Write-Verbose "Err: $errorMessage"
        Write-Error $errorMessage
    }
}

function Test-DestinationFolderStructure {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$SourcePath,

        [Parameter(Mandatory = $true)]
        [string]$DestinationPath
    )

    Write-Verbose "Validating destination folder structure at '$DestinationPath'..."

    $sourceFolders = Get-ChildItem -Path $SourcePath -Directory
    foreach ($folder in $sourceFolders) {
        foreach ($versionFolder in (Get-ChildItem -Path $folder.FullName -Directory)) {
            $destinationVersionPath = Join-Path -Path $DestinationPath -ChildPath "$($folder.Name)\$($versionFolder.Name)"

            if (Test-Path -Path $destinationVersionPath) {
                $errorMessage = "Destination folder '$destinationVersionPath' already exists. Cannot overwrite."
                Write-Verbose "Err: $errorMessage"
                throw $errorMessage
            }
            Write-Verbose "Destination folder '$destinationVersionPath' does not exist, safe to copy."
        }
    }
}

function Copy-ModuleVersionFolders {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param (
        [Parameter(Mandatory = $true)]
        [string]$SourcePath,

        [Parameter(Mandatory = $true)]
        [string]$DestinationPath
    )

    Write-Verbose "Copying module version folders from '$SourcePath' to '$DestinationPath'..."

    $sourceFolders = Get-ChildItem -Path $SourcePath -Directory
    foreach ($folder in $sourceFolders) {
        $destinationModulePath = Join-Path -Path $DestinationPath -ChildPath $folder.Name

        if (-not (Test-Path -Path $destinationModulePath)) {
            New-Item -Path $destinationModulePath -ItemType Directory | Out-Null
            Write-Verbose "Created module folder '$destinationModulePath'."
        }

        foreach ($versionFolder in (Get-ChildItem -Path $folder.FullName -Directory)) {
            $destinationVersionPath = Join-Path -Path $destinationModulePath -ChildPath $versionFolder.Name

            if ($PSCmdlet.ShouldProcess($destinationVersionPath, "Copy version folder")) {
                Write-Verbose "Copying '$($versionFolder.FullName)' to '$destinationVersionPath'."
                Copy-Item -Path $versionFolder.FullName -Destination $destinationVersionPath -Recurse -Force
            }
        }
    }
    Write-Verbose "Copy operation completed."
}

function Remove-SourceFolders {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$SourcePath
    )

    Write-Verbose "Removing source folders in '$SourcePath'..."

    foreach ($folder in (Get-ChildItem -Path $SourcePath -Directory)) {
        try {
            Remove-Item -Path $folder.FullName -Recurse -Force -ErrorAction Stop
            Write-Verbose "Successfully removed folder '$($folder.FullName)'."
        }
        catch {
            $errorMessage = "Failed to remove '$($folder.FullName)': $($_.Exception.Message)"
            Write-Verbose "Err: $errorMessage"
            Write-Error $errorMessage
        }
    }
    Write-Verbose "Source folders removed successfully."
}
