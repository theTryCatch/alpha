function Convert-JwkToPkcs1Pem {
    param(
        [string]$n,
        [string]$e,
        [string]$d,
        [string]$p,
        [string]$q,
        [string]$dp,
        [string]$dq,
        [string]$qi
    )

    # Helper: Base64Url decode
    function From-Base64Url($str) {
        $str = $str.Replace('-', '+').Replace('_', '/')
        switch ($str.Length % 4) {
            2 { $str += '==' }
            3 { $str += '=' }
        }
        return [Convert]::FromBase64String($str)
    }

    # Convert JWK params
    $nBytes  = From-Base64Url $n
    $eBytes  = From-Base64Url $e
    $dBytes  = From-Base64Url $d
    $pBytes  = From-Base64Url $p
    $qBytes  = From-Base64Url $q
    $dpBytes = From-Base64Url $dp
    $dqBytes = From-Base64Url $dq
    $qiBytes = From-Base64Url $qi

    # Encode ASN.1 INTEGER
    function Encode-Integer($bytes) {
        if ($bytes[0] -gt 0x7F) {
            $bytes = ,0x00 + $bytes
        }
        $len = $bytes.Length
        if ($len -lt 128) {
            $lenBytes = [byte]$len
        } else {
            $lenBytes = @()
            $tmp = $len
            while ($tmp -gt 0) {
                $lenBytes = ,([byte]($tmp -band 0xFF)) + $lenBytes
                $tmp = $tmp -shr 8
            }
            $lenBytes = ,([byte](0x80 -bor $lenBytes.Length)) + $lenBytes
        }
        return ,0x02 + $lenBytes + $bytes
    }

    # Encode ASN.1 SEQUENCE
    function Encode-Sequence($elements) {
        $body = $elements -join '' | ForEach-Object { }
        $body = -join ($elements | ForEach-Object { [System.Text.Encoding]::ASCII.GetString($_) })
    }

    # Build PKCS#1 structure (ASN.1 DER SEQUENCE of 9 integers)
    $ints = @(
        Encode-Integer @(0)             # version
        (Encode-Integer $nBytes)
        (Encode-Integer $eBytes)
        (Encode-Integer $dBytes)
        (Encode-Integer $pBytes)
        (Encode-Integer $qBytes)
        (Encode-Integer $dpBytes)
        (Encode-Integer $dqBytes)
        (Encode-Integer $qiBytes)
    )

    $body = @()
    foreach ($i in $ints) { $body += $i }
    $len = $body.Length
    if ($len -lt 128) {
        $lenBytes = [byte]$len
    } else {
        $lenBytes = @()
        $tmp = $len
        while ($tmp -gt 0) {
            $lenBytes = ,([byte]($tmp -band 0xFF)) + $lenBytes
            $tmp = $tmp -shr 8
        }
        $lenBytes = ,([byte](0x80 -bor $lenBytes.Length)) + $lenBytes
    }
    $der = ,0x30 + $lenBytes + $body

    # Base64 encode with 64-char wrapping
    $b64 = [Convert]::ToBase64String($der)
    $wrapped = ($b64.ToCharArray() -split "(.{1,64})" | Where-Object {$_ -ne ""}) -join "`n"

    $pem = "-----BEGIN RSA PRIVATE KEY-----`n$wrapped`n-----END RSA PRIVATE KEY-----"
    return $pem
}
