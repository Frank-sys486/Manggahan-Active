import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import LandingMorph, { LandingGlyph } from './LandingMorph.jsx'
import LandingCourt from './LandingCourt.jsx'

const days = [
  { day: 'Mon', date: 'Sep 28', full: 'Monday, September 28, 2026' },
  { day: 'Tue', date: 'Sep 29', full: 'Tuesday, September 29, 2026' },
  { day: 'Wed', date: 'Sep 30', full: 'Wednesday, September 30, 2026' },
  { day: 'Thu', date: 'Oct 1', full: 'Thursday, October 1, 2026' },
  { day: 'Fri', date: 'Oct 2', full: 'Friday, October 2, 2026' },
  { day: 'Sat', date: 'Oct 3', full: 'Saturday, October 3, 2026' },
  { day: 'Sun', date: 'Oct 4', full: 'Sunday, October 4, 2026' },
]

const times = ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM']

const facilitySeed = [
  {
    id: 'basketball',
    name: 'Basketball Court A',
    note: 'Indoor court · Full court',
    tagline: 'Shoot higher together',
    surface: 'wood',
    sport: 'basketball',
    features: ['Full-size court', 'LED lighting', 'Team benches', 'Scoreboard ready'],
    statuses: ['open', 'open', 'open', 'limited', 'booked', 'open', 'open'],
  },
  {
    id: 'badminton',
    name: 'Badminton Hall',
    note: 'Three courts · Indoor',
    tagline: 'Small courts, big connections',
    surface: 'green',
    sport: 'badminton',
    features: ['Three marked courts', 'Competition nets', 'Non-slip flooring', 'Ventilated hall'],
    statuses: ['open', 'booked', 'open', 'open', 'limited', 'open', 'booked'],
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis Hall',
    note: 'Indoor hall · Two tables',
    tagline: 'Fast rallies, shared energy',
    surface: 'blue',
    sport: 'table-tennis',
    features: ['Competition tables', 'Adjustable nets', 'Indoor lighting', 'Spectator seating'],
    statuses: ['open', 'open', 'limited', 'open', 'booked', 'open', 'open'],
  },
  {
    id: 'volleyball',
    name: 'Volleyball Court',
    note: 'Indoor court · Full court',
    tagline: 'Set up the next play',
    surface: 'volleyball',
    sport: 'volleyball',
    features: ['Competition net', 'Line-marked court', 'Referee stand', 'Indoor lighting'],
    statuses: ['booked', 'open', 'open', 'limited', 'open', 'open', 'booked'],
  },
  {
    id: 'tennis',
    name: 'Tennis Court',
    note: 'Outdoor court · Full court',
    tagline: 'Serve, rally, connect',
    surface: 'tennis',
    sport: 'tennis',
    features: ['Full-size court', 'Competition net', 'Night lighting', 'Player benches'],
    statuses: ['open', 'limited', 'open', 'booked', 'open', 'open', 'limited'],
  },
  {
    id: 'sepak-takraw',
    name: 'Sepak Takraw Court',
    note: 'Covered court · Regulation net',
    tagline: 'Sipa higher together',
    surface: 'sepak',
    sport: 'sepak-takraw',
    features: ['Regulation court', 'Competition net', 'Covered playing area', 'Team benches'],
    statuses: ['limited', 'open', 'booked', 'open', 'open', 'limited', 'open'],
  },
]

const demoStaffRows = [
  ['MA-2041', 'Basketball Court B', '4:00 PM', 'Confirmed'],
  ['MA-2042', 'Badminton Hall', '6:00 PM', 'Pending'],
  ['MA-2043', 'Table Tennis Hall', '8:00 PM', 'Confirmed'],
]

const leaderboardData = {
  basketball: {
    label: 'Basketball', entryLabel: 'Team', season: 'Community League · 2026',
    rows: [
      ['Manggahan Cyclones', 8, 7, 1, 21],
      ['Riverside Five', 8, 6, 2, 18],
      ['Eastside Ballers', 8, 5, 3, 15],
      ['Court Kings', 8, 3, 5, 9],
    ],
  },
  badminton: {
    label: 'Badminton', entryLabel: 'Player', season: 'Open Singles · 2026',
    rows: [
      ['Alyssa Reyes', 7, 7, 0, 21],
      ['Marco Santos', 7, 5, 2, 15],
      ['Bea Navarro', 7, 4, 3, 12],
      ['Paolo Lim', 7, 3, 4, 9],
    ],
  },
  'table-tennis': {
    label: 'Table Tennis', entryLabel: 'Player', season: 'Open Singles · 2026',
    rows: [
      ['Miguel Ramos', 7, 6, 1, 18],
      ['Sofia Cruz', 7, 5, 2, 15],
      ['Nathan Uy', 7, 4, 3, 12],
      ['Lea Mendoza', 7, 3, 4, 9],
    ],
  },
  volleyball: {
    label: 'Volleyball', entryLabel: 'Team', season: 'Community League · 2026',
    rows: [
      ['Manggahan Spikers', 8, 7, 1, 21],
      ['Block Party', 8, 6, 2, 18],
      ['Net Ninjas', 8, 4, 4, 12],
      ['Southside Six', 8, 3, 5, 9],
    ],
  },
  tennis: {
    label: 'Tennis', entryLabel: 'Player', season: 'Open Singles · 2026',
    rows: [
      ['Carlo Garcia', 7, 6, 1, 18],
      ['Mika Flores', 7, 5, 2, 15],
      ['Andre Villanueva', 7, 4, 3, 12],
      ['Nina Bautista', 7, 3, 4, 9],
    ],
  },
  'sepak-takraw': {
    label: 'Sepak Takraw', entryLabel: 'Team', season: 'Community League · 2026',
    rows: [
      ['Manggahan Siklab', 8, 7, 1, 21],
      ['Sipa Norte', 8, 5, 3, 15],
      ['Eastside Regu', 8, 4, 4, 12],
      ['Net Flyers', 8, 3, 5, 9],
    ],
  },
}

