import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CircleArrowDown, ChevronDown, ChevronRight, Globe2, Home, Music2, Search, Smartphone, UsersRound, X } from 'lucide-react'
import { tracks } from './data/musicData'
import TrackArtwork from './components/TrackArtwork'
import { loginDemoAccount, registerDemoAccount, validateDemoEmail, validateDemoPassword } from './auth/demoAuth'
import './PublicExperience.css'

const artists = [...new Set(tracks.flatMap((track) => track.artist.split(',').map((name) => name.trim())))].slice(0, 8)
const footerLinks = ['Legal', 'Safety & Privacy Center', 'Privacy Policy', 'Cookies', 'About Ads', 'Accessibility', 'Cookie settings']

function SpotifyMark() {
  return <svg className="public-brand-mark" viewBox="0 0 40 40" role="img" aria-label="Spotify"><circle cx="20" cy="20" r="20" fill="currentColor"/><path d="M9 14.2c7.8-2.3 16.4-1.7 22.2 1.7M10.2 20c6.8-1.8 14.2-1.3 19.7 1.5M11.5 25.5c5.5-1.4 11.6-.9 16.3 1.3" fill="none" stroke="#000" strokeWidth="2.25" strokeLinecap="round"/></svg>
}

function Artwork({ track }) {
  return <TrackArtwork track={track} className="public-cover" placeholderClassName="public-art-placeholder"/>
}

function PublicHeader({ navigate, search, setSearch, route, enterPlayerDemo, demoSession, onLogout }) {
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const premiumRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    if (!premiumOpen && !profileOpen) return undefined
    const dismissOutside = (event) => {
      if (!premiumRef.current?.contains(event.target)) setPremiumOpen(false)
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
    }
    const dismissEscape = (event) => {
      if (event.key === 'Escape') {
        setPremiumOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', dismissEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', dismissEscape)
    }
  }, [premiumOpen, profileOpen])

  const isAccount = route === 'account'
  return <header className="public-header">
    <button className={`public-logo-button ${isAccount ? 'public-account-logo' : ''}`} aria-label="Spotify home" onClick={() => navigate('public')}><SpotifyMark/>{isAccount && <span>Spotify</span>}</button>
    {!isAccount && <div className="public-left-nav">
      <button className="public-home-button" aria-label="Home" onClick={() => navigate('public')}><Home size={25} fill="currentColor"/></button>
      <label className="public-search"><Search size={24}/><input value={search} onChange={(event) => { setSearch(event.target.value); if (route !== 'public') navigate('public') }} placeholder="What do you want to play?" aria-label="Search songs"/></label>
    </div>}
    <nav className={`public-links ${isAccount ? 'public-account-links' : ''}`} aria-label="Public navigation">
      <div className="public-premium-wrap" ref={premiumRef}>
        <button className="public-premium-trigger" aria-expanded={premiumOpen} aria-controls="public-premium-menu" onClick={() => { setPremiumOpen((open) => !open); setSelectedPlan('') }}>Premium plans</button>
        {premiumOpen && <div className="public-premium-menu" id="public-premium-menu" aria-label="Premium plans">
          {[
            ['Premium Standard', 'Your music. Your way. Everywhere – 1 account.'],
            ['Premium Platinum', 'Listen on a whole new level – up to 3 accounts.'],
            ['Premium Student', '1 account – discount for eligible students.'],
          ].map(([name, description]) => <button className="public-premium-option" key={name} onClick={() => setSelectedPlan(name)}>
            <b>{name}</b><span>{description}</span>
          </button>)}
          {selectedPlan && <p className="public-premium-selection" role="status">{selectedPlan} selected. Plan details are for demonstration only; no subscription was started.</p>}
        </div>}
      </div>
      <button onClick={() => navigate('support')}>Support</button>
      <button onClick={() => navigate('download')}>Download</button>
      <span className="public-divider" aria-hidden="true"/>
      {!isAccount && !demoSession && <>
        <button className="public-install" onClick={() => navigate('download')}><CircleArrowDown size={20}/><span>Install App</span></button>
        {route !== 'signup' && <button className="public-signup-link" onClick={() => navigate('signup')}>Sign up</button>}
        {route !== 'login' && <button className="public-login-button" onClick={() => navigate('login')}>Log in</button>}
      </>}
      {(isAccount || demoSession) && <div className="public-profile-wrap" ref={profileRef}>
        <button className="public-profile-trigger" aria-expanded={profileOpen} aria-controls="public-profile-menu" onClick={() => { setProfileOpen((open) => !open); setPremiumOpen(false) }}><img src="/artwork/profile-user.png" alt=""/><span>{demoSession ? 'Demo account' : 'Profile'}</span><ChevronDown size={18}/></button>
        {profileOpen && <div className="public-profile-menu" id="public-profile-menu" aria-label="Profile menu">
          {demoSession && <p className="public-session-email">{demoSession.email}</p>}
          <button onClick={() => { setProfileOpen(false); navigate('account') }}>Account dashboard <span>Demo</span></button>
          <button onClick={enterPlayerDemo}>Open player demo <ChevronRight size={17}/></button>
          {demoSession
            ? <button onClick={onLogout}>Log out</button>
            : <button onClick={() => navigate('public')}>Back to public home <ChevronRight size={17}/></button>}
        </div>}
      </div>}
    </nav>
  </header>
}

