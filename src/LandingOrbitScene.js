import * as THREE from 'three'
import { gsap } from 'gsap'
import atlasUrl from './assets/sports-atlas.jpg'

export async function mountLandingOrbit(host, sports, onSelect, signal) {
  const texture = await new THREE.TextureLoader().loadAsync(atlasUrl)
  if (signal.aborted) { texture.dispose(); return () => {} }

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
  } catch (error) {
    texture.dispose()
    throw error
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
  const canvasHost = host.querySelector('.landing-orbit__canvas')
  const logo = host.querySelector('.landing-orbit__core')
  const title = host.querySelector('.landing-orbit__title')
  const cursor = host.querySelector('.landing-orbit__cursor')
  const canvas = renderer.domElement
  canvasHost.appendChild(canvas)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0A1612')
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80)
  camera.position.z = 14
  const imageAspect = (texture.image.width / 3) / (texture.image.height / 2)
  const geometries = sports.map((_, index) => {
    const geometry = new THREE.PlaneGeometry(imageAspect, 1)
    const uv = geometry.attributes.uv
    const inset = 0.002
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i,
        (index % 3) / 3 + inset + uv.getX(i) * (1 / 3 - 2 * inset),
        (1 - Math.floor(index / 3)) / 2 + inset + uv.getY(i) * (1 / 2 - 2 * inset),
      )
    }
    return geometry
  })
  // Jittered layers keep the cloud dense without leaving large random holes.
  const planes = Array.from({ length: 36 }, (_, index) => {
    const sport = index < sports.length ? index : Math.floor(Math.random() * sports.length)
    const plane = new THREE.Mesh(geometries[sport], new THREE.MeshBasicMaterial({
      map: texture, transparent: true, opacity: 0.45, depthWrite: false, toneMapped: false,
      side: THREE.DoubleSide,
    }))
    plane.userData = {
      sport,
      x: ((index % 6 + Math.random()) / 6 - 0.5) * 2.2,
      y: ((Math.floor(index / 6) + Math.random()) / 6 - 0.5) * 2.1,
      size: 0.13 + Math.random() * 0.1,
    }
    plane.position.z = -Math.random() * 18
    plane.rotation.set((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.18)
    scene.add(plane)
    return plane
  })
  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.2, ease: 'power3.out' })
  const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.2, ease: 'power3.out' })
  let hovered = null
  let pointerInside = false
  let cursorEnabled = false
  let visible = false
  let disposed = false

  const highlight = plane => {
    if (plane === hovered) return
    hovered = plane
    planes.forEach(item => gsap.to(item.material, {
      opacity: !plane ? 0.45 : item === plane ? 1 : 0.12,
      duration: 0.35, ease: 'power2.out', overwrite: true,
    }))
    gsap.to(logo, { autoAlpha: plane ? 0 : 1, scale: plane ? 0.96 : 1, duration: 0.3, overwrite: true })
    gsap.killTweensOf(title)
    if (plane) {
      gsap.to(title, {
        autoAlpha: 0, y: 8, duration: 0.1,
        onComplete: () => {
          title.textContent = sports[plane.userData.sport].name
          gsap.to(title, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' })
        },
      })
    } else {
      gsap.to(title, { autoAlpha: 0, y: 8, duration: 0.2 })
    }
    gsap.to(cursor, { autoAlpha: plane && cursorEnabled ? 1 : 0, duration: 0.15, overwrite: 'auto' })
    canvas.style.cursor = plane ? (cursorEnabled ? 'none' : 'pointer') : ''
  }
  const pick = () => {
    camera.updateMatrixWorld()
    raycaster.setFromCamera(pointer, camera)
    return raycaster.intersectObjects(planes, false)[0]?.object || null
  }
  const locate = event => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    pointer.set(x / rect.width * 2 - 1, 1 - y / rect.height * 2)
    if (!pointerInside) gsap.set(cursor, { x, y })
    cursorX(Math.max(0, Math.min(x + 18, rect.width - 150)))
    cursorY(Math.max(0, Math.min(y + 18, rect.height - 44)))
  }
  const move = event => {
    if (event.pointerType === 'touch') return
    locate(event)
    pointerInside = true
    cursorEnabled = true
  }
  const leave = event => {
    if (event?.pointerType === 'touch') return
    pointerInside = false
    cursorEnabled = false
    pointer.set(0, 0)
    highlight(null)
  }
  const click = event => {
    if (event.pointerType === 'touch') { pointerInside = false; cursorEnabled = false }
    locate(event)
    const plane = pick()
    if (event.pointerType === 'touch' && plane !== hovered) {
      cursorEnabled = false
      highlight(plane)
    } else if (plane) {
      onSelect(plane.userData.sport)
      leave()
    }
  }
  const resize = () => {
    const width = host.clientWidth
    const height = host.clientHeight
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 760 ? 1.25 : 1.5))
    renderer.setSize(width, height, false)
    planes.forEach(plane => {
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - plane.position.z)
      plane.position.x = plane.userData.x * viewHeight * camera.aspect / 2
      plane.position.y = plane.userData.y * viewHeight / 2
      plane.scale.setScalar(viewHeight * plane.userData.size)
    })
    scene.updateMatrixWorld(true)
    leave()
    renderer.render(scene, camera)
  }
  const tick = (_, delta) => {
    if (!visible || document.hidden) return
    const ease = 1 - Math.exp(-Math.min(delta, 64) / 160)
    camera.position.x += ((pointerInside ? pointer.x * Math.min(2.2, camera.aspect * 1.5) : 0) - camera.position.x) * ease
    camera.position.y += ((pointerInside ? pointer.y * 1.2 : 0) - camera.position.y) * ease
    // Keep the camera facing forward so translation reveals real depth parallax.
    if (pointerInside) highlight(pick())
    renderer.render(scene, camera)
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (!visible) leave()
  })
  const resizeObserver = new ResizeObserver(resize)
  const contextLost = event => { event.preventDefault(); dispose() }
  const dispose = () => {
    if (disposed) return
    disposed = true
    gsap.ticker.remove(tick)
    observer.disconnect()
    resizeObserver.disconnect()
    canvas.removeEventListener('pointermove', move)
    canvas.removeEventListener('pointerleave', leave)
    canvas.removeEventListener('click', click)
    canvas.removeEventListener('webglcontextlost', contextLost)
    window.removeEventListener('scroll', leave)
    gsap.killTweensOf([logo, title, cursor, ...planes.map(plane => plane.material)])
    cursorX.tween.kill()
    cursorY.tween.kill()
    geometries.forEach(geometry => geometry.dispose())
    planes.forEach(plane => plane.material.dispose())
    texture.dispose()
    renderer.dispose()
    canvas.remove()
    host.classList.remove('is-gallery-ready')
    gsap.set([logo, title, cursor], { clearProps: 'all' })
  }
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerleave', leave)
  canvas.addEventListener('click', click)
  canvas.addEventListener('webglcontextlost', contextLost)
  window.addEventListener('scroll', leave, { passive: true })
  observer.observe(host)
  resizeObserver.observe(host)
  resize()
  host.classList.add('is-gallery-ready')
  gsap.ticker.add(tick)
  return dispose
}