const demoAccounts = {
  player: {
    role: 'player',
    label: 'Player',
    name: 'Juan Dela Cruz',
    email: 'player@manggahan.test',
    password: 'Player123',
    description: 'Reserve facilities and manage personal bookings.',
  },
  admin: {
    role: 'admin',
    label: 'Administrator',
    name: 'Facility Admin',
    email: 'admin@manggahan.test',
    password: 'Admin123',
    description: 'Review the daily facility and reservation board.',
  },
}

function LineIcon({ name, size = 24 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
  if (name === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  if (name === 'building') return <svg {...common}><path d="M3 21h18M6 21V5h9v16M15 9h3v12M9 9h2M9 13h2M9 17h2" /></svg>
  if (name === 'trophy') return <svg {...common}><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  if (name === 'chevron-left') return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>
  if (name === 'chevron-right') return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>
  if (name === 'chevron-down') return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>
  if (name === 'eye-off') return <svg {...common}><path d="m3 3 18 18M10.6 6.2A11.8 11.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8M6.5 6.5C3.6 8.3 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 4-.7M10.2 10.2a2.5 2.5 0 0 0 3.6 3.6" /></svg>
  if (name === 'logout') return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /></svg>
  return null
}

function SportMark({ sport, size = 56 }) {
  const common = { className: 'sport-mark', width: size, height: size, viewBox: '0 0 64 64', fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false }
  if (sport === 'basketball') return (
    <svg {...common}>
      <circle cx="32" cy="32" r="25" />
      <path d="M7 32h50M32 7v50M14 15c17 7 17 27 0 34M50 15c-17 7-17 27 0 34" />
    </svg>
  )
  if (sport === 'badminton') return (
    <svg {...common}>
      <path d="M23 43 8 13l8-5 8 4 8-5 8 5 8-4 8 5-15 30ZM23 43h18v5a9 9 0 0 1-18 0Z" />
      <path d="m16 8 11 35M24 12l6 31M32 7v36M40 12l-6 31M48 8 37 43" />
    </svg>
  )
  if (sport === 'table-tennis') return (
    <svg {...common}>
      <path d="M42 9c11 4 16 15 11 24-3 7-10 10-18 10L22 56l-7-7 13-13c-4-7-4-14 0-20 3-5 8-8 14-7Z" />
      <path d="m28 36 7 7" />
      <circle cx="12" cy="20" r="5" />
    </svg>
  )
  if (sport === 'volleyball') return (
    <svg {...common}>
      <circle cx="32" cy="32" r="25" />
      <path d="M32 7c-7 8-8 17 0 25 11 2 18-2 22-12M32 32c-4 10-12 14-23 9M19 11c-5 10-3 20 4 26M57 34c-8 7-18 10-28 6M22 55c10-1 19-7 22-15" />
    </svg>
  )
  if (sport === 'tennis') return (
    <svg {...common}>
      <g transform="rotate(35 32 32)">
        <ellipse cx="32" cy="23" rx="16" ry="18" />
        <path d="M25 39l4 9h6l4-9M29 48v10h6V48" />
        <path d="M25 13v20M32 11v24M39 13v20M22 17h20M21 24h22M24 31h16" strokeWidth="2" />
      </g>
      <circle cx="51" cy="49" r="5" />
    </svg>
  )
  if (sport === 'sepak-takraw') return (
    <svg {...common}>
      <circle cx="32" cy="32" r="25" />
      <path d="M20 10c-9 18 0 35 23 44M26 8c-8 19 1 33 23 42M57 31C45 15 26 14 7 29M56 38C44 21 27 21 8 35M20 54c20-2 31-18 27-42M14 49c21-2 30-16 27-40" />
    </svg>
  )
  return null
}

function CourtLines() {
  return <svg className="court-lines" viewBox="0 0 900 150" preserveAspectRatio="none" aria-hidden="true"><rect x="8" y="8" width="884" height="134" /></svg>
}

function CourtPreview({ facility }) {
  const surface = { basketball: '#c9ad7f', badminton: '#1c5851', 'table-tennis': '#185a7b', volleyball: '#8a4b35', tennis: '#3b6f4d', 'sepak-takraw': '#a6632e' }[facility.sport]
  return (
    <svg className="court-preview" viewBox="0 0 900 360" role="img" aria-labelledby={`${facility.id}-preview-title`}>
      <title id={`${facility.id}-preview-title`}>Illustrated view of {facility.name}</title>
      <rect width="900" height="360" fill="#e6e0d2" />
      <rect width="900" height="66" fill="#0d3c36" />
      <rect y="66" width="900" height="22" fill="#f6b93b" />
      <path d="M74 88h752l74 272H0Z" fill={surface} />
      <path d="M74 88h752M0 359h900M450 88v272" fill="none" stroke="#fffdf8" strokeWidth="5" opacity=".88" />
      {facility.sport === 'basketball' && <><path d="M104 122h82v58h-82M796 122h-82v58h82" fill="none" stroke="#fffdf8" strokeWidth="5" /><circle cx="450" cy="235" r="56" fill="none" stroke="#fffdf8" strokeWidth="5" /><path d="M185 180c54 36 54 108 0 145M715 180c-54 36-54 108 0 145" fill="none" stroke="#fffdf8" strokeWidth="5" /></>}
      {facility.sport === 'badminton' && <><path d="M230 88 170 360M670 88l60 272M74 225h752" fill="none" stroke="#fffdf8" strokeWidth="5" /><path d="M430 110v184M470 110v184M430 174h40M430 230h40" fill="none" stroke="#092f35" strokeWidth="6" /></>}
      {facility.sport === 'table-tennis' && <><path d="M260 154h380l62 142H198Z" fill="#2367d1" stroke="#fffdf8" strokeWidth="6" /><path d="M450 154v142M198 226h504" fill="none" stroke="#fffdf8" strokeWidth="5" /><path d="M435 138v132M465 138v132M435 166h30M435 198h30M435 230h30" fill="none" stroke="#092f35" strokeWidth="6" /></>}
      {facility.sport === 'volleyball' && <><path d="M245 88 190 360M655 88l55 272M74 235h752" fill="none" stroke="#fffdf8" strokeWidth="5" /><path d="M430 104v212M470 104v212M430 130h40M430 165h40M430 200h40M430 235h40M430 270h40" fill="none" stroke="#092f35" strokeWidth="6" /></>}
      {facility.sport === 'tennis' && <><path d="M230 88 160 360M670 88l70 272M74 225h752M315 88 280 360M585 88l35 272" fill="none" stroke="#fffdf8" strokeWidth="5" /><path d="M435 104v212M465 104v212M435 145h30M435 190h30M435 235h30M435 280h30" fill="none" stroke="#092f35" strokeWidth="6" /></>}
      {facility.sport === 'sepak-takraw' && <><path d="M245 88 190 360M655 88l55 272M74 235h752" fill="none" stroke="#fffdf8" strokeWidth="5" /><ellipse cx="290" cy="235" rx="55" ry="36" fill="none" stroke="#fffdf8" strokeWidth="5" /><ellipse cx="610" cy="235" rx="55" ry="36" fill="none" stroke="#fffdf8" strokeWidth="5" /><path d="M435 104v212M465 104v212M435 145h30M435 190h30M435 235h30M435 280h30" fill="none" stroke="#092f35" strokeWidth="6" /></>}
      <path d="M0 330 450 260 900 330" fill="none" stroke="#092f35" strokeWidth="12" opacity=".18" />
    </svg>
  )
}

function StatusMark({ status }) {
  if (status === 'booked') return <span className="status-mark status-mark--booked" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17" /></svg></span>
  if (status === 'limited') return <span className="status-mark status-mark--limited" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 4 21 20H3Z" /></svg></span>
  return <span className="status-mark status-mark--open" aria-hidden="true" />
}

function LandingOrbit({ onEnter }) {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const section = sectionRef.current
    const scene = section.firstElementChild
    const stage = scene.querySelector('.landing-orbit__cards')
    const cards = [...stage.querySelectorAll('.landing-orbit__card')]
    const target = { reveal: 0, turn: 0, x: 0, y: 0 }
    const current = { ...target }
    const clamp = value => Math.max(0, Math.min(1, value))
    let frame = 0
    let radius = 0
    let depth = 0
    let rise = 0
    stage.classList.add('is-orbit')

    const draw = () => {
      frame = 0
      for (const key of Object.keys(current)) current[key] += (target[key] - current[key]) * 0.16
      stage.style.transform = `rotateX(${-current.y * 4}deg) rotateY(${current.x * 6}deg)`
      cards.forEach((card, index) => {
        const angle = index / cards.length * Math.PI * 2 + current.turn + Math.PI / 6
        const front = (Math.cos(angle) + 1) / 2
        const arrival = clamp((current.reveal - index * 0.045) / 0.78)
        card.style.opacity = (arrival * (0.55 + front * 0.45)).toFixed(3)
        card.style.transform = `translate(-50%, -50%) translate3d(${Math.sin(angle) * radius}px, ${Math.cos(angle) * rise}px, ${Math.cos(angle) * depth - (1 - arrival) * 180}px) rotateY(${-Math.sin(angle) * 24}deg) scale(${0.88 + arrival * 0.12})`
      })
      if (Object.keys(current).some(key => Math.abs(current[key] - target[key]) > 0.002)) schedule()
    }
    const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw) }
    const measure = () => {
      const rect = section.getBoundingClientRect()
      target.reveal = clamp((window.innerHeight - rect.top) / (window.innerHeight * 0.72))
      target.turn = clamp(-rect.top / Math.max(1, section.offsetHeight - scene.offsetHeight)) * Math.PI * 2
      scene.style.opacity = clamp(scene.getBoundingClientRect().bottom / window.innerHeight).toFixed(3)
      schedule()
    }
    const resize = () => {
      radius = Math.max(0, (stage.clientWidth - cards[0].offsetWidth * 1.5) / 2)
      depth = Math.min(280, stage.clientWidth * 0.25)
      rise = Math.min(140, stage.clientHeight * 0.27)
      measure()
    }
    const move = event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      const rect = scene.getBoundingClientRect()
      target.x = (event.clientX - rect.left) / rect.width * 2 - 1
      target.y = (event.clientY - rect.top) / rect.height * 2 - 1
      schedule()
    }
    const leave = () => { target.x = 0; target.y = 0; schedule() }
    const focus = event => {
      const index = cards.indexOf(event.target)
      if (index < 0 || !event.target.matches(':focus-visible')) return
      // Bring keyboard-selected cards to the front via the shortest arc.
      const angle = index / cards.length * Math.PI * 2 + current.turn + Math.PI / 6
      target.turn = current.turn - Math.atan2(Math.sin(angle), Math.cos(angle))
      schedule()
    }
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', resize)
    scene.addEventListener('pointermove', move)
    scene.addEventListener('pointerleave', leave)
    stage.addEventListener('focusin', focus)
    resize()
    cancelAnimationFrame(frame)
    frame = 0
    Object.assign(current, target)
    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', resize)
      scene.removeEventListener('pointermove', move)
      scene.removeEventListener('pointerleave', leave)
      stage.removeEventListener('focusin', focus)
      stage.classList.remove('is-orbit')
      stage.style.removeProperty('transform')
      cards.forEach(card => { card.style.removeProperty('transform'); card.style.removeProperty('opacity') })
      scene.style.removeProperty('opacity')
    }
  }, [])

  return (
    <section ref={sectionRef} className="landing-orbit" id="sports" aria-labelledby="orbit-title">
      <div className="landing-orbit__scene">
        <div className="landing-orbit__heading"><h2 id="orbit-title">Move into<br />the game.</h2><p>Six sports. One place to play.</p></div>
        <div className="landing-orbit__cards">
          <div className="landing-orbit__core" aria-hidden="true"><LandingGlyph /></div>
          {facilitySeed.map((facility, index) => (
            <button key={facility.id} className="landing-orbit__card" type="button" onClick={onEnter} aria-label={`Sign in to book ${facility.name}`}>
              <span className="landing-orbit__photo" style={{ '--tile-x': `${index % 3 * 50}%`, '--tile-y': `${Math.floor(index / 3) * 100}%` }} aria-hidden="true" />
              <span className="landing-orbit__label"><SportMark sport={facility.sport} size={26} /><strong>{facility.name}</strong><LineIcon name="arrow" size={19} /></span>
            </button>
          ))}
        </div>
        <p className="landing-orbit__disclaimer">Illustrative scenes for this classroom concept.</p>
      </div>
    </section>
  )
}