function PublicSidebar({ navigate }) {
  const [languageOpen, setLanguageOpen] = useState(false)
  return <aside className="public-sidebar">
    <div className="public-library-heading"><b>Your Library</b><button className="public-create-icon" aria-label="Create playlist" onClick={() => navigate('signup')}>+</button></div>
    <div className="public-sidebar-prompts">
      <section className="public-prompt"><h2>Create your first playlist</h2><p>It's easy, we'll help you</p><button onClick={() => navigate('signup')}>Create playlist</button></section>
      <section className="public-prompt"><h2>Let's find some podcasts to follow</h2><p>We'll keep you updated on new episodes</p><button onClick={() => navigate('support')}>Browse podcasts</button></section>
    </div>
    <div className="public-sidebar-footer"><nav aria-label="Legal and privacy links">{footerLinks.map((link) => <button key={link} onClick={() => navigate('support')}>{link}</button>)}</nav><div className="public-language-wrap"><button className="public-language" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}><Globe2 size={19}/>English</button>{languageOpen && <div className="public-language-menu"><b>Language</b><span>English (selected)</span><small>More languages are not available in this demo.</small></div>}</div></div>
  </aside>
}

function PublicCarousel({ title, items, kind, expanded, onShowAll, onSelect }) {
  const visible = expanded ? items : items.slice(0, 6)
  return <section className={`public-section ${kind}-section`}>
    <div className="public-section-heading"><h1>{title}</h1><button onClick={onShowAll}>{expanded ? 'Show less' : 'Show all'}</button></div>
    <div className={`public-carousel ${expanded ? 'is-expanded' : ''} ${kind}-carousel`}>
      {visible.map((item) => kind === 'song'
        ? <button className="public-song-card" key={item.id} onClick={() => onSelect('signup')} aria-label={`Sign up to listen to ${item.title}`}><Artwork track={item}/><b>{item.title}</b><span>{item.artist}</span></button>
        : <button className="public-artist-card" key={item} onClick={() => onSelect('signup')} aria-label={`Sign up to listen to ${item}`}><span className="public-artist-placeholder"><Music2 size={44}/></span><b>{item}</b><span>Artist</span></button>)}
    </div>
  </section>
}

