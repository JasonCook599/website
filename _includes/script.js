async function getTimeOffset(interval, oldoffset) {
  if (remoteTimeLastCheck == null || remoteTimeLastCheck < new Date(Date.now() - interval)) {
    remoteTimeLastCheck = Date.now()
    try {
      const start = Date.now()
      const date = new Date((await (await fetch("/api/date")).json()).date)
      const end = Date.now()
      return {
        lastCheck: new Date((start + end) / 2),
        latency: end - start,
        offset: date - start
      }
    } catch (error) {
      console.log(error)
      return {
        offset: 0
      }
    }
  } else {
    return oldoffset
  }
}

async function getPreferences() {
  try {
    return await (await fetch("/assets/prefs.json")).json()
  } catch (error) {
    console.log(error)
    return
  }
}

async function updateTime() {
  // Get time offset once per hour. 3600000 = 60 seconds * 60 minutes * 1000 milliseconds
  RemoteTime = await getTimeOffset(3600000, RemoteTime)

  // Get preferences
  if (prefs == null) {
    prefs = await getPreferences()
  }

  //Set date based on offset
  let date = new Date(Date.now() + RemoteTime.offset)

  // https://day.js.org/docs/en/display/format#list-of-all-available-formats
  timeTitle = dayjs(date).format(prefs.titleFormat)
  timeSubtitle = dayjs(date).format(prefs.subtitleFormat)

  // Show time and date
  document.getElementById("title").textContent = timeTitle
  document.getElementById("subtitle").textContent = timeSubtitle
  fitty("#title")

  // Wait, then update time again
  setTimeout(updateTime, 250)
}
window.onload = load

function load() {
  // Only run clock code on clock page.
  if (document.getElementById("clock")) {
    remoteTimeLastCheck = null
    RemoteTime = null
    prefs = null
    updateTime()
  }
}
