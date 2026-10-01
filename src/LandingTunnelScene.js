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
  uniform float uRevealProgress;
  uniform float uProgress;
  uniform float uOpacity;
  uniform float uHover;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float shapeAt(vec2 uv) {
    vec2 p = uv - 0.5;
    float angle = atan(p.y, p.x);
    float radius = 0.35 + 0.035 * sin(angle * 3.0) + 0.018 * sin(angle * 7.0 + 1.2);
    float blob = 1.0 - smoothstep(radius - 0.01, radius + 0.01, length(p));
    return mix(blob, texture2D(uMaskTexture, uv).a, uHasTexture);
  }

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float cloudNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 blend = fract(p);
    blend = blend * blend * (3.0 - 2.0 * blend);
    return mix(mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), blend.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + 1.0), blend.x), blend.y);
  }

  void main() {
    float zoom = exp(log(12.0) * smoothstep(0.0, 0.7, uProgress));
    float aspect = uResolution.x / uResolution.y;
    float baseScale = min(1.001, aspect * 1.08);
    vec2 anchor = mix(vec2(0.5), vec2(0.5, 1.0 - 340.0 / 520.0), smoothstep(0.0, 0.68, uProgress));
    vec2 uv = anchor + (vUv - 0.5) * vec2(aspect, 1.0) / (baseScale * zoom);
    float inside = shapeAt(uv);
    vec2 edge = vec2(3.0 / (baseScale * zoom * uResolution.y));
    float neighbors = (shapeAt(uv + vec2(edge.x, 0.0)) + shapeAt(uv - vec2(edge.x, 0.0))
      + shapeAt(uv + vec2(0.0, edge.y)) + shapeAt(uv - vec2(0.0, edge.y))) * 0.25;
    float innerRim = smoothstep(0.01, 0.22, max(inside - neighbors, 0.0)) * uRevealProgress;
    float hoverFade = 1.0 - smoothstep(0.18, 0.45, uProgress);
    float trail = texture2D(uTrailTexture, vUv).a * hoverFade;
    vec2 pointerUv = anchor + (uPointer - 0.5) * vec2(aspect, 1.0) / (baseScale * zoom);
    float pointerInside = smoothstep(0.05, 0.25, shapeAt(pointerUv));
    float pointerDistance = length((vUv - uPointer) * uResolution);
    float hover = (1.0 - smoothstep(0.0, 58.0, pointerDistance)) * uHover * pointerInside * hoverFade;
    float activity = max(hover, trail * 0.75) * uRevealProgress;
    if (activity < 0.005) {
      float alpha = clamp(1.0 - inside * uRevealProgress + innerRim * 0.28, 0.0, 1.0) * uOpacity;
      vec3 color = mix(vec3(1.0, 0.992, 0.973), vec3(0.025), inside * (1.0 - uRevealProgress) + innerRim);
      gl_FragColor = vec4(color, alpha);
      return;
    }
    vec2 pixel = gl_FragCoord.xy;
    vec2 grainCell = pixel / 2.5;
    vec2 cell = floor(grainCell);
    vec2 jitter = vec2(hash21(cell + 1.7), hash21(cell + 9.2)) - 0.5;
    float fineGrain = hash21(cell);
    float coarseGrain = cloudNoise(pixel / 18.0);
    float grain = mix(fineGrain, coarseGrain, 0.35);
    float speckRadius = mix(0.20, 0.47, fineGrain);
    float speck = 1.0 - smoothstep(speckRadius * 0.45, speckRadius,
      length(fract(grainCell) - 0.5 - jitter * 0.35));
    float particles = speck * smoothstep(0.60, 0.86, grain)
      * smoothstep(0.30, 0.75, coarseGrain) * smoothstep(0.03, 0.65, activity);
    float outsideEdge = smoothstep(0.02, 0.27, max(neighbors - inside, 0.0));
    float whiteErosion = clamp(inside * particles * 0.65, 0.0, 0.85);
    float outsideDust = outsideEdge * particles * 0.55;
    float alpha = clamp(1.0 - inside * uRevealProgress + innerRim * 0.28 + whiteErosion, 0.0, 1.0) * uOpacity;
    float ink = outsideDust;
    vec3 color = mix(vec3(1.0, 0.992, 0.973), vec3(0.035), ink + inside * (1.0 - uRevealProgress) + innerRim);
    gl_FragColor = vec4(color, alpha);
  }
