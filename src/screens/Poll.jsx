import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import FloatingEmoji from '../components/FloatingEmoji'
import GlassCard from '../components/GlassCard'
import { POLL_OPTIONS } from '../constants/questions'
import './Poll.css'

const LETTERS = ['A', 'B', 'C', 'D']

export default function Poll({ onContinue }) {
  const [selected, setSelected] = useState(null)
  const [showContinue, setShowContinue] = useState(false)
  const [showSecondary, setShowSecondary] = useState(false)

  useEffect(() => {
    if (!selected) {
      setShowContinue(false)
      setShowSecondary(false)
      return undefined
    }

    const continueTimer = window.setTimeout(() => setShowContinue(true), 1500)
    let secondaryTimer

    if (selected.id === 'D') {
      secondaryTimer = window.setTimeout(() => setShowSecondary(true), 1500)
    }

    return () => {
      window.clearTimeout(continueTimer)
      if (secondaryTimer) window.clearTimeout(secondaryTimer)
    }
  }, [selected])

  return (
    <section id="poll" className="story-section poll-section screen-shell">
      <FloatingEmoji emoji="🌸" className="left-[12%] top-[20%]" />
      <FloatingEmoji emoji="💗" className="right-[14%] top-[24%]" delay={1} />
      <FloatingEmoji emoji="✨" className="left-[20%] bottom-[18%]" delay={1.8} />
      <FloatingEmoji emoji="🌙" className="right-[22%] bottom-[16%]" delay={0.5} />

      <div className="center-stack max-w-[640px]">
        <div className="text-center">
          <h2 className="poll-heading">Before I ask</h2>
          <h2 className="poll-heading">for real —</h2>
          <h2 className="poll-heading text-[var(--rose)] rose-glow-text">tell me honestly.</h2>
        </div>
        <p className="mt-4 text-[15px] italic text-[var(--muted)]">
          No jokes this time. I can take the truth.
        </p>

        <GlassCard className="poll-card mt-10 w-full px-7 py-8 sm:px-12 sm:py-12">
          <p className="poll-question">So if I actually showed up and asked?</p>

          <div className="mt-8 space-y-[10px]">
            {POLL_OPTIONS.map((option, index) => {
              const active = selected?.id === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`poll-option ${active ? 'poll-option-active' : ''}`}
                  onClick={() => setSelected(option)}
                  data-cursor="interactive"
                >
                  <span className="poll-option-badge">{LETTERS[index]}</span>
                  <span className="poll-option-text">{option.label}</span>
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="poll-result"
              >
                <p className="poll-result-label">{selected.label}</p>
                <div className="poll-result-track">
                  <motion.div
                    className="poll-result-bar"
                    initial={{ width: '0%' }}
                    animate={{ width: `${selected.percentage}%`, backgroundColor: selected.color }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
                <p className="poll-result-percentage">{selected.percentage}% chance detected</p>
                <p className="poll-result-reaction">{selected.reaction}</p>
                {showSecondary && selected.secondaryReaction ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="poll-result-secondary"
                  >
                    {selected.secondaryReaction}
                  </motion.p>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {showContinue ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="btn-ghost mt-8"
              onClick={onContinue}
              data-cursor="interactive"
            >
              All right. No more hiding. →
            </motion.button>
          ) : null}
        </GlassCard>
      </div>
    </section>
  )
}