function LandingPage({ onEnter }) {
  const processRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const sections = [...document.querySelectorAll('.landing-sports, .landing-process, .landing-close')]
    const fade = () => sections.forEach(section => {
      section.style.opacity = Math.max(0, Math.min(1, section.getBoundingClientRect().bottom / Math.min(window.innerHeight, section.offsetHeight))).toFixed(3)
    })
    window.addEventListener('scroll', fade, { passive: true })
    window.addEventListener('resize', fade)
    fade()
    return () => {
      window.removeEventListener('scroll', fade)
      window.removeEventListener('resize', fade)
      sections.forEach(section => section.style.removeProperty('opacity'))
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.35 })
    observer.observe(processRef.current)
    observer.observe(closeRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="#main-content" aria-label="Manggahan Active home">
          <LandingGlyph className="landing-brand__glyph" />
          <span><strong>Manggahan</strong><small>Active</small></span>
        </a>
        <nav aria-label="Landing page">
          <a href="#sports">Courts</a>
          <a href="#how-it-works">How it works</a>
          <button type="button" onClick={onEnter}>Sign in <LineIcon name="arrow" size={18} /></button>
        </nav>
      </header>

      <main id="main-content" tabIndex="-1">
        <div className="landing-intro">
          <section className="landing-hero" aria-labelledby="landing-title">
            <LandingMorph />
            <div className="landing-hero__bottom">
              <div><h1 id="landing-title">The next game<br />starts here.</h1><p>Find a court. Pick your time. Play together.</p></div>
              <a href="#sports">Explore the courts <LineIcon name="chevron-down" size={20} /></a>
            </div>
          </section>
        </div>

        <LandingOrbit onEnter={onEnter} />

        <section className="landing-sports" id="courts-index" aria-labelledby="sports-title">
          <div className="landing-sports__intro">
            <div className="landing-section-heading"><h2 id="sports-title">Every game<br />has a place.</h2><p>Six ways to get moving. Choose the one calling your name.</p></div>
            <LandingCourt />
          </div>
          <div className="landing-sports__list">
            {facilitySeed.map((facility, index) => (
              <button key={facility.id} className={`landing-sport landing-sport--${facility.surface}`} type="button" onClick={onEnter} aria-label={`Sign in to book ${facility.name}`}>
                <span className="landing-sport__number">{String(index + 1).padStart(2, '0')}</span>
                <SportMark sport={facility.sport} size={58} />
                <strong>{facility.name}</strong>
                <span className="landing-sport__note">{facility.note}</span>
                <LineIcon name="arrow" size={28} />
              </button>
            ))}
          </div>
        </section>

        <section ref={processRef} className="landing-process" id="how-it-works" aria-labelledby="process-title">
          <div className="landing-section-heading"><h2 id="process-title">Less planning.<br />More playing.</h2><p>Getting your next game together is this simple.</p></div>
          <div className="landing-process__film" aria-hidden="true">
            {facilitySeed.map((facility, index) => <span key={facility.id} style={{ '--tile-x': `${index % 3 * 50}%`, '--tile-y': `${Math.floor(index / 3) * 100}%`, '--tile-delay': `${index * 45}ms` }} />)}
          </div>
          <ol>
            <li><span>01</span><strong>Find your sport</strong><p>Explore the courts and halls made for your game.</p></li>
            <li><span>02</span><strong>Pick your time</strong><p>See the schedule and choose an available slot.</p></li>
            <li><span>03</span><strong>Make it official</strong><p>Reserve your place and keep the details handy.</p></li>
          </ol>
        </section>

        <section ref={closeRef} className="landing-close" aria-labelledby="close-title">
          <SportMark sport="basketball" size={148} />
          <div><h2 id="close-title">The court is waiting.</h2><p>Bring your people. We’ll help you find the place.</p></div>
          <button className="primary-button" type="button" onClick={onEnter}>Get in the game <LineIcon name="arrow" /></button>
        </section>
      </main>
      <footer className="landing-footer"><span>Manggahan Active / Community sports complex</span><span>Classroom concept · Demo reservations only</span></footer>
    </div>
  )
}

