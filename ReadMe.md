<p align="center">
  <img src="./assets/images/DulM.png" alt="Dulce App Banner" width="800"/>
</p>

<p align="center">
  <strong>A Mindful Wellness Companion for Calm and Focus</strong>
</p>

<p align="center">
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white">
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
</p>

---

## 🌿 Core Philosophy

**Dulce** (pronounced _Dool-say_) is more than just an app; it's a digital sanctuary designed from the ground up to reduce stress through serene, gesture-based interactions. The core design principle is to replace complex UI with fluid, rhythmic gestures, creating a predictable and calming environment.

The application adheres to a strict "one-color" aesthetic, utilizing a deep **Olive Green (`#4E6813`)** and its tints to create a visually cohesive and low-sensory experience that is especially mindful of users on the autism spectrum.

## ✨ Key Features

<details>
  <summary><strong>🧠 Mindful Activities & Games</strong></summary>
  <ul>
    <li>
      <g-emoji class="g-emoji" alias="leaves" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f343.png">🍃</g-emoji>
      <strong>Guided Breathing:</strong> An interactive, timed breathing exercise with smooth animations to promote calmness.
    </li>
    <li>
      <g-emoji class="g-emoji" alias="puzzle" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f9e9.png">🧩</g-emoji>
      <strong>Zen Slide & Starlight Tap:</strong> Non-verbal puzzle games designed to induce a state of flow and focus.
    </li>
    <li>
      <g-emoji class="g-emoji" alias="sparkles" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/2728.png">✨</g-emoji>
      <strong>Willowisp Maze:</strong> A timed labyrinth game with strategic elements to encourage mindful problem-solving.
    </li>
  </ul>
</details>

<details>
  <summary><strong>✍️ Personalized Journaling</strong></summary>
  <ul>
    <li>
      <g-emoji class="g-emoji" alias="notebook" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f4d3.png">📓</g-emoji>
      <strong>Text Journal:</strong> A private, focused space for written reflection, with entries saved securely to Firestore.
    </li>
    <li>
      <g-emoji class="g-emoji" alias="movie_camera" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f3a5.png">🎥</g-emoji>
      <strong>Video Diary:</strong> A non-verbal diary where users can record and save short video clips via Cloudinary, with entries displayed beautifully in a "Memories" log.
    </li>
  </ul>
</details>

<details>
  <summary><strong>📈 Progress & Motivation</strong></summary>
  <ul>
    <li>
      <g-emoji class="g-emoji" alias="fire" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f525.png">🔥</g-emoji>
      <strong>Daily Streaks & Progress Bar:</strong> A visual system on the home screen encourages daily engagement by tracking completed activities.
    </li>
    <li>
      <g-emoji class="g-emoji" alias="bar_chart" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f4ca.png">📊</g-emoji>
      <strong>Mood Analytics:</strong> A dedicated stats page visualizes mood trends over time with clean, modern charts.
    </li>
  </ul>
</details>

<details>
  <summary><strong>🎵 Immersive Experience</strong></summary>
  <ul>
    <li>
      <g-emoji class="g-emoji" alias="musical_note" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f3b5.png">🎵</g-emoji>
      <strong>Integrated Music Player:</strong> Features a playlist of calming background tracks with rotating album art, managed globally via React Context.
    </li>
    <li>
      <g-emoji class="g-emoji" alias="art" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f3a8.png">🎨</g-emoji>
      <strong>Apple-Inspired "Soft UI":</strong> A clean, Neumorphic design with soft shadows and a polished aesthetic for a premium feel.
    </li>
  </ul>
</details>

## 🚀 Tech Stack

| Category                 | Technology                                        |
| :----------------------- | :------------------------------------------------ |
| **Framework**            | React Native with Expo                            |
| **Navigation**           | Expo Router (File-based w/ Groups)                |
| **State Management**     | React Context (`AuthContext`, `MusicContext`)     |
| **Animation & Gestures** | React Native Reanimated, Gesture Handler          |
| **Backend (BaaS)**       | Firebase (Authentication, Firestore, Realtime DB) |
| **Cloud Media**          | Cloudinary (for Video Diary uploads)              |
| **Charting**             | `react-native-gifted-charts`                      |
| **Language**             | TypeScript                                        |

## 📂 Project Structure

The project utilizes a feature-driven structure within the Expo Router `app` directory, promoting separation of concerns and scalability.


## ⚙️ Setup & Installation

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [Git](https://git-scm.com/)
-   Expo Go app on a physical iOS or Android device

### Installation Guide

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/RelaxPoi.git
    cd RelaxPoi
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    This project requires API keys from Firebase and Cloudinary.
    
    -   **Firebase:**
        -   Create a `firebaseConfig.js` file in the project root.
        -   Paste your Firebase Web configuration object into this file.
        -   Ensure you export `auth` (Authentication) and `db` (Firestore) from this file.
    
    -   **Cloudinary:**
        -   Open `app/(app)/videoDiary.tsx`.
        -   Replace the placeholder `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` constants with your own credentials from your Cloudinary dashboard.

4.  **Launch the App**
    ```bash
    npx expo start
    ```
    Scan the generated QR code with the **Expo Go** app on your mobile device.

---
<p align="center">
  Developed with a focus on calm and mindfulness.
</p>
