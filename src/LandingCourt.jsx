import { useEffect, useRef } from 'react'

const clamp = value => Math.max(0, Math.min(1, value))

function mountCourt(THREE, host) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.5
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30)
  camera.position.set(0, 4.7, 8)
  camera.lookAt(0, 0, 0)

  const court = new THREE.Group()
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8f643c, roughness: 0.82 })
  const surfaceMaterial = new THREE.MeshStandardMaterial({ color: 0x1c5851, roughness: 0.72 })
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f2e9 })
  const baseGeometry = new THREE.BoxGeometry(5.12, 0.18, 3.42)
  const surfaceGeometry = new THREE.BoxGeometry(4.96, 0.12, 3.26)
  const longLineGeometry = new THREE.BoxGeometry(4.42, 0.012, 0.035)
  const shortLineGeometry = new THREE.BoxGeometry(0.035, 0.012, 2.72)

  const base = new THREE.Mesh(baseGeometry, frameMaterial)
  base.position.y = -0.15
  court.add(base)
  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
  court.add(surface)
  for (const z of [-1.36, 1.36]) {
    const line = new THREE.Mesh(longLineGeometry, lineMaterial)
    line.position.set(0, 0.067, z)
    court.add(line)
  }
  for (const x of [-2.21, 2.21]) {
    const line = new THREE.Mesh(shortLineGeometry, lineMaterial)
    line.position.set(x, 0.067, 0)
    court.add(line)
  }
  scene.add(court)

  scene.add(new THREE.HemisphereLight(0xe6f5ea, 0x34432e, 2.2))
  const keyLight = new THREE.DirectionalLight(0xffdfa4, 2.5)
  keyLight.position.set(-3, 6, 4)
  scene.add(keyLight)

  const section = host.closest('.landing-sports')
  let current = 0
  let target = 0
  let frame = 0
  let lastFrame = 0
  let visible = false

  const draw = now => {
    frame = 0
    const delta = Math.min(now - (lastFrame || now), 64)
    lastFrame = now
    current += (target - current) * (1 - Math.exp(-delta / 90))
    const settle = current * current * (3 - 2 * current)
    court.rotation.set(-0.18 + settle * 0.18, -0.72 + settle * 0.48, -0.1 + settle * 0.1)
    court.position.y = -0.27 + settle * 0.27
    court.scale.setScalar(0.86 + settle * 0.14)
    renderer.render(scene, camera)
    if (Math.abs(target - current) > 0.001) schedule()
  }
  const schedule = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const measure = () => {
    target = clamp((window.innerHeight - section.getBoundingClientRect().top) / (window.innerHeight * 0.85))
    schedule()
  }
  const resize = () => {
    const width = host.clientWidth
    const height = host.clientHeight
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    schedule()
  }
  const visibility = () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
    else schedule()
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) { measure(); schedule() }
    else { cancelAnimationFrame(frame); frame = 0; lastFrame = 0 }
  })
  const resizeObserver = new ResizeObserver(resize)
  observer.observe(host)
  resizeObserver.observe(host)
  window.addEventListener('scroll', measure, { passive: true })
  document.addEventListener('visibilitychange', visibility)
  resize()
  measure()
  current = target
  draw(performance.now())
  host.classList.add('landing-court--ready')

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    resizeObserver.disconnect()
    window.removeEventListener('scroll', measure)
    document.removeEventListener('visibilitychange', visibility)
    host.classList.remove('landing-court--ready')
    baseGeometry.dispose()
    surfaceGeometry.dispose()
    longLineGeometry.dispose()
    shortLineGeometry.dispose()
    frameMaterial.dispose()
    surfaceMaterial.dispose()
    lineMaterial.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}

export default function LandingCourt() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)').matches) return

    let cancelled = false
    let cleanup = () => {}
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      import('three').then(THREE => {
        if (cancelled) return
        try { cleanup = mountCourt(THREE, host) }
        catch { host.classList.remove('landing-court--ready') }
      }).catch(() => {})
    }, { rootMargin: '200px 0px' })
    observer.observe(host)

    return () => { cancelled = true; observer.disconnect(); cleanup() }
  }, [])

  return <div ref={hostRef} className="landing-court" aria-hidden="true"><div className="landing-court__fallback" /></div>
}