function LoginPage({ onLogin, onBack }) {
  const [role, setRole] = useState('player')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()

  function fillAccount(nextRole) {
    const account = demoAccounts[nextRole]
    setRole(nextRole)
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  function submit(event) {
    event.preventDefault()
    const account = demoAccounts[role]
    if (email.trim().toLowerCase() !== account.email || password !== account.password) {
      setError('The email or password does not match the selected role. Use the demo credentials shown on this page.')
      return
    }
    onLogin(account)
  }

  return (
    <main className="login-shell" id="main-content">
      <section className="login-world" aria-labelledby="login-brand">
        <CourtLines />
        <div className="login-brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <div><h1 id="login-brand">Manggahan <em>Active</em></h1><p>Community sports complex</p></div>
        </div>
        <div className="login-message"><h2>One court.<br />Two ways in.</h2><p>Players reserve time. Administrators keep every facility moving.</p></div>
        <section className="credential-ledger" aria-labelledby="demo-credentials-heading">
          <header><h2 id="demo-credentials-heading">Demo credentials</h2><p>Choose an account to fill the sign-in form.</p></header>
          {Object.values(demoAccounts).map(account => (
            <button type="button" key={account.role} onClick={() => fillAccount(account.role)}>
              <span><strong>{account.label}</strong><small>{account.description}</small></span>
              <span className="credential-values"><code>{account.email}</code><code>{account.password}</code></span>
              <LineIcon name="arrow" />
            </button>
          ))}
          <p className="demo-warning"><LineIcon name="lock" size={18} />Classroom demo only. These credentials are stored in the front end and must not be used for a real deployment.</p>
        </section>
      </section>

      <section className="login-panel" aria-labelledby="login-heading">
        <button className="text-button login-back" type="button" onClick={onBack}><LineIcon name="chevron-left" size={18} /> Back to home</button>
        <form className="login-form" onSubmit={submit}>
          <div className="login-heading"><h2 id="login-heading">Sign in to your court</h2><p>Select your role, then enter its demo credentials.</p></div>
          <fieldset className="role-selector">
            <legend>Choose role</legend>
            {Object.values(demoAccounts).map(account => (
              <label key={account.role}>
                <input type="radio" name="role" value={account.role} checked={role === account.role} onChange={() => { setRole(account.role); setError('') }} />
                <span><LineIcon name={account.role === 'player' ? 'users' : 'building'} /><strong>{account.label}</strong><small>{account.role === 'player' ? 'Book and play' : 'Manage facilities'}</small></span>
              </label>
            ))}
          </fieldset>
          <label className="login-field" htmlFor={emailId}>Email address<input id={emailId} type="email" value={email} onChange={event => { setEmail(event.target.value); setError('') }} autoComplete="username" required /></label>
          <label className="login-field" htmlFor={passwordId}>Password<span className="password-control"><input id={passwordId} type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError('') }} autoComplete="current-password" required aria-describedby={error ? errorId : undefined} /><button className={showPassword ? 'is-visible' : ''} type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}><LineIcon name={showPassword ? 'eye-off' : 'eye'} /></button></span></label>
          {error && <p className="login-error" id={errorId} role="alert">{error}</p>}
          <button className="primary-button login-submit" type="submit">Sign in as {demoAccounts[role].label}<LineIcon name="arrow" /></button>
          <button className="text-button login-fill" type="button" onClick={() => fillAccount(role)}>Fill {demoAccounts[role].label.toLowerCase()} demo credentials</button>
        </form>
      </section>
    </main>
  )
}

