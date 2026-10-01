import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const glyphPath = 'M64 380 181 132 300 340 431 132 548 380'
const handoffScale = 0.92

export function LandingGlyph({ className = '' }) {
  return <svg className={className} viewBox="0 0 600 520" fill="none" aria-hidden="true" focusable="false"><path d="M64 380 181 132 300 340 431 132 548 380" stroke="#0d3c36" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" /><circle cx="432" cy="64" r="36" fill="#f6b93b" /></svg>
}

export default function LandingMorph() {
  const rootRef = useRef(null)
  const preloaderRef = useRef(null)
  const progressRef = useRef(null)
  const shapeRef = useRef(null)
  const dotRef = useRef(null)
  const orbitRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = rootRef.current
    let cancelled = false
    let cleanup = () => {}
    let scene
    let morph
    let handoff
    let counterTween
    let circleTween
    let failSafe
    let sceneReady = false
    let counterComplete = false
    let circleComplete = false
    let introStarted = false
    let latestProgress = 0
    const counter = { value: 0 }
    const controller = new AbortController()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const unlock = () => { document.body.style.overflow = previousOverflow }
    const finish = () => {
      if (cancelled) return
      counterTween?.kill()
      circleTween?.kill()
      setLoading(false)
      unlock()
      ScrollTrigger.refresh()
    }
    const startMorph = () => {
      if (!sceneReady || !counterComplete || !circleComplete || introStarted || cancelled) return
      introStarted = true
      const orbit = { progress: 0 }
      const orbitLength = orbitRef.current.getTotalLength()
      const followOrbit = () => {
        const point = orbitRef.current.getPointAtLength(orbit.progress * orbitLength)
        dotRef.current.setAttribute('cx', point.x)
        dotRef.current.setAttribute('cy', point.y)
      }
      morph = gsap.timeline({ onComplete: () => {
        handoff = gsap.to(preloaderRef.current, {
          opacity: 0, duration: 0.1, ease: 'power2.out',
          onComplete: () => {
            setLoading(false)
            scene.reveal(() => { if (!cancelled) { unlock(); ScrollTrigger.refresh() } })
          },
        })
      } })
        .to(progressRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0)
        .set(shapeRef.current, { opacity: 1 }, 0)
        .to(dotRef.current, { attr: { cx: 75, cy: 290 }, duration: 0.4, ease: 'power2.inOut' }, 0)
        .to(dotRef.current, { attr: { r: 65 }, duration: 0.22, ease: 'power2.inOut' }, 0.18)
        .to(orbit, { progress: 1, duration: 0.63, ease: 'power2.inOut', onUpdate: followOrbit }, 0.4)
        .to(dotRef.current, { attr: { r: 36 }, duration: 0.63, ease: 'sine.inOut' }, 0.4)
        .set(dotRef.current, { attr: { cx: 432, cy: 64, r: 36 } }, 1.03)
    }
    const animateProgress = value => {
      if (cancelled || controller.signal.aborted || value <= latestProgress) return
      latestProgress = value
      counterTween?.kill()
      circleTween?.kill()
      circleTween = gsap.to(dotRef.current, {
        attr: { r: 10 + value * 3.2 },
        duration: value === 100 ? 0.8 : 0.45,
        ease: 'sine.inOut',
        onComplete: () => {
          if (value === 100) { circleComplete = true; startMorph() }
        },
      })
      counterTween = gsap.to(counter, {
        value,
        duration: Math.max(0.18, (value - counter.value) * 0.0055),
        ease: 'sine.inOut',
        onUpdate: () => setProgress(Math.floor(counter.value)),
        onComplete: () => {
          setProgress(value)
          if (value === 100) { counterComplete = true; startMorph() }
        },
      })
    }
    failSafe = window.setTimeout(() => {
      controller.abort()
      scene?.dispose()
      scene = null
      cleanup = () => {}
      morph?.kill()
      handoff?.kill()
      finish()
    }, 8000)

    import('./LandingTunnelScene.js')
      .then(({ mountLandingTunnel }) => controller.signal.aborted ? null : mountLandingTunnel(root, controller.signal, animateProgress, handoffScale))
      .then(result => {
        if (!result || cancelled) {
          result?.dispose()
          if (!cancelled) { window.clearTimeout(failSafe); finish() }
          return
        }
        scene = result
        cleanup = result.dispose
        sceneReady = true
        window.clearTimeout(failSafe)
        animateProgress(100)
        startMorph()
      })
      .catch(error => {
        console.warn('3D hero unavailable; showing the static M.', error)
        window.clearTimeout(failSafe)
        finish()
      })

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(failSafe)
      morph?.kill()
      handoff?.kill()
      counterTween?.kill()
      circleTween?.kill()
      cleanup()
      unlock()
    }
  }, [])

  return <>
    {loading && createPortal(
      <div ref={preloaderRef} className="landing-preloader" role="status" aria-label={`Loading Manggahan Active, ${progress}%`} style={{ '--circle-scale': handoffScale }}>
        <span ref={progressRef} className="landing-preloader__progress" aria-hidden="true">{progress}%</span>
        <svg viewBox="0 0 600 520" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path ref={shapeRef} d={glyphPath} fill="none" stroke="#000" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
          <circle ref={dotRef} cx="300" cy="260" r="10" fill="#000" />
          <path ref={orbitRef} d="M75 290 C5 260 20 100 130 44 C185 5 290 -30 432 64" fill="none" stroke="none" />
        </svg>
      </div>, document.body,
    )}
    <div ref={rootRef} className="landing-morph" aria-hidden="true"><div className="landing-morph__fallback" /></div>
  </>
}
