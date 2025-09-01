function Convert-JwkToPem {
    param(
        [Parameter(Mandatory)]
        [pscustomobject]$Jwk,

        [string]$OutputPath = $null
    )

    # Base64Url → Byte[]
    function From-Base64Url([string]$str) {
        $s = $str.Replace('-', '+').Replace('_', '/')
        switch ($s.Length % 4) {
            2 { $s += '==' }
            3 { $s += '=' }
        }
        return [Convert]::FromBase64String($s)
    }

    # DER encoder for INTEGER
    function Encode-Integer([byte[]]$bytes) {
        if ($bytes[0] -gt 0x7F) {
            $bytes = ,0x00 + $bytes
        }
        $len = $bytes.Length
        if ($len -lt 128) {
            $lenBytes = [byte]$len
        } else {
            $lenBytes = [byte]([Math]::Floor([Math]::Log($len,256))+1)
            $lenBytes = ,(0x80 -bor $lenBytes) + ([BitConverter]::GetBytes([UInt32]$len)[0..($lenBytes-1)] | ForEach-Object { $_ })
        }
        return ,0x02 + $lenBytes + $bytes
    }

    # ASN.1 SEQUENCE
    function Encode-Sequence([byte[][]]$elements) {
        $body = @()
        foreach ($el in $elements) { $body += $el }
        $len = $body.Length
        if ($len -lt 128) {
            $lenBytes = [byte]$len
        } else {
            $lenBytes = [byte]([Math]::Floor([Math]::Log($len,256))+1)
            $lenBytes = ,(0x80 -bor $lenBytes) + ([BitConverter]::GetBytes([UInt32]$len)[0..($lenBytes-1)] | ForEach-Object { $_ })
        }
        return ,0x30 + $lenBytes + $body
    }

    # Build PKCS#1 structure
    $seq = Encode-Sequence @(
        (Encode-Integer @(0)) # version
        (Encode-Integer (From-Base64Url $Jwk.n))
        (Encode-Integer (From-Base64Url $Jwk.e))
        (Encode-Integer (From-Base64Url $Jwk.d))
        (Encode-Integer (From-Base64Url $Jwk.p))
        (Encode-Integer (From-Base64Url $Jwk.q))
        (Encode-Integer (From-Base64Url $Jwk.dp))
        (Encode-Integer (From-Base64Url $Jwk.dq))
        (Encode-Integer (From-Base64Url $Jwk.qi))
    )

    $pemBody = [Convert]::ToBase64String($seq, 'InsertLineBreaks')
    $pem = "-----BEGIN RSA PRIVATE KEY-----`n$pemBody`n-----END RSA PRIVATE KEY-----"

    if ($OutputPath) {
        Set-Content -Path $OutputPath -Value $pem
        return $OutputPath
    } else {
        return $pem
    }
}
