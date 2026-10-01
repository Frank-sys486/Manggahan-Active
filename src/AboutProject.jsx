import { useEffect, useRef } from 'react'
import { LandingGlyph } from './LandingMorph.jsx'
import './AboutProject.css'

const technologies = [
  { name: 'HTML5', logo: 'html' },
  { name: 'CSS3', logo: 'css' },
  { name: 'JavaScript', logo: 'javascript' },
  { name: 'React + React DOM', logo: 'react' },
  { name: 'Three.js', logo: 'three' },
  { name: 'WebGL', logo: 'webgl' },
  { name: 'GSAP + ScrollTrigger', logo: 'gsap' },
  { name: 'Lenis', logo: 'lenis' },
  { name: 'Vite', logo: 'vite' },
  { name: 'Node.js + node:test', logo: 'node' },
  { name: 'ESLint', logo: 'eslint' },
  { name: 'Web Storage API', logo: 'storage' },
]

export default function AboutProject() {
  const slidesRef = useRef(null)

  useEffect(() => {
    const previousTitle = document.title
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyMinHeight = document.body.style.minHeight
    document.title = 'About the project — Manggahan Active'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.minHeight = '0'

    const onKeyDown = (event) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
      event.preventDefault()
      const slides = slidesRef.current
      if (!slides) return
      const current = Math.round(slides.scrollTop / slides.clientHeight)
      const next = Math.max(0, Math.min(1, current + (event.key === 'ArrowDown' ? 1 : -1)))
      slides.scrollTo({
        top: next * slides.clientHeight,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.title = previousTitle
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
      document.body.style.minHeight = previousBodyMinHeight
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <main className="about-project" id="main-content" ref={slidesRef}>
      <section className="about-project__slide about-project__slide--identity" aria-label="Manggahan Active">
        <h1 className="sr-only">Manggahan Active</h1>
        <div className="about-project__hero-mark">
          <LandingGlyph className="about-project__mark" />
        </div>
      </section>
      <section className="about-project__slide about-project__slide--stack" aria-labelledby="about-project-stack-title">
        <h2 className="sr-only" id="about-project-stack-title">Technology stack</h2>
        <ul className="about-project__grid">
          {technologies.map(({ name, logo }) => (
            <li key={logo}>
              <svg viewBox="0 0 100 100" role="img" aria-label={name}>
                <use href={`/technology-logos.svg#${logo}`} />
              </svg>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
