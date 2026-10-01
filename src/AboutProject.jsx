import { useCallback, useEffect, useRef, useState } from 'react'
import './AboutProject.css'

const stack = [
  {
    title: 'The interface.',
    technologies: [
      { name: 'React + React DOM', logo: 'react' },
      { name: 'JavaScript', logo: 'javascript' },
      { name: 'HTML5', logo: 'html' },
      { name: 'CSS3', logo: 'css' },
      { name: 'Web Storage API', logo: 'storage' },
    ],
  },
  {
    title: 'Motion & depth.',
    technologies: [
      { name: 'Three.js', logo: 'three' },
      { name: 'WebGL', logo: 'webgl' },
      { name: 'GSAP + ScrollTrigger', logo: 'gsap' },
      { name: 'Lenis', logo: 'lenis' },
    ],
  },
  {
    title: 'Built & checked with.',
    technologies: [
      { name: 'Vite', logo: 'vite' },
      { name: 'Node.js + node:test', logo: 'node' },
      { name: 'ESLint', logo: 'eslint' },
    ],
  },
]

const lastSlide = stack.length

function ProjectMark() {
  return (
    <svg className="about-project__mark" viewBox="0 0 600 580" role="img" aria-label="Six court paths joining at one highlighted reservation slot">
      <path d="M72 450 192 192 300 422 408 192 528 450" fill="none" stroke="#f5f2e9" strokeWidth="58" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M72 450 192 192 300 422 408 192 528 450" fill="none" stroke="#14874e" strokeWidth="16" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M104 452 196 254M136 452 200 324M464 452 400 324M496 452 404 254" stroke="#000" strokeWidth="13" strokeLinecap="square" />
      <rect x="255" y="382" width="90" height="80" fill="#f6b93b" />
      <path d="m274 422 18 17 34-39" fill="none" stroke="#000" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  )
}

function TechnologyLogo({ logo, name }) {
  return (
    <svg className="about-project__tech-logo" role="img" aria-label={`${name} logo`} viewBox="0 0 100 100">
      <use href={`/technology-logos.svg#${logo}`} />
    </svg>
  )
}

export default function AboutProject() {
  const [slide, setSlide] = useState({ index: 0, direction: 1, phase: 'idle' })
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  const changeSlide = useCallback((direction) => {
    const next = Math.max(0, Math.min(lastSlide, indexRef.current + direction))
    if (next === indexRef.current || timerRef.current) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      indexRef.current = next
      setSlide({ index: next, direction, phase: 'idle' })
      return
    }

    setSlide(current => ({ ...current, direction, phase: 'leaving' }))
    timerRef.current = window.setTimeout(() => {
      indexRef.current = next
      setSlide({ index: next, direction, phase: 'arriving' })
      timerRef.current = window.setTimeout(() => {
        setSlide(current => ({ ...current, phase: 'idle' }))
        timerRef.current = null
      }, 420)
    }, 220)
  }, [])

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyMinWidth = document.body.style.minWidth
    const previousTitle = document.title
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.minWidth = '0'
    document.title = 'About the project — Manggahan Active'

    const blockScroll = (event) => event.preventDefault()
    const onKeyDown = (event) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
      event.preventDefault()
      changeSlide(event.key === 'ArrowDown' ? 1 : -1)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', blockScroll, { passive: false })
    window.addEventListener('touchmove', blockScroll, { passive: false })
    return () => {
      document.documentElement.style.overflow = previousOverflow
      document.body.style.overflow = previousBodyOverflow
      document.body.style.minWidth = previousBodyMinWidth
      document.title = previousTitle
      window.clearTimeout(timerRef.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', blockScroll)
      window.removeEventListener('touchmove', blockScroll)
    }
  }, [changeSlide])

  return (
    <main className="about-project" id="main-content">
      <section
        key={slide.index}
        className={`about-project__slide about-project__slide--${slide.phase}-${slide.direction > 0 ? 'down' : 'up'}`}
        aria-label={`Slide ${slide.index + 1} of ${lastSlide + 1}`}
        aria-live="polite"
      >
        {slide.index === 0 ? (
          <div className="about-project__identity">
            <ProjectMark />
            <h1>Manggahan <span>Active.</span></h1>
          </div>
        ) : (
          <div className="about-project__stack">
            <h2>{stack[slide.index - 1].title}</h2>
            <ul className="about-project__technologies">
              {stack[slide.index - 1].technologies.map(technology => (
                <li key={technology.logo}>
                  <TechnologyLogo {...technology} />
                  <span>{technology.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <nav className="about-project__controls" aria-label="Project slides">
        <button type="button" aria-label="Previous slide" onClick={() => changeSlide(-1)} disabled={slide.index === 0}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 15 7-7 7 7" /></svg>
        </button>
        <button type="button" aria-label="Next slide" onClick={() => changeSlide(1)} disabled={slide.index === lastSlide}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg>
        </button>
      </nav>
    </main>
  )
}
