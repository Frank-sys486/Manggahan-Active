import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import maskUrl from './assets/portal-logo-mask.svg'
import atlasUrl from './assets/sports-atlas.jpg'

gsap.registerPlugin(ScrollTrigger)

const clamp = value => Math.max(0, Math.min(1, value))
const smoothstep = (start, end, value) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uMaskTexture;
  uniform sampler2D uTrailTexture;
  uniform float uHasTexture;
  uniform float uProgress;
  uniform float uOpacity;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float shapeAt(vec2 uv) {
    vec2 p = uv - 0.5;
    float angle = atan(p.y, p.x);
    float radius = 0.35 + 0.035 * sin(angle * 3.0) + 0.018 * sin(angle * 7.0 + 1.2);
    float blob = 1.0 - smoothstep(radius - 0.01, radius + 0.01, length(p));
    return mix(blob, texture2D(uMaskTexture, uv).a, uHasTexture);
  }

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    float zoom = exp(log(12.0) * smoothstep(0.3, 0.7, uProgress));
    float aspect = uResolution.x / uResolution.y;
    float baseScale = min(1.001, aspect * 1.08);
    vec2 anchor = mix(vec2(0.5), vec2(0.5, 1.0 - 340.0 / 520.0), smoothstep(0.28, 0.68, uProgress));
    vec2 uv = anchor + (vUv - 0.5) * vec2(aspect, 1.0) / (baseScale * zoom);
    float inside = shapeAt(uv);
    vec2 edge = vec2(0.012);
    float neighbors = (shapeAt(uv + vec2(edge.x, 0.0)) + shapeAt(uv - vec2(edge.x, 0.0))
      + shapeAt(uv + vec2(0.0, edge.y)) + shapeAt(uv - vec2(0.0, edge.y))) * 0.25;
    float shadow = max(0.0, inside - neighbors) * 0.7;
    float trail = texture2D(uTrailTexture, vUv).a * (1.0 - smoothstep(0.18, 0.45, uProgress));
    vec2 pixel = gl_FragCoord.xy;
    float fineGrain = hash(floor(pixel * 0.75));
    float clusterGrain = hash(floor(pixel / 6.0) + 17.0);
    float grain = mix(fineGrain, clusterGrain, 0.35);
    float density = smoothstep(0.03, 0.65, trail);
    float particles = smoothstep(0.68, 0.90, grain) * density;
    float boundary = clamp(abs(inside - neighbors) * 3.0, 0.0, 1.0);
    float edgeDust = inside * boundary * particles;
    float spray = (1.0 - inside) * particles * 0.42;
    float rightLeg = inside * smoothstep(0.64, 0.72, uv.x) * smoothstep(0.20, 0.32, uv.y)
      * (1.0 - smoothstep(0.76, 0.82, uv.y)) * (1.0 - smoothstep(0.06, 0.28, uProgress));
    rightLeg *= 1.0 - smoothstep(0.24, 0.72, trail) * smoothstep(0.48, 0.78, grain);
    float alpha = clamp(1.0 - inside + shadow + rightLeg - edgeDust * 0.7, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(mix(vec3(1.0), vec3(0.035), clamp(shadow + spray + rightLeg, 0.0, 1.0)), alpha);
  }
