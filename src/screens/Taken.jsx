import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './Taken.css'

export default function Taken() {
  const navigate = useNavigate()

  return (
    <main className="taken-screen screen-shell">
      <div className="center-stack max-w-[520px] gap-8">
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl"
        >
          😭
        </motion.div>
        <h1 className="taken-heading">...oh.</h1>
        <p className="taken-copy">
          Okay. That&apos;s okay. I&apos;m completely fine. He better treat you like the most
          precious person alive or I will be very upset. Very.
        </p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => navigate('/gate')}
          data-cursor="interactive"
        >
          ← Actually wait 😅
        </button>
      </div>
    </main>
  )
}
