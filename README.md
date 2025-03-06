function Copy-MSModule {
    [CmdletBinding()]
    param (
        [ValidateScript({ Test-Path $_ })]
        [string]$SourcePath,

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
        Write-Error "Error during module copy: $($_.Exception.Message)"
    }
}

function Test-SourceFolderStructure {
    [CmdletBinding()]
    param (
        [string]$SourcePath
    )

    Write-Verbose "Validating source folder structure at '$SourcePath'..."

    $sourceFolders = Get-ChildItem -Path $SourcePath -Directory -Depth 0
    $sourceFiles = Get-ChildItem -Path $SourcePath -File

    if ($sourceFiles.Count -gt 0) {
        throw "Source folder '$SourcePath' contains files. Only module folders are allowed."
    }
    Write-Verbose "No files found in '$SourcePath'."

    if ($sourceFolders.Count -eq 0) {
        throw "Source folder '$SourcePath' is empty. At least one module folder is required."
    }
    Write-Verbose "Found $($sourceFolders.Count) module folders in '$SourcePath'."

    foreach ($folder in $sourceFolders) {
        if (-not ($folder.Name -match '^ms[a-zA-Z]+$')) {
            throw "Module folder '$($folder.FullName)' does not follow naming convention (must start with 'ms' followed by alphabets)."
        }
        Write-Verbose "Module folder '$($folder.FullName)' follows naming convention."
        
        $versionFolders = Get-ChildItem -Path $folder.FullName -Directory
        $filesUnderVersionFolderLevel = Get-ChildItem -Path $folder.FullName -File
        if($filesUnderVersionFolderLevel)
        {
            throw "There should be only other version folders in the module folder. Files are not allowed"
        }
        if ($versionFolders.Count -eq 0) {
            throw "Module folder '$($folder.FullName)' has no version subfolders."
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
        [System.IO.DirectoryInfo]$VersionFolder
    )

    Write-Verbose "Validating version folder '$($VersionFolder.FullName)'..."

    if (-not ($VersionFolder.Name -as [version])) {
        throw "Invalid version folder '$($VersionFolder.FullName)'. Folder name must be a valid version number."
    }
    Write-Verbose "Valid version folder '$($VersionFolder.FullName)'."

    $psd1File = Get-ChildItem -Path $VersionFolder.FullName -Filter *.psd1
    if (-not $psd1File) {
        throw "Version folder '$($VersionFolder.FullName)' is missing a .psd1 file."
    }
    Write-Verbose "Found .psd1 file '$($psd1File.FullName)'."

    Test-Psd1Content -Psd1FilePath $psd1File.FullName -ExpectedVersion $VersionFolder.Name
}

function Test-Psd1Content {
    [CmdletBinding()]
    param (
        [string]$Psd1FilePath,
        [string]$ExpectedVersion
    )

    Write-Verbose "Validating .psd1 file content in '$Psd1FilePath'..."

    try {
        $psd1Content = Import-PowerShellDataFile -Path $Psd1FilePath

        if ($psd1Content.ModuleVersion -ne $ExpectedVersion) {
            throw "Version mismatch in '$Psd1FilePath'. Expected: '$ExpectedVersion', Found: '$($psd1Content.ModuleVersion)'."
        }
        Write-Verbose "Version in '$Psd1FilePath' matches expected version."
    }
    catch {
        Write-Error "Failed to validate .psd1 file at '$Psd1FilePath': $($_.Exception.Message)"
    }
}

function Test-DestinationFolderStructure {
    [CmdletBinding()]
    param (
        [string]$SourcePath,
        [string]$DestinationPath
    )

    Write-Verbose "Validating destination folder structure at '$DestinationPath'..."

    $sourceFolders = Get-ChildItem -Path $SourcePath -Directory
    foreach ($folder in $sourceFolders) {
        foreach ($versionFolder in (Get-ChildItem -Path $folder.FullName -Directory)) {
            $destinationVersionPath = Join-Path -Path $DestinationPath -ChildPath "$($folder.Name)\$($versionFolder.Name)"

            if (Test-Path -Path $destinationVersionPath) {
                throw "Destination folder '$destinationVersionPath' already exists. Cannot overwrite."
            }
            Write-Verbose "Destination folder '$destinationVersionPath' does not exist, safe to copy."
        }
    }
}

function Copy-ModuleVersionFolders {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param (
        [string]$SourcePath,
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
        [string]$SourcePath
    )

    Write-Verbose "Removing source folders in '$SourcePath'..."

    foreach ($folder in (Get-ChildItem -Path $SourcePath -Directory)) {
        try {
            Remove-Item -Path $folder.FullName -Recurse -Force -ErrorAction Stop
            Write-Verbose "Successfully removed folder '$($folder.FullName)'."
        }
        catch {
            Write-Error "Failed to remove '$($folder.FullName)': $($_.Exception.Message)"
        }
    }
    Write-Verbose "Source folders removed successfully."
}

# Example usage
Copy-MSModule -SourcePath "C:\src" -DestinationPath "C:\dest" -Verbose
