import { motion } from 'framer-motion'

export default function FloatingEmoji({
  emoji,
  className = '',
  duration = 6,
  delay = 0,
  range = 20,
}) {
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute select-none text-3xl opacity-10 ${className}`.trim()}
      animate={{ y: [0, -range, 0], rotate: [0, 6, -6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.span>
  )
}
