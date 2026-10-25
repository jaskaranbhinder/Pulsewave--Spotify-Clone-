import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive, Bell, CircleArrowDown, Clock3, Download, FolderOpen, Heart,
  House, List, ListMusic, Maximize, Maximize2, Monitor, MonitorSmartphone,
  MoreHorizontal, Music2, Pause, PenLine, Play, Plus, Search, Shuffle,
  SkipBack, SkipForward, UsersRound, Volume2, VolumeX, X,
} from 'lucide-react'
import { trackById as sampleTrackById, playlists } from './data/musicData'
import { usePlayer } from './player/usePlayer'
import TrackArtwork from './components/TrackArtwork'
import { logoutDemoAccount, readDemoSession } from './auth/demoAuth'
import PublicExperience from './PublicExperience'
import './App.css'

const shortcuts = [
  ['Said & Done', 'shortcut-said-done'], ['VIBE', 'shortcut-vibe'], ['Kaali Hoodie', 'shortcut-kaali-hoodie'], ['Barsaat Radio', 'shortcut-barsaat-radio'],
  ['OG', 'shortcut-og'], ['Apollo', 'shortcut-apollo'], ['Arjan Dhillon Radio', 'shortcut-arjan-radio'], ['AJULA SZN 1', 'shortcut-ajula'],
]
const stations = [
  ['Real Bad Man', 'With Karan Aujla, Navaan Sandhu,...', 'radio-real-bad-man'],
  ['Alvida Alvida (From "Dar-E-Nijaat")', 'With Nabeel Shaukat Ali, Wajhi Farooqi,...', 'radio-alvida'],
  ['Bhalwaan', 'With Otaal, Signature By SB, Prem Dhillon...', 'radio-bhalwaan'],
  ['Taare', 'With Farak, Aditya Pushkarna, 10A and more', 'radio-taare'],
  ['Jordan Sandhu', 'With Prem Dhillon, Navaan Sandhu,...', 'radio-jordan'],
]
const library = [
  ['Liked Songs', 'Playlist · 54 songs', null, 'liked'], ['OG', 'Playlist · Jaskaran Singh', 'library-og'],
  ['VIBE', 'Playlist · Jaskaran Singh', 'library-vibe', 'vibe'], ['TOP 50 PUNJABI SONGS 2026', 'Playlist · SpiceUp', 'library-top50'],
  ['Arjan Dhillon', 'Artist', 'library-arjan'], ['My top tracks playlist', 'Playlist · Jaskaran Singh', 'library-toptracks'], ['Young G.O.A.T', 'Playlist · Jaskaran Singh', 'shortcut-ajula'],
]
const formatTime = (value = 0) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`
const publicRoutes = new Set(['public', 'login', 'signup', 'premium', 'support', 'download', 'account'])
const playerRoutes = new Set(['home', 'vibe', 'liked', 'local'])
const readPlayerRoute = () => {
  const hashRoute = location.hash.slice(1)
  const route = hashRoute.startsWith('/playlist/') ? hashRoute.slice('/playlist/'.length) : hashRoute
  return playerRoutes.has(route) ? route : null
}
const readPublicRoute = () => {
  const view = new URLSearchParams(location.search).get('view')
  if (view === 'player') return null
  if (publicRoutes.has(view)) return view
  if (readPlayerRoute()) return null
  return 'public'
}

function SpotifyMark() {
  return <svg className="spotify-mark" viewBox="0 0 40 40" aria-label="Spotify" role="img"><circle cx="20" cy="20" r="20" fill="currentColor"/><path d="M9 14.2c7.8-2.3 16.4-1.7 22.2 1.7M10.2 20c6.8-1.8 14.2-1.3 19.7 1.5M11.5 25.5c5.5-1.4 11.6-.9 16.3 1.3" fill="none" stroke="#000" strokeWidth="2.25" strokeLinecap="round"/></svg>
}

function Artwork({ track, className = '' }) {
  return <TrackArtwork track={track} className={className} placeholderClassName={`track-art-placeholder ${className}`}/>
}

function TrackTable({ items, onPlay, likedIds, toggleLike, addToQueue }) {
  const [hovered, setHovered] = useState(null)
  return <div className="track-table">
    <div className="track-table-head"><span>#</span><span>Title</span><span>Album</span><span>Date added</span><span><Clock3 size={17}/></span></div>
    {items.map((track, index) => <div className={`track-row ${hovered === track.id ? 'hovered' : ''}`} key={track.id} onMouseEnter={() => setHovered(track.id)} onMouseLeave={() => setHovered(null)}>
      <button className="row-number" onClick={() => onPlay(track.id, items.map((item) => item.id))} aria-label={`Play ${track.title}`}>{hovered === track.id ? <Play size={16} fill="currentColor"/> : index + 1}</button>
      <div className="row-title"><Artwork track={track}/><div><button onClick={() => onPlay(track.id, items.map((item) => item.id))}>{track.title}</button>{track.artist && <span>{track.artist}</span>}</div></div>
      <span className="row-album">{track.album || '—'}</span><span className="row-date">{track.added || '—'}</span>
      <div className="row-actions"><button aria-label={likedIds.includes(track.id) ? 'Unlike song' : 'Like song'} className={likedIds.includes(track.id) ? 'liked' : ''} onClick={() => toggleLike(track.id)}><Heart size={18} fill={likedIds.includes(track.id) ? 'currentColor' : 'none'}/></button><button aria-label="Add to queue" onClick={() => addToQueue(track.id)}><MoreHorizontal size={20}/></button><span>{track.duration || '—'}</span></div>
    </div>)}
  </div>
}

function HomePage({ navigate, playTrack, likedIds, toggleLike, addToQueue, searchQuery, allTracks, recentTrackIds }) {
  const found = searchQuery.trim() ? allTracks.filter((track) => `${track.title} ${track.artist} ${track.album} ${track.filename || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) : []
  if (searchQuery.trim()) return <div className="home-content search-results"><div className="section-heading"><h1>Search results</h1></div>{found.length ? <TrackTable items={found} onPlay={playTrack} likedIds={likedIds} toggleLike={toggleLike} addToQueue={addToQueue}/> : <p className="empty-message">No results found for “{searchQuery}”.</p>}</div>
  return <div className="home-content">
    <div className="chips"><button className="selected">All</button><button>Music</button><button>Podcasts</button></div>
    <div className="shortcut-grid">{shortcuts.map(([name, artwork]) => <button className="shortcut" key={name} onClick={() => name === 'VIBE' && navigate('vibe')}><img src={`/artwork/${artwork}.png`} alt=""/><b>{name}</b></button>)}</div>
    <section className="station-section"><p className="eyebrow">Non-stop music based on your favorite songs and artists.</p><div className="section-heading"><h1>Recommended Stations</h1><button>Show all</button></div><div className="station-row">{stations.map(([name, detail, artwork]) => <article className="station" key={name}><img src={`/artwork/${artwork}.png`} alt=""/><p>{detail}</p></article>)}</div></section>
    <section className="jump-section"><div className="section-heading"><h2>Jump back in</h2></div>{recentTrackIds.length ? <div className="home-track-cards">{recentTrackIds.map((id) => allTracks.find((track) => track.id === id)).filter(Boolean).map((track) => <button key={track.id} onClick={() => playTrack(track.id)}><Artwork track={track}/><span>{track.title}</span></button>)}</div> : <p className="recent-empty">Play a song to see it here.</p>}</section>
  </div>
}