`

const photoFragmentShader = `
  uniform sampler2D uAtlas;
  uniform vec4 uTileBounds;
  uniform vec3 uFallbackColor;
  uniform float uHasAtlas;
  uniform float uTime;
  uniform float uScrollVelocity;
  varying vec2 vUv;

  void main() {
    vec2 localUv = (vUv - uTileBounds.xy) / (uTileBounds.zw - uTileBounds.xy);
    float wave = sin(localUv.y * 16.0 + uTime * 3.0) * 0.7
      + sin(localUv.y * 29.0 - uTime * 2.2) * 0.3;
    vec2 displaced = vUv + vec2(wave * 0.014 * uScrollVelocity, 0.0);
    vec2 safeUv = clamp(displaced, uTileBounds.xy, uTileBounds.zw);
    float edge = 1.0 - smoothstep(0.0, 0.16, min(localUv.x, 1.0 - localUv.x));
    vec2 split = vec2(0.0035 * edge * uScrollVelocity, 0.0);
    vec3 image = texture2D(uAtlas, safeUv).rgb;
    if (uScrollVelocity > 0.001 && edge > 0.001) {
      image.r = texture2D(uAtlas, clamp(safeUv + split, uTileBounds.xy, uTileBounds.zw)).r;
      image.b = texture2D(uAtlas, clamp(safeUv - split, uTileBounds.xy, uTileBounds.zw)).b;
    }
    gl_FragColor = vec4(mix(uFallbackColor, image, uHasAtlas), 1.0);
    #include <colorspace_fragment>
  }