function Topbar({ view, onView, account, onLogout }) {
  const isAdmin = account.role === 'admin'
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onView(isAdmin ? 'staff' : 'schedule')} aria-label="Manggahan Active home">
        <span className="brand-mark" aria-hidden="true"><i /><i /></span>
        <span><strong>Manggahan <em>Active</em></strong><small>Community sports complex</small></span>
      </button>
      <nav className="primary-nav" aria-label="Primary navigation">
        {!isAdmin && <button className={view === 'schedule' ? 'is-active' : ''} onClick={() => onView('schedule')}><LineIcon name="calendar" />Schedule</button>}
        {!isAdmin && <button className={view === 'reservations' ? 'is-active' : ''} onClick={() => onView('reservations')}><LineIcon name="users" />My reservations</button>}
        {!isAdmin && <button className={view === 'leaderboards' ? 'is-active' : ''} onClick={() => onView('leaderboards')}><LineIcon name="trophy" />Leaderboards</button>}
        {isAdmin && <button className={view === 'staff' ? 'is-active' : ''} onClick={() => onView('staff')}><LineIcon name="building" />Staff view</button>}
      </nav>
      <div className="account-menu"><span><strong>{account.name}</strong><small>{account.label}</small></span><button type="button" onClick={onLogout} aria-label={`Sign out ${account.name}`}><LineIcon name="logout" /></button></div>
    </header>
  )
}

