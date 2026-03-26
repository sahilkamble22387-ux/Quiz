import { motion } from 'framer-motion'

export default function PhotoSlot({ emoji, label, caption = 'Replace this with her photo later' }) {
  return (
    <div className="story-side flex justify-center">
      <div className="glass-card flex aspect-[3/4] w-full max-w-[360px] flex-col items-center justify-center border border-dashed border-[rgba(232,103,138,0.2)] px-8 py-10 text-center">
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-5 text-5xl opacity-35"
        >
          {emoji}
        </motion.div>
        <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-[rgba(232,103,138,0.35)]">
          {label}
        </p>
        <p className="mt-3 font-ui text-[9px] text-[rgba(255,255,255,0.15)]">{caption}</p>
      </div>
    </div>
  )
}