`

function loadTexture(url, manager) {
  return new Promise(resolve => {
    new THREE.TextureLoader(manager).load(url, resolve, undefined, () => resolve(null))
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
  const tunnelBackground = new THREE.Color('#050505')
  const orbitBackground = new THREE.Color('#061b18')
  scene.background = tunnelBackground.clone()
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
    gradient.addColorStop(0, 'rgba(255,255,255,0.045)')
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.018)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    stampContext.fillStyle = gradient
    stampContext.fillRect(0, 0, 64, 64)
  }

  const maskMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uMaskTexture: { value: maskTexture || placeholder },
      uTrailTexture: { value: trailTexture },
      uHasTexture: { value: maskTexture ? 1 : 0 },
      uRevealProgress: { value: 0 },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uHover: { value: 0 },
      uPointer: { value: new THREE.Vector2(-1, -1) },
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
  const timeUniform = { value: 0 }
  const velocityUniform = { value: 0 }
  const compact = window.innerWidth < 760
  const fallbackColors = [0x8f643c, 0x1c5851, 0x185a7b, 0x8a4b35, 0x3b6f4d, 0xa6632e]
  for (let i = 0; i < (compact ? 8 : 10); i++) {
    const geometry = photoGeometry(i)
    const column = i % 3
    const row = Math.floor(i / 3) % 2
    const inset = 0.001
    const tileMinX = column / 3 + inset
    const tileMinY = (1 - row) / 2 + inset
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uAtlas: { value: atlasTexture || placeholder },
        uTileBounds: { value: new THREE.Vector4(tileMinX, tileMinY, (column + 1) / 3 - inset, (2 - row) / 2 - inset) },
        uFallbackColor: { value: new THREE.Color(fallbackColors[i % 6]) },
        uHasAtlas: { value: atlasTexture ? 1 : 0 },
        uTime: timeUniform,
        uScrollVelocity: velocityUniform,
      },
      vertexShader,
      fragmentShader: photoFragmentShader,
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
  let hoverStrength = 0
  let active = true
  let elapsed = 0
  let lastRenderTime = null
  let lenis
  let revealTween
  const paintTrail = delta => {
    if (!trailContext || trailPointer.life === 0 || delta === 0) return
    trailPointer.life = Math.max(0, trailPointer.life - delta)
    if (trailPointer.life === 0) {
      trailContext.clearRect(0, 0, trailCanvas.width, trailCanvas.height)
      trailTexture.needsUpdate = true
      return
    }
    trailContext.globalCompositeOperation = 'destination-out'
    trailContext.fillStyle = `rgba(0,0,0,${1 - Math.pow(0.925, delta * 60)})`
    trailContext.fillRect(0, 0, trailCanvas.width, trailCanvas.height)
    trailContext.globalCompositeOperation = 'source-over'
    trailTexture.needsUpdate = true
  }
  const render = time => {
    const delta = lastRenderTime === null ? 1 / 60 : Math.max(0, time - lastRenderTime)
    lastRenderTime = time
    camera.position.z = state.cameraZ
    camera.position.x += (pointer.x - camera.position.x) * 0.08
    camera.position.y += (pointer.y - camera.position.y) * 0.08
    camera.lookAt(0, 0, camera.position.z - 100)
    artifact.rotation.set(time * 0.07, time * 0.11, time * 0.035)
    timeUniform.value = time
    const targetVelocity = lenis?.isScrolling ? Math.min(1, Math.abs(lenis.velocity) / 65) : 0
    velocityUniform.value += (targetVelocity - velocityUniform.value) * (1 - Math.exp(-delta * 9))
    maskMaterial.uniforms.uProgress.value = state.progress
    maskMaterial.uniforms.uOpacity.value = 1 - smoothstep(0.65, 0.8, state.progress)
    scene.background.copy(tunnelBackground).lerp(orbitBackground, smoothstep(0.8, 0.92, state.progress))
    hero.style.opacity = (1 - smoothstep(0.90, 1, state.progress)).toFixed(3)
    hero.style.pointerEvents = state.progress >= 0.9 ? 'none' : ''
    if (hero.parentElement?.classList.contains('pin-spacer')) {
      hero.parentElement.style.pointerEvents = hero.style.pointerEvents
    }
    hoverStrength *= Math.exp(-delta / 0.16)
    maskMaterial.uniforms.uHover.value = hoverStrength
    hero.style.setProperty('--landing-copy', (1 - smoothstep(0.08, 0.36, state.progress)).toFixed(3))
    paintTrail(delta)
    renderer.render(scene, camera)
  }
  const resize = () => {
    const width = root.clientWidth
    const height = root.clientHeight
    if (!width || !height) return
    const narrow = width < 760
    panels.forEach((panel, index) => panel.position.set(poses[index][0] * (narrow ? 0.5 : 1), poses[index][1] * (narrow ? 0.75 : 1), poses[index][2]))
    const trailScale = Math.min(1, (narrow ? 512 : 1024) / Math.max(width, height))
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
    maskMaterial.uniforms.uPointer.value.set(x, 1 - y)
    hoverStrength = 1
    const trailX = x * trailCanvas.width
    const trailY = y * trailCanvas.height
    if (!trailContext || !stampContext) return
    const dx = trailX - trailPointer.x
    const dy = trailY - trailPointer.y
    const distance = Math.hypot(dx, dy)
    const velocity = trailPointer.active ? distance / Math.max(1, event.timeStamp - trailPointer.time) : 0
    const radius = Math.min(trailCanvas.width, trailCanvas.height) * 0.018 + Math.min(9, velocity * 7)
    const spacing = 3 * trailCanvas.width / bounds.width
    const steps = trailPointer.active ? Math.max(1, Math.ceil(distance / spacing)) : 1
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const px = trailPointer.active ? trailPointer.x + dx * t : trailX
      const py = trailPointer.active ? trailPointer.y + dy * t : trailY
      trailContext.drawImage(stampCanvas, px - radius, py - radius, radius * 2, radius * 2)
    }
    trailTexture.needsUpdate = true
    trailPointer.life = 1.2
    trailPointer.x = trailX
    trailPointer.y = trailY
    trailPointer.time = event.timeStamp
    trailPointer.active = true
  }
  const leave = () => { pointer.x = 0; pointer.y = 0; trailPointer.active = false }

  resize()
  lenis = new Lenis({ anchors: true })
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
          hoverStrength = 0
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

  const dispose = () => {
    revealTween?.kill()
    if (hero.parentElement?.classList.contains('pin-spacer')) {
      hero.parentElement.style.removeProperty('pointer-events')
    }
    timeline.scrollTrigger?.kill()
    timeline.kill()
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    lenis.off('scroll', ScrollTrigger.update)
    lenis.destroy()
    window.removeEventListener('resize', resize)
    hero.removeEventListener('pointermove', move)
    hero.removeEventListener('pointerleave', leave)
    hero.style.removeProperty('opacity')
    hero.style.removeProperty('pointer-events')
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
  return {
    reveal(onComplete) {
      revealTween?.kill()
      revealTween = gsap.to(maskMaterial.uniforms.uRevealProgress, {
        value: 1, duration: 0.65, ease: 'power2.inOut', onComplete,
      })
    },
    dispose,
  }
  } catch (error) {
    root.classList.remove('landing-morph--ready')
    renderer.dispose()
    renderer.domElement.remove()
    throw error
  }
}

export async function mountLandingTunnel(root, signal, onProgress = () => {}) {
  const manager = new THREE.LoadingManager()
  manager.onProgress = (_url, loaded, total) => onProgress(Math.round(loaded / total * 100))
  const [maskTexture, atlasTexture] = await Promise.all([loadTexture(maskUrl, manager), loadTexture(atlasUrl, manager)])
  if (!maskTexture) {
    atlasTexture?.dispose()
    throw new Error('Hero mask texture could not be loaded')
  }
  if (signal.aborted || !root.isConnected) {
    maskTexture?.dispose()
    atlasTexture?.dispose()
    return null
  }
  try { return makeTunnel(root, maskTexture, atlasTexture) }
  catch (error) {
    maskTexture?.dispose()
    atlasTexture?.dispose()
    throw error
  }
}
