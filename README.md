# 💸 TrustLend — P2P Emergency Loans for Underserved Communities

A decentralized microloan platform that helps people in rural or low-income areas access emergency credit — using **social trust** instead of traditional credit scores.

---

## 🌍 Problem We're Solving

Millions lack access to formal loans due to:
- No credit history or collateral
- Limited banking infrastructure

**TrustLend** enables peer-to-peer loans using:
- Trust scores from community data
- Transparent blockchain-style ledger
- SMS-based access in local languages

---

## 🔑 Key Features

- ✅ **Social Trust Scoring** – Simple points-based model from referrals and repayments
- ✅ **Fraud Prevention** – OTP verification + hashed transaction ledger (blockchain sim)
- ✅ **Lender Incentives** – Gamified badges & minimal interest returns (1–2% APR)
- ✅ **High Accessibility** – SMS support (Twilio), Hindi/Tamil/Marathi support

---

## ⚙️ Tech Stack

- **Backend**: Flask (Python)
- **SMS Gateway**: Twilio
- **Database**: SQLite
- **Blockchain Sim**: Hashed ledger using SHA256
- **Frontend (Optional)**: Simple dashboard or WhatsApp chatbot

---

## 🧪 How It Works

1. Users register via SMS with OTP
2. Borrowers request loans via SMS (e.g., `LOAN ₹1000`)
3. Platform checks trust score
4. Lender accepts, transaction logged in ledger
5. Repayment via SMS triggers score update

---

## 📦 Run Locally

```bash
git clone https://github.com/nalin-mahajan/ts25
cd ts25
pip install -r requirements.txt
python app.py
```git 
📲 Sample SMS Commands

    REGISTER Asha

    LOAN ₹500

    REPAY ₹500

    SCORE → Shows current trust score

🔮 Roadmap

    NGO / microfinance partner integration

    WhatsApp chatbot

    Multilingual support expansion

    Real-time analytics for lenders

## 👨‍💻 Team

| Name     | Role                    | Contribution                              |
|----------|-------------------------|-------------------------------------------|
| Sachin   | Backend Developer       | Flask backend, DB, OTP verification       |
| Nalin    | Frontend Developer      | UI design, dashboard/chatbot              |
| Ane      | Trust Score & Blockchain| Social trust algorithm, blockchain sim    |
| Shashank | API & Testing Lead      | API integration, test cases, flow testing |
