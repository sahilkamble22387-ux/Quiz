import { AnimatePresence, motion } from 'framer-motion'
import ConfettiCanvas from '../components/ConfettiCanvas'
import FloatingHearts from '../components/FloatingHearts'
import SplineScene from '../spline/SplineScene'
import './Celebration.css'

const CELEBRATION_SCENE = 'https://prod.spline.design/EzPPCkuSFB4TFKOE/scene.splinecode'

export default function Celebration({ active, origin }) {
  return (
    <>
      <ConfettiCanvas active={active} origin={origin} />
      <FloatingHearts active={active} />

      <AnimatePresence>
        {active ? (
          <motion.div
            className="celebration-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            <div className="celebration-scene">
              <SplineScene
                url={CELEBRATION_SCENE}
                opacity={0.95}
                fallback={<div className="story-star-fallback" />}
              />
            </div>

            <motion.div
              className="celebration-copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="micro-label text-[var(--rose)]"
              >
                She said yes. 🌸
              </motion.p>
              <div className="mt-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95 }}
                  className="celebration-heading"
                >
                  No more
                </motion.h2>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="celebration-heading rose-glow-text"
                >
                  almosts.
                </motion.h2>
              </div>
              <div className="celebration-lines">
                {[
                  'This is what all that silence was carrying.',
                  'This is what every missed timing was trying to become.',
                  'No more roads passing in opposite directions.',
                  'No more feelings left unsent.',
                ].map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.3 }}
                    className="celebration-line"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                transition={{
                  delay: 2.6,
                  scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="celebration-name rose-glow-text"
              >
                Radhika.
              </motion.p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
