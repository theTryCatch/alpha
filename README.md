function ConvertTo-Pem {
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [pscustomobject]$Jwk,

        [ValidateSet("PKCS1")]
        [string]$Format = "PKCS1",

        [string]$OutputPath = $null
    )

    begin {
        function From-Base64Url([string]$str) {
            $s = $str.Replace('-', '+').Replace('_', '/')
            switch ($s.Length % 4) {
                2 { $s += '==' }
                3 { $s += '=' }
            }
            return [Convert]::FromBase64String($s)
        }

        function Encode-Integer([byte[]]$bytes) {
            if ($bytes[0] -gt 0x7F) { $bytes = ,0x00 + $bytes }
            $len = $bytes.Length
            $lenBytes = if ($len -lt 128) { ,$len } else {
                $tmp = [BitConverter]::GetBytes([UInt32]$len)
                $tmp = $tmp[0..([Array]::IndexOf($tmp, ($tmp | Where-Object { $_ -ne 0 })[0]))]
                ,(0x80 -bor $tmp.Length) + $tmp
            }
            return ,0x02 + $lenBytes + $bytes
        }

        function Encode-Sequence([byte[][]]$elements) {
            $body = @(); foreach ($el in $elements) { $body += $el }
            $len = $body.Length
            $lenBytes = if ($len -lt 128) { ,$len } else {
                $tmp = [BitConverter]::GetBytes([UInt32]$len)
                $tmp = $tmp[0..([Array]::IndexOf($tmp, ($tmp | Where-Object { $_ -ne 0 })[0]))]
                ,(0x80 -bor $tmp.Length) + $tmp
            }
            return ,0x30 + $lenBytes + $body
        }
    }

    process {
        if ($Format -eq "PKCS1") {
            $seq = Encode-Sequence @(
                (Encode-Integer @(0))                  # version
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
        }

        if ($OutputPath) {
            Set-Content -Path $OutputPath -Value $pem
            return $OutputPath
        } else {
            return $pem
        }
    }
}
