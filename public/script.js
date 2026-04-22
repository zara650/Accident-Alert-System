let totalDistance = 3;   // approx km (initial distance)
let currentDistance = 3; // start same as total
function triggerFlash() {
  const flash = document.getElementById("flash");

  flash.style.animation = "redFlash 0.5s infinite";

  // auto stop after 5 sec
  setTimeout(() => {
    flash.style.animation = "none";
    flash.style.opacity = 0;
  }, 5000);
}

let siren = new Audio("siren.mp3");
siren.loop = true;
// 🚨 ALERT CONTROL (duplicate alert rokne ke liye)
let alertSent = false;

// 📍 SEND ALERT FUNCTION
function sendAlert() {
  console.log("Button clicked");
  triggerFlash();
  siren.play();

  navigator.geolocation.getCurrentPosition(function(position) {

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

     console.log("Location:", lat, lng);

    document.getElementById("locationText").innerText =
  `📍 ${lat}, ${lng}`;

    initMap(lat, lng);  

    // UI UPDATE
    document.getElementById("alertList").innerHTML = `
      <li>🚑 Ambulance Notified</li>
      <li>🏥 Hospital Notified</li>
      <li>👮 Police Notified</li>
    `;
    
    console.log("FETCH BEGINS");

    // SERVER CALL
    fetch("/alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        location: { lat, lng }
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("SERVER RESPONSE", data);
      document.getElementById("status").innerText = data.message;

      checkResponseAndRedirect();
      startEscalationLoop();
    })
    .catch(err => console.error("FETCH ERROR",err));

  }, function(error) {
    console.log("Location error:", error);
    alert("Please allow location access");
  });
}

function startRescue() {

  sendAlert();   // 🚨 alert trigger

  // ⏳ COUNTDOWN START
  let time = 60;

const timer = setInterval(() => {

  let statusText;

  // 🔥 STATUS LOGIC
  if (time > 25) {
    statusText = "🚑 Dispatching...";
  } else if (time > 5) {
    statusText = "🚑 On the way...";
  } else {
    statusText = "🏥 Arriving...";
  }

  // 🔥 UI UPDATE
  document.getElementById("status").innerText =
    statusText + " | ⏳ " + time + " sec";

  time--;

  // ⏱ TIMEOUT → AUTO RESCUE
    if (time < 0) {
      clearInterval(timer);

      console.log("⏱ No response → Auto Rescue");

      window.location.href = "rescue.html";
    }

  }, 1000);
}

// 🗺 MAP FUNCTION
function initMap(lat = 28.6139, lng = 77.2090) {
  const mapDiv = document.getElementById("map");

  if (!mapDiv) {
    console.log("Map div not found ❌");
    return;
  }

  window.map = new google.maps.Map(mapDiv, {
    center: { lat, lng },
    zoom: 15,
    styles: [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#020617" }]
  }
]
  });

  new google.maps.Marker({
    position: { lat, lng },
    map: window.map,
  });
  const pulse = new google.maps.Circle({
strokeColor: "#ff0000",
strokeOpacity: 0.8,
strokeWeight: 2,
fillColor: "#ff0000",
fillOpacity: 0.01,
map: window.map,
center: { lat, lng },
radius: 40
});
setInterval(() => {
  let r = pulse.getRadius();
  pulse.setRadius(r > 500 ? 100 : r + 25);
  pulse.setOptions({
    fillOpacity: r > 500 ? 0.2 : 0.4
  });
}, 150);

setInterval(() => {
let r = pulse.getRadius();
pulse.setRadius(r > 300 ? 100 : r + 20);
}, 200);

  console.log("Map loaded ✅");

  startAmbulanceMovement(window.map);
}

// 🚑 MOVING AMBULANCE

let ambulanceMarker;

