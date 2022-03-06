[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [ValidateSet("Banner", "All", "Logo", "Brandmark", $null)][array]$Types = "Banner",
    $Parent = (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent),
    [string]$Path = (Join-Path -Path $Parent -ChildPath "..\images\"),
    [string]$OutFolder = "Resized",
    [ValidateScript( { Test-Path $_ })]$Json = (Join-Path -Path $Parent -ChildPath "Images.json")
)
function Initialize-OutFolder {
    param ([string]$Path)
    New-Item -ItemType Directory $Path -ErrorAction SilentlyContinue
    Get-ChildItem -Recurse $Path | Remove-Item -Recurse -Force
}

if ($Types -contains "Logo" -or $Types -contains "Brandmark" -or $Types -contains "All") {
    $OutPath = Join-Path -Path $Path -ChildPath "\Logos\Resized"
    Initialize-OutFolder -Path $OutPath
}

if ($Types -contains "Logo" -or $Types -contains "All") { 
    ConvertTo-OutputImages -WhatIf:$WhatIfPreference -Json $Json -Destination "Web" -OutPath $OutPath -Type Logo      -Path (Get-ChildItem -Path $Path -File -Recurse -Depth 0 -Include "*Logo.png", "*Word.png")
}

if ($Types -contains "Brandmark" -or $Types -contains "All") { 
    ConvertTo-OutputImages -WhatIf:$WhatIfPreference -Json $Json -Destination "Web" -OutPath $OutPath -Type Brandmark -Path (Get-ChildItem -Path $Path -File -Recurse -Depth 0 -Include "*Brand.png", "*Icon.png")
}

if ($Types -contains "Banner" -or $Types -contains "All") {
    $OutPath = Join-Path -Path $Path -ChildPath "\Banners\Resized"
    Initialize-OutFolder -Path $OutPath

    ConvertTo-OutputImages -WhatIf:$WhatIfPreference -Json $Json -Destination "Web" -OutPath $OutPath -Type Banner -Path (Get-ChildItem -Path $Path -File -Recurse -Depth 0 -Include "*BG.jpg", "*FG.jpg", "Wallpaper.jpg")

    $Wallpaper = Join-Path -Path $OutPath -ChildPath "Wallpaper_Windows.jpg"
    if (Test-Path -Path $Wallpaper -PathType Leaf) {
        Copy-Item -Path $Wallpaper -Destination (Join-Path -Path $OutPath -ChildPath "BG_Windows.jpg") -WhatIf:$WhatIfPreference
        Remove-Item (Join-Path -Path $OutPath -ChildPath "Wallpaper_*.jpg") -WhatIf:$WhatIfPreference
    }
}