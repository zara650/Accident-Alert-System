🚨 Accident Alert System

📌 Project Overview

Accident Alert System is a real-time emergency response application that detects accidents and automatically sends alert messages via WhatsApp to predefined contacts using Twilio API. The system helps in quick response and escalation until confirmation is received.

---

🎯 Objective

- Detect accident situations in real-time
- Notify emergency contacts instantly
- Ensure alert acknowledgment
- Reduce response time in emergencies

---

⚙️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- API: Twilio WhatsApp API
- Other Tools: Ngrok, Google Maps

---

🚀 Features

- 📍 Live location sharing via Google Maps
- 📲 Automatic WhatsApp alert system
- 🔁 Escalation cycle until acknowledgment
- ✅ Alert confirmation using "YES" reply
- 📊 Dashboard to monitor alerts
- 🌐 Real-time communication using webhook

---

🔧 Installation & Setup

1️⃣ Clone Repository

git clone https://github.com/zara650/Accident-Alert-System.git
cd Accident-Alert-System

2️⃣ Install Dependencies

npm install

3️⃣ Setup Environment Variables

Create a ".env" file and add:

TWILIO_SID=your_account_sid
TWILIO_AUTH=your_auth_token

4️⃣ Start Server

node server.js

5️⃣ Run Ngrok

ngrok http 5000

---

📡 API Endpoints

🔹 Send Alert

POST /alert

Request Body:

{
  "location": {
    "lat": 26.8467,
    "lng": 80.9462
  }
}

---

🔹 Webhook (WhatsApp Reply)

POST /webhook

---

🔹 Get Alerts

GET /alerts

---

🔄 Working Flow

1. Accident detected
2. Location captured
3. Alert sent to first contact
4. If no response → escalate to next contact
5. If "YES" received → stop escalation

---

📱 Twilio WhatsApp Setup

- Join Twilio Sandbox
- Send:

join <sandbox-code>

to:

+1 415 523 8886

---

⚠️ Challenges Faced

- API authentication issues
- WhatsApp sandbox configuration
- Real-time message handling
- Error handling in escalation logic

---

💡 Future Enhancements

- AI-based accident detection
- Integration with hospitals & ambulance services
- Live tracking of ambulance
- Data encryption for patient safety

---

👩‍💻 Developed By

Mahima Gupta

---

📌 Conclusion

This system provides a reliable and fast emergency alert mechanism that ensures timely help during accidents, making it a useful real-world application for safety and rescue operat
