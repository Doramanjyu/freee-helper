const ubrowser = chrome || browser

const origins = ['https://accounts.secure.freee.co.jp/api/p/products/hosts']

document.getElementById('setTotpSecret').addEventListener('click', async () => {
  const e = document.getElementById('totpSecret')
  const secret64 = e.value
  await ubrowser.storage.local.set({
    totpSecret: secret64,
  })
  console.debug('set totpSecret')
  e.value = ''
})

const enableLoginKeepalive = document.getElementById('enableLoginKeepalive')
const updateButtonState = async () => {
  const permitted = await ubrowser.permissions.contains({ origins })
  enableLoginKeepalive.disabled = permitted
}

enableLoginKeepalive.addEventListener('click', async () => {
  await ubrowser.permissions.request({ origins })
  await updateButtonState()
})

updateButtonState()
