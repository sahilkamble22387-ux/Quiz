import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMusic } from '../hooks/useMusic'
import GlassCard from '../components/GlassCard'
import SplineScene from '../spline/SplineScene'
import './Gate.css'

const HEART_SCENE = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode'
const STAR_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM7/scene.splinecode'

export default function Gate() {
  const navigate = useNavigate()
  const { playHeartDoorSweep, setDramaticVolume } = useMusic()
  const [heartReady, setHeartReady] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const handleEnter = () => {
    if (leaving) return
    playHeartDoorSweep()
    setDramaticVolume()
    setLeaving(true)
    window.setTimeout(() => navigate('/heartdoor?next=quiz'), 650)
  }

  return (
    <main className="gate-screen screen-shell">
      <div className="gate-background">
        <SplineScene
          url={STAR_SCENE}
          opacity={0.5}
          fallback={<div className="gate-fallback-stars" />}
        />
      </div>

      <motion.div
        className="center-stack gate-content"
        animate={{ opacity: leaving ? 0 : 1, y: leaving ? -20 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="gate-heart-wrap"
          animate={{ scale: leaving ? 3 : 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <SplineScene
            url={HEART_SCENE}
            onLoad={() => setHeartReady(true)}
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="gate-css-heart css-heart" />
              </div>
            }
          />
        </motion.div>

        <motion.div
          className="mt-8 flex w-full flex-col items-center"
          initial={false}
          animate={heartReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="gate-label">A MESSAGE · JUST FOR YOU</p>
          <div className="mt-4 space-y-2 text-center">
            <p className="gate-heading-muted">Welcome to</p>
            <h1 className="gate-heading rose-glow-text">Sahil&apos;s Heart</h1>
          </div>

          <GlassCard className="gate-condition-card mt-8 w-full max-w-[520px] px-8 py-7 text-center">
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              😭🙏
            </motion.div>
            <p className="mt-4 font-romance text-[20px] text-[var(--white)]">
              Please, PLEASE don&apos;t have a boyfriend.
            </p>
            <p className="mt-2 text-[12px] italic text-[var(--dimmer)]">
              ( the heart above is literally shaking )
            </p>
          </GlassCard>

          <div className="mt-8 flex w-full flex-col items-center gap-3">
            <motion.button
              type="button"
              className="btn-primary gate-primary"
              onClick={handleEnter}
              data-cursor="interactive"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              I&apos;m single, let me in 🌸
            </motion.button>
            <motion.button
              type="button"
              className="btn-ghost gate-secondary"
              onClick={() => navigate('/taken')}
              data-cursor="interactive"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              I have a boyfriend... 💔
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  )
}
