// ✓ Director's Cut — 
import { useMemo } from 'react'
import type { NarrationLine } from '../../lib/sceneConfig'

type Props = {
  lines: NarrationLine[]
  sceneTime: number
}

function activeLine(lines: NarrationLine[], sceneTime: number) {
  return lines.find(
    (line) => sceneTime >= line.delay && sceneTime <= line.delay + line.duration,
  ) ?? null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function smoothstep(start: number, end: number, value: number) {
  if (start === end) return value >= end ? 1 : 0
  const x = clamp((value - start) / (end - start), 0, 1)
  return x * x * (3 - 2 * x)
}

export default function NarrationText({ lines, sceneTime }: Props) {
  const currentLine = useMemo(() => activeLine(lines, sceneTime), [lines, sceneTime])
  const currentOpacity = useMemo(() => {
    if (!currentLine) return 0
    const localTime = sceneTime - currentLine.delay
    const fadeIn = smoothstep(0, 0.7, localTime)
    const fadeOutStart = Math.max(currentLine.duration - 0.4, 0)
    const fadeOut = 1 - smoothstep(fadeOutStart, currentLine.duration, localTime)
    return Math.min(fadeIn, fadeOut)
  }, [currentLine, sceneTime])

  const specialStyle = useMemo(() => {
    if (!currentLine) return null
    if (currentLine.text === 'Radhika.') {
      return {
        fontSize: 'clamp(32px, 3vw, 38px)',
        letterSpacing: '0.2em',
        color: '#FFF8F2',
      }
    }
    if (currentLine.text.includes("tired of being quiet")) {
      return {
        fontSize: 'clamp(26px, 2.6vw, 32px)',
        color: '#FFD6E0',
      }
    }
    if (currentLine.text === 'Because I already know what I feel.') {
      return {
        fontSize: 'clamp(24px, 2.4vw, 30px)',
        color: '#FFF8F2',
      }
    }
    return null
  }, [currentLine])

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '22%',
        transform: 'translateX(-50%)',
        width: 'min(90vw, 980px)',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <div
        key={currentLine?.text ?? 'empty'}
        style={{
          opacity: currentOpacity,
          transform: `translateY(${(1 - currentOpacity) * 10}px)`,
          color: '#FFF8F2',
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(20px, 2vw, 28px)',
          letterSpacing: '0.08em',
          lineHeight: 1.6,
          textAlign: 'center',
          textWrap: 'balance',
          textShadow: '0 0 25px rgba(255,180,180,0.5)',
          padding: '0 18px',
          ...specialStyle,
        }}
      >
        {currentLine?.text ?? ''}
      </div>
    </div>
  )
}
