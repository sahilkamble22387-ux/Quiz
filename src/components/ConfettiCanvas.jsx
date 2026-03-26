import { useEffect, useRef } from 'react'

const CONFETTI_COLORS = ['#e8678a', '#f0a0b8', '#f5c842', '#ffffff', '#c02060']

export default function ConfettiCanvas({ active, origin }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setSize()
    window.addEventListener('resize', setSize)

    const pieces = Array.from({ length: 300 }, () => ({
      x: origin?.x ?? window.innerWidth / 2,
      y: origin?.y ?? window.innerHeight / 2,
      w: 6,
      h: 12,
      angle: Math.random() * Math.PI * 2,
      speed: 8 + Math.random() * 12,
      gravity: 0.22 + Math.random() * 0.18,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      alpha: 1,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }))

    const start = performance.now()
    let rafId = 0

    const render = (now) => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach((piece) => {
        piece.x += Math.cos(piece.angle) * piece.speed
        piece.y += Math.sin(piece.angle) * piece.speed + piece.gravity * 2
        piece.speed *= 0.985
        piece.rotation += piece.rotationSpeed
        piece.alpha = Math.max(0, piece.alpha - 0.004)

        context.save()
        context.translate(piece.x, piece.y)
        context.rotate(piece.rotation)
        context.globalAlpha = piece.alpha
        context.fillStyle = piece.color
        context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h)
        context.restore()
      })

      if (now - start < 5000) {
        rafId = window.requestAnimationFrame(render)
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    rafId = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', setSize)
      window.cancelAnimationFrame(rafId)
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [active, origin])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[90]" />
}
