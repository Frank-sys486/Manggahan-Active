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
  const backDotRef = useRef(null)
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
    let circleComplete = false
    let introStarted = false
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
      if (!sceneReady || !counterComplete || !circleComplete || introStarted || cancelled) return
      introStarted = true
      const orbit = { progress: 0 }
      const followOrbit = () => {
        const phase = orbit.progress
        const angle = (85.44326273 + phase * 288.3120367) * Math.PI / 180
        const tilt = -35 * Math.PI / 180
        const x = 220 + 247.287279 * Math.cos(angle) * Math.cos(tilt) - 111.771572 * Math.sin(angle) * Math.sin(tilt)
        const y = 180 + 247.287279 * Math.cos(angle) * Math.sin(tilt) + 111.771572 * Math.sin(angle) * Math.cos(tilt)
        const depth = phase < 0.64 ? phase / 0.64 : (phase - 0.64) / 0.36
        const easedDepth = depth * depth * (3 - 2 * depth)
        const radius = phase < 0.64 ? 330 - 310 * easedDepth : 20 + 16 * easedDepth
        const smoothstep = (start, end) => {
          const t = Math.max(0, Math.min(1, (phase - start) / (end - start)))
          return t * t * (3 - 2 * t)
        }
        const frontOpacity = 1 - smoothstep(0.52, 0.6) + smoothstep(0.89, 0.97)
        for (const circle of [dotRef.current, backDotRef.current]) {
          circle.setAttribute('cx', x)
          circle.setAttribute('cy', y)
          circle.setAttribute('r', radius)
        }
        dotRef.current.setAttribute('opacity', frontOpacity)
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
        .set(backDotRef.current, { attr: { opacity: 1 } }, 0)
        .to(orbit, { progress: 1, duration: 1.6, ease: 'sine.inOut', onUpdate: followOrbit }, 0)
        .set(dotRef.current, { attr: { cx: 432, cy: 64, r: 36, opacity: 1 } }, 1.6)
        .set(backDotRef.current, { attr: { opacity: 0 } }, 1.6)
    }
    const simulateLoading = () => {
      const stops = [34 + Math.round(Math.random() * 12), 58 + Math.round(Math.random() * 12), 78 + Math.round(Math.random() * 10), 100]
      counterTween = gsap.timeline({ onComplete: () => {
        setProgress(100)
        counterComplete = true
        circleComplete = true
        startMorph()
      } })
        .to(counter, { value: 20, duration: 0.4, ease: 'sine.inOut', onUpdate: () => setProgress(Math.floor(counter.value)) }, 1)
        .to(dotRef.current, { attr: { r: 74 }, duration: 0.4, ease: 'sine.inOut' }, 1)
      let at = 2.4 + Math.random()
      for (let index = 0; index < stops.length; index++) {
        const target = stops[index]
        const previous = index === 0 ? 20 : stops[index - 1]
        const duration = Math.max(0.2, (target - previous) * 0.013)
        counterTween.to(counter, { value: target, duration, ease: 'sine.inOut', onUpdate: () => setProgress(Math.floor(counter.value)) }, at)
          .to(dotRef.current, { attr: { r: 10 + target * 3.2 }, duration, ease: 'sine.inOut' }, at)
        at += duration + 0.1 + Math.random() * 0.16
      }
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

    const loadScene = () => {
      import('./LandingTunnelScene.js')
        .then(({ mountLandingTunnel }) => controller.signal.aborted ? null : mountLandingTunnel(root, controller.signal, undefined, handoffScale))
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
          simulateLoading()
        })
        .catch(error => {
          console.warn('3D hero unavailable; showing the static M.', error)
          window.clearTimeout(failSafe)
          finish()
        })
    }
    counterTween = gsap.timeline({ onComplete: loadScene })
      .to(counter, { value: 10, duration: 0.45, ease: 'sine.inOut', onUpdate: () => setProgress(Math.floor(counter.value)) }, 0)
      .to(dotRef.current, { attr: { r: 42 }, duration: 0.45, ease: 'sine.inOut' }, 0)

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
      <div ref={preloaderRef} className="landing-preloader" role="status" aria-label={`Loading Manggahan Active, ${progress}%`} style={{ '--circle-scale': handoffScale }}>
        <span ref={progressRef} className="landing-preloader__progress" aria-hidden="true">{progress}%</span>
        <svg viewBox="0 0 600 520" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <circle ref={backDotRef} cx="300" cy="260" r="10" fill="#000" opacity="0" />
          <path ref={shapeRef} d={glyphPath} fill="none" stroke="#000" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
          <circle ref={dotRef} cx="300" cy="260" r="10" fill="#000" />
        </svg>
      </div>, document.body,
    )}
    <div ref={rootRef} className="landing-morph" aria-hidden="true"><div className="landing-morph__fallback" /></div>
  </>
}
