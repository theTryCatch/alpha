function Copy-MSModule {
    <#
    .SYNOPSIS
        Copies MS module folders from the source path to the destination path.
    .DESCRIPTION
        Validates the source folder structure, copies module version folders, and removes the source folders upon completion.
    .PARAMETER SourcePath
        Specify the source path where the modules are located.
    .PARAMETER DestinationPath
        Specify the destination path where the modules should be copied.
    .EXAMPLE
        Copy-MSModule -SourcePath "C:\Source" -DestinationPath "C:\Destination"
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, HelpMessage = "Specify the source path.")]
        [ValidateScript({ Test-Path $_ })]
        [string]$SourcePath,

        [Parameter(Mandatory = $true, HelpMessage = "Specify the destination path.")]
        [ValidateScript({ Test-Path $_ })]
        [string]$DestinationPath
    )

    Write-Verbose "Starting function: ${function:Copy-MSModule}"  
    
    try {
        Write-Verbose "Starting module copy from '$SourcePath' to '$DestinationPath'."

        Test-SourceFolderStructure -SourcePath $SourcePath -ErrorAction Stop -Verbose
        Test-DestinationFolderStructure -SourcePath $SourcePath -DestinationPath $DestinationPath -ErrorAction Stop -Verbose
        Copy-ModuleVersionFolders -SourcePath $SourcePath -DestinationPath $DestinationPath -ErrorAction Stop -Verbose
        Remove-SourceFolders -SourcePath $SourcePath -ErrorAction Stop -Verbose

        Write-Verbose "Module copy completed successfully from '$SourcePath' to '$DestinationPath'."
    }
    catch {
        $errorMessage = "Err: Error during module copy: $($_.Exception.Message)"
        Write-Error $errorMessage
    }
}

function Test-SourceFolderStructure {
    <#
    .SYNOPSIS
        Validates the source folder structure for module compliance.
    .DESCRIPTION
        Ensures the source folder contains valid module folders following naming conventions and includes version subfolders.
    .PARAMETER SourcePath
        Specify the source path to validate.
    .EXAMPLE
        Test-SourceFolderStructure -SourcePath "C:\Source"
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, HelpMessage = "Specify the source path.")]
        [string]$SourcePath
    )

    Write-Verbose "Starting function: ${function:Test-SourceFolderStructure}"  
    Write-Verbose "Validating source folder structure at '$SourcePath'..."

    $sourceFolders = Get-ChildItem -Path $SourcePath -Directory -Depth 0
    $sourceFiles = Get-ChildItem -Path $SourcePath -File

    if ($sourceFiles.Count -gt 0) {
        $errorMessage = "Err: Source folder '$SourcePath' contains files. Only module folders are allowed."
        throw $errorMessage
    }
    Write-Verbose "No files found in '$SourcePath'."

    if ($sourceFolders.Count -eq 0) {
        $errorMessage = "Err: Source folder '$SourcePath' is empty. At least one module folder is required."
        throw $errorMessage
    }
    Write-Verbose "Found $($sourceFolders.Count) module folders in '$SourcePath'."

    foreach ($folder in $sourceFolders) {
        if (-not ($folder.Name -match '^ms[a-zA-Z]+$')) {
            $errorMessage = "Err: Module folder '$($folder.FullName)' does not follow naming convention (must start with 'ms' followed by alphabets)."
            throw $errorMessage
        }
        Write-Verbose "Module folder '$($folder.FullName)' follows naming convention."
        
        $versionFolders = Get-ChildItem -Path $folder.FullName -Directory
        $filesUnderVersionFolderLevel = Get-ChildItem -Path $folder.FullName -File
        if ($filesUnderVersionFolderLevel) {
            $errorMessage = "Err: There should be only other version folders in the module folder. Files are not allowed."
            throw $errorMessage
        }
        if ($versionFolders.Count -eq 0) {
            $errorMessage = "Err: Module folder '$($folder.FullName)' has no version subfolders."
            throw $errorMessage
        }
        Write-Verbose "Module folder '$($folder.FullName)' contains $($versionFolders.Count) version folders."

        foreach ($versionFolder in $versionFolders) {
            Test-VersionFolder -VersionFolder $versionFolder -Verbose
        }
    }
}

function Test-DestinationFolderStructure {
    <#
    .SYNOPSIS
        Validates the destination folder structure before copying.
    .DESCRIPTION
        Ensures the destination path is properly structured and writable.
    .PARAMETER SourcePath
        Specify the source path.
    .PARAMETER DestinationPath
        Specify the destination path.
    .EXAMPLE
        Test-DestinationFolderStructure -SourcePath "C:\Source" -DestinationPath "C:\Destination"
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, HelpMessage = "Specify the source path.")]
        [string]$SourcePath,

        [Parameter(Mandatory = $true, HelpMessage = "Specify the destination path.")]
        [string]$DestinationPath
    )
    
    Write-Verbose "Starting function: ${function:Test-DestinationFolderStructure}"
    Write-Verbose "Validating destination folder at '$DestinationPath'..."
    
    if (-not (Test-Path -Path $DestinationPath -PathType Container)) {
        $errorMessage = "Err: Destination path '$DestinationPath' does not exist or is not a directory."
        throw $errorMessage
    }
    Write-Verbose "Destination folder '$DestinationPath' is valid."
}

function Copy-ModuleVersionFolders {
    <#
    .SYNOPSIS
        Copies the module version folders from source to destination.
    .DESCRIPTION
        Ensures each module and version folder is copied correctly while preserving structure.
    .PARAMETER SourcePath
        Specify the source path.
    .PARAMETER DestinationPath
        Specify the destination path.
    .EXAMPLE
        Copy-ModuleVersionFolders -SourcePath "C:\Source" -DestinationPath "C:\Destination"
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, HelpMessage = "Specify the source path.")]
        [string]$SourcePath,

        [Parameter(Mandatory = $true, HelpMessage = "Specify the destination path.")]
        [string]$DestinationPath
    )
    
    Write-Verbose "Starting function: ${function:Copy-ModuleVersionFolders}"
    Write-Verbose "Copying modules from '$SourcePath' to '$DestinationPath'..."
}
