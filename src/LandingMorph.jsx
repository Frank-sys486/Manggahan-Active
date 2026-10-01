import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import MorphSVGPlugin from 'gsap/MorphSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger)

const circlePath = 'M300 250 A10 10 0 1 1 299.99 250 Z'
const glyphPath = 'M64 380 181 132 300 340 431 132 548 380'

export function LandingGlyph({ className = '' }) {
  return <svg className={className} viewBox="0 0 600 520" fill="none" aria-hidden="true" focusable="false"><path d="M64 380 181 132 300 340 431 132 548 380" stroke="#0d3c36" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" /><circle cx="432" cy="64" r="36" fill="#f6b93b" /></svg>
}

export default function LandingMorph() {
  const rootRef = useRef(null)
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
    let failSafe
    const controller = new AbortController()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const unlock = () => { document.body.style.overflow = previousOverflow }
    const finish = () => {
      if (cancelled) return
      setLoading(false)
      unlock()
      ScrollTrigger.refresh()
    }
    failSafe = window.setTimeout(() => {
      controller.abort()
      scene?.dispose()
      scene = null
      cleanup = () => {}
      morph?.kill()
      finish()
    }, 8000)

    import('./LandingTunnelScene.js')
      .then(({ mountLandingTunnel }) => controller.signal.aborted ? null : mountLandingTunnel(root, controller.signal, value => {
        if (!cancelled && !controller.signal.aborted) setProgress(value)
      }))
      .then(result => {
        if (!result || cancelled) {
          result?.dispose()
          if (!cancelled) { window.clearTimeout(failSafe); finish() }
          return
        }
        scene = result
        cleanup = result.dispose
        window.clearTimeout(failSafe)
        setProgress(100)
        morph = gsap.timeline({ onComplete: () => {
          setLoading(false)
          scene.reveal(() => { if (!cancelled) { unlock(); ScrollTrigger.refresh() } })
        } })
          .to(shapeRef.current, { morphSVG: glyphPath, attr: { 'stroke-width': 85 }, duration: 0.65, ease: 'power2.inOut' })
          .to(dotRef.current, { opacity: 1, duration: 0.16, ease: 'power2.out' }, '-=0.16')
          .to({}, { duration: 0.2 })
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
      cleanup()
      unlock()
    }
  }, [])

  return <>
    {loading && createPortal(
      <div className="landing-preloader" role="status" aria-label={`Loading Manggahan Active, ${progress}%`}>
        <span className="landing-preloader__progress" aria-hidden="true">{progress}%</span>
        <svg viewBox="0 0 600 520" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path ref={shapeRef} d={circlePath} fill="none" stroke="#000" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
          <circle ref={dotRef} cx="432" cy="64" r="36" fill="#000" opacity="0" />
        </svg>
      </div>, document.body,
    )}
    <div ref={rootRef} className="landing-morph" aria-hidden="true"><div className="landing-morph__fallback" /></div>
  </>
}
