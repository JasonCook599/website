async function getRemoteTime() {
  return new Date((await (await fetch("/api/date")).json()).date)
}

async function getTimeOffset(interval, oldoffset) {
  if (remoteTimeLastCheck == null || remoteTimeLastCheck < new Date(Date.now() - interval)) {
    remoteTimeLastCheck = Date.now()
    try {
      offset = (await getRemoteTime()) - new Date()
      console.log("Your clock is off by " + offset + "ms")
      return offset
    } catch (error) {
      console.log(error)
      return 0
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
  offset = await getTimeOffset(3600000, offset)

  // Get preferences
  prefs = await getPreferences()

  //Set date based on offset
  var date = new Date(Date.now() + offset)

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
    offset = null
    updateTime()
  }
}