function startAmbulanceMovement(map) {

  let path = [
 {lat: 28.6139, lng: 77.2090},
 {lat: 28.6141, lng: 77.2095},
 {lat: 28.6143, lng: 77.2100},
 {lat: 28.6145, lng: 77.2105},
 {lat: 28.6148, lng: 77.2110},
 {lat: 28.6151, lng: 77.2115},
 {lat: 28.6155, lng: 77.2120},
 {lat: 28.6160, lng: 77.2128},
 {lat: 28.6165, lng: 77.2135},
 {lat: 28.6170, lng: 77.2140}
];
  

  let index = 0;

  ambulanceMarker = new google.maps.Marker({
    position: path[0],
    map: map,
    icon: {
  url: "https://img.icons8.com/color/48/ambulance.png",
  scaledSize: new google.maps.Size(40, 40)
},
zIndex: 999,
animation: google.maps.Animation.DROP
  });

  const interval = setInterval(() => {

    index++;

    if (index >= path.length) {
  index = 1;
  routeLine.setPath([path[0]]);
}

    console.log("Moving to:", path[index]);   

    ambulanceMarker.setPosition(path[index]);
    const currentPath = routeLine.getPath();
currentPath.push(path[index]);

    map.panTo(path[index]);   

  }, 500);
}

// 🚗 ACCIDENT DETECTION
function detectAccident() {
    window.addEventListener("devicemotion", function(event) {

        let x = event.acceleration.x || 0;
        let y = event.acceleration.y || 0;
        let z = event.acceleration.z || 0;

        let total = Math.sqrt(x*x + y*y + z*z);

        console.log("Force:", total);

        if (total > 25 && !alertSent) {
        alertSent = true;
            console.log("🚨 Accident Detected Automatically!");
            siren.play();
            triggerFlash();
            sendAlert();
        }
    });
}
if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then(response => {
        if (response === "granted") {
            detectAccident();
        }
    });
} else {
    detectAccident();
}
function loadDashboard() {

  fetch("/alerts")
    .then(res => res.json())
    .then(data => {

      const dashboard = document.getElementById("dashboard");

      if (!dashboard) {
        console.log("Dashboard not found ❌");
        return;
      }

      dashboard.innerHTML = "";

      Object.keys(data).reverse().forEach(id => {

        const alert = data[id];

        if (alert.acknowledged === true) {
          siren.pause();
          siren.currentTime = 0;
        }

        const card = document.createElement("div");
        card.classList.add("alert-card");

        card.innerHTML = `
          <p><b>🚨 Alert ID: ${id}</b></p>
          <p>Status: 
            <span style="color:${alert.acknowledged ? 'green' : 'red'}">
              ${alert.acknowledged ? 'Handled' : 'Pending'}
            </span>
          </p>
        `;

        dashboard.appendChild(card);

      });

    })
    .catch(err => console.log("Dashboard error", err));
}
loadDashboard();
setInterval(loadDashboard, 3000);

function updateChart(data) {

  let active = 0;
  let resolved = 0;
  let pending = 0;

  Object.values(data).forEach(alert => {

    if (alert.acknowledged === true) {
      resolved++;
    } 
    else if (alert.acknowledged === false) {
      active++;
    }

  });

  //  update chart data
  
  alertChart.data.datasets[0].data = [active, resolved, 0];

  alertChart.update();

}
// 🔁 ESCALATION LOOP SYSTEM

let contacts = ["Contact 1", "Contact 2", "Contact 3"];
let currentIndex = 0;
let escalationRunning = false;

function startEscalationLoop() {

  if (escalationRunning) return;
  escalationRunning = true;

  const loop = setInterval(() => {

    // 🛑 stop when siren stops (means response aa gaya)
    if (siren.paused) {
      clearInterval(loop);
      escalationRunning = false;
      console.log("✅ Escalation stopped (response received)");
      return;
    }

    let contact = contacts[currentIndex];

    console.log("📲 Sending alert to:", contact);

    const list = document.getElementById("alertList");
    if (list) {
      let li = document.createElement("li");
      li.innerText = `📞 Escalating → ${contact}`;
      list.appendChild(li);
    }

    currentIndex++;

    if (currentIndex >= contacts.length) {
      currentIndex = 0;
      console.log("🔁 Restarting escalation cycle...");
    }

  }, 15000);

}

