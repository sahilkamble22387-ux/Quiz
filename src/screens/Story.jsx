import { useEffect, useMemo, useState } from 'react'
import CinematicBackdrop from '../components/CinematicBackdrop'
import ProgressDots from '../components/ProgressDots'
import TopBar from '../components/TopBar'
import { LOVE_PANELS, STORY_CHAPTERS, STORY_SECTIONS } from '../constants/story'
import { useMusic } from '../hooks/useMusic'
import useLenis from '../hooks/useLenis'
import Poll from './Poll'
import Question from './Question'
import './Story.css'

function StoryBeat({ beat }) {
  return (
    <section id={beat.id} className={`story-section story-beat story-beat-${beat.align}`}>
      <div className="story-beat-shell">
        <div className="story-beat-copy">
          <p className="story-kicker">{beat.eyebrow}</p>
          <p className="story-chapter-index">CHAPTER {beat.chapter}</p>
          <h2 className="story-title">{beat.title}</h2>
          <div className="story-lines" data-cursor="story">
            {beat.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LoveBeat({ panel }) {
  return (
    <section id={panel.id} className="story-section love-beat" style={{ backgroundColor: panel.background }}>
      <div className="love-beat-number">{panel.number}</div>
      <div className="love-beat-shell">
        <div className="love-beat-copy">
          <p className="story-kicker">WHAT I LOVE</p>
          <h2 className="love-beat-title">{panel.title}</h2>
          <div className="love-beat-lines" data-cursor="story">
            {panel.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function useActiveSectionProgress(activeId) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const section = document.getElementById(activeId)
      if (!section) return
      const rect = section.getBoundingClientRect()
      const ratio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      setProgress(Math.max(0, Math.min(1, ratio)))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [activeId])

  return progress
}

export default function Story() {
  const lenisRef = useLenis(true)
  const { restoreMusic, normalizeCelebrationRate } = useMusic()
  const [activeIndex, setActiveIndex] = useState(0)
  const [showTopBar, setShowTopBar] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    restoreMusic()
    normalizeCelebrationRate()
  }, [normalizeCelebrationRate, restoreMusic])

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? window.scrollY / max : 0
      setProgress(Math.max(0, Math.min(1, ratio)))
      setShowTopBar(window.scrollY > 80)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sections = STORY_SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!visible) return
        const index = sections.findIndex((section) => section === visible.target)
        if (index >= 0) {
          setActiveIndex(index)
        }
      },
      { threshold: [0.2, 0.45, 0.65] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const activeSection = STORY_SECTIONS[activeIndex] ?? STORY_SECTIONS[0]
  const activeSceneKey = useMemo(() => {
    if (activeSection.id === 'question') {
      return 'panel-06'
    }
    return activeSection.id
  }, [activeSection.id])
  const sceneProgress = useActiveSectionProgress(activeSection.id)

  const scrollToSection = (id) => {
    const target = document.getElementById(id)
    if (!target) return
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(target, { offset: -40 })
      return
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="story-route">
      <div className="story-progress-bar">
        <div className="story-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <TopBar
        visible={showTopBar}
        activeIndex={activeIndex}
        total={STORY_SECTIONS.length}
        activeLabel={activeSection.label}
      />
      <ProgressDots sections={STORY_SECTIONS} activeIndex={activeIndex} onSelect={scrollToSection} />

      <div className="story-background">
        <CinematicBackdrop sceneKey={activeSceneKey} progress={sceneProgress} />
        <div className="story-background-wash" />
        <div className="story-film-grain" />
      </div>

      <div className="story-content">
        {STORY_CHAPTERS.map((beat) => (
          <StoryBeat key={beat.id} beat={beat} />
        ))}

        {LOVE_PANELS.map((panel) => (
          <LoveBeat key={panel.id} panel={panel} />
        ))}

        <Poll onContinue={() => scrollToSection('question')} />
        <Question />
      </div>
    </main>
  )
}
