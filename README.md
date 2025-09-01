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

    # Decode fields
    $rsaParams = [System.Security.Cryptography.RSAParameters]@{
        Modulus  = From-Base64Url $Jwk.n
        Exponent = From-Base64Url $Jwk.e
        D        = From-Base64Url $Jwk.d
        P        = From-Base64Url $Jwk.p
        Q        = From-Base64Url $Jwk.q
        DP       = From-Base64Url $Jwk.dp
        DQ       = From-Base64Url $Jwk.dq
        InverseQ = From-Base64Url $Jwk.qi
    }

    # Create RSA object
    $rsa = [System.Security.Cryptography.RSACryptoServiceProvider]::new()
    $rsa.ImportParameters($rsaParams)

    # Export PKCS#1 private key
    $pkcs1 = $rsa.ExportRSAPrivateKey()

    # Encode PEM
    $pem = "-----BEGIN RSA PRIVATE KEY-----`n"
    $pem += [Convert]::ToBase64String($pkcs1, 'InsertLineBreaks')
    $pem += "`n-----END RSA PRIVATE KEY-----"

    if ($OutputPath) {
        Set-Content -Path $OutputPath -Value $pem
        return $OutputPath
    } else {
        return $pem
    }
}