function DateBoard({ selectedDay, onSelectDay }) {
  const active = days[selectedDay]
  return (
    <section className="date-board" aria-labelledby="date-heading">
      <p className="date-mantra">Same courts.<br />Bigger community.</p>
      <div className="date-focus">
        <button type="button" onClick={() => onSelectDay((selectedDay + 6) % 7)} aria-label="Previous day"><LineIcon name="chevron-left" /></button>
        <p id="date-heading" key={selectedDay}><span>{active.day}</span><strong>{active.date.split(' ')[0]} {active.date.split(' ')[1]}</strong><span>2026</span></p>
        <button type="button" onClick={() => onSelectDay((selectedDay + 1) % 7)} aria-label="Next day"><LineIcon name="chevron-right" /></button>
      </div>
      <div className="week-strip" role="group" aria-label="Choose date">
        {days.map((item, index) => <button key={item.date} type="button" className={index === selectedDay ? 'is-active' : ''} onClick={() => onSelectDay(index)} aria-pressed={index === selectedDay}><span>{item.day}</span><strong>{item.date}</strong></button>)}
      </div>
    </section>
  )
}

function FacilityLane({ facility, selected, focused, onFocus, onSelect }) {
  return (
    <section className={`facility-lane facility-lane--${facility.surface} ${focused ? 'is-focused' : ''}`} aria-labelledby={`${facility.id}-heading`}>
      <button className="facility-name" type="button" onClick={onFocus} aria-expanded={focused} aria-controls={`${facility.id}-details`} aria-label={`${focused ? 'Hide' : 'View'} details for ${facility.name}`}>
        <SportMark sport={facility.sport} />
        <span><span className="facility-title" id={`${facility.id}-heading`} role="heading" aria-level="2">{facility.name}</span><span className="facility-tagline">{facility.tagline}</span></span>
        <span className="facility-expand" aria-hidden="true"><LineIcon name="chevron-down" /></span>
      </button>
      <div className="slot-track">
        <CourtLines />
        {times.map((time, index) => {
          const status = facility.statuses[index]
          const isSelected = selected?.facilityId === facility.id && selected?.time === time
          return (
            <button
              key={time}
              type="button"
              className={`slot slot--${status} ${isSelected ? 'is-selected' : ''}`}
              disabled={status === 'booked'}
              onClick={event => onSelect({ facilityId: facility.id, facilityName: facility.name, facilityNote: facility.note, sport: facility.sport, time, status }, event.currentTarget.closest('.facility-lane'))}
              aria-pressed={isSelected}
              aria-label={`${facility.name}, ${time}, ${status}`}
            >
              <StatusMark status={status} />
              <span><strong>{isSelected ? 'Selected' : status}</strong><small>{time} – {times[index + 1] || '11:00 PM'}</small></span>
            </button>
          )
        })}
      </div>
      <div className="facility-focus" id={`${facility.id}-details`} aria-hidden={!focused}>
        <div className="facility-focus__clip">
          <div className="facility-focus__content">
            <CourtPreview facility={facility} />
            <div className="facility-focus__copy">
              <p className="focus-kicker">Court spotlight</p>
              <h3>{facility.name}</h3>
              <p>{facility.note}. Built for comfortable community play and straightforward hourly reservations.</p>
              <ul>{facility.features.map(feature => <li key={feature}><LineIcon name="check" size={18} />{feature}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatusLegend() {
  return <div className="legend" aria-label="Availability legend"><span><StatusMark status="open" /><b>Open</b>Available for booking</span><span><StatusMark status="limited" /><b>Limited</b>Few slots left</span><span><StatusMark status="booked" /><b>Booked</b>Not available</span><p>Let’s keep Manggahan active</p></div>
}

function BookingBar({ selection, selectedDate, stage, onStage, onConfirm, account }) {
  const nameId = useId()
  const emailId = useId()
  const playersId = useId()

  if (stage === 'details') {
    return (
      <section className="booking-panel" aria-labelledby="booking-heading">
        <div className="booking-panel__intro"><button type="button" className="text-button" onClick={() => onStage('summary')}><LineIcon name="chevron-left" />Back</button><div><h2 id="booking-heading">Complete your reservation</h2><p>{selection.facilityName} · {selectedDate.full} · {selection.time}</p></div></div>
        <form onSubmit={onConfirm}>
          <label htmlFor={nameId}>Contact name<input id={nameId} name="name" autoComplete="name" required defaultValue={account.name} /></label>
          <label htmlFor={emailId}>Email address<input id={emailId} name="email" type="email" autoComplete="email" required defaultValue={account.email} /></label>
          <label htmlFor={playersId}>Number of players<select id={playersId} name="players" defaultValue="6">{[1,2,3,4,5,6,7,8,9,10].map(number => <option key={number}>{number}</option>)}</select></label>
          <button className="primary-button" type="submit"><LineIcon name="check" />Confirm reservation</button>
        </form>
      </section>
    )
  }

  return (
    <aside className="booking-bar" aria-label="Selected reservation">
      <p className="selection-label">Selected slot</p>
      <div className="booking-item booking-item--facility"><SportMark sport={selection.sport} size={50} /><span><strong>{selection.facilityName}</strong><small>{selection.facilityNote}</small></span></div>
      <div className="booking-item"><LineIcon name="clock" size={38} /><span><strong>{selection.time} – {times[times.indexOf(selection.time) + 1] || '11:00 PM'}</strong><small>{selectedDate.full}</small></span></div>
      <div className="booking-item"><LineIcon name="users" size={38} /><span><strong>6 players</strong><small>Ideal for 5–10 players</small></span></div>
      <div className="booking-item booking-item--status"><StatusMark status={selection.status} /><span><strong>{selection.status === 'limited' ? 'Limited' : 'Available'}</strong><small>Ready for reservation</small></span></div>
      <button className="primary-button" type="button" onClick={() => onStage('details')}>Reserve this slot<LineIcon name="arrow" /></button>
    </aside>
  )
}

function ScheduleView({ selectedDay, onSelectDay, selection, onSelect, bookingStage, onBookingStage, onConfirm, account }) {
  const [focusedFacility, setFocusedFacility] = useState(null)

  function revealFacility(facilityId, lane) {
    setFocusedFacility(facilityId)
    requestAnimationFrame(() => lane?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }))
  }

  function focusFacility(facilityId, event) {
    const opening = focusedFacility !== facilityId
    if (opening) revealFacility(facilityId, event.currentTarget.closest('.facility-lane'))
    else setFocusedFacility(null)
  }

  function selectSlot(slot, lane) {
    onSelect(slot)
    revealFacility(slot.facilityId, lane)
  }

  return (
    <>
      <DateBoard selectedDay={selectedDay} onSelectDay={onSelectDay} />
      <section className={`schedule ${focusedFacility ? 'has-focus' : ''}`} aria-label={`Facility schedule for ${days[selectedDay].full}`}>
        <div className="schedule-scroll" tabIndex="0" aria-label="Scroll horizontally to see all time slots on small screens">
          <div className="time-row" aria-hidden="true"><span>Facility</span>{times.map(time => <span key={time}>{time}</span>)}</div>
          {facilitySeed.map(facility => <FacilityLane key={facility.id} facility={facility} selected={selection} focused={focusedFacility === facility.id} onFocus={event => focusFacility(facility.id, event)} onSelect={selectSlot} />)}
        </div>
        <StatusLegend />
      </section>
      <BookingBar key={`${selectedDay}-${selection.facilityId}-${selection.time}`} selection={selection} selectedDate={days[selectedDay]} stage={bookingStage} onStage={onBookingStage} onConfirm={onConfirm} account={account} />
    </>
  )
}

function ReservationsView({ bookings, onSchedule }) {
  return (
    <section className="secondary-view" aria-labelledby="reservations-heading">
      <header><div><h1 id="reservations-heading">My reservations</h1><p>Upcoming bookings made in this prototype.</p></div><button className="primary-button" type="button" onClick={onSchedule}>Book another slot<LineIcon name="arrow" /></button></header>
      {bookings.length === 0 ? <div className="empty-state"><SportMark sport="basketball" /><h2>No reservations yet</h2><p>Choose an open facility time and it will appear here.</p><button type="button" className="text-button" onClick={onSchedule}>Browse the schedule</button></div> : bookings.map(booking => <article className="reservation-row" key={booking.id}><div><span className="reservation-code">{booking.id}</span><h2>{booking.facilityName}</h2><p>{booking.date} · {booking.time} · {booking.players} players</p></div><span className="badge"><LineIcon name="check" size={18} />Confirmed</span></article>)}
    </section>
  )
}

function LeaderboardView() {
  const [sport, setSport] = useState('basketball')
  const board = leaderboardData[sport]

  return (
    <section className="secondary-view leaderboard-view" aria-labelledby="leaderboard-heading">
      <header><div><h1 id="leaderboard-heading">Community leaderboards</h1><p>Demo standings from Manggahan Active leagues and open-play competitions.</p></div><span className="staff-date">Season 2026</span></header>
      <div className="leaderboard-tabs" role="tablist" aria-label="Choose sport leaderboard">
        {facilitySeed.map(facility => <button key={facility.sport} type="button" role="tab" aria-selected={sport === facility.sport} className={sport === facility.sport ? 'is-active' : ''} onClick={() => setSport(facility.sport)}><SportMark sport={facility.sport} size={30} /><span>{leaderboardData[facility.sport].label}</span></button>)}
      </div>
      <section className="leaderboard-board" key={sport} aria-live="polite" aria-labelledby="active-leaderboard-heading">
        <header><SportMark sport={sport} size={66} /><div><p>Current standings</p><h2 id="active-leaderboard-heading">{board.label}</h2><span>{board.season}</span></div></header>
        <div className="leader-strip">
          {board.rows.slice(0, 3).map((row, index) => <article key={row[0]}><span>0{index + 1}</span><div><strong>{row[0]}</strong><small>{row[2]} wins · {row[4]} points</small></div></article>)}
        </div>
        <div className="table-wrap leaderboard-table-wrap">
          <table className="leaderboard-table">
            <caption>{board.label} standings</caption>
            <thead><tr><th scope="col">Rank</th><th scope="col">{board.entryLabel}</th><th scope="col">Played</th><th scope="col">Wins</th><th scope="col">Losses</th><th scope="col">Points</th></tr></thead>
            <tbody>{board.rows.map((row, index) => <tr key={row[0]} className={index === 0 ? 'is-leader' : ''}><td><span className="rank-mark">{index + 1}</span></td><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><strong>{row[4]}</strong></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

function StaffView({ bookings }) {
  const rows = useMemo(() => [...demoStaffRows, ...bookings.map(item => [item.id, item.facilityName, item.time, 'Confirmed'])], [bookings])
  return (
    <section className="secondary-view" aria-labelledby="staff-heading">
      <header><div><h1 id="staff-heading">Today’s facility board</h1><p>Illustrative reservation data for the classroom prototype.</p></div><span className="staff-date">Sep 28, 2026</span></header>
      <div className="staff-summary"><p><strong>{rows.length}</strong><span>Reservations</span></p><p><strong>{rows.filter(row => row[3] === 'Confirmed').length}</strong><span>Confirmed</span></p><p><strong>{rows.filter(row => row[3] === 'Pending').length}</strong><span>Needs review</span></p></div>
      <div className="table-wrap"><table><caption>Reservation schedule</caption><thead><tr><th scope="col">Reference</th><th scope="col">Facility</th><th scope="col">Start time</th><th scope="col">Status</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 3 ? <span className={`badge badge--${cell.toLowerCase()}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>
    </section>
  )
}

export default function App() {
  const [entry, setEntry] = useState('landing')
  const [account, setAccount] = useState(() => {
    try {
      const savedRole = sessionStorage.getItem('manggahan-demo-role')
      return savedRole ? demoAccounts[savedRole] : null
    } catch {
      return null
    }
  })
  const [view, setView] = useState(() => {
    try { return sessionStorage.getItem('manggahan-demo-role') === 'admin' ? 'staff' : 'schedule' } catch { return 'schedule' }
  })
  const [selectedDay, setSelectedDay] = useState(0)
  const [selection, setSelection] = useState({ facilityId: 'basketball', facilityName: 'Basketball Court A', facilityNote: 'Indoor court · Full court', sport: 'basketball', time: '6:00 PM', status: 'open' })
  const [bookingStage, setBookingStage] = useState('summary')
  const [bookings, setBookings] = useState([])
  const [announcement, setAnnouncement] = useState('')

  function login(nextAccount) {
    setAccount(nextAccount)
    setView(nextAccount.role === 'admin' ? 'staff' : 'schedule')
    setAnnouncement(`Signed in as ${nextAccount.label}.`)
    try { sessionStorage.setItem('manggahan-demo-role', nextAccount.role) } catch { /* Session storage can be unavailable in private contexts. */ }
  }

  function logout() {
    setAccount(null)
    setEntry('landing')
    setView('schedule')
    setBookingStage('summary')
    setAnnouncement('Signed out.')
    try { sessionStorage.removeItem('manggahan-demo-role') } catch { /* Session storage can be unavailable in private contexts. */ }
  }

  function selectSlot(slot) {
    setSelection(slot)
    setBookingStage('summary')
    setAnnouncement(`${slot.facilityName} at ${slot.time} selected.`)
  }

  function confirmBooking(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const booking = {
      id: `MA-${2044 + bookings.length}`,
      facilityName: selection.facilityName,
      date: days[selectedDay].full,
      time: selection.time,
      players: data.get('players'),
    }
    setBookings(current => [...current, booking])
    setBookingStage('summary')
    setView('reservations')
    setAnnouncement(`Reservation ${booking.id} confirmed.`)
  }

  if (!account) return entry === 'login'
    ? <LoginPage onLogin={login} onBack={() => setEntry('landing')} />
    : <LandingPage onEnter={() => { setEntry('login'); window.scrollTo(0, 0) }} />

  return (
    <div className="app-shell">
      <Topbar view={view} onView={setView} account={account} onLogout={logout} />
      <main id="main-content" tabIndex="-1">
        {view === 'schedule' && <ScheduleView selectedDay={selectedDay} onSelectDay={setSelectedDay} selection={selection} onSelect={selectSlot} bookingStage={bookingStage} onBookingStage={setBookingStage} onConfirm={confirmBooking} account={account} />}
        {view === 'reservations' && <ReservationsView bookings={bookings} onSchedule={() => setView('schedule')} />}
        {view === 'leaderboards' && <LeaderboardView />}
        {view === 'staff' && <StaffView bookings={bookings} />}
      </main>
      <div className="sr-only" aria-live="polite">{announcement}</div>
    </div>
  )
}
