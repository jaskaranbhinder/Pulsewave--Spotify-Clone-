# Pulsewave browser-only demo authentication

This account flow is a frontend teaching demo, not production authentication. A user who controls the browser can inspect or change local storage, alter the running JavaScript, or bypass the demo checks. Do not use real credentials, and do not treat this session as proof of identity.

## Storage

The app uses one versioned localStorage entry: pulsewave-demo-auth-v1.

The schema stores:

- version: the schema version.
- accounts: normalized email, a random 16-byte salt, a PBKDF2-HMAC-SHA-256 password hash, iteration count, and creation timestamp.
- session: the normalized email and session start timestamp, or null when signed out.

Passwords are not written to storage. Web Crypto derives the hash with 310,000 PBKDF2 iterations. If secure Web Crypto is unavailable, registration and login fail with an explanatory message instead of saving a plaintext password.

Logout clears only the demo session field. It preserves the demo account list, likes, imported music preferences, and other Pulsewave browser data.

## Routes

- Sign-up: /?view=signup
- Login: /?view=login
- Player demo: /?view=player (continues to work without an account)
- Logout: the player account menu or the public demo-account menu; returns to /?view=public
