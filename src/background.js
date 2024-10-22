const ubrowser = chrome || browser
const alarmName = 'keepalive_freee_login'
const origins = ['https://accounts.secure.freee.co.jp/api/p/products/hosts']

console.debug('Freee helper background')

const openSettingPage = () => {
  ubrowser.tabs.create({
    url: ubrowser.runtime.getURL('src/index.html'),
    active: true,
  })
}

ubrowser.action.onClicked.addListener(openSettingPage)

const keepaliveLogin = async () => {
  const permitted = await ubrowser.permissions.contains({ origins })
  if (!permitted) {
    return
  }

  const resp = await fetch(
    'https://accounts.secure.freee.co.jp/api/p/products/hosts',
    {
      method: 'GET',
    },
  )
  console.log(`login keepalive: ${resp.status}`)
}

ubrowser.alarms.create(alarmName, {
  delayInMinutes: 0,
  periodInMinutes: 30,
})

ubrowser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === alarmName) {
    keepaliveLogin()
  }
})

keepaliveLogin()
