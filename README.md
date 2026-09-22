# 🌾 Krishi AI — Smart Farming App for Indian Farmers

<div align="center">

![Krishi AI Banner](https://img.shields.io/badge/Krishi_AI-Smart_Farming-green?style=for-the-badge&logo=leaf&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.83-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_55-black?style=for-the-badge&logo=expo)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**An AI-powered mobile application designed to empower Indian farmers with smart technology, real-time data, and multilingual support.**

</div>

---

## 📱 About The App

**Krishi AI** is a comprehensive smart farming assistant built for Indian farmers. It combines artificial intelligence, real-time weather, market prices, crop disease detection, and government scheme information — all in a single easy-to-use mobile app with **multilingual support**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chatbot** | Get instant farming advice powered by AI |
| 🌿 **Crop Disease Detection** | Upload a photo to detect plant diseases |
| 🌦️ **Weather Forecast** | Real-time weather updates for your location |
| 📈 **Mandi Prices** | Live market prices for crops (Mandi rates) |
| 💰 **Kisan Loan** | Loan eligibility and information for farmers |
| 🗺️ **Geo-Fencing** | Map-based field area measurement tool |
| 🚜 **AgriShare** | Share and rent farming equipment |
| 🌐 **Community** | Farmer community posts and discussions |
| 📋 **Government Schemes** | Latest govt schemes and subsidies for farmers |
| 🔔 **Admin Alerts** | Notifications and alerts from admin panel |
| 🌍 **Multilingual** | Supports multiple Indian languages |
| 📊 **Farmer Dashboard** | Personalized dashboard with farm insights |
| 👨‍💻 **Developer Screen** | App info and developer credits |

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native** 0.83 with **TypeScript**
- **Expo SDK 55**
- **React Navigation** — Screen navigation
- **i18next** — Multilingual / internationalization
- **Expo Location** — GPS & geofencing
- **React Native Maps** — Map integration
- **Expo Camera / Image Picker** — Crop photo analysis
- **Expo Speech** — Voice support

### Backend
- **Node.js** with **Express.js**
- **REST API** for AI, auth, mandi, weather data
- **Docker** support via `docker-compose.yml`

---

## 📁 Project Structure

```
krishi-ai/
├── src/
│   ├── screens/          # All app screens
│   │   ├── HomeScreen.tsx
│   │   ├── ChatbotScreen.tsx
│   │   ├── AnalyzeScreen.tsx
│   │   ├── WeatherScreen.tsx
│   │   ├── MandiScreen.tsx
│   │   ├── KisanLoanScreen.tsx
│   │   ├── GeoFencingScreen.tsx
│   │   ├── AgriShareScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   └── ...more screens
│   ├── components/       # Reusable UI components
│   └── utils/            # Helper functions & storage
├── backend/
│   ├── server.js         # Express server entry point
│   ├── routes/           # API route handlers
│   └── .env              # Environment variables (not committed)
├── assets/               # Images, icons, fonts
├── App.tsx               # Main app entry point
├── docker-compose.yml    # Docker configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or above)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) or physical Android device

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/basufulari/krishi-ai.git

# 2. Navigate to the project
cd krishi-ai

# 3. Install dependencies
npm install

# 4. Setup environment variables
cp .env.example backend/.env
# Edit backend/.env with your API keys

# 5. Start the backend server
cd backend
node server.js

# 6. Start the Expo app (in a new terminal)
cd ..
npx expo start
```

### Running on Android

```bash
# Scan the QR code with Expo Go app, OR
npx expo run:android
```

---

## 🔑 Environment Variables

Create a `backend/.env` file based on `.env.example`:

```env
# Add your API keys here
OPENAI_API_KEY=your_key_here
WEATHER_API_KEY=your_key_here
# ... other keys
```

> ⚠️ **Never commit your `.env` file to GitHub!**

---

## 🐳 Docker Support

```bash
# Run backend with Docker
docker-compose up
```

---

## 📸 Screenshots

> *Coming soon — add screenshots of your app here*

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Developer

**Basavaraj** — [@basufulari](https://github.com/basufulari)

> Built with ❤️ to empower Indian farmers through technology

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>🌾 Krishi AI — Technology in the hands of every farmer 🌾</strong>
</div>
