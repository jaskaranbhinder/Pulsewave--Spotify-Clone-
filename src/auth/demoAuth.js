const STORAGE_KEY = 'pulsewave-demo-auth-v1'
const SCHEMA_VERSION = 1
const HASH_ITERATIONS = 310_000
const HASH_BITS = 256
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 256

export class DemoAuthError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'DemoAuthError'
    this.code = code
  }
}

export function validateDemoEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : ''
}

export function validateDemoPassword(password) {
  if (!password) return 'Enter your password.'
  if (password.length < MIN_PASSWORD_LENGTH) return 'Use at least ' + MIN_PASSWORD_LENGTH + ' characters.'
  if (password.length > MAX_PASSWORD_LENGTH) return 'Use no more than ' + MAX_PASSWORD_LENGTH + ' characters.'
  return ''
}

function storage() {
  try {
    if (!globalThis.localStorage) throw new Error('Unavailable')
    return globalThis.localStorage
  } catch {
    throw new DemoAuthError('Browser storage is unavailable. Enable local storage to use demo accounts.', 'storage-unavailable')
  }
}

function readState() {
  const store = storage()
  let raw
  try { raw = store.getItem(STORAGE_KEY) } catch {
    throw new DemoAuthError('Browser storage could not be read. Demo sign-in is unavailable.', 'storage-unavailable')
  }
  if (!raw) return { version: SCHEMA_VERSION, accounts: [], session: null }
  let state
  try { state = JSON.parse(raw) } catch {
    throw new DemoAuthError('Saved demo account data is invalid. Clear only the Pulsewave demo-auth entry to continue.', 'storage-invalid')
  }
  const accountValid = (account) => account && typeof account.email === 'string' &&
    typeof account.salt === 'string' && typeof account.passwordHash === 'string' &&
    Number.isInteger(account.iterations) && account.iterations >= 100_000 && account.iterations <= 1_000_000
  if (!state || state.version !== SCHEMA_VERSION || !Array.isArray(state.accounts) ||
      !state.accounts.every(accountValid) ||
      (state.session !== null && (!state.session || typeof state.session.email !== 'string' || typeof state.session.startedAt !== 'string'))) {
    throw new DemoAuthError('Saved demo account data has an unsupported format. Existing data was left unchanged.', 'storage-invalid')
  }
  return state
}

function writeState(state) {
  try {
    storage().setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    if (error instanceof DemoAuthError) throw error
    throw new DemoAuthError('Browser storage could not save the demo account. Check available storage space.', 'storage-unavailable')
  }
}

function webCrypto() {
  if (globalThis.isSecureContext === false || !globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues || !globalThis.TextEncoder) {
    throw new DemoAuthError('Secure Web Crypto is unavailable. Open Pulsewave on HTTPS or localhost to use demo accounts.', 'crypto-unavailable')
  }
  return globalThis.crypto
}

function toBase64(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function derivePasswordHash(password, salt, iterations) {
  const crypto = webCrypto()
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, HASH_BITS)
  return new Uint8Array(bits)
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}

export async function registerDemoAccount(email, password) {
  const normalizedEmail = validateDemoEmail(email)
  if (!normalizedEmail) throw new DemoAuthError('Enter a valid email address.', 'invalid-email')
  const passwordError = validateDemoPassword(password)
  if (passwordError) throw new DemoAuthError(passwordError, 'invalid-password')

  const state = readState()
  if (state.accounts.some((account) => account.email === normalizedEmail)) {
    throw new DemoAuthError('An account already exists for this email. Log in instead.', 'duplicate-email')
  }

  const crypto = webCrypto()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const account = {
    email: normalizedEmail,
    salt: toBase64(salt),
    passwordHash: toBase64(await derivePasswordHash(password, salt, HASH_ITERATIONS)),
    iterations: HASH_ITERATIONS,
    createdAt: new Date().toISOString(),
  }
  writeState({ ...state, accounts: [...state.accounts, account], session: { email: normalizedEmail, startedAt: new Date().toISOString() } })
  return { email: normalizedEmail }
}

export async function loginDemoAccount(email, password) {
  const normalizedEmail = validateDemoEmail(email)
  if (!normalizedEmail) throw new DemoAuthError('Enter a valid email address.', 'invalid-email')
  if (!password) throw new DemoAuthError('Enter your password.', 'invalid-password')

  const state = readState()
  const account = state.accounts.find((item) => item.email === normalizedEmail)
  if (!account) throw new DemoAuthError('Email or password is incorrect.', 'invalid-credentials')
  let storedHash
  try {
    storedHash = fromBase64(account.passwordHash)
    const candidate = await derivePasswordHash(password, fromBase64(account.salt), account.iterations)
    if (!equalBytes(storedHash, candidate)) throw new DemoAuthError('Email or password is incorrect.', 'invalid-credentials')
  } catch (error) {
    if (error instanceof DemoAuthError) throw error
    throw new DemoAuthError('Saved demo account data could not be verified.', 'storage-invalid')
  }
  writeState({ ...state, session: { email: normalizedEmail, startedAt: new Date().toISOString() } })
  return { email: normalizedEmail }
}

export function readDemoSession() {
  try {
    const state = readState()
    if (!state.session) return null
    return state.accounts.some((account) => account.email === state.session.email)
      ? { email: state.session.email }
      : null
  } catch {
    return null
  }
}

export function logoutDemoAccount() {
  const state = readState()
  if (!state.session) return
  writeState({ ...state, session: null })
}
