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
  offset = await getTimeOffset(60 * 60 * 1000, offset)
  prefs = await getPreferences()
  var date = new Date(Date.now() + offset)
  var hour = date.getHours() // 0 - 23
  var minute = date.getMinutes() // 0 - 59
  var second = date.getSeconds() // 0 - 59
  //console.log(date.toLocaleTimeString('en-US', prefs.format.time));
  if (prefs.twelvehour === true) {
    hour = hour % 12 //convert to 12h; mod 12
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
  /*
  time=null
  if (prefs.show.hour) {time += hour}
  if (prefs.show.hour & prefs.show.minute) {time += prefs.separator}
  if (prefs.show.minute) {time += minute}
  if (prefs.show.minute & prefs.show.second) {time += prefs.separator}
  if (prefs.show.second) {time += second}
  if (prefs.show.session) {time += " " + session}
  document.getElementById("time").textContent = time;
*/
  document.getElementById("hour").textContent = hour
  document.getElementById("minute").textContent = minute
  document.getElementById("second").textContent = second
  document.querySelectorAll(".separator").forEach(function (element) {
    if (prefs.separator == null) {
      element.textContent = ":"
    } else {
      element.textContent = prefs.separator
    }
  })
  document.getElementById("session").textContent = session
  setTimeout(updateTime, 1000)
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
