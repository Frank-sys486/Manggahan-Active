import { useEffect, useRef } from 'react'

export function LandingGlyph({ className = '' }) {
  return <svg className={className} viewBox="0 0 600 520" fill="none" aria-hidden="true" focusable="false"><path d="M64 380 181 132 300 340 431 132 548 380" stroke="#0d3c36" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" /><circle cx="432" cy="64" r="36" fill="#f6b93b" /></svg>
}

export default function LandingMorph() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = rootRef.current
    let cancelled = false
    let cleanup = () => {}
    const controller = new AbortController()

    import('./LandingTunnelScene.js')
      .then(({ mountLandingTunnel }) => controller.signal.aborted ? () => {} : mountLandingTunnel(root, controller.signal))
      .then(dispose => { if (cancelled) dispose(); else cleanup = dispose })
      .catch(error => console.warn('3D hero unavailable; showing the static M.', error))

    return () => { cancelled = true; controller.abort(); cleanup() }
  }, [])

  return <div ref={rootRef} className="landing-morph" aria-hidden="true"><div className="landing-morph__fallback" /></div>
}
