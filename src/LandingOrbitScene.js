import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
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
  scene.background = new THREE.Color('#061b18')
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80)
  camera.rotation.order = 'YXZ'
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const blurPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uVelocity: { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse;
      uniform vec2 uVelocity;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(tDiffuse, vUv) * 0.4;
        color += texture2D(tDiffuse, clamp(vUv - uVelocity, vec2(0.0), vec2(1.0))) * 0.2;
        color += texture2D(tDiffuse, clamp(vUv + uVelocity, vec2(0.0), vec2(1.0))) * 0.2;
        color += texture2D(tDiffuse, clamp(vUv - uVelocity * 2.0, vec2(0.0), vec2(1.0))) * 0.1;
        color += texture2D(tDiffuse, clamp(vUv + uVelocity * 2.0, vec2(0.0), vec2(1.0))) * 0.1;
        gl_FragColor = color;
      }`,
  })
  composer.addPass(blurPass)
  const outputPass = new OutputPass()
  composer.addPass(outputPass)
  const previousCameraPosition = camera.position.clone()
  let previousCameraYaw = camera.rotation.y
  const wallGeometry = new THREE.CylinderGeometry(19, 19, 30, 64, 1, true)
  const wallMaterial = new THREE.MeshBasicMaterial({ color: '#061b18', side: THREE.BackSide })
  scene.add(new THREE.Mesh(wallGeometry, wallMaterial))
  const rimGeometry = new THREE.TorusGeometry(18.95, 0.025, 6, 96)
  const rimMaterial = new THREE.MeshBasicMaterial({ color: '#f2c94c', transparent: true, opacity: 0.18 })
  for (const y of [-14.8, 14.8]) {
    const rim = new THREE.Mesh(rimGeometry, rimMaterial)
    rim.rotation.x = Math.PI / 2
    rim.position.y = y
    scene.add(rim)
  }
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
  // Six staggered rows fill the taller cylinder; each card faces inward.
  const planes = Array.from({ length: 108 }, (_, index) => {
    const sport = index < sports.length ? index : Math.floor(Math.random() * sports.length)
    const row = Math.floor(index / 18)
    const foreground = index % 3 === 0
    const radius = foreground ? 9.5 + Math.random() * 2 : 14 + Math.random() * 3
    const restingOpacity = foreground ? 0.55 : 0.38
    const plane = new THREE.Mesh(geometries[sport], new THREE.MeshBasicMaterial({
      map: texture, transparent: true, opacity: restingOpacity, depthWrite: false, toneMapped: false,
      side: THREE.DoubleSide,
    }))
    plane.userData = {
      sport,
      angle: ((index % 18 + row % 2 * 0.5 + (Math.random() - 0.5) * 0.25) / 18) * Math.PI * 2,
      height: (row - 2.5) * 4.5 + (Math.random() - 0.5) * 0.5,
      radius,
      restingOpacity,
      size: (foreground ? 3 : 3.7) + Math.random() * 0.6,
    }
    plane.position.set(
      Math.sin(plane.userData.angle) * plane.userData.radius,
      plane.userData.height,
      -Math.cos(plane.userData.angle) * plane.userData.radius,
    )
    plane.lookAt(0, plane.userData.height, 0)
    plane.rotateZ((Math.random() - 0.5) * 0.12)
    plane.scale.setScalar(plane.userData.size)
    scene.add(plane)
    return plane
  })
  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.11, ease: 'power3.out' })
  const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.11, ease: 'power3.out' })
  let hovered = null
  let pointerInside = false
  let cursorEnabled = false
  let visible = false
  let disposed = false

  const highlight = plane => {
    if (plane === hovered) return
    if (hovered) gsap.to(hovered.scale, {
      x: hovered.userData.size, y: hovered.userData.size, z: hovered.userData.size,
      duration: 0.2, ease: 'power2.out', overwrite: true,
    })
    hovered = plane
    if (plane) gsap.to(plane.scale, {
      x: plane.userData.size * 1.14, y: plane.userData.size * 1.14, z: plane.userData.size * 1.14,
      duration: 0.22, ease: 'back.out(1.4)', overwrite: true,
    })
    planes.forEach(item => gsap.to(item.material, {
      opacity: !plane ? item.userData.restingOpacity : item === plane ? 1 : 0.08,
      duration: 0.18, ease: 'power2.out', overwrite: true,
    }))
    gsap.to(logo, { autoAlpha: plane ? 0 : 1, scale: plane ? 0.9 : 1, delay: plane ? 0.15 : 0, duration: 0.18, overwrite: true })
    gsap.killTweensOf(title)
    if (plane) {
      gsap.to(title, {
        autoAlpha: 0, y: 8, delay: 0.15, duration: 0.06,
        onComplete: () => {
          title.textContent = sports[plane.userData.sport].name
          gsap.to(title, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' })
        },
      })
    } else {
      gsap.to(title, { autoAlpha: 0, y: 8, duration: 0.14 })
    }
    gsap.to(cursor, { autoAlpha: plane && cursorEnabled ? 1 : 0, duration: 0.1, overwrite: 'auto' })
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
    const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.25 : 1.5)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    composer.setPixelRatio(pixelRatio)
    composer.setSize(width, height)
    previousCameraPosition.copy(camera.position)
    previousCameraYaw = camera.rotation.y
    scene.updateMatrixWorld(true)
    leave()
    renderer.render(scene, camera)
  }
  const tick = (_, delta) => {
    if (!visible || document.hidden) return
    const ease = 1 - Math.exp(-Math.min(delta, 64) / 95)
    camera.rotation.y += ((pointerInside ? -pointer.x * 0.7 : 0) - camera.rotation.y) * ease
    const sideways = pointerInside ? pointer.x * 1.8 : 0
    camera.position.x += (sideways * Math.cos(camera.rotation.y) - camera.position.x) * ease
    camera.position.z += (-sideways * Math.sin(camera.rotation.y) - camera.position.z) * ease
    camera.position.y += ((pointerInside ? pointer.y * 6 : 0) - camera.position.y) * ease
    if (pointerInside) highlight(pick())
    blurPass.uniforms.uVelocity.value.set(
      THREE.MathUtils.clamp((camera.rotation.y - previousCameraYaw) * 0.05 + (camera.position.x - previousCameraPosition.x) * 0.008, -0.012, 0.012),
      THREE.MathUtils.clamp((camera.position.y - previousCameraPosition.y) * 0.008, -0.012, 0.012),
    )
    previousCameraPosition.copy(camera.position)
    previousCameraYaw = camera.rotation.y
    if (blurPass.uniforms.uVelocity.value.lengthSq() > 0.00000025) composer.render()
    else renderer.render(scene, camera)
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
    gsap.killTweensOf([logo, title, cursor, ...planes.map(plane => plane.material), ...planes.map(plane => plane.scale)])
    cursorX.tween.kill()
    cursorY.tween.kill()
    geometries.forEach(geometry => geometry.dispose())
    planes.forEach(plane => plane.material.dispose())
    wallGeometry.dispose()
    wallMaterial.dispose()
    rimGeometry.dispose()
    rimMaterial.dispose()
    texture.dispose()
    blurPass.dispose()
    outputPass.dispose()
    composer.dispose()
    renderer.dispose()
    canvas.remove()
    host.classList.remove('is-gallery-ready')
    gsap.set([logo, title, cursor], { clearProps: 'all' })
  }
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerleave', leave)
  canvas.addEventListener('click', click)
  canvas.addEventListener('webglcontextlost', contextLost)
  observer.observe(host)
  resizeObserver.observe(host)
  resize()
  host.classList.add('is-gallery-ready')
  gsap.ticker.add(tick)
  return dispose
}
