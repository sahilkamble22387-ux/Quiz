import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUIZ_QUESTIONS } from '../constants/questions'
import { useMusic } from '../hooks/useMusic'
import GlassCard from '../components/GlassCard'
import SplineScene from '../spline/SplineScene'
import './Quiz.css'

const STAR_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM7/scene.splinecode'
const LETTERS = ['A', 'B', 'C', 'D']

export default function Quiz() {
  const navigate = useNavigate()
  const { playQuizHover, playQuizClick } = useMusic()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)

  const question = QUIZ_QUESTIONS[currentIndex]

  useEffect(() => {
    if (!analyzing) return undefined
    const timer = window.setTimeout(() => {
      setAnalysisDone(true)
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [analyzing])

  const progressState = useMemo(() => {
    if (analyzing || analysisDone) return QUIZ_QUESTIONS.length - 1
    return currentIndex
  }, [analysisDone, analyzing, currentIndex])

  const handleSelect = (index) => {
    if (selectedOption != null || analyzing || analysisDone) return
    playQuizClick()
    setSelectedOption(index)

    window.setTimeout(() => {
      if (currentIndex === QUIZ_QUESTIONS.length - 1) {
        setAnalyzing(true)
      } else {
        setCurrentIndex((value) => value + 1)
      }
      setSelectedOption(null)
    }, 300)
  }

  return (
    <main className="quiz-screen screen-shell">
      <div className="quiz-background">
        <SplineScene
          url={STAR_SCENE}
          opacity={0.3}
          fallback={<div className="quiz-fallback-stars" />}
        />
      </div>
      <div className="quiz-orb quiz-orb-one" />
      <div className="quiz-orb quiz-orb-two" />
      <div className="quiz-orb quiz-orb-three" />

      <div className="center-stack z-20 w-full max-w-[640px]">
        <p className="section-label">BEFORE WE BEGIN</p>
        <div className="mt-4 text-center">
          <h1 className="quiz-heading">A completely unrelated</h1>
          <h2 className="quiz-heading text-[var(--rose)]">personality quiz 😇</h2>
        </div>
        <p className="mt-4 text-[12px] italic text-[var(--dimmer)]">
          ( just trust the process. )
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          {QUIZ_QUESTIONS.map((item, index) => {
            const active = index === progressState
            const completed = index < progressState
            return (
              <motion.div
                key={item.id}
                layout
                className={`quiz-dot ${
                  active ? 'quiz-dot-active' : completed ? 'quiz-dot-completed' : 'quiz-dot-idle'
                }`}
              />
            )
          })}
        </div>

        <div className="mt-8 w-full">
          <AnimatePresence mode="wait">
            {!analyzing && !analysisDone ? (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <GlassCard className="quiz-card px-7 py-8 sm:px-12 sm:py-12">
                  <p className="quiz-question">{question.question}</p>

                  <div className="mt-8 space-y-[10px]">
                    {question.options.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        className={`quiz-option ${selectedOption === index ? 'quiz-option-selected' : ''}`}
                        onMouseEnter={playQuizHover}
                        onClick={() => handleSelect(index)}
                        data-cursor="interactive"
                      >
                        <span className="quiz-option-badge">{LETTERS[index]}</span>
                        <span className="quiz-option-text">{option}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <GlassCard className="quiz-card px-7 py-8 sm:px-12 sm:py-12">
                  {!analysisDone ? (
                    <div className="space-y-5">
                      <p className="micro-label text-[var(--dimmer)]">READING THE ROOM...</p>
                      <div className="quiz-loading-track">
                        <motion.div
                          className="quiz-loading-bar"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2.5, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="micro-label text-[var(--rose)]"
                      >
                        DIAGNOSIS COMPLETE 🔬
                      </motion.p>
                      <motion.h3
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 14 }}
                        className="quiz-result-title"
                      >
                        You are, unmistakably, a Radhika.
                      </motion.h3>
                      {[
                        'Organised. Ambitious.',
                        'Doing impossible things like they were always going to happen.',
                        'The kind of person people remember for longer than they admit.',
                      ].map((line, index) => (
                        <motion.p
                          key={line}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.25 }}
                          className="quiz-result-copy"
                        >
                          {line}
                        </motion.p>
                      ))}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8 }}
                        className="quiz-result-copy font-romance text-[clamp(17px,2vw,22px)]"
                      >
                        Has absolutely no idea someone has been
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, scale: [1, 1.03, 1] }}
                        transition={{
                          delay: 2.2,
                          scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                        }}
                        className="quiz-result-emphasis rose-glow-text"
                      >
                        carrying her around in his mind since 11th standard.
                      </motion.p>
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5 }}
                        className="btn-ghost mt-4"
                        onClick={() => navigate('/notification')}
                        data-cursor="interactive"
                        whileHover={{ y: -3 }}
                      >
                        This is where it gets real →
                      </motion.button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
