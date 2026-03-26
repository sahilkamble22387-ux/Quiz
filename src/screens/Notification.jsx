import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { confessionAudio } from '../../components/confession/AudioManager'
import { useMusic } from '../hooks/useMusic'
import SplineScene from '../spline/SplineScene'
import './Notification.css'

const AVATAR_SCENE = 'https://prod.spline.design/KMFMbyMESFrFojY9/scene.splinecode'

export default function Notification() {
  const navigate = useNavigate()
  const { playNotificationSound, playHeartDoorSweep } = useMusic()
  const [expanded, setExpanded] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const soundPlayedRef = useRef(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(true), 2000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="notification-screen screen-shell">
      <LayoutGroup>
        <AnimatePresence>
          {expanded ? (
            <motion.div
              key="notification-backdrop"
              className="notification-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : null}
        </AnimatePresence>

        <div className="notification-frame">
          {!expanded ? (
            <div className="notification-banner-wrap">
              <motion.button
                type="button"
                layoutId="notification-card"
                className="notification-banner glass-card"
                initial={{ y: -150, opacity: 0 }}
                animate={{ y: [0, -3, 0], opacity: 1 }}
                transition={{
                  y: { delay: 1, duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 0.7, ease: 'easeOut' },
                }}
                onAnimationStart={() => {
                  if (soundPlayedRef.current) return
                  soundPlayedRef.current = true
                  playNotificationSound()
                }}
                onClick={() => setExpanded(true)}
                data-cursor="interactive"
              >
                <div className="notification-icon">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💌
                  </motion.span>
                </div>
                <div className="notification-text">
                  <p className="notification-app">Unsent</p>
                  <p className="notification-message">
                    There is something someone never managed to say out loud. Tap to open.
                  </p>
                </div>
                <p className="notification-time">now</p>
              </motion.button>

              {showHint ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="notification-hint"
                >
                  open it ↑
                </motion.p>
              ) : null}
            </div>
          ) : (
            <motion.div
              layoutId="notification-card"
              className="notification-expanded glass-card"
            >
              <div className="notification-character">
                <SplineScene
                  url={AVATAR_SCENE}
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <div className="css-heart" style={{ width: 90, height: 90 }} />
                    </div>
                  }
                />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.45 }}
                className="notification-expanded-copy"
              >
                <h1 className="notification-question">Do you have a boyfriend?</h1>
                <p className="notification-subtext">
                  ( answer honestly.
                  <br />
                  I&apos;ll take the truth. )
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <motion.button
                    type="button"
                    className="btn-primary notification-primary"
                    onClick={() => {
                      confessionAudio.unlock()
                      confessionAudio.preloadAll()
                      confessionAudio.playScene(0)
                      playHeartDoorSweep()
                      navigate('/heartdoor')
                    }}
                    data-cursor="interactive"
                    whileHover={{ scale: 1.06, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    No, I don&apos;t 🌸
                  </motion.button>
                  <button
                    type="button"
                    className="btn-ghost notification-secondary"
                    onClick={() => navigate('/taken')}
                    data-cursor="interactive"
                  >
                    I do... 💔
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </LayoutGroup>
    </main>
  )
}
