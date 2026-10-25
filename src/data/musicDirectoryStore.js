const DB_NAME = 'pulsewave-local-music'
const STORE_NAME = 'directory-handles'
const HANDLE_KEY = 'music-folder'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function storeMusicDirectoryHandle(handle) {
  const database = await openDatabase()
  await new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    request.onsuccess = resolve; request.onerror = () => reject(request.error)
  })
  database.close()
}

export async function readMusicDirectoryHandle() {
  const database = await openDatabase()
  const handle = await new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(HANDLE_KEY)
    request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error)
  })
  database.close()
  return handle
}
