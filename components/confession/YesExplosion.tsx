import { useMemo } from 'react'
import { YES_SEQUENCE_NARRATION } from '../../lib/sceneConfig'

type Props = {
  active: boolean
  sceneTime: number
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function activeLine(sceneTime: number) {
  return YES_SEQUENCE_NARRATION.find((line) => sceneTime >= line.delay && sceneTime <= line.delay + line.duration) ?? null
}

export default function YesExplosion({ active, sceneTime }: Props) {
  const hearts = useMemo(() => {
    const random = seededRandom(99)
    return Array.from({ length: 120 }, (_, index) => ({
      id: index,
      x: random() * 100,
      y: 65 + random() * 35,
      size: 18 + random() * 28,
      duration: 2.4 + random() * 2.4,
      delay: random() * 0.6,
      rotate: -18 + random() * 36,
      emoji: random() > 0.35 ? '💖' : '✨',
    }))
  }, [])
  const currentLine = activeLine(sceneTime)
  const whiteFade = sceneTime > 13 ? Math.min((sceneTime - 13) / 1, 1) : 0

  if (!active) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: 'radial-gradient(circle at center, rgba(255,214,224,0.14), rgba(26,10,20,0.82) 55%, rgba(26,10,20,0.98))',
      }}
    >
      {hearts.map((heart) => (
        <span
          key={heart.id}
          style={{
            position: 'absolute',
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            fontSize: heart.size,
            transform: `rotate(${heart.rotate}deg) scale(${1 + Math.sin(heart.id) * 0.1})`,
            animation: `confession-heart-float ${heart.duration}s ${heart.delay}s ease-out forwards`,
            opacity: 0,
          }}
        >
          {heart.emoji}
        </span>
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#fffaf0',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(40px, 6vw, 48px)',
          }}
        >
          She said yes.
        </h2>
        <p
          style={{
            margin: 0,
            color: '#ff6b9d',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 3vw, 24px)',
          }}
        >
          This was always going to happen. 💖
        </p>
      </div>

      {currentLine ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '18%',
            transform: `translateX(-50%) scale(${currentLine.text.includes('5 years') ? 1.04 : 1})`,
            color: currentLine.text === "Now let's show you what comes next." ? '#ffd28f' : '#fff8f0',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: currentLine.text === '💛' ? '42px' : 'clamp(22px, 2vw, 28px)',
            letterSpacing: '0.04em',
            textAlign: 'center',
            textShadow: '0 0 24px rgba(0,0,0,0.35)',
            width: 'min(88vw, 780px)',
          }}
        >
          {currentLine.text}
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffffff',
          opacity: whiteFade,
          transition: 'opacity 180ms linear',
        }}
      />

      <style>{`
        @keyframes confession-heart-float {
          0% { opacity: 0; transform: translate3d(0, 0, 0) scale(0.7); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(0, -180px, 0) scale(1.2); }
        }
      `}</style>
    </div>
  )
}