function LandingPage({ navigate, search }) {
  const [expanded, setExpanded] = useState('')
  const visibleTracks = useMemo(() => tracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(search.trim().toLowerCase())), [search])
  return <>
    <div className="public-workspace">
      <PublicSidebar navigate={navigate}/>
      <main className="public-main">
        <PublicCarousel title={search ? 'Search results' : 'Trending songs'} items={visibleTracks} kind="song" expanded={expanded === 'song'} onShowAll={() => setExpanded(expanded === 'song' ? '' : 'song')} onSelect={navigate}/>
        {!search && <PublicCarousel title="Popular artists" items={artists} kind="artist" expanded={expanded === 'artist'} onShowAll={() => setExpanded(expanded === 'artist' ? '' : 'artist')} onSelect={navigate}/>}
        {search && !visibleTracks.length && <p className="public-empty-results">No songs found. Try another search.</p>}
      </main>
    </div>
    <aside className="public-signup-banner"><div><b>Preview of Spotify</b><p>Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</p></div><button onClick={() => navigate('signup')}>Sign up free</button></aside>
  </>
}

const pageContent = {
  login: { title: 'Welcome back', description: 'This sign-in screen is a local frontend demo. No account authentication is connected.' },
  signup: { title: 'Sign up to start listening', description: 'Create an account experience is not connected in this demo. You can still explore the public page or open the player demo.' },
  premium: { title: 'Premium plans', description: 'Plan details are shown for demonstration only. No subscription is processed.' },
  support: { title: 'Spotify Support', description: 'Browse demo help topics for account access, listening, privacy, and podcasts.' },
  download: { title: 'Download Spotify', description: 'The app download destination is represented as a local demo page. No download will start.' },
}

function DestinationPage({ route, navigate, enterPlayerDemo }) {
  const content = pageContent[route]
  return <main className={`public-destination public-destination-${route}`}>
    <button className="public-back" onClick={() => navigate('public')}><ArrowLeft size={18}/>Back to Spotify home</button>
    <div className="public-destination-content"><SpotifyMark/><h1>{content.title}</h1><p>{content.description}</p>
      {route === 'premium' && <div className="public-plan-list"><article><b>Premium Standard</b><span>Your music. Your way. Everywhere – 1 account.</span></article><article><b>Premium Platinum</b><span>Listen on a whole new level – up to 3 accounts.</span></article><article><b>Premium Student</b><span>1 account – discount for eligible students.</span></article></div>}
      {route === 'support' && <div className="public-help-topics"><span>Account help</span><span>Payments</span><span>Listening help</span><span>Privacy and safety</span></div>}
      {route === 'login' || route === 'signup' ? <button className="public-destination-primary" onClick={enterPlayerDemo}>Open Pulsewave player demo</button> : <button className="public-destination-primary" onClick={() => navigate('public')}>Return to Spotify home</button>}
      <button className="public-destination-secondary" onClick={() => navigate('public')}>Back to public home</button>
    </div>
  </main>
}

