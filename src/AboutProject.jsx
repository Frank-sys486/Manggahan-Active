import { useEffect } from 'react'
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
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'About the project — Manggahan Active'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="about-project" id="main-content">
      <div className="about-project__inner">
        <header className="about-project__identity">
          <LandingGlyph className="about-project__mark" />
          <h1>Manggahan <span>Active</span></h1>
        </header>
        <section className="about-project__stack" aria-labelledby="about-project-stack-title">
          <h2 id="about-project-stack-title">Built with</h2>
          <ul className="about-project__grid">
            {technologies.map(({ name, logo }) => (
              <li key={logo}>
                <svg viewBox="0 0 100 100" role="img" aria-label={`${name} logo`}>
                  <use href={`/technology-logos.svg#${logo}`} />
                </svg>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
