import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { tracks as sampleTracks } from '../data/musicData'
import { collectDirectoryAudioFiles, createImportedTrack, isSupportedAudioFile } from '../data/localMusicLibrary'
import { readMusicDirectoryHandle, storeMusicDirectoryHandle } from '../data/musicDirectoryStore'
import { PlayerContext } from './playerState'

const readLikes = () => {
  try {
    const stored = localStorage.getItem('pulsewave-liked')
    if (stored === null) return ['ghol-ghumai', 'barsaat']
    const value = JSON.parse(stored)
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : []
  } catch { return [] }
}
const readVolume = () => {
  try { const value = Number(localStorage.getItem('pulsewave-volume')); return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.7 } catch { return 0.7 }
}
const readRecentTracks = () => {
  try {
    const value = JSON.parse(localStorage.getItem('pulsewave-recent-tracks') || '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string'))].slice(0, 12) : []
  } catch { return [] }
}

async function mapConcurrent(items, limit, mapItem) {
  const output = new Array(items.length)
  let index = 0
  let failed = false
  let failure
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length && !failed) {
      const current = index++
      try { output[current] = await mapItem(items[current]) } catch (error) { failed = true; failure = error }
    }
  }))
  if (failed) {
    output.filter(Boolean).forEach((item) => item.objectUrls.forEach((url) => URL.revokeObjectURL(url)))
    throw failure
  }
  return output
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const advanceRef = useRef(null)
  const localTracksRef = useRef([])
  const [localTracks, setLocalTracks] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(readVolume)
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState('')
  const [likedIds, setLikedIds] = useState(readLikes)
  const [recentTrackIds, setRecentTrackIds] = useState(readRecentTracks)
  const [queue, setQueue] = useState(['ishq-mubarak', 'galliyan', 'humnava-mere', 'dil-evr'])
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(0)
  const [contextIds, setContextIds] = useState(sampleTracks.map((track) => track.id))
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importStatus, setImportStatus] = useState('')
  const [needsReimport, setNeedsReimport] = useState(false)

  const allTracks = useMemo(() => [...sampleTracks, ...localTracks], [localTracks])
  const trackById = useMemo(() => Object.fromEntries(allTracks.map((track) => [track.id, track])), [allTracks])
  const track = currentId ? trackById[currentId] || null : null

  const importAudioFiles = useCallback(async (entries) => {
    const supported = entries
      .filter(({ file }) => file && isSupportedAudioFile(file))
      .sort((a, b) => a.relativePath.localeCompare(b.relativePath, undefined, { numeric: true }))
    if (!supported.length) {
      setImportError('No supported audio files were found in that folder.')
      setImportStatus('')
      return 0
    }
    setImporting(true); setImportError(''); setImportStatus('Reading audio tags and durations…')
    let imported = []
    try {
      imported = await mapConcurrent(supported, 4, ({ file, relativePath }) => createImportedTrack(file, relativePath))
      const ids = imported.map((item) => item.id)
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
      for (const oldTrack of localTracksRef.current) oldTrack.objectUrls.forEach((url) => URL.revokeObjectURL(url))
      localTracksRef.current = imported
      setLocalTracks(imported)
      setLikedIds((old) => old.filter((id) => sampleTracks.some((item) => item.id === id) || ids.includes(id)))
      setCurrentId(null); setContextIds(ids); setQueue([]); setTime(0); setDuration(0); setPlaying(false); setError('')
      setNeedsReimport(false)
      setImportStatus(`Imported ${imported.length} ${imported.length === 1 ? 'track' : 'tracks'}.`)
      try { localStorage.setItem('pulsewave-has-local-library', 'true') } catch {}
      return imported.length
    } catch (cause) {
      imported.forEach((item) => item.objectUrls.forEach((url) => URL.revokeObjectURL(url)))
      setImportError(cause instanceof Error ? `Could not import this folder: ${cause.message}` : 'Could not import this folder.')
      setImportStatus('')
      return 0
    } finally { setImporting(false) }
  }, [])

  const importFileList = useCallback((fileList) => {
    const entries = Array.from(fileList || []).map((file) => ({ file, relativePath: file.webkitRelativePath || file.name }))
    return importAudioFiles(entries)
  }, [importAudioFiles])

  const importDirectoryHandle = useCallback(async (handle, persistHandle = true) => {
    if (handle.queryPermission && await handle.queryPermission({ mode: 'read' }) !== 'granted') {
      const permission = handle.requestPermission ? await handle.requestPermission({ mode: 'read' }) : 'denied'
      if (permission !== 'granted') { setNeedsReimport(true); setImportError('Folder access was not granted. Choose the folder again to import it.'); return 0 }
    }
    let handleSaved = true
    if (persistHandle) {
      try { await storeMusicDirectoryHandle(handle) } catch { handleSaved = false }
    }
    const entries = await collectDirectoryAudioFiles(handle)
    const count = await importAudioFiles(entries)
    if (count && !handleSaved) setImportStatus(`Imported ${count} tracks. This browser could not save the folder permission; import again after refresh.`)
    return count
  }, [importAudioFiles])

  const chooseMusicFolder = useCallback(async () => {
    setImportError('')
    if (typeof window.showDirectoryPicker !== 'function') return false
    try {
      let savedHandle = null
      try { savedHandle = await readMusicDirectoryHandle() } catch {}
      if (savedHandle && savedHandle.queryPermission && await savedHandle.queryPermission({ mode: 'read' }) === 'granted') {
        await importDirectoryHandle(savedHandle, false)
        return true
      }
      if (savedHandle && savedHandle.requestPermission && await savedHandle.requestPermission({ mode: 'read' }) === 'granted') {
        await importDirectoryHandle(savedHandle, false)
        return true
      }
      const handle = await window.showDirectoryPicker({ mode: 'read' })
      await importDirectoryHandle(handle)
      return true
    } catch (cause) {
      if (cause?.name !== 'AbortError') setImportError(cause instanceof Error ? cause.message : 'Could not open the folder picker.')
      return true
    }
  }, [importDirectoryHandle])

  useEffect(() => {
    let cancelled = false
    const restore = async () => {
      let previouslyImported = false
      try { previouslyImported = localStorage.getItem('pulsewave-has-local-library') === 'true' } catch {}
      try {
        const handle = await readMusicDirectoryHandle()
        if (cancelled) return
        if (!handle) { setNeedsReimport(previouslyImported); return }
        if (await handle.queryPermission({ mode: 'read' }) === 'granted') {
          await importDirectoryHandle(handle, false)
        } else setNeedsReimport(previouslyImported)
      } catch { if (!cancelled) setNeedsReimport(previouslyImported) }
    }
    restore()
    return () => { cancelled = true }
  }, [importDirectoryHandle])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio
    const onTime = () => setTime(audio.currentTime || 0)
    const onDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onEnded = () => advanceRef.current?.(1)
    const onError = () => { if (audio.src) { setPlaying(false); setError('This audio file could not be played by this browser.') } }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.pause(); audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onDuration); audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onError)
      for (const item of localTracksRef.current) item.objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => { if (audioRef.current) audioRef.current.volume = muted ? 0 : volume }, [volume, muted])
  useEffect(() => { try { localStorage.setItem('pulsewave-liked', JSON.stringify(likedIds)) } catch {} }, [likedIds])
  useEffect(() => { try { localStorage.setItem('pulsewave-volume', String(volume)) } catch {} }, [volume])
  useEffect(() => { try { localStorage.setItem('pulsewave-recent-tracks', JSON.stringify(recentTrackIds)) } catch {} }, [recentTrackIds])

  const playTrack = useCallback(async (id, ids = contextIds) => {
    const selected = trackById[id]
    if (!selected) return
    setContextIds(ids.length ? ids : [id]); setCurrentId(id); setTime(0); setDuration(selected.seconds || 0); setError('')
    setRecentTrackIds((old) => [id, ...old.filter((recentId) => recentId !== id)].slice(0, 12))
    const audio = audioRef.current
    if (!audio || !selected.audio) { setPlaying(false); setError('Audio is unavailable for this track. Import the file again to play it.'); return }
    audio.pause(); audio.src = selected.audio; audio.currentTime = 0
    try { await audio.play(); setPlaying(true) } catch { setPlaying(false); setError('Audio could not start. Try Play again or choose another file.') }
  }, [contextIds, trackById])

  const advance = useCallback((direction) => {
    if (!currentId) return
    const audio = audioRef.current
    if (repeat === 2 && direction > 0 && audio) { audio.currentTime = 0; audio.play().catch(() => setPlaying(false)); return }
    let ids = contextIds.filter((id) => trackById[id])
    if (!ids.length) ids = allTracks.map((item) => item.id)
    let nextId
    if (direction > 0 && queue.some((id) => trackById[id])) {
      nextId = queue.find((id) => trackById[id])
      setQueue((old) => old.filter((id) => id !== nextId))
    } else if (shuffle && direction > 0) {
      const options = ids.filter((id) => id !== currentId && !queue.includes(id))
      nextId = options[Math.floor(Math.random() * options.length)] || currentId
    } else {
      const index = ids.indexOf(currentId)
      const target = index + direction
      if (direction > 0 && target >= ids.length && repeat === 0) { audio?.pause(); setPlaying(false); return }
      nextId = ids[(target + ids.length) % ids.length]
    }
    playTrack(nextId, ids)
  }, [allTracks, contextIds, currentId, playTrack, queue, repeat, shuffle, trackById])
  useEffect(() => { advanceRef.current = advance }, [advance])

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !currentId) return
    if (playing) { audio.pause(); setPlaying(false); return }
    if (!audio.src) return playTrack(currentId)
    try { await audio.play(); setPlaying(true); setError('') } catch { setPlaying(false); setError('Audio could not start. Try Play again or choose another file.') }
  }, [currentId, playTrack, playing])
  const toggleLike = useCallback((id) => setLikedIds((old) => old.includes(id) ? old.filter((item) => item !== id) : [...old, id]), [])
  const seek = useCallback((value) => { if (audioRef.current && Number.isFinite(value)) { audioRef.current.currentTime = value; setTime(value) } }, [])
  const addToQueue = useCallback((id) => setQueue((old) => old.includes(id) ? old : [...old, id]), [])
  const playQueued = useCallback((id) => { const ids = [id, ...queue.filter((queued) => queued !== id)]; setQueue(ids.slice(1)); playTrack(id, ids) }, [playTrack, queue])
  const value = {
    tracks: allTracks, trackById, localTracks, track, currentId, playing, time, duration, volume, muted, error, likedIds, recentTrackIds, queue, shuffle, repeat,
    importing, importError, importStatus, needsReimport, importFileList, chooseMusicFolder,
    playTrack, togglePlayback, previous: () => advance(-1), next: () => advance(1), seek, setVolume, setMuted, toggleLike, addToQueue,
    removeFromQueue: (id) => setQueue((old) => old.filter((item) => item !== id)), playQueued, setShuffle, setRepeat: () => setRepeat((mode) => (mode + 1) % 3), setContextIds,
  }
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
