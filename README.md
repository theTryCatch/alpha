function Export-RsaPrivateKeyPkcs1Pem {
    param(
        [System.Security.Cryptography.RSACryptoServiceProvider]$rsa,
        [string]$path
    )

    # Export parameters
    $params = $rsa.ExportParameters($true)

    # Helper: encode ASN.1 INTEGER
    function Encode-Integer([byte[]]$bytes) {
        if ($bytes[0] -ge 0x80) {
            $bytes = ,0x00 + $bytes
        }
        $len = $bytes.Length
        ,0x02 + ,$len + $bytes
    }

    # Encode sequence (PKCS#1 structure)
    $list = @()
    $list += (Encode-Integer ( ))                          # version
    $list += (Encode-Integer ($params.Modulus))
    $list += (Encode-Integer ($params.Exponent))
    $list += (Encode-Integer ($params.D))
    $list += (Encode-Integer ($params.P))
    $list += (Encode-Integer ($params.Q))
    $list += (Encode-Integer ($params.DP))
    $list += (Encode-Integer ($params.DQ))
    $list += (Encode-Integer ($params.InverseQ))

    $seq = ,0x30 + ,([byte]($list.Length)) + $list

    # Base64 encode
    $b64 = [System.Convert]::ToBase64String($seq, 'InsertLineBreaks')
    $pem = "-----BEGIN RSA PRIVATE KEY-----`n$b64`n-----END RSA PRIVATE KEY-----"

    Set-Content -Path $path -Value $pem -Encoding ascii
}

# Example usage:
$cert = Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.Subject -like "*YourCN*" }
$rsa = [System.Security.Cryptography.RSACryptoServiceProvider]$cert.PrivateKey

Export-RsaPrivateKeyPkcs1Pem -rsa $rsa -path ".\private_pkcs1.pem"














function Export-RsaPublicKeyPkcs1Pem {
    param(
        [System.Security.Cryptography.RSACryptoServiceProvider]$rsa,
        [string]$path
    )

    $params = $rsa.ExportParameters($false)

    function Encode-Integer([byte[]]$bytes) {
        if ($bytes[0] -ge 0x80) {
            $bytes = ,0x00 + $bytes
        }
        ,0x02 + ,$bytes.Length + $bytes
    }

    $list = @()
    $list += (Encode-Integer $params.Modulus)
    $list += (Encode-Integer $params.Exponent)

    $seq = ,0x30 + ,([byte]$list.Length) + $list
    $b64 = [System.Convert]::ToBase64String($seq, 'InsertLineBreaks')
    $pem = "-----BEGIN RSA PUBLIC KEY-----`n$b64`n-----END RSA PUBLIC KEY-----"

    Set-Content -Path $path -Value $pem -Encoding ascii
}

Export-RsaPublicKeyPkcs1Pem -rsa $rsa -path ".\public_pkcs1.pem"
