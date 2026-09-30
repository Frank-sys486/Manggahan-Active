import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import MorphSVGPlugin from 'gsap/MorphSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger)

const circlePath = 'M301 260 C301 260.55 300.55 261 300 261 C299.45 261 299 260.55 299 260 C299 259.45 299.45 259 300 259 C300.55 259 301 259.45 301 260'
const blobPath = 'M246 262 C237 228 263 205 292 220 C318 196 357 221 345 251 C365 279 342 307 308 301 C276 318 242 295 246 262'
const glyphPath = 'M64 380 181 132 300 340 431 132 548 380'

export function LandingGlyph({ className = '' }) {
  return <svg className={className} viewBox="0 0 600 520" fill="none" aria-hidden="true" focusable="false"><path d="M64 380 181 132 300 340 431 132 548 380" stroke="#0d3c36" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" /><circle cx="432" cy="64" r="36" fill="#f6b93b" /></svg>
}

export default function LandingMorph() {
  const rootRef = useRef(null)
  const preloaderRef = useRef(null)
  const shapeRef = useRef(null)
  const dotRef = useRef(null)
  const distortionRef = useRef(null)
  const [showPreloader, setShowPreloader] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = rootRef.current
    let cancelled = false
    let cleanup = () => {}
    let timeline
    let timer
    let failSafe
    let revealQueued = false
    const controller = new AbortController()
    const previousOverflow = document.body.style.overflow
    const started = performance.now()
    const pulse = gsap.to(shapeRef.current, { scale: 1.2, transformOrigin: 'center center', duration: 0.55, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    let scrollLocked = true
    document.body.style.overflow = 'hidden'
    const unlockScroll = () => {
      if (!scrollLocked) return
      document.body.style.overflow = previousOverflow
      scrollLocked = false
    }

    const reveal = () => {
      if (cancelled) return
      pulse.kill()
      gsap.set(shapeRef.current, { scale: 1 })
      timeline = gsap.timeline({ onComplete: () => {
        unlockScroll()
        setShowPreloader(false)
        ScrollTrigger.refresh()
      } })
      timeline
        .to(shapeRef.current, { morphSVG: blobPath, attr: { 'stroke-width': 125 }, duration: 0.38, ease: 'power2.inOut' }, 0)
        .to(distortionRef.current, { attr: { scale: 16 }, duration: 0.38, ease: 'power2.inOut' }, 0)
        .to(shapeRef.current, { morphSVG: glyphPath, attr: { 'stroke-width': 85 }, duration: 0.56, ease: 'power3.inOut' }, 0.38)
        .to(distortionRef.current, { attr: { scale: 0 }, duration: 0.56, ease: 'power2.out' }, 0.38)
        .fromTo(dotRef.current, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'back.out(1.5)' }, 0.74)
        .to(preloaderRef.current, { autoAlpha: 0, duration: 0.28, ease: 'power2.out' }, '+=0.08')
    }
    const scheduleReveal = () => {
      if (cancelled || revealQueued) return
      revealQueued = true
      window.clearTimeout(failSafe)
      timer = window.setTimeout(reveal, Math.max(0, 180 - (performance.now() - started)))
    }
    failSafe = window.setTimeout(() => { controller.abort(); scheduleReveal() }, 7000)

    import('./LandingTunnelScene.js')
      .then(({ mountLandingTunnel }) => controller.signal.aborted ? () => {} : mountLandingTunnel(root, controller.signal))
      .then(dispose => { if (cancelled) dispose(); else { cleanup = dispose; scheduleReveal() } })
      .catch(error => {
        console.warn('3D hero unavailable; showing the static M.', error)
        scheduleReveal()
      })

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timer)
      window.clearTimeout(failSafe)
      pulse.kill()
      timeline?.kill()
      cleanup()
      unlockScroll()
    }
  }, [])

  return <>
    {showPreloader && createPortal(
      <div ref={preloaderRef} className="landing-preloader" role="status" aria-label="Loading Manggahan Active">
        <svg viewBox="0 0 600 520" aria-hidden="true" focusable="false">
          <filter id="landing-preloader-liquid" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="8" result="noise" />
            <feDisplacementMap ref={distortionRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <path ref={shapeRef} d={circlePath} fill="none" stroke="#0d3c36" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" filter="url(#landing-preloader-liquid)" />
          <circle ref={dotRef} cx="432" cy="64" r="36" fill="#f6b93b" opacity="0" />
        </svg>
      </div>, document.body,
    )}
    <div ref={rootRef} className="landing-morph" aria-hidden="true"><div className="landing-morph__fallback" /></div>
  </>
}
