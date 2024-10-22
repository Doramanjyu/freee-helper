console.debug('Freee helper OTP')

const base32Decode = (input) => {
  if (input.length & 0x7) {
    throw new RangeError('invalid base32 input')
  }

  const chmap = new Map([
    ...Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', (c, i) => [c, BigInt(i)]),
  ])
  const b32 = input.toUpperCase().replace(/=+$/, '')
  let v = Array.from(b32).reduce(
    (v, c) => (v << BigInt(5)) | chmap.get(c),
    BigInt(0),
  )
  const out = new Uint8Array(Math.floor((input.length * 5) / 8))
  out.forEach((c, i) => {
    out[out.length - i - 1] = Number(v & BigInt(0xff))
    v = v >> BigInt(8)
  })
  return out
}

const getSecret = async () => {
  const ubrowser = chrome || browser

  try {
    const secret_data = await ubrowser.storage.local.get('totpSecret')
    return base32Decode(secret_data.totpSecret)
  } catch (err) {
    return null
  }
}

const numToBytes = (num) => {
  const dv = new DataView(new ArrayBuffer(8), 0)
  dv.setBigUint64(0, BigInt(num))
  return new Uint8Array(dv.buffer)
}

const totp = async () => {
  const secret = await getSecret()
  if (!secret) {
    console.debug('secret not set')
    return
  }

  const tx = 30 * 1000
  const ct = Math.floor(Date.now() / tx)

  const key = await window.crypto.subtle.importKey(
    'raw',
    secret,
    {
      name: 'HMAC',
      hash: {
        name: 'SHA-1',
      },
    },
    false,
    ['sign'],
  )
  const hash = await window.crypto.subtle.sign('HMAC', key, numToBytes(ct))
  const b = new Uint8Array(hash)
  const offset = b[19] & 0xf
  const p =
    ((b[offset] & 0x7f) << 24) |
    (b[offset + 1] << 16) |
    (b[offset + 2] << 8) |
    b[offset + 3]
  const hotp = (p % 1000000).toString().padStart(6, '0')

  const otp = document.querySelector('input#__security_code')
  const submit = otp.closest('form').getElementsByTagName('button')[0]
  otp.value = hotp
  otp.dispatchEvent(new Event('input', { bubbles: true }))
  setTimeout(() => submit.click(), 100)
}

totp()
