import { afterEach, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loginDemoAccount, logoutDemoAccount, readDemoSession, registerDemoAccount } from '../src/auth/demoAuth.js'

const memory = new Map()
const localStorageMock = {
  getItem(key) { return memory.has(key) ? memory.get(key) : null },
  setItem(key, value) { memory.set(key, String(value)) },
  removeItem(key) { memory.delete(key) },
}

beforeEach(() => {
  memory.clear()
  globalThis.localStorage = localStorageMock
  globalThis.isSecureContext = true
})

afterEach(() => {
  delete globalThis.localStorage
  delete globalThis.isSecureContext
})

describe('frontend demo authentication', () => {
  it('stores a salted password hash and restores the signed-in session', async () => {
    const session = await registerDemoAccount('  Student@Example.com ', 'safe-demo-pass')
    const saved = JSON.parse(memory.get('pulsewave-demo-auth-v1'))
    assert.equal(session.email, 'student@example.com')
    assert.equal(saved.version, 1)
    assert.notEqual(saved.accounts[0].passwordHash, 'safe-demo-pass')
    assert.notEqual(saved.accounts[0].salt, '')
    assert.equal(readDemoSession().email, 'student@example.com')
  })

  it('rejects duplicate email addresses without creating another account', async () => {
    await registerDemoAccount('student@example.com', 'safe-demo-pass')
    await assert.rejects(registerDemoAccount('STUDENT@example.com', 'another-pass'), { code: 'duplicate-email' })
    assert.equal(JSON.parse(memory.get('pulsewave-demo-auth-v1')).accounts.length, 1)
  })

  it('accepts the registered password and rejects wrong or unknown credentials', async () => {
    await registerDemoAccount('student@example.com', 'safe-demo-pass')
    logoutDemoAccount()
    assert.equal((await loginDemoAccount('student@example.com', 'safe-demo-pass')).email, 'student@example.com')
    await assert.rejects(loginDemoAccount('student@example.com', 'wrong-password'), { code: 'invalid-credentials' })
    await assert.rejects(loginDemoAccount('unknown@example.com', 'safe-demo-pass'), { code: 'invalid-credentials' })
  })

  it('logs out without deleting demo accounts or unrelated preferences', async () => {
    await registerDemoAccount('student@example.com', 'safe-demo-pass')
    memory.set('pulsewave-liked', '["barsaat"]')
    logoutDemoAccount()
    const saved = JSON.parse(memory.get('pulsewave-demo-auth-v1'))
    assert.equal(saved.session, null)
    assert.equal(saved.accounts.length, 1)
    assert.equal(memory.get('pulsewave-liked'), '["barsaat"]')
    assert.equal(readDemoSession(), null)
  })

  it('fails safely when secure Web Crypto is unavailable', async () => {
    globalThis.isSecureContext = false
    await assert.rejects(registerDemoAccount('student@example.com', 'safe-demo-pass'), { code: 'crypto-unavailable' })
    assert.equal(memory.has('pulsewave-demo-auth-v1'), false)
  })

  it('leaves malformed stored data unchanged and fails safely', async () => {
    const malformed = '{"version":99,"accounts":[],"session":null}'
    memory.set('pulsewave-demo-auth-v1', malformed)
    await assert.rejects(registerDemoAccount('student@example.com', 'safe-demo-pass'), { code: 'storage-invalid' })
    assert.equal(memory.get('pulsewave-demo-auth-v1'), malformed)
  })
})