function checkResponseAndRedirect() {

  const interval = setInterval(() => {

    fetch("/alerts")
      .then(res => res.json())
      .then(data => {

        const ids = Object.keys(data);
        const last = data[ids[ids.length - 1]];

        if (last && last.acknowledged === true) {

          console.log("✅ Response received → Redirecting");

          clearInterval(interval);

          window.location.href = "rescue.html";
        }

      });

  }, 3000); // har 3 sec check
}

function generateAlert() {
  let id = Math.floor(Math.random() * 100000);
  let time = new Date().toLocaleTimeString();

  const idEl = document.getElementById("alertID");
  const timeEl = document.getElementById("alertTime");

  if (idEl) idEl.innerText = "ID: #" + id + " | Active";
  if (timeEl) timeEl.innerText = "Time: " + time;
}

// 🧠 PATIENT ANALYSIS FUNCTION
function analyzePatient() {

  let severity = Math.random();

  let conditionText;
  let priorityText;
  let adviceText;

  if (severity > 0.7) {
    conditionText = "🔴 Critical condition detected";
    priorityText = "🚨 High Priority (Immediate response)";
    adviceText = "⚕️ Oxygen support required, trauma care ready";
  } 
  else if (severity > 0.4) {
    conditionText = "🟠 Moderate injury";
    priorityText = "⚠️ Medium Priority";
    adviceText = "🩺 Monitor vitals, prepare emergency ward";
  } 
  else {
    conditionText = "🟢 Stable condition";
    priorityText = "✔️ Low Priority";
    adviceText = "🧾 Basic first aid sufficient";
  }

  document.getElementById("patientCondition").innerText = conditionText;
  document.getElementById("patientPriority").innerText = priorityText;
  document.getElementById("patientAdvice").innerText = adviceText;

  // 🎨 COLOR LOGIC (YAHAN ADD KARNA HAI)
  const conditionEl = document.getElementById("patientCondition");

  if (severity > 0.7) {
    conditionEl.style.color = "#ef4444"; // red
  }
  else if (severity > 0.4) {
    conditionEl.style.color = "#f59e0b"; // orange
  }
  else {
    conditionEl.style.color = "#22c55e"; // green
  }

}

// 🚑 RESCUE SIMULATION (Dashboard / rescue.html ke liye)