function AccountDashboard({ navigate }) {
  const [question, setQuestion] = useState('')
  const [message, setMessage] = useState('')

  const askSupport = (event) => {
    event.preventDefault()
    setMessage(question.trim()
      ? 'Support search is a demo. Your question was not sent or saved.'
      : 'Enter a question to preview this demo support search.')
  }

  return <main className="account-dashboard">
    <div className="account-dashboard-content">
      <form className="account-support-search" onSubmit={askSupport}>
        <label className="visually-hidden" htmlFor="account-support-question">Search account help</label>
        <input id="account-support-question" placeholder="What can I help with?" value={question} onChange={(event) => { setQuestion(event.target.value); setMessage('') }}/>
        <button type="submit">Ask</button>
      </form>
      <p className="account-search-caption">Demo support search · no question is sent.</p>
      {message && <p className="account-demo-message" role="status">{message}</p>}

      <section className="account-plan-card" aria-labelledby="account-plan-title">
        <span className="account-plan-label">Your plan</span>
        <div className="account-plan-content">
          <div className="account-plan-brand"><SpotifyMark/><b>Premium</b></div>
          <h1 id="account-plan-title">Platinum</h1>
          <p>Demo account · sample plan summary</p>
          <div className="account-member-avatars" aria-label="Sample account members">
            <img src="/artwork/profile-user.png" alt=""/>
            <img src="/artwork/profile-user.png" alt=""/>
            <span aria-hidden="true">S</span>
          </div>
        </div>
      </section>

      <section className="account-premium-panel" aria-labelledby="account-premium-title">
        <h2 id="account-premium-title">Your Premium</h2>
        <div className="account-settings-list">
          <button className="account-setting-row" onClick={() => navigate('premium')}>
            <span className="account-setting-icon"><SpotifyMark/></span><span>Manage your subscription</span><ChevronRight size={25}/>
          </button>
          <button className="account-setting-row" onClick={() => setMessage('Member management is a demo control. No account or membership changes are available.')}>
            <span className="account-setting-icon"><UsersRound size={21}/></span><span>Manage members</span><ChevronRight size={25}/>
          </button>
          <button className="account-setting-row" onClick={() => setMessage('Cancellation is not available in this demo. No subscription was changed.')}>
            <span className="account-setting-icon"><X size={22}/></span><span>Cancel subscription</span><ChevronRight size={25}/>
          </button>
        </div>
      </section>
      <p className="account-dashboard-footnote">Frontend demo only. No account, subscription, or billing data is connected.</p>
    </div>
  </main>
}

function ProviderIcon({ provider }) {
  if (provider === 'phone') return <Smartphone size={22} strokeWidth={2}/>
  if (provider === 'google') return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.44Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.55c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.63A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.86A6.02 6.02 0 0 1 6.1 12c0-.64.11-1.27.31-1.86V7.51H3.06A10 10 0 0 0 2 12c0 1.62.39 3.15 1.06 4.49l3.35-2.63Z"/><path fill="#EA4335" d="M12 6.02c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 3.02 14.7 2 12 2a10 10 0 0 0-8.94 5.51l3.35 2.63C7.2 7.78 9.4 6.02 12 6.02Z"/></svg>
  if (provider === 'facebook') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2"/><path fill="#fff" d="M13.5 20v-7h2.35l.35-2.73H13.5V8.53c0-.79.22-1.33 1.36-1.33h1.45V4.76c-.25-.03-1.11-.11-2.12-.11-2.1 0-3.54 1.28-3.54 3.64v1.98H8.28V13h2.37v7h2.85Z"/></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.37 12.56c.02 2.17 1.9 2.9 1.92 2.91-.02.05-.3 1.03-.98 2.04-.59.88-1.2 1.76-2.16 1.78-.94.02-1.24-.57-2.31-.57-1.06 0-1.4.55-2.29.59-.92.03-1.62-.95-2.22-1.83-1.22-1.77-2.15-5-.9-7.18.62-1.08 1.73-1.76 2.94-1.78.92-.02 1.79.62 2.35.62.55 0 1.59-.77 2.68-.66.46.02 1.75.19 2.58 1.44-.07.05-1.54.9-1.61 2.64ZM14.62 6.7c.48-.58.8-1.39.71-2.2-.69.03-1.52.46-2.01 1.03-.44.51-.83 1.33-.72 2.12.77.06 1.55-.39 2.02-.95Z"/></svg>
}

