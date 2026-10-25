# 🎧 Pulsewave

### A Spotify-Inspired Music Streaming Web Application

Pulsewave is a modern, dark-themed music web application built with **React, JavaScript, HTML, and CSS**. Inspired by the user experience of popular music streaming platforms, it demonstrates interactive UI design, component-based architecture, state management, playlist navigation, and local music library functionality.

This project was developed as part of a Front End Engineering-II university project.

---

## ✨ Features

### 🏠 Music Discovery

* Modern, dark-themed homepage.
* Music discovery sections and playlist navigation.
* Responsive layouts designed for different screen sizes.

### 🎵 Music Player

* Play and pause controls.
* Previous and next track controls.
* Playback progress and seeking.
* Volume controls.
* Shuffle and repeat controls.
* Queue interface.
* Now Playing panel.

### 📚 Music Library

* VIBE playlist.
* Liked Songs collection.
* Recently played history.
* Search functionality for available tracks.
* Local music import functionality.

### 💿 Local Music Import

* Import music from a local directory where browser permissions and APIs allow it.
* Read supported track metadata and embedded artwork where available.
* Integrate imported tracks with search, playlists, queue, and playback.
* Use browser storage mechanisms for supported preferences and directory-handle persistence.

### 👤 Public Pages and Account UI

* Public homepage.
* Login and sign-up interfaces with form validation.
* Premium Plans dropdown.
* Premium Account Dashboard demonstration.
* Navigation between public pages and the music player.

> **Note:** Authentication, subscription management, and payment processing are frontend demonstrations. Pulsewave does not implement a production authentication or billing backend.

---

## 🛠️ Tech Stack

| Technology   | Purpose                                      |
| ------------ | -------------------------------------------- |
| HTML5        | Application structure                        |
| CSS3         | Styling, layouts, and responsive UI          |
| JavaScript   | Application logic and interactions           |
| React        | Component-based user interface               |
| Vite         | Development server and build tooling         |
| React State  | Managing interactive UI state                |
| Context API  | Sharing player state across components       |
| localStorage | Persisting supported preferences and data    |
| IndexedDB    | Persisting supported local directory handles |
| lucide-react | Icons                                        |

---

## 🚀 Getting Started

Follow these steps to run Pulsewave locally.

### Prerequisites

Install the following:

* [Node.js](https://nodejs.org/)
* npm, which is included with Node.js
* [Git](https://git-scm.com/) (optional, for cloning the repository)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/pulsewave.git
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Open the project directory

```bash
cd pulsewave
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will display a local development URL in the terminal, typically:

```text
http://localhost:5173
```

Open that address in your browser.

### 5. Create a production build

```bash
npm run build
```

### 6. Run lint checks

```bash
npm run lint
```

---

## 📁 Project Structure

The project uses a React + Vite structure. The main files include:

```text
pulsewave/
├── public/
│   └── artwork/
├── src/
│   ├── data/
│   │   ├── musicData.js
│   │   ├── localMusicLibrary.js
│   │   └── musicDirectoryStore.js
│   ├── player/
│   │   └── PlayerContext.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── PublicExperience.jsx
│   ├── PublicExperience.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

*This is a simplified overview. The exact directory contents may vary as the project evolves.*

---

## 🧠 Key Concepts Demonstrated

### Component-Based Architecture

React components divide the application into reusable UI elements, making the code easier to maintain and extend.

### State Management

React state manages interactive features such as menus, forms, playback controls, and user interface changes.

### Context API

The Context API allows shared player state and functionality to be accessed across relevant components without repeatedly passing props through every intermediate component.

### Event Handling

JavaScript event handlers support interactions such as selecting tracks, controlling playback, opening menus, and navigating between views.

### Form Validation

Controlled form inputs and validation logic provide feedback when users submit invalid or incomplete information.

### Browser Storage

localStorage and IndexedDB support selected persistence features, subject to browser capabilities and permissions.

---

## 🧪 Testing and Validation

The project has undergone code-level validation.

| Check                                 | Status                        |
| ------------------------------------- | ----------------------------- |
| Production build                      | Passed                        |
| ESLint checks                         | Passed                        |
| Static route inspection               | Completed                     |
| Browser interaction testing           | Requires further verification |
| Responsive visual testing             | Requires further verification |
| End-to-end local music import testing | Requires further verification |

A successful build confirms that the application compiles; it does not guarantee that every interactive feature works correctly in every browser.

---

## ⚠️ Limitations

* Login and sign-up are frontend demonstrations, not production authentication.
* Premium features do not process payments or modify real subscriptions.
* Music playback depends on available audio sources and browser support.
* Local music import depends on browser APIs, permissions, and supported file formats.
* Browser-level interaction and responsive testing remain outstanding.

---

## 🔮 Future Improvements

Potential future enhancements include:

* Backend authentication and user profiles.
* Cloud-based music library synchronization.
* Server-side playlists and account persistence.
* Real streaming-service API integration where permitted.
* Improved mobile layouts and accessibility.
* Automated browser testing.
* Production deployment and performance optimization.

---

## 🎓 Project Information

**Project:** Pulsewave — Spotify-Inspired Music Streaming Web Application
**Course:** Front End Engineering-II
**Institution:** Chitkara University
**Developer:** *Add your name here*

---

## 📄 License

No license has been specified yet. If you plan to make this repository public, consider adding an appropriate license after reviewing the ownership and licensing of the project's code and assets.

---

### Built with React, JavaScript, and 🎵
