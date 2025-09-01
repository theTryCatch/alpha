function ConvertTo-Pem {
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [pscustomobject]$Jwk,

        [ValidateSet("PKCS1")]
        [string]$Format = "PKCS1",

        [string]$OutputPath = $null
    )

    begin {
        function From-Base64Url([string]$s) {
            $s = $s.Replace('-', '+').Replace('_', '/')
            switch ($s.Length % 4) {
                2 { $s += '==' }
                3 { $s += '=' }
            }
            [Convert]::FromBase64String($s)
        }

        function Encode-Length([int]$len) {
            if ($len -lt 128) { return ,([byte]$len) }
            $bytes = @()
            $v = $len
            while ($v -gt 0) {
                $bytes = ,([byte]($v -band 0xFF)) + $bytes
                $v = $v -shr 8
            }
            return ,([byte](0x80 -bor $bytes.Length)) + $bytes
        }

        function Concat-Bytes([byte[][]]$parts) {
            $list = New-Object System.Collections.Generic.List[byte]
            foreach ($p in $parts) { $list.AddRange($p) }
            ,$list.ToArray()
        }

        function Encode-Integer([byte[]]$bytes) {
            if ($null -eq $bytes -or $bytes.Length -eq 0) { $bytes = ,0x00 }
            if (($bytes[0] -band 0x80) -ne 0) { $bytes = ,0x00 + $bytes }
            $tag = ,0x02
            $len = Encode-Length $bytes.Length
            Concat-Bytes @($tag, $len, $bytes)
        }

        function Encode-Sequence([byte[]]$body) {
            $tag = ,0x30
            $len = Encode-Length $body.Length
            Concat-Bytes @($tag, $len, $body)
        }

        function Wrap-Base64([string]$s, [int]$width = 64) {
            $sb = New-Object System.Text.StringBuilder
            for ($i = 0; $i -lt $s.Length; $i += $width) {
                $chunkLen = [Math]::Min($width, $s.Length - $i)
                [void]$sb.AppendLine($s.Substring($i, $chunkLen))
            }
            $sb.ToString().TrimEnd("`r","`n")
        }
    }

    process {
        if ($Format -ne "PKCS1") { throw "Only PKCS1 is supported in this function." }

        # Decode JWK fields (Base64URL)
        $nBytes  = From-Base64Url $Jwk.n
        $eBytes  = From-Base64Url $Jwk.e
        $dBytes  = From-Base64Url $Jwk.d
        $pBytes  = From-Base64Url $Jwk.p
        $qBytes  = From-Base64Url $Jwk.q
        $dpBytes = From-Base64Url $Jwk.dp
        $dqBytes = From-Base64Url $Jwk.dq
        $qiBytes = From-Base64Url $Jwk.qi

        # Build RSAPrivateKey ::= SEQUENCE { version, n, e, d, p, q, dp, dq, qi }
        $version = Encode-Integer ([byte[]](0x00))
        $ints = @(
            $version,
            (Encode-Integer $nBytes),
            (Encode-Integer $eBytes),
            (Encode-Integer $dBytes),
            (Encode-Integer $pBytes),
            (Encode-Integer $qBytes),
            (Encode-Integer $dpBytes),
            (Encode-Integer $dqBytes),
            (Encode-Integer $qiBytes)
        )

        $body = Concat-Bytes $ints
        $der  = Encode-Sequence $body

        # Base64 with 64-char wrapping (JOSE-style)
        $b64 = [Convert]::ToBase64String($der)
        $pemBody = Wrap-Base64 $b64 64

        $pem = "-----BEGIN RSA PRIVATE KEY-----`n$pemBody`n-----END RSA PRIVATE KEY-----"

        if ($OutputPath) {
            Set-Content -Path $OutputPath -Value $pem -NoNewline
            return $OutputPath
        } else {
            return $pem
        }
    }
}