function AuthPage({ route, navigate, enterPlayerDemo }) {
  const isLogin = route === 'login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [providerMessage, setProviderMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const providers = isLogin
    ? [['phone', 'Continue with phone number'], ['google', 'Continue with Google'], ['facebook', 'Continue with Facebook'], ['apple', 'Continue with Apple']]
    : [['phone', 'Sign up with phone number'], ['google', 'Sign up with Google'], ['apple', 'Sign up with Apple']]

  const submitEmail = async (event) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    setEmail(trimmedEmail)
    setProviderMessage('')
    setFormError('')
    const validEmail = validateDemoEmail(trimmedEmail)
    const nextEmailError = trimmedEmail ? (validEmail ? '' : 'Enter a valid email address.') : 'Enter your email address.'
    const nextPasswordError = isLogin && !password ? 'Enter your password.' : (!isLogin ? validateDemoPassword(password) : '')
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)
    if (nextEmailError || nextPasswordError || submitting) return

    setSubmitting(true)
    try {
      const session = isLogin
        ? await loginDemoAccount(validEmail, password)
        : await registerDemoAccount(validEmail, password)
      enterPlayerDemo(session)
    } catch (error) {
      if (error.code === 'duplicate-email') setEmailError(error.message)
      else if (error.code === 'invalid-email') setEmailError(error.message)
      else if (error.code === 'invalid-password' || error.code === 'invalid-credentials') setPasswordError(error.message)
      else setFormError(error.message || 'Demo authentication could not be completed.')
    } finally {
      setSubmitting(false)
    }
  }

  const explainProvider = (provider) => {
    const providerName = provider === 'phone' ? 'Phone' : provider[0].toUpperCase() + provider.slice(1)
    setProviderMessage(`${providerName} sign-in is not configured in this frontend demo.`)
  }

  return <main className={`auth-screen ${isLogin ? 'auth-screen-login' : 'auth-screen-signup'}`}>
    <section className="auth-card" aria-labelledby="auth-title">
      <button className="auth-home" aria-label="Return to Spotify home" onClick={() => navigate('public')}><SpotifyMark/></button>
      <h1 id="auth-title">{isLogin ? 'Welcome back' : <>Sign up to<br/>start listening</>}</h1>
      <form className="auth-form" onSubmit={submitEmail} noValidate aria-busy={submitting}>
        <div className="auth-field">
          <label htmlFor="auth-email">{isLogin ? 'Email' : 'Email address'}</label>
          <input id="auth-email" type="email" autoComplete="email" placeholder={isLogin ? '' : 'name@domain.com'} value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(''); setFormError(''); setProviderMessage('') }} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? 'auth-email-error' : undefined}/>
          {emailError && <p className="auth-error" id="auth-email-error" role="alert">{emailError}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError(''); setFormError(''); setProviderMessage('') }} aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? 'auth-password-error' : undefined}/>
          {passwordError && <p className="auth-error" id="auth-password-error" role="alert">{passwordError}</p>}
        </div>
        {formError && <p className="auth-error auth-form-error" id="auth-form-error" role="alert">{formError}</p>}
        <p className="auth-security-note">Local frontend demo. Passwords are hashed in this browser; never use real credentials.</p>
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <div className="auth-providers">{providers.map(([provider, label]) => <button className="auth-provider" type="button" key={provider} disabled={submitting} onClick={() => explainProvider(provider)}><span className="auth-provider-icon"><ProviderIcon provider={provider}/></span><span>{label}</span></button>)}</div>
      {providerMessage && <p className="auth-provider-message" role="status">{providerMessage}</p>}
    </section>
    <footer className="auth-footer">{isLogin ? <>Don't have an account? <button onClick={() => navigate('signup')}>Sign up</button></> : <>Already have an account? <button onClick={() => navigate('login')}>Log in</button></>}</footer>
  </main>
}

export default function PublicExperience({ route, navigate, enterPlayerDemo, demoSession, onLogout }) {
  const [search, setSearch] = useState('')
  if (route === 'login' || route === 'signup') return <AuthPage route={route} navigate={navigate} enterPlayerDemo={enterPlayerDemo}/>
  const isAccount = route === 'account'
  return <div className={`public-app ${isAccount ? 'account-public-app' : ''}`}>
    <PublicHeader key={route} navigate={navigate} search={search} setSearch={setSearch} route={route} enterPlayerDemo={enterPlayerDemo} demoSession={demoSession} onLogout={onLogout}/>
    {route === 'public' ? <LandingPage navigate={navigate} search={search}/> : isAccount ? <AccountDashboard navigate={navigate}/> : <DestinationPage route={route} navigate={navigate} enterPlayerDemo={enterPlayerDemo}/>}
  </div>
}
