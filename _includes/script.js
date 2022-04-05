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

async function CalculateFuelCost(event) {
  event.preventDefault() // prevent default form submission. Handle only with this function.

  // Get form data
  let data = new FormData(document.getElementById("FuelForm"))
  let distance = data.get("distance")
  let cost = data.get("cost")
  let efficiency = data.get("efficiency")

  // Calculate trip cost
  let FuelCost = ((cost * distance) / 100) * efficiency
  let FuelCostString = "$" + FuelCost.toFixed(2)
  document.getElementById("TripCost").placeholder = FuelCostString

  // Save form data as cookies
  CreateCookie("distance", distance, 365)
  CreateCookie("cost", cost, 365)
  CreateCookie("efficiency", efficiency, 365)
}

function CreateCookie(name, value, days) {
  let date = new Date()
  date.setTime(date.getTime() + 24 * 60 * 60 * 1000 * days)
  let expires = "; expires=" + date.toGMTString()
  document.cookie = name + "=" + value + expires + ";secure ;samesite=Strict ;path=/"
}

function GetCookie(cookieName) {
  let cookie = {}
  document.cookie.split(";").forEach(function (el) {
    let [key, value] = el.split("=")
    cookie[key.trim()] = value
  })
  return cookie[cookieName]
}

window.onload = function load() {
  // Only run clock code on clock page.
  if (document.getElementById("clock")) {
    remoteTimeLastCheck = null
    RemoteTime = null
    prefs = null
    updateTime()
  }

  // Only run form code on form page.
  let FuelForm = document.getElementById("FuelForm")
  if (FuelForm) {
    // Set default values
    document.getElementById("distance").value = GetCookie("distance")
    document.getElementById("cost").value = GetCookie("cost")
    document.getElementById("efficiency").value = GetCookie("efficiency")
    FuelForm.addEventListener("submit", CalculateFuelCost)

    // Set efficiency base on trip type
    document.body.addEventListener("change", function (e) {
      let value = e.target.value
      switch (value) {
      case "mix":
        document.getElementById("efficiency").value = 7
        break
      case "city":
        document.getElementById("efficiency").value = 10
        break
      case "highway":
        document.getElementById("efficiency").value = 6
        break
      }
    })
  }
}
