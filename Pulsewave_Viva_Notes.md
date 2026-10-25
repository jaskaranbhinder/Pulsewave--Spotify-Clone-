# Pulsewave viva preparation

## Project in one minute

Pulsewave is a React and Vite frontend demonstration of a Spotify-inspired music player. It combines public discovery and demo account pages with a local player, playlists, search, queue, likes, recently played history, and browser-based local audio import. It does not provide production streaming, real authentication, payment processing, or cloud accounts.

## Architecture

- src/main.jsx renders the application inside React StrictMode and wraps App in PlayerProvider.
- src/App.jsx reads query and hash routes, selects public or player views, and composes the top bar, library sidebar, main page, Now Playing or queue panel, and bottom player.
- src/PublicExperience.jsx implements the public homepage, destination pages, Premium dropdown, account dashboard demo, and controlled login/sign-up forms.
- src/player/PlayerContext.jsx owns shared audio state and actions. Player views access it through usePlayer() from src/player/usePlayer.js.
- src/data/musicData.js defines sample tracks and the VIBE playlist. src/data/localMusicLibrary.js parses supported local audio and metadata. src/data/musicDirectoryStore.js stores and retrieves the selected directory handle.

## Important JavaScript behavior

- playTrack(id, ids) finds a stable track ID, updates the current selection, records the ID as most recent, and asks the browser audio element to play the selected track.
- Recent history is de-duplicated by ID, ordered newest first, capped at 12 entries, and persisted as pulsewave-recent-tracks in localStorage.
- toggleLike, queue actions, seek, volume, next/previous, shuffle, and repeat are shared through the player context.
- The login and sign-up form in AuthPage uses controlled email state. It trims whitespace and validates a basic email format. It displays a demo message rather than contacting a backend or saving the email.
- Music import supports the File System Access API where available and a directory-input fallback. The ID3 reader can extract title, artist, album, and embedded APIC/PIC artwork. Imported track object URLs are runtime-only.
- The directory handle is stored in IndexedDB. The source audio files are not copied into IndexedDB or uploaded.

## Likely viva questions

### Why use Context API for the player?

The player is used by several parts of the interface. Context lets the provider expose shared playback state and actions without passing the same props through every intermediate component.

### What does useState do in this project?

It holds changing UI and player values, including the selected track, playback status, likes, queue, volume, email form input, and open menus. Updating state causes React to render the affected interface again.

### How is the recent list kept current?

When playTrack is called, it places that track ID at the front, removes any older copy of the same ID, keeps at most 12 IDs, and an effect writes the value to localStorage.

### Is the login real?

No. This is a frontend demonstration. It validates an email address and shows a message. There is no password collection, authentication backend, account creation, or external provider sign-in.

### How does local music import work?

The browser selects a directory or a set of files. The app filters for audio files, reads available metadata and embedded artwork, reads the duration, creates object URLs for playback, and adds the resulting tracks to runtime player data. It can store the directory handle in IndexedDB, subject to browser permission.

### What remains unavailable?

There is no remote music catalogue or licensed streaming service, real authentication, cloud library synchronization, or real subscription/payment integration. Personal-file import and browser-level interactions were not end-to-end tested for this presentation.

## Validation and presentation caveat

The project build and lint were rerun during this presentation task and passed. Static route checks from the earlier integration pass reported HTTP 200 for checked paths, which confirms an app-shell response and does not prove that each React route rendered correctly. No browser automation or screenshot rendering tool was available for this presentation task. Screenshots in the deck are existing project captures; the Premium menu and account images are supplied references and are labeled accordingly.

## Future scope

Possible future work includes a secure authentication service, backend APIs, licensed remote streaming, cloud-backed user libraries, and a real subscription provider. These are not implemented features.

## Editable placeholders

Replace [Your name], [Your registration number], and [Your university and faculty] on the title slide before submission.
