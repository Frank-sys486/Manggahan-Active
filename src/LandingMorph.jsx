import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import MorphSVGPlugin from 'gsap/MorphSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger)

const circlePath = 'M310 260 A10 10 0 1 1 290 260 A10 10 0 1 1 310 260 Z'
const glyphPath = 'M64 380 181 132 300 340 431 132 548 380'
const dotPath = 'M468 64 A36 36 0 1 1 396 64 A36 36 0 1 1 468 64 Z'
const circleScale = 0.68
const handoffScale = 0.92
const morphDuration = 0.8

export function LandingGlyph({ className = '' }) {
  return <svg className={className} viewBox="0 0 600 520" fill="none" aria-hidden="true" focusable="false"><path d="M64 380 181 132 300 340 431 132 548 380" stroke="#0d3c36" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" /><circle cx="432" cy="64" r="36" fill="#f6b93b" /></svg>
}

export default function LandingMorph() {
  const rootRef = useRef(null)
  const preloaderRef = useRef(null)
  const progressRef = useRef(null)
  const svgRef = useRef(null)
  const shapeRef = useRef(null)
  const dotRef = useRef(null)
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
    let failSafe
    let sceneReady = false
    let counterComplete = false
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
      setLoading(false)
      unlock()
      ScrollTrigger.refresh()
    }
    const startMorph = () => {
      if (!sceneReady || !counterComplete || introStarted || cancelled) return
      introStarted = true
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
        .to(svgRef.current, { scale: handoffScale, duration: morphDuration, ease: 'sine.inOut' }, 0)
        .to(shapeRef.current, { morphSVG: glyphPath, attr: { 'stroke-width': 85 }, duration: morphDuration, ease: 'sine.inOut' }, 0)
        .to(dotRef.current, { morphSVG: dotPath, duration: morphDuration, ease: 'sine.inOut' }, 0)
        .set(shapeRef.current, { attr: { d: glyphPath, 'stroke-width': 85 } }, morphDuration)
        .set(dotRef.current, { attr: { d: dotPath } }, morphDuration)
    }
    const animateProgress = value => {
      if (cancelled || controller.signal.aborted || value <= latestProgress) return
      latestProgress = value
      counterTween?.kill()
      counterTween = gsap.to(counter, {
        value,
        duration: Math.max(0.1, (value - counter.value) * 0.0025),
        ease: 'none',
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
      cleanup()
      unlock()
    }
  }, [])

  return <>
    {loading && createPortal(
      <div ref={preloaderRef} className="landing-preloader" role="status" aria-label={`Loading Manggahan Active, ${progress}%`} style={{ '--circle-scale': circleScale }}>
        <span ref={progressRef} className="landing-preloader__progress" aria-hidden="true">{progress}%</span>
        <svg ref={svgRef} viewBox="0 0 600 520" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path ref={shapeRef} d={circlePath} fill="none" stroke="#000" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
          <path ref={dotRef} d={circlePath} fill="#000" />
        </svg>
      </div>, document.body,
    )}
    <div ref={rootRef} className="landing-morph" aria-hidden="true"><div className="landing-morph__fallback" /></div>
  </>
}