function startSimulation() {

  generateAlert();   // 🔥 alert auto create

  analyzePatient();

  document.getElementById("hospitalName").innerText = "🔍 Scanning hospitals...";
document.getElementById("hospitalDetails").innerText = "Fetching nearby hospitals...";
document.getElementById("hospitalLogic").innerText = "⏳ Please wait...";

  const hospitals = [
    { name: "City Care Hospital", rating: 4.5, distance: 2.3 },
    { name: "Apollo Emergency Center", rating: 4.8, distance: 3.1 },
    { name: "LifeLine Hospital", rating: 4.2, distance: 1.8 }
  ];

  // 🧠 STEP 1: show hospitals list (after 1 sec)
setTimeout(() => {

  const listDiv = document.getElementById("hospitalList");

  

  const hospital = selectBestHospital(hospitals); 

  updateEmergencyResponse();

  setTimeout(() => {
  const summaryEl = document.getElementById("incidentSummary");

  if (summaryEl) {
    summaryEl.innerText =
      `🚨 Accident detected → 📍 Location identified → 🏥 ${hospital.name} selected → 🚑 Ambulance dispatched → 🧠 AI monitoring active`;

    summaryEl.style.color = "#22c55e";
  }
}, 2000);
  
  document.getElementById("ambulanceStatus").innerText =
    "🚑 Ambulance auto-dispatched based on AI optimization";

  listDiv.innerHTML = hospitals.map(h => {
    let score = (h.distance - h.rating).toFixed(2);
    let isBest = h.name === hospital.name;

    return `
      <div style="
        ${isBest ? "color:#22c55e; font-weight:600;" : ""}
      ">
        🏥 ${h.name} ⭐ ${h.rating} • ${h.distance} km
        <span style="color:#64748b;">(score: ${score})</span>
        ${isBest ? " ✅ BEST" : ""}
      </div>
    `;
  }).join("");

  document.getElementById("hospitalLogic").innerHTML = `
  🧠 AI Decision:
  <br>✔ Closest hospital (${hospital.distance} km)
  <br>✔ Good rating (${hospital.rating} ⭐)
  <br>✔ Optimized for fastest response
`;

}, 1000);

  function selectBestHospital(hospitals) {

  return hospitals.reduce((best, current) => {

    // 🧠 score calculate (distance kam, rating zyada = better)
    let bestScore = best.distance - best.rating;
    let currentScore = current.distance - current.rating;

    return currentScore < bestScore ? current : best;

  });

}
  // 🧠 STEP 2: select best hospital (after 2.5 sec)
setTimeout(() => {

  const hospital = selectBestHospital(hospitals);

  console.log("Selected hospital:", hospital);

  document.getElementById("hospitalName").innerText = hospital.name;
  document.getElementById("hospitalDetails").innerText =
    "⭐ " + hospital.rating + " • " + hospital.distance + " km";

  document.getElementById("hospitalLogic").innerText =
    `🤖 Best hospital selected:
✔ Closest (${hospital.distance} km)
✔ High rating (${hospital.rating} ⭐)`;

  document.getElementById("ambulanceStatus").innerText =
    "🚑 Ambulance auto-assigned";

}, 2500);

  console.log("Selected hospital:", hospital);

  document.getElementById("hospitalName").innerText = hospital.name;
  document.getElementById("hospitalDetails").innerText =
    "⭐ " + hospital.rating + " • " + hospital.distance + " km";

  let progress = 0;
  const totalTime = 100;
  const totalDistance = 3.0;

  const interval = setInterval(() => {

    progress++;

    let percent = (progress / totalTime) * 100;
    let eta = Math.ceil((totalTime - progress) / 10);
    let dist = (totalDistance * (1 - percent / 100)).toFixed(2);

    document.getElementById("ambulanceETA").innerText = "ETA: " + eta + " min";
    document.getElementById("distanceLeft").innerText = "Distance: " + dist + " km";

    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressBar2").style.width = percent + "%";

    document.getElementById("progressText").innerText = Math.floor(percent) + "%";
    document.getElementById("progressText2").innerText =
      Math.floor(percent) + "% completed";

    const statusText = document.getElementById("statusText");

    if (percent < 30) {
      statusText.innerText = "🚑 Dispatching...";
      statusText.style.color = "#facc15";
    } 
    else if (percent < 80) {
      statusText.innerText = "🚑 On the way...";
      statusText.style.color = "#38bdf8";
    } 
    else {
      statusText.innerText = "🏥 Arriving...";
      statusText.style.color = "#fb7185";
    }

    if (percent >= 100) {
      clearInterval(interval);

      statusText.innerText = "✅ Arrived!";
      statusText.style.color = "#22c55e";

      document.getElementById("ambulanceETA").innerText = "ETA: Arrived";
      document.getElementById("distanceLeft").innerText = "Distance: 0 km";
    }

  }, 1000);
}

function updateEmergencyResponse() {

  let time = Math.floor(Math.random() * 5) + 3; // 3–7 min
  let severity = Math.random();

  let status;
  let priority;

  if (severity > 0.7) {
    status = "🚨 Immediate dispatch (Critical)";
    priority = "High Priority";
  } 
  else if (severity > 0.4) {
    status = "⚠️ Rapid response team assigned";
    priority = "Medium Priority";
  } 
  else {
    status = "✔️ Standard response activated";
    priority = "Low Priority";
  }

  document.getElementById("responseStatus").innerText = status;
  document.getElementById("responseTime").innerText = "⏱ Estimated Response: " + time + " min";
  document.getElementById("responsePriority").innerText = "📊 Priority: " + priority;

  const statusEl = document.getElementById("responseStatus");

if (severity > 0.7) {
  statusEl.style.color = "#ef4444"; // red
}
else if (severity > 0.4) {
  statusEl.style.color = "#f59e0b"; // orange
}
else {
  statusEl.style.color = "#22c55e"; // green
}
statusEl.style.fontWeight = "600";
statusEl.style.textShadow = "0 0 6px rgba(255,255,255,0.3)";
}





