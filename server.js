const express = require("express");
const twilio = require("twilio");
const contacts = [
  "whatsapp:+919807343224", // mummy
  "whatsapp:+919721132121"  // mine
];
const alerts = {};

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;

const client = twilio(accountSid, authToken);

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

async function sendAlert(alertId, location) {


  if (alerts[alertId]) {
    alerts[alertId].status = "active";
  }

  let index = 0;

  while (true) {

    if (alerts[alertId].acknowledged) {
      console.log("✅ Alert handled, stopping escalation");
      return;
    }

    const to = contacts[index];

    console.log(`📤 Sending alert to ${to}`);

    try {
      const message = await client.messages.create({
        body: `🚨 Accident Detected!
Location: https://maps.google.com/?q=${location.lat},${location.lng}
Reply YES to confirm.`,
        from: "whatsapp:+14155238886",
        to: to
      });

      console.log("✅ Sent:", message.sid);

    } catch (err) {
      console.log("❌ Failed for:", to);
      console.log("ERROR DETAILS:", err.message);
    }

    await new Promise(resolve => setTimeout(resolve, 30000));

    if (alerts[alertId].acknowledged) {
      console.log("🛑 Stopped after wait (response received)");
      return;
    }

    index++;

    if (index >= contacts.length) {
      index = 0;
      console.log("🔁 Restarting escalation cycle...");
    }
  }
}

app.post("/alert", async (req, res) => {
  console.log("ALERT HIT 🔥");

    const { location } = req.body;

    if (!location || !location.lat || !location.lng) {
    return res.status(400).json({ message: "Invalid location" });
    }
    
    const alertId = Date.now();

    alerts[alertId] = {
    acknowledged: false,
    status: "pending",   
    time: new Date()
    };

    // 🔥 START ESCALATION
  sendAlert(alertId, location);

  res.json({ message: "Escalation started 🚀" });
});

app.post("/webhook", (req, res) => {
  const msg = (req.body.Body || "").trim().toLowerCase();

  console.log("📩 Incoming reply:", msg);

  if (msg === "yes") {
    
    const keys = Object.keys(alerts);
    const lastAlertId = keys[keys.length - 1];

    if (lastAlertId && alerts[lastAlertId]) {
      alerts[lastAlertId].acknowledged = true;
      alerts[lastAlertId].status = "resolved";
      console.log("✅ Alert acknowledged → STOP escalation");
    }
  }

  res.sendStatus(200);
});

app.get("/alerts", (req, res) => {
  res.json(alerts);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});