`

function loadTexture(url) {
  return new Promise(resolve => {
    new THREE.TextureLoader().load(url, resolve, undefined, () => resolve(null))
  })
}

function photoGeometry(index) {
  const geometry = new THREE.PlaneGeometry(7.6, 11.4)
  const uv = geometry.attributes.uv
  const column = index % 3
  const row = Math.floor(index / 3) % 2
  const inset = 0.001
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i,
      column / 3 + inset + uv.getX(i) * (1 / 3 - 2 * inset),
      (1 - row) / 2 + inset + uv.getY(i) * (1 / 2 - 2 * inset),
    )
  }
  return geometry
}

function makeTunnel(root, maskTexture, atlasTexture) {
  const hero = root.closest('.landing-hero')
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  root.appendChild(renderer.domElement)
  try {

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#050505')
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300)
  camera.position.z = 15
  scene.add(camera)

  const placeholder = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat)
  placeholder.needsUpdate = true
  if (atlasTexture) {
    atlasTexture.colorSpace = THREE.SRGBColorSpace
    atlasTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
  }
  if (maskTexture) {
    maskTexture.generateMipmaps = false
    maskTexture.minFilter = THREE.LinearFilter
  }

  const trailCanvas = document.createElement('canvas')
  const trailContext = trailCanvas.getContext('2d')
  const trailTexture = new THREE.CanvasTexture(trailCanvas)
  trailTexture.generateMipmaps = false
  trailTexture.minFilter = THREE.LinearFilter
  const stampCanvas = document.createElement('canvas')
  stampCanvas.width = stampCanvas.height = 64
  const stampContext = stampCanvas.getContext('2d')
  if (stampContext) {
    const gradient = stampContext.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,0.07)')
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.035)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    stampContext.fillStyle = gradient
    stampContext.fillRect(0, 0, 64, 64)
  }

  const maskMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uMaskTexture: { value: maskTexture || placeholder },
      uTrailTexture: { value: trailTexture },
      uHasTexture: { value: maskTexture ? 1 : 0 },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  const maskGeometry = new THREE.PlaneGeometry(1, 1)
  const mask = new THREE.Mesh(maskGeometry, maskMaterial)
  mask.position.z = -1
  mask.renderOrder = 1000
  mask.frustumCulled = false
  camera.add(mask)

  const poses = [
    [-8, 4, -20], [8, -4, -38], [-7, -5, -56], [8, 5, -73], [-10, 3, -95],
    [9, -5, -111], [-6, 6, -129], [8, -4, -146], [-9, 3, -164], [7, -6, -180],
  ]
  const panels = []
  const compact = window.innerWidth < 760
  const fallbackColors = [0x8f643c, 0x1c5851, 0x185a7b, 0x8a4b35, 0x3b6f4d, 0xa6632e]
  for (let i = 0; i < (compact ? 8 : 10); i++) {
    const geometry = photoGeometry(i)
    const material = new THREE.MeshBasicMaterial({
      map: atlasTexture,
      color: atlasTexture ? 0xffffff : fallbackColors[i % 6],
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const panel = new THREE.Mesh(geometry, material)
    panel.position.set(poses[i][0] * (compact ? 0.5 : 1), poses[i][1] * (compact ? 0.75 : 1), poses[i][2])
    panel.rotation.y = (i % 2 ? -1 : 1) * 0.16
    panel.rotation.z = (i % 3 - 1) * 0.07
    scene.add(panel)
    panels.push(panel)
  }

  const artifactGeometry = new THREE.IcosahedronGeometry(3.5, 2)
  const positions = artifactGeometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    const z = positions.getZ(i)
    const irregularity = 1 + 0.075 * Math.sin(x * 2.3 + y * 1.7) * Math.cos(z * 2.1)
    positions.setXYZ(i, x * irregularity, y * irregularity, z * irregularity)
  }
  positions.needsUpdate = true
  artifactGeometry.computeVertexNormals()
  const artifactMaterial = new THREE.MeshStandardMaterial({ color: 0xb39461, roughness: 0.86, metalness: 0.08, flatShading: true })
  const artifact = new THREE.Mesh(artifactGeometry, artifactMaterial)
  artifact.position.set(0, 0, -90)
  scene.add(artifact)
  scene.add(new THREE.HemisphereLight(0xdce8e4, 0x20241f, 2.1))
  const keyLight = new THREE.DirectionalLight(0xffdfad, 3)
  keyLight.position.set(-5, 7, 5)
  scene.add(keyLight)

  const state = { progress: 0, cameraZ: 15 }
  const pointer = { x: 0, y: 0 }
  const trailPointer = { x: 0, y: 0, time: 0, active: false, life: 0 }
  let active = true
  let elapsed = 0
  const paintTrail = () => {
    if (!trailContext || trailPointer.life === 0) return
    trailContext.globalCompositeOperation = 'destination-out'
    trailContext.fillStyle = 'rgba(0,0,0,0.075)'
    trailContext.fillRect(0, 0, trailCanvas.width, trailCanvas.height)
    trailContext.globalCompositeOperation = 'source-over'
    trailPointer.life--
    trailTexture.needsUpdate = true
  }
  const render = time => {
    camera.position.z = state.cameraZ
    camera.position.x += (pointer.x - camera.position.x) * 0.08
    camera.position.y += (pointer.y - camera.position.y) * 0.08
    camera.lookAt(0, 0, camera.position.z - 100)
    artifact.rotation.set(time * 0.07, time * 0.11, time * 0.035)
    maskMaterial.uniforms.uProgress.value = state.progress
    maskMaterial.uniforms.uOpacity.value = 1 - smoothstep(0.65, 0.8, state.progress)
    hero.style.setProperty('--landing-copy', (1 - smoothstep(0.08, 0.36, state.progress)).toFixed(3))
    paintTrail()
    renderer.render(scene, camera)
  }
  const resize = () => {
    const width = root.clientWidth
    const height = root.clientHeight
    if (!width || !height) return
    const narrow = width < 760
    panels.forEach((panel, index) => panel.position.set(poses[index][0] * (narrow ? 0.5 : 1), poses[index][1] * (narrow ? 0.75 : 1), poses[index][2]))
    const trailScale = Math.min(1, 512 / Math.max(width, height))
    trailCanvas.width = Math.max(1, Math.round(width * trailScale))
    trailCanvas.height = Math.max(1, Math.round(height * trailScale))
    trailPointer.active = false
    trailPointer.life = 0
    trailTexture.needsUpdate = true
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    mask.scale.set(viewHeight * camera.aspect, viewHeight, 1)
    maskMaterial.uniforms.uResolution.value.set(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.5))
    renderer.setSize(width, height, false)
    render(elapsed)
  }
  const move = event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
    const bounds = hero.getBoundingClientRect()
    const x = clamp((event.clientX - bounds.left) / bounds.width)
    const y = clamp((event.clientY - bounds.top) / bounds.height)
    pointer.x = x - 0.5
    pointer.y = 0.5 - y
    const trailX = x * trailCanvas.width
    const trailY = y * trailCanvas.height
    if (!trailContext || !stampContext) return
    const dx = trailX - trailPointer.x
    const dy = trailY - trailPointer.y
    const distance = Math.hypot(dx, dy)
    const velocity = trailPointer.active ? distance / Math.max(1, event.timeStamp - trailPointer.time) : 0
    const radius = Math.min(trailCanvas.width, trailCanvas.height) * 0.04 + Math.min(18, velocity * 16)
    const spacing = Math.max(1, 4 * trailCanvas.width / bounds.width)
    const steps = trailPointer.active ? Math.max(1, Math.ceil(distance / spacing)) : 1
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const px = trailPointer.active ? trailPointer.x + dx * t : trailX
      const py = trailPointer.active ? trailPointer.y + dy * t : trailY
      trailContext.drawImage(stampCanvas, px - radius, py - radius, radius * 2, radius * 2)
    }
    trailTexture.needsUpdate = true
    trailPointer.life = 90
    trailPointer.x = trailX
    trailPointer.y = trailY
    trailPointer.time = event.timeStamp
    trailPointer.active = true
  }
  const leave = () => { pointer.x = 0; pointer.y = 0; trailPointer.active = false }

  resize()
  const lenis = new Lenis({ anchors: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.lagSmoothing(0)
  const tick = time => {
    elapsed = time
    lenis.raf(time * 1000)
    if (active && !document.hidden) render(time)
  }
  gsap.ticker.add(tick)

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate: () => render(elapsed),
    scrollTrigger: {
      trigger: hero,
      pin: true,
      start: 'top top',
      end: '+=2500',
      scrub: true,
      anticipatePin: 1,
      onToggle: self => {
        active = self.isActive
        if (active) render(elapsed)
        else {
          trailPointer.active = false
          trailPointer.life = 0
          trailContext?.clearRect(0, 0, trailCanvas.width, trailCanvas.height)
          trailTexture.needsUpdate = true
        }
      },
    },
  })
  timeline
    .to(state, { cameraZ: 5, progress: 0.3, duration: 0.3 })
    .to(state, { cameraZ: -50, progress: 0.7, duration: 0.4 })
    .to(state, { cameraZ: -78, progress: 1, duration: 0.3 })

  window.addEventListener('resize', resize)
  hero.addEventListener('pointermove', move)
  hero.addEventListener('pointerleave', leave)
  ScrollTrigger.refresh()
  root.classList.add('landing-morph--ready')

  return () => {
    timeline.scrollTrigger?.kill()
    timeline.kill()
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    lenis.off('scroll', ScrollTrigger.update)
    lenis.destroy()
    window.removeEventListener('resize', resize)
    hero.removeEventListener('pointermove', move)
    hero.removeEventListener('pointerleave', leave)
    hero.style.removeProperty('--landing-copy')
    root.classList.remove('landing-morph--ready')
    for (const panel of panels) { panel.geometry.dispose(); panel.material.dispose() }
    artifactGeometry.dispose()
    artifactMaterial.dispose()
    maskGeometry.dispose()
    maskMaterial.dispose()
    trailTexture.dispose()
    maskTexture?.dispose()
    atlasTexture?.dispose()
    placeholder.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
  } catch (error) {
    root.classList.remove('landing-morph--ready')
    renderer.dispose()
    renderer.domElement.remove()
    throw error
  }
}

export async function mountLandingTunnel(root, signal) {
  const [maskTexture, atlasTexture] = await Promise.all([loadTexture(maskUrl), loadTexture(atlasUrl)])
  if (signal.aborted || !root.isConnected) {
    maskTexture?.dispose()
    atlasTexture?.dispose()
    return () => {}
  }
  try { return makeTunnel(root, maskTexture, atlasTexture) }
  catch (error) {
    maskTexture?.dispose()
    atlasTexture?.dispose()
    throw error
  }
}
