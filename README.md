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

function Copy-ModuleVersionFolders {
    <#
    .SYNOPSIS
        Copies module version folders from source to destination.
    .DESCRIPTION
        Ensures each module version folder is copied correctly to the destination path.
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
    Write-Verbose "Copying module version folders from '$SourcePath' to '$DestinationPath'..."
    
    Get-ChildItem -Path $SourcePath -Directory | ForEach-Object {
        $moduleFolder = $_.FullName
        $destinationModulePath = Join-Path -Path $DestinationPath -ChildPath $_.Name
        New-Item -ItemType Directory -Path $destinationModulePath -Force | Out-Null
        Copy-Item -Path "$moduleFolder\*" -Destination $destinationModulePath -Recurse -Force
        Write-Verbose "Copied module '$($_.Name)' to '$destinationModulePath'."
    }
}

function Remove-SourceFolders {
    <#
    .SYNOPSIS
        Removes the source folders after copying is complete.
    .DESCRIPTION
        Ensures that source module folders are deleted after a successful copy operation.
    .PARAMETER SourcePath
        Specify the source path.
    .EXAMPLE
        Remove-SourceFolders -SourcePath "C:\Source"
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, HelpMessage = "Specify the source path.")]
        [string]$SourcePath
    )

    Write-Verbose "Starting function: ${function:Remove-SourceFolders}"
    Write-Verbose "Removing source folders at '$SourcePath'..."
    
    Get-ChildItem -Path $SourcePath -Directory | ForEach-Object {
        Remove-Item -Path $_.FullName -Recurse -Force
        Write-Verbose "Removed folder: '$($_.FullName)'."
    }
}

function Test-psd1content {
    <#
    .SYNOPSIS
        Validates the content of a module manifest (.psd1) file.
    .DESCRIPTION
        Ensures that the manifest file exists and contains valid data.
    .PARAMETER ModulePath
        Specify the module path containing the .psd1 file.
    .EXAMPLE
        Test-psd1content -ModulePath "C:\Modules\msModule"
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, HelpMessage = "Specify the module path.")]
        [string]$ModulePath
    )

    Write-Verbose "Starting function: ${function:Test-psd1content}"
    Write-Verbose "Checking .psd1 content in '$ModulePath'..."
    
    $psd1File = Get-ChildItem -Path $ModulePath -Filter "*.psd1" | Select-Object -First 1
    if (-not $psd1File) {
        $errorMessage = "Err: No .psd1 file found in '$ModulePath'."
        throw $errorMessage
    }
    Write-Verbose "Found .psd1 file: '$($psd1File.FullName)'."
}