function LocalMusicPage({ localTracks, playTrack, likedIds, toggleLike, addToQueue }) {
  return <div className="home-content local-music-page"><div className="section-heading"><h1>Local Music</h1></div><p className="eyebrow">{localTracks.length} imported {localTracks.length === 1 ? 'track' : 'tracks'} · files stay on your device</p>{localTracks.length ? <TrackTable items={localTracks} onPlay={playTrack} likedIds={likedIds} toggleLike={toggleLike} addToQueue={addToQueue}/> : <p className="empty-message">Import a folder to see your songs here.</p>}</div>
}

function PlaylistPage({ liked, items, playTrack, setShuffle, likedIds, toggleLike, addToQueue }) {
  const vibe = playlists.vibe
  const list = liked ? items : vibe.trackIds.map((id) => sampleTrackById[id]).filter(Boolean)
  const [filter, setFilter] = useState('')
  const shown = list.filter((track) => !filter || `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(filter.toLowerCase()))
  const ids = shown.map((track) => track.id)
  const total = list.reduce((sum, track) => sum + track.seconds, 0)
  return <div className={`playlist-page ${liked ? 'liked-page' : 'vibe-page'}`}>
    <div className="playlist-hero"><div className={liked ? 'liked-cover' : 'playlist-cover'}>{liked ? <img src="/artwork/playlist-liked.png" alt="Liked Songs artwork"/> : <img src={vibe.artwork} alt="VIBE playlist artwork"/>}</div><div className="playlist-meta"><span>{liked ? 'Playlist' : 'Public Playlist'}</span><h1>{liked ? 'Liked Songs' : 'VIBE'}</h1><div className="playlist-owner"><img src="/artwork/profile-user.png" alt=""/><b>Jaskaran Singh</b><span>· {liked ? `${list.length} songs, ${list.length ? `about ${Math.floor(total / 3600)} hr ${Math.round((total % 3600) / 60)} min` : 'your music library'}` : '54 songs, about 3 hr 45 min'}</span></div></div></div>
    <div className="playlist-tools"><button className="large-play" aria-label="Play playlist" onClick={() => ids[0] && playTrack(ids[0], ids)}><Play size={25} fill="black"/></button>{!liked && <img className="playlist-mini-art" src={vibe.artwork} alt=""/>}<button className="playlist-shuffle" onClick={() => { setShuffle(true); if (ids.length) playTrack(ids[Math.floor(Math.random() * ids.length)], ids) }} aria-label="Shuffle playlist"><Shuffle size={21}/></button><button className="playlist-download" aria-label="Download"><Download size={22}/></button>{!liked && <button aria-label="Collaborators"><UsersRound size={23}/></button>}<button className="playlist-more" aria-label="More options"><MoreHorizontal size={26}/></button><div className="playlist-view-tools">{liked ? <><Search size={20}/><input aria-label="Filter liked songs" placeholder="Search in playlist" value={filter} onChange={(event) => setFilter(event.target.value)}/></> : <button aria-label="List view"><span>List</span><List size={21}/></button>}</div></div>
    {!liked && <div className="playlist-subtools"><button><Plus size={21}/>Add</button><button><List size={19}/>Mix</button><button><PenLine size={19}/>Name & details</button></div>}
    <TrackTable items={shown} onPlay={playTrack} likedIds={likedIds} toggleLike={toggleLike} addToQueue={addToQueue}/>
  </div>
}

function LibraryPanel({ expanded, setExpanded, page, go, libraryItems, player, onImport, folderFallback }) {
  const listRef = useRef(null)
  const listScrollTop = useRef(0)
  useEffect(() => {
    if (expanded && listRef.current) listRef.current.scrollTop = listScrollTop.current
  }, [expanded])
  const notice = player.importing || player.importError || player.importStatus || player.needsReimport || folderFallback
  const content = libraryItems.map(([name, description, artwork, destination]) => <button className={`library-item ${page === destination ? 'selected' : ''}`} key={name} aria-label={name} title={name} onClick={() => destination && go(destination)}>
    <div className={`library-art ${!artwork ? 'liked-art' : ''}`}>{artwork ? <img src={`/artwork/${artwork}.png`} alt=""/> : destination === 'local' ? <span className="local-library-art"><Music2 size={25}/></span> : <svg viewBox="0 0 60 60"><defs><linearGradient id="liked" x2="1" y2="1"><stop stopColor="#591bfa"/><stop offset="1" stopColor="#a8dbc5"/></linearGradient></defs><rect width="60" height="60" fill="url(#liked)"/><path d="M30 44 14 28c-9-12 6-23 16-11 10-12 25-1 16 11z" fill="white"/></svg>}</div>
    <div className="library-copy"><b>{name}</b><span>{description}</span></div>
  </button>)
  return <aside className="library-panel">
    {expanded ? <>
      <div className="library-heading"><strong>Your Library</strong><button><Plus size={22}/>Create</button><button className="expand-icon" onClick={() => setExpanded(false)} aria-label="Collapse library"><Maximize2 size={18}/></button></div>
      <div className="library-filters"><button>Playlists</button><button>Artists</button><button>Albums</button></div>
      <div className="library-tools"><button className="import-music-button" aria-label="Import Music" onClick={onImport}><FolderOpen size={18}/><span>Import Music</span></button><span className="library-recents">Recents</span><List size={20}/></div>
      {notice && <div className={`music-import-notice ${player.importError ? 'has-error' : ''}`}>{folderFallback && !player.importError ? 'Choose the J:\\Music folder in the folder dialog. Files stay in place.' : player.importing ? player.importStatus || 'Importing audio files…' : player.importError || player.importStatus || 'Re-import your music folder to restore local tracks.'}{player.needsReimport && <button onClick={onImport}>Import again</button>}</div>}
      <div className="library-list" ref={listRef} onScroll={(event) => { listScrollTop.current = event.currentTarget.scrollTop }}>{content}</div>
    </> : <>
      <div className="compact-tools"><button onClick={() => setExpanded(true)} aria-label="Expand library"><ListMusic size={26}/></button><button onClick={onImport} aria-label="Import Music" title="Import Music"><Plus size={25}/></button></div>
      <div className="compact-list">{libraryItems.map(([name,,artwork,destination]) => <button key={name} aria-label={name} onClick={() => destination ? go(destination) : setExpanded(true)}>{artwork ? <img src={`/artwork/${artwork}.png`} alt=""/> : destination === 'local' ? <span className="compact-liked"><Music2 size={23}/></span> : <span className="compact-liked"><Heart fill="white" strokeWidth={0}/></span>}</button>)}</div>
    </>}
  </aside>
}

function App() {
  const player = usePlayer()
  const folderInputRef = useRef(null)
  const narrowLayoutRef = useRef(window.innerWidth <= 850)
  const [publicRoute, setPublicRoute] = useState(readPublicRoute)
  const [demoSession, setDemoSession] = useState(readDemoSession)
  const [expanded, setExpanded] = useState(() => !['vibe', 'liked', 'local'].includes(readPlayerRoute()))
  const [rightView, setRightView] = useState(() => readPlayerRoute() === 'liked' || window.innerWidth <= 850 ? 'none' : 'now')
  const [accountOpen, setAccountOpen] = useState(false)
  const [page, setPage] = useState(() => readPlayerRoute() || 'home')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [folderFallback, setFolderFallback] = useState(false)

  const navigate = (next) => { setPage(next); setSearch(''); setSearchOpen(false); if (next !== 'home') setExpanded(false); if (next === 'liked' || (rightView === 'none' && narrowLayoutRef.current)) setRightView('none'); else if (next !== 'home' && rightView === 'none') setRightView('now') }
  useEffect(() => {
    const onResize = () => {
      const narrow = window.innerWidth <= 850
      if (narrow !== narrowLayoutRef.current) {
        narrowLayoutRef.current = narrow
        setRightView(narrow || readPlayerRoute() === 'liked' ? 'none' : 'now')
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  useEffect(() => { const pop = () => { const route = readPublicRoute(); setPublicRoute(route); if (route === null) { const next = readPlayerRoute() || 'home'; setPage(next); setExpanded(next === 'home'); setRightView(next === 'liked' || window.innerWidth <= 850 ? 'none' : 'now') } }; window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop) }, [])
  const openPublicPage = (route) => { history.pushState({}, '', `${location.pathname}?view=${route}`); setPublicRoute(route) }
  const enterPlayerDemo = (session = null) => { if (session?.email) setDemoSession(session); history.pushState({}, '', `${location.pathname}?view=player`); setPublicRoute(null); setPage('home'); setExpanded(true); setRightView(window.innerWidth <= 850 ? 'none' : 'now'); setSearch(''); setSearchOpen(false) }
  const logout = () => {
    try { logoutDemoAccount() } catch {}
    setDemoSession(null)
    history.pushState({}, '', `${location.pathname}?view=public`)
    setPublicRoute('public')
  }
  const go = (next) => { history.pushState({}, '', `${location.pathname}?view=player${next === 'home' ? '' : `#${next}`}`); navigate(next) }
  const startImport = async () => { const handled = await player.chooseMusicFolder(); setFolderFallback(!handled); if (!handled) folderInputRef.current?.click() }
  const onFallbackFiles = (event) => { if (event.target.files?.length) setFolderFallback(false); player.importFileList(event.target.files); event.target.value = '' }
  const likedItems = useMemo(() => player.likedIds.map((id) => player.trackById[id]).filter(Boolean), [player.likedIds, player.trackById])
  const searchMatches = search ? player.tracks.filter((track) => `${track.title} ${track.artist} ${track.album} ${track.filename || ''}`.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : []
  const libraryItems = [...library, ...(player.localTracks.length ? [['Local Music', `${player.localTracks.length} imported tracks`, null, 'local']] : [])]

  if (publicRoute) return <PublicExperience route={publicRoute} navigate={openPublicPage} enterPlayerDemo={enterPlayerDemo} demoSession={demoSession} onLogout={logout}/>

  return <div className="app-shell">
    <input ref={folderInputRef} className="folder-input" type="file" accept="audio/*,.mp3,.m4a,.aac,.flac,.ogg,.oga,.opus,.wav,.webm,.aif,.aiff,.wma" multiple webkitdirectory="" onChange={onFallbackFiles}/>
    <header className="topbar">
      <div className="brand"><SpotifyMark/></div>
      <div className="top-center">
        <button className="home-button" aria-label="Home" onClick={() => go('home')}><House size={28} fill="currentColor" strokeWidth={2.5}/></button>
        <div className="search-box">
          <Search size={26}/>
          <input aria-label="Search your music" placeholder="What do you want to play?" value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setPage('home'); setSearchOpen(true) }}/>
          <i></i><Archive size={25}/>
          {searchOpen && search && <div className="search-dropdown">{searchMatches.length ? searchMatches.map((track) => <button key={track.id} onClick={() => { player.playTrack(track.id, player.tracks.map((item) => item.id)); setSearch(''); setSearchOpen(false) }}><Artwork track={track}/><span><b>{track.title}</b><small>{track.artist || (track.source === 'local' ? 'Local music' : '')}</small></span><Play size={17}/></button>) : <p>No results found</p>}</div>}
        </div>
      </div>
      <div className="top-actions"><button className="install"><CircleArrowDown size={20}/>Install App</button><button className="icon-button" aria-label="Notifications"><Bell size={22}/></button><button className="icon-button friends" aria-label="Friend activity"><UsersIcon/></button><button className="profile" onClick={() => setAccountOpen(!accountOpen)} aria-label="Account"><img src="/artwork/profile-user.png" alt=""/></button>{accountOpen && <div className="account-menu">{demoSession && <p className="account-session-label">Signed in as {demoSession.email}</p>}{['Public Home','Account','Profile','Recents','Support','Download','Settings',demoSession ? 'Log out' : 'Log in'].map((item) => <button key={item} onClick={() => { if (item === 'Public Home') openPublicPage('public'); else if (item === 'Account') openPublicPage('account'); else if (item === 'Log in') openPublicPage('login'); else if (item === 'Log out') logout(); setAccountOpen(false) }}>{item}</button>)}<div className="updates"><b>Your Updates</b><small>Just days away: HUSTINDER live<br/>in Brampton on Sat, Aug 22 · 10w</small></div></div>}</div>
    </header>
    <div className={`workspace ${expanded && page === 'home' ? '' : 'compact'} ${rightView === 'none' ? 'right-hidden' : ''}`}>
      <LibraryPanel expanded={expanded} setExpanded={setExpanded} page={page} go={go} libraryItems={libraryItems} player={player} onImport={startImport} folderFallback={folderFallback}/>
      <main className="main-panel">{page === 'home' ? <HomePage navigate={go} playTrack={player.playTrack} likedIds={player.likedIds} toggleLike={player.toggleLike} addToQueue={player.addToQueue} searchQuery={search} allTracks={player.tracks} recentTrackIds={player.recentTrackIds}/>: page === 'local' ? <LocalMusicPage localTracks={player.localTracks} playTrack={player.playTrack} likedIds={player.likedIds} toggleLike={player.toggleLike} addToQueue={player.addToQueue}/>: <PlaylistPage liked={page === 'liked'} items={likedItems} playTrack={player.playTrack} setShuffle={player.setShuffle} likedIds={player.likedIds} toggleLike={player.toggleLike} addToQueue={player.addToQueue}/>}</main>
      {rightView !== 'none' && <aside className={`right-panel ${rightView === 'queue' ? 'queue-panel' : 'now-playing-panel'}`}>{rightView === 'now' ? <><h2>Now Playing</h2><Artwork track={player.track} className="now-artwork"/><div className={`now-meta ${player.track ? '' : 'empty'}`}><div className="now-song"><div><b>{player.track?.title || 'Nothing playing'}</b>{player.track && <span>{player.track.artist || (player.track.source === 'local' ? 'Local music' : '')}</span>}</div>{player.track && <button className={`green-check like-round ${player.likedIds.includes(player.track.id) ? 'checked' : ''}`} aria-label="Like current track" onClick={() => player.toggleLike(player.track.id)}><Heart size={17} fill={player.likedIds.includes(player.track.id) ? 'currentColor' : 'none'}/></button>}</div><div className="lyrics-preview"><b>Lyrics Preview</b></div></div></> : <><div className="queue-heading"><b>Queue</b><button onClick={() => setRightView('now')} aria-label="Close queue"><X size={20}/></button></div><p className="queue-note">About recommendations and the impact of promotion</p>{player.track ? <><b className="queue-subtitle">Now playing</b><div className="queue-track active"><Artwork track={player.track}/><div><b>{player.track.title}</b><span>Music video · {player.track.artist || 'Local music'}</span></div></div></> : <p className="empty-message">Nothing playing.</p>}<b className="queue-subtitle next">Next up</b>{player.queue.map((id) => { const track = player.trackById[id]; return track && <div className="queue-track" key={id}><button className="queue-track-main" onClick={() => player.playQueued(id)}><Artwork track={track}/><span><b>{track.title}</b><small>{track.artist || (track.source === 'local' ? 'Local music' : '')}</small></span></button><button aria-label={`Remove ${track.title} from queue`} onClick={() => player.removeFromQueue(id)}><X size={18}/></button></div> })}{!player.queue.length && <p className="empty-message">Your queue is empty.</p>}</>}</aside>}
    </div>
    <footer className="player-bar"><div className={`player-track ${player.track ? '' : 'empty'}`}><Artwork track={player.track}/><div><b>{player.track?.title || 'Choose a song to play'}</b>{player.track && <span>{player.track.artist || (player.track.source === 'local' ? 'Local music' : '')}</span>}</div>{player.track && <button className={`player-like ${player.likedIds.includes(player.track.id) ? 'liked' : ''}`} aria-label="Like track" onClick={() => player.toggleLike(player.track.id)}><Heart size={18} fill={player.likedIds.includes(player.track.id) ? 'currentColor' : 'none'}/></button>}</div><div className="playback"><div className="transport"><button aria-label="Shuffle" className={`shuffle ${player.shuffle ? 'enabled' : ''}`} onClick={() => player.setShuffle(!player.shuffle)}><Shuffle size={21}/></button><button aria-label="Previous" onClick={player.previous}><SkipBack size={21} fill="currentColor"/></button><button className="play-pause" onClick={player.togglePlayback} aria-label={player.playing ? 'Pause' : 'Play'}>{player.playing ? <Pause size={22} fill="black"/> : <Play size={22} fill="black"/>}</button><button aria-label="Next" onClick={player.next}><SkipForward size={21} fill="currentColor"/></button><button aria-label={player.repeat === 0 ? 'Repeat off' : player.repeat === 1 ? 'Repeat playlist' : 'Repeat track'} className={player.repeat ? 'enabled' : ''} onClick={player.setRepeat}><RepeatStatusIcon/></button></div><div className="timeline"><span>{formatTime(player.time)}</span><input aria-label="Playback position" type="range" min="0" max={Math.max(player.duration, 1)} step="0.1" value={Math.min(player.time, player.duration)} onChange={(event) => player.seek(Number(event.target.value))}/><span>{player.duration ? formatTime(player.duration) : '--:--'}</span></div>{(player.error || player.track?.demoAudio) && <small className={`player-audio-note ${player.error ? 'has-error' : ''}`}>{player.error || 'Generated demo audio · not the original recording'}</small>}</div><div className="player-tools"><button aria-label="Lyrics"><PenLine size={19}/></button><button aria-label="Queue" className={rightView === 'queue' ? 'active' : ''} onClick={() => setRightView(rightView === 'queue' ? 'now' : 'queue')}><List size={21}/></button><button aria-label="Toggle Now Playing panel" onClick={() => setRightView(rightView === 'none' ? 'now' : 'none')}><Monitor size={20}/></button><button aria-label={player.muted ? 'Unmute' : 'Mute'} onClick={() => player.setMuted(!player.muted)}>{player.muted ? <VolumeX size={21}/> : <Volume2 size={21}/>}</button><input className="volume-range" aria-label="Volume" type="range" min="0" max="1" step="0.01" value={player.muted ? 0 : player.volume} onChange={(event) => { player.setVolume(Number(event.target.value)); player.setMuted(false) }}/><button aria-label="Connect to a device"><MonitorSmartphone size={20}/></button><button aria-label="Full screen"><Maximize size={20}/></button></div></footer>
  </div>
}

function UsersIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-7.5a4 4 0 0 1 0 7.7M22 20v-1.5a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function RepeatStatusIcon() { return <svg className="repeat-status-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h10a3.5 3.5 0 0 1 3.5 3.5v6a3.5 3.5 0 0 1-3.5 3.5h-4"/><path d="M6.5 3.5A3.5 3.5 0 0 0 3 7v6a3.5 3.5 0 0 0 3.5 3.5H8"/><path d="m14 13.5 2.5 2.5-2.5 2.5"/></svg> }
export default App
