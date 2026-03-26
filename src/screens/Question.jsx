import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import Celebration from './Celebration'
import { useMusic } from '../hooks/useMusic'
import SplineScene from '../spline/SplineScene'
import './Question.css'

gsap.registerPlugin(ScrollTrigger)

const FLOWER_SCENE = 'https://prod.spline.design/Br-MYkEMSMBcFwRb/scene.splinecode'
const QUESTION_LINES = ['Radhika,', 'will you go', 'on a date', 'with me?']

export default function Question() {
  const sectionRef = useRef(null)
  const arenaRef = useRef(null)
  const noButtonRef = useRef(null)
  const escapeCountRef = useRef(0)
  const positionRef = useRef({ x: 180, y: 0 })
  const sequenceStartedRef = useRef(false)
  const timersRef = useRef([])
  const [accepted, setAccepted] = useState(false)
  const [celebrationOrigin, setCelebrationOrigin] = useState(null)
  const [noVisible, setNoVisible] = useState(true)
  const [noGoneText, setNoGoneText] = useState(false)
  const [activeLineIndex, setActiveLineIndex] = useState(-1)
  const [showActions, setShowActions] = useState(false)
  const { playYesChord, playNoEscape, swellCelebration } = useMusic()

  useLayoutEffect(() => {
    if (noButtonRef.current) {
      gsap.set(noButtonRef.current, { x: positionRef.current.x, y: positionRef.current.y })
    }
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 68%',
        once: true,
        onEnter: () => {
          if (sequenceStartedRef.current) return
          sequenceStartedRef.current = true
          setActiveLineIndex(0)
          timersRef.current = [
            window.setTimeout(() => setActiveLineIndex(1), 2000),
            window.setTimeout(() => setActiveLineIndex(2), 3500),
            window.setTimeout(() => setActiveLineIndex(3), 5000),
            window.setTimeout(() => setShowActions(true), 8200),
          ]
        },
      })
    }, sectionRef)

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      ctx.revert()
    }
  }, [])

  const finishNoButton = () => {
    if (!noButtonRef.current || !noVisible) return
    gsap.to(noButtonRef.current, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => setNoVisible(false),
    })
    window.setTimeout(() => {
      setNoGoneText(true)
      window.setTimeout(() => setNoGoneText(false), 4000)
    }, 500)
  }

  const maybeEscape = (clientX, clientY) => {
    if (accepted || !noVisible || !arenaRef.current || !noButtonRef.current) return

    const buttonRect = noButtonRef.current.getBoundingClientRect()
    const arenaRect = arenaRef.current.getBoundingClientRect()
    const centerX = buttonRect.left + buttonRect.width / 2
    const centerY = buttonRect.top + buttonRect.height / 2
    const distance = Math.hypot(centerX - clientX, centerY - clientY)

    if (distance >= 100) return

    let dx = centerX - clientX
    let dy = centerY - clientY

    if (dx === 0 && dy === 0) {
      dx = Math.random() - 0.5
      dy = Math.random() - 0.5
    }

    const magnitude = Math.hypot(dx, dy) || 1
    const stepX = (dx / magnitude) * 180
    const stepY = (dy / magnitude) * 180
    const maxX = arenaRect.width / 2 - buttonRect.width / 2 - 50
    const maxY = arenaRect.height / 2 - buttonRect.height / 2 - 30

    positionRef.current = {
      x: Math.max(-maxX, Math.min(maxX, positionRef.current.x + stepX)),
      y: Math.max(-maxY, Math.min(maxY, positionRef.current.y + stepY)),
    }

    gsap.to(noButtonRef.current, {
      x: positionRef.current.x,
      y: positionRef.current.y,
      duration: 0.2,
      ease: 'power2.out',
    })
    playNoEscape()
    escapeCountRef.current += 1

    if (escapeCountRef.current >= 8) {
      finishNoButton()
    }
  }

  const handleTouchMove = (event) => {
    const touch = event.touches?.[0]
    if (!touch) return
    maybeEscape(touch.clientX, touch.clientY)
  }

  const handleYes = (event) => {
    if (accepted) return
    const rect = event.currentTarget.getBoundingClientRect()
    setCelebrationOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    setAccepted(true)
    playYesChord()
    swellCelebration()
  }

  return (
    <section
      id="question"
      ref={sectionRef}
      className="story-section question-section"
      onPointerMove={(event) => maybeEscape(event.clientX, event.clientY)}
      onTouchMove={handleTouchMove}
    >
      <div className="question-background">
        <div className="question-flower-layer">
          <SplineScene
            url={FLOWER_SCENE}
            opacity={0.95}
            fallback={<div className="story-star-fallback" />}
          />
        </div>
      </div>

      <motion.div
        className="question-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: accepted ? 0 : 1 }}
        transition={{ duration: accepted ? 0.6 : 1.5 }}
      >
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center justify-center px-6 py-[120px] text-center sm:px-10">
          <div className="question-line-stage">
            <AnimatePresence mode="wait">
              {activeLineIndex >= 0 ? (
                <motion.h2
                  key={QUESTION_LINES[activeLineIndex]}
                  className={`question-line ${
                    activeLineIndex === 0 || activeLineIndex === 3 ? 'text-[var(--rose)]' : ''
                  }`}
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: activeLineIndex === 3 ? 1 : 0, y: activeLineIndex === 3 ? 0 : -40 }}
                  transition={{ duration: 1, ease: 'power3.out' }}
                >
                  {QUESTION_LINES[activeLineIndex]}
                </motion.h2>
              ) : null}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showActions ? (
              <motion.div
                ref={arenaRef}
                className="question-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  type="button"
                  className="question-yes"
                  onClick={handleYes}
                  data-cursor="interactive"
                  animate={{
                    boxShadow: [
                      '0 16px 48px rgba(192,21,42,0.34), 0 0 0 0 rgba(192,21,42,0)',
                      '0 16px 48px rgba(192,21,42,0.34), 0 0 0 14px rgba(192,21,42,0)',
                      '0 16px 48px rgba(192,21,42,0.34), 0 0 0 0 rgba(192,21,42,0)',
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  whileHover={{ scale: 1.06, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Yes, Sahil 🌸
                </motion.button>

                {noVisible ? (
                  <button
                    ref={noButtonRef}
                    type="button"
                    className="question-no"
                    data-cursor="interactive"
                  >
                    No
                  </button>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {noGoneText ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="question-no-gone"
            >
              The no button has left the chat 💀
            </motion.p>
          ) : null}
        </div>
      </motion.div>

      <Celebration active={accepted} origin={celebrationOrigin} />
    </section>
  )
}
