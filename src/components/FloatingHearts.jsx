import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const HEARTS = ['🌸', '💗', '✨', '🌙', '💫', '🌺', '💕', '🫀']

export default function FloatingHearts({ active }) {
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    if (!active) {
      setHearts([])
      return undefined
    }

    const spawnHeart = () => {
      const id = crypto.randomUUID()
      const nextHeart = {
        id,
        emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
        left: 8 + Math.random() * 84,
        duration: 4 + Math.random() * 2,
        rotate: -20 + Math.random() * 40,
        drift: -40 + Math.random() * 80,
        size: 22 + Math.random() * 22,
      }

      setHearts((current) => [...current, nextHeart])
      window.setTimeout(() => {
        setHearts((current) => current.filter((heart) => heart.id !== id))
      }, nextHeart.duration * 1000)
    }

    spawnHeart()
    const intervalId = window.setInterval(spawnHeart, 400)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [active])

  return (
    <div className="pointer-events-none fixed inset-0 z-[88] overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.span
            key={heart.id}
            initial={{ opacity: 0, x: 0, y: '110vh', rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: heart.drift, y: '-110vh', rotate: heart.rotate }}
            exit={{ opacity: 0 }}
            transition={{ duration: heart.duration, ease: 'easeOut' }}
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
            }}
            className="absolute bottom-0"
          >
            {heart.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
