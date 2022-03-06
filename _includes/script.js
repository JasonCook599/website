function sleep(milliseconds) {
  const date = Date.now()
  let currentDate = null
  do {
    currentDate = Date.now()
  } while (currentDate - date < milliseconds)
}
async function getRemoteTime() {
  return new Date((await (await fetch("/api/date")).json()).date)
}
async function getTimeOffset(interval, oldoffset) {
  if (remoteTimeLastCheck == null || remoteTimeLastCheck < new Date(Date.now() - interval)) {
    remoteTimeLastCheck = Date.now()
    try {
      return ((await getRemoteTime()) - new Date())
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
  offset = await getTimeOffset(60 * 60 * 1000, offset) // Get time offset. Interval of one hours. 60 seconds * 60 minutes * 1000 milliseconds per second
  prefs = await getPreferences() // Get preferences
  //Set date based on offset
  var date = new Date(Date.now() + offset)
  var hour = date.getHours() // 0 - 23
  var minute = date.getMinutes() // 0 - 59
  var second = date.getSeconds() // 0 - 59
  //convert to 12h
  if (prefs.twelvehour === true) {
    hour = hour % 12 // mod 12
    hour = hour ? hour : 12 //midnight
    session = hour >= 12 ? prefs.format.session.PM : prefs.format.session.AM //AM or PM
  }
  //Add leading zeros.
  if (prefs.leadingzeros.hour) {
    var hour = hour.toString().padStart(2, 0)
  }
  if (prefs.leadingzeros.minute) {
    var minute = minute.toString().padStart(2, 0)
  }
  if (prefs.leadingzeros.second) {
    var second = second.toString().padStart(2, 0)
  }
  // Format time based on prefs
  time = null
  if (prefs.show.hour) {
    time += hour
  }
  if (prefs.show.hour & prefs.show.minute) {
    time += prefs.separator
  }
  if (prefs.show.minute) {
    time += minute
  }
  if (prefs.show.minute & prefs.show.second) {
    time += prefs.separator
  }
  if (prefs.show.second) {
    time += second
  }
  if (prefs.show.session && prefs.twelvehour) {
    time += " " + session
  }
  document.getElementById("time").textContent = time //Show time
  // TODO Add formatting options for date.
  document.getElementById("date").textContent = date.toDateString() //Show date
  setTimeout(updateTime, 500) // Wait, then update time again
}
window.onload = load

function load() {
  // Only run clock code on clock page.
  if (document.getElementById("time")) {
    remoteTimeLastCheck = null
    offset = null
    updateTime()
  }
}
