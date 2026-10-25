const AUDIO_EXTENSIONS = new Set(['mp3', 'm4a', 'aac', 'flac', 'ogg', 'oga', 'opus', 'wav', 'webm', 'aif', 'aiff', 'wma'])
const MAX_ID3_BYTES = 12 * 1024 * 1024

export function isSupportedAudioFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return file.type?.startsWith('audio/') || AUDIO_EXTENSIONS.has(extension)
}

function decodeText(bytes) {
  if (!bytes.length) return ''
  const encoding = bytes[0]
  let decoder = 'utf-8'
  if (encoding === 0) decoder = 'windows-1252'
  if (encoding === 1) decoder = 'utf-16'
  if (encoding === 2) decoder = 'utf-16be'
  return new TextDecoder(decoder).decode(bytes.subarray(1)).replace(/\0/g, '').trim()
}

const synchsafe = (bytes, offset) => ((bytes[offset] & 0x7f) << 21) | ((bytes[offset + 1] & 0x7f) << 14) | ((bytes[offset + 2] & 0x7f) << 7) | (bytes[offset + 3] & 0x7f)
const uint32 = (bytes, offset) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset)
const findNull = (bytes, start) => { const index = bytes.indexOf(0, start); return index < 0 ? bytes.length : index }

function parsePicture(frame, objectUrls) {
  if (frame.length < 5) return ''
  const encoding = frame[0]
  let cursor = findNull(frame, 1) + 1
  cursor += 1 // picture type
  if (encoding === 1 || encoding === 2) {
    while (cursor + 1 < frame.length && (frame[cursor] !== 0 || frame[cursor + 1] !== 0)) cursor += 2
    cursor += 2
  } else cursor = findNull(frame, cursor) + 1
  if (cursor >= frame.length) return ''
  const image = new Blob([frame.subarray(cursor)], { type: new TextDecoder().decode(frame.subarray(1, findNull(frame, 1))) || 'image/jpeg' })
  const url = URL.createObjectURL(image)
  objectUrls.push(url)
  return url
}

export async function readAudioTags(file, objectUrls = []) {
  const header = new Uint8Array(await file.slice(0, 10).arrayBuffer())
  const result = { title: '', artist: '', album: '', artwork: '' }
  if (header.length >= 10 && String.fromCharCode(...header.subarray(0, 3)) === 'ID3') {
    const version = header[3]
    const tagSize = Math.min(synchsafe(header, 6), MAX_ID3_BYTES, file.size - 10)
    const tag = new Uint8Array(await file.slice(10, 10 + tagSize).arrayBuffer())
    const frames = { TIT2: 'title', TPE1: 'artist', TALB: 'album' }
    let offset = 0
    while (offset + 10 <= tag.length) {
      const frameId = String.fromCharCode(...tag.subarray(offset, offset + 4))
      if (!/^[A-Z0-9]{4}$/.test(frameId)) break
      const frameSize = version === 4 ? synchsafe(tag, offset + 4) : uint32(tag, offset + 4)
      if (!frameSize || offset + 10 + frameSize > tag.length) break
      const frame = tag.subarray(offset + 10, offset + 10 + frameSize)
      if (frames[frameId]) result[frames[frameId]] = decodeText(frame)
      if ((frameId === 'APIC' || frameId === 'PIC') && !result.artwork) result.artwork = parsePicture(frame, objectUrls)
      offset += 10 + frameSize
    }
  }
  if (result.title || result.artist || result.album) return result
  if (file.size >= 128) {
    const tail = new Uint8Array(await file.slice(-128).arrayBuffer())
    if (String.fromCharCode(...tail.subarray(0, 3)) === 'TAG') {
      const text = (start, end) => new TextDecoder('windows-1252').decode(tail.subarray(start, end)).replace(/\0/g, '').trim()
      result.title = text(3, 33); result.artist = text(33, 63); result.album = text(63, 93)
    }
  }
  return result
}

export async function readAudioDuration(url) {
  return new Promise((resolve) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    const finish = (seconds = 0) => {
      audio.removeAttribute('src'); audio.load()
      resolve(Number.isFinite(seconds) && seconds > 0 ? seconds : 0)
    }
    audio.addEventListener('loadedmetadata', () => finish(audio.duration), { once: true })
    audio.addEventListener('error', () => finish(), { once: true })
    audio.src = url
  })
}

const stableHash = (text) => {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  return (hash >>> 0).toString(36)
}

export async function createImportedTrack(file, relativePath = file.webkitRelativePath || file.name) {
  const objectUrls = []
  try {
    const audio = URL.createObjectURL(file)
    objectUrls.push(audio)
    const metadata = await readAudioTags(file, objectUrls).catch(() => ({ title: '', artist: '', album: '', artwork: '' }))
    const filename = file.name.replace(/\.[^.]+$/, '')
    const title = metadata.title || filename.replace(/[._]+/g, ' ').trim()
    const seconds = await readAudioDuration(audio)
    return {
      id: `local-${stableHash(`${relativePath}\0${file.size}\0${file.lastModified}`)}`,
      source: 'local', filename: file.name, title: title || file.name, artist: metadata.artist || '', album: metadata.album || '',
      audio, artwork: metadata.artwork || '', mimeType: file.type || '', seconds, duration: seconds ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '',
      playlists: [], demoAudio: false, relativePath, objectUrls,
    }
  } catch (error) {
    objectUrls.forEach((url) => URL.revokeObjectURL(url))
    throw error
  }
}

export async function collectDirectoryAudioFiles(directoryHandle, parentPath = '') {
  const files = []
  for await (const [name, handle] of directoryHandle.entries()) {
    const relativePath = parentPath ? `${parentPath}/${name}` : name
    if (handle.kind === 'directory') files.push(...await collectDirectoryAudioFiles(handle, relativePath))
    else if (handle.kind === 'file') {
      const file = await handle.getFile()
      if (isSupportedAudioFile(file)) files.push({ file, relativePath })
    }
  }
  return files
}
