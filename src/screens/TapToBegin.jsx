import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMusic } from '../hooks/useMusic'
import SplineScene from '../spline/SplineScene'
import './TapToBegin.css'

const STAR_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM7/scene.splinecode'

export default function TapToBegin() {
  const navigate = useNavigate()
  const { startExperience } = useMusic()
  const [leaving, setLeaving] = useState(false)

  const handleStart = async () => {
    if (leaving) return
    setLeaving(true)
    await startExperience()
    window.setTimeout(() => navigate('/quiz'), 600)
  }

  return (
    <motion.main
      className="tap-screen screen-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.95 : 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="tap-scene-bg">
        <SplineScene
          url={STAR_SCENE}
          opacity={0.65}
          fallback={<div className="tap-fallback-stars" />}
        />
      </div>
      <div className="noise-overlay" />

      <div className="center-stack max-w-[760px] gap-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="tap-blossom"
        >
          🌸
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          className="space-y-1"
        >
          <h1 className="tap-heading">Something beautiful</h1>
          <h2 className="tap-heading text-[var(--rose)]">is waiting for you.</h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2, ease: 'easeOut' }}
          className="tap-subtitle"
        >
          ( headphones help. it lands better in the quiet. )
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <motion.button
            type="button"
            className="tap-button"
            onClick={handleStart}
            data-cursor="interactive"
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 20px rgba(232,103,138,0.3)',
                '0 0 60px rgba(232,103,138,0.6)',
                '0 0 20px rgba(232,103,138,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            whileTap={{ scale: 0.94 }}
          >
            🎵
          </motion.button>
          <p className="tap-button-label">Tap to begin</p>
          <p className="tap-note">Press play. Let it unfold.</p>
        </motion.div>
      </div>
    </motion.main>
  )
}
