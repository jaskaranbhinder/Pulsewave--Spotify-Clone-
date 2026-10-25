export const tracks = [
  { id: 'deewaana', title: 'Deewaana Deewaana', artist: 'A.R. Rahman, Irshad Kamil', album: 'Tere Ishk Mein', added: 'Jun 7, 2026', duration: '5:37', seconds: 337, artwork: '', audio: '/audio/pulsewave-demo-a.wav', playlists: ['vibe'], demoAudio: true },
  { id: 'itni-si-baat', title: 'Itni Si Baat Hain (From "Azhar")', artist: 'Arijit Singh, Antara Mitra', album: 'Azhar', added: 'Jun 7, 2026', duration: '4:55', seconds: 295, artwork: '', audio: '/audio/pulsewave-demo-b.wav', playlists: ['vibe'], demoAudio: true },
  { id: 'ishqa-ve', title: 'Ishqa Ve', artist: 'Zeeshan Ali, Yuvraj Tung, Sandeep Aulakh', album: 'Ishqa Ve', added: 'Jun 7, 2026', duration: '3:19', seconds: 199, artwork: '', audio: '/audio/pulsewave-demo-c.wav', playlists: ['vibe'], demoAudio: true },
  { id: 'ghol-ghumai', title: 'Ghol Ghumai Lalna', artist: 'Bhai Surinder Singh Ji Jodhpuri', album: 'Har Jiyo Nimaneeaan Tu Maan', added: '1 week ago', duration: '10:11', seconds: 611, artwork: '', audio: '/audio/pulsewave-demo-a.wav', playlists: ['liked'], demoAudio: true },
  { id: 'barsaat', title: 'Barsaat', artist: 'Banjaare, Roni', album: 'Barsaat', added: '3 weeks ago', duration: '3:05', seconds: 185, artwork: '', audio: '/audio/pulsewave-demo-b.wav', playlists: ['liked'], demoAudio: true },
  { id: 'ishq-mubarak', title: 'Ishq Mubarak (From "Tum Bin 2")', artist: 'Arijit Singh', album: 'Tum Bin 2', added: 'May 22, 2026', duration: '4:57', seconds: 297, artwork: '', audio: '/audio/pulsewave-demo-c.wav', playlists: ['vibe'], demoAudio: true },
  { id: 'galliyan', title: 'Galliyan', artist: 'Ankit Tiwari, Manoj Muntashir', album: 'Ek Villain', added: 'May 21, 2026', duration: '5:40', seconds: 340, artwork: '', audio: '/audio/pulsewave-demo-a.wav', playlists: ['vibe'], demoAudio: true },
  { id: 'humnava-mere', title: 'Humnava Mere', artist: 'Jubin Nautiyal', album: 'Humnava Mere', added: 'May 20, 2026', duration: '5:29', seconds: 329, artwork: '', audio: '/audio/pulsewave-demo-b.wav', playlists: ['vibe'], demoAudio: true },
  { id: 'dil-evr', title: 'Dil (From "Ek Villain Returns")', artist: 'Kaushik-Guddu, Raghav Chaitanya', album: 'Ek Villain Returns', added: 'May 19, 2026', duration: '4:14', seconds: 254, artwork: '', audio: '/audio/pulsewave-demo-c.wav', playlists: ['vibe'], demoAudio: true },
]

export const playlists = {
  vibe: { id: 'vibe', name: 'VIBE', owner: 'Jaskaran Singh', description: '', artwork: '/artwork/playlist-vibe.png', trackIds: ['deewaana', 'itni-si-baat', 'ishqa-ve', 'ishq-mubarak', 'galliyan', 'humnava-mere', 'dil-evr'] },
}

export const trackById = Object.fromEntries(tracks.map((track) => [track.id, track]))
