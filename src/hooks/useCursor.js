import { useEffect } from 'react'

export default function useCursor() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(pointer: coarse)').matches) return undefined

    const dot = document.getElementById('cursor-dot')
    const ring = document.getElementById('cursor-ring')
    if (!dot || !ring) return undefined

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let ringSize = 36
    let targetRingSize = 36
    let rafId = 0
    let storyHover = false

    const setRingState = (size, opacity = 0.5, background = 'transparent') => {
      targetRingSize = size
      ring.style.opacity = `${opacity}`
      ring.style.background = background
    }

    const updateTarget = (eventTarget) => {
      const storyTarget = eventTarget?.closest?.('[data-cursor="story"]')
      const interactiveTarget = eventTarget?.closest?.('[data-cursor="interactive"]')

      if (storyTarget) {
        storyHover = true
        dot.style.transform = 'translate(-50%, -50%) scale(1.25)'
        dot.style.background = 'var(--blush)'
        setRingState(60, 0.8, 'rgba(232,103,138,0.05)')
        return
      }

      storyHover = false
      if (interactiveTarget) {
        dot.style.transform = 'translate(-50%, -50%) scale(2)'
        dot.style.background = 'var(--rose)'
        setRingState(20, 0.8)
        return
      }

      dot.style.transform = 'translate(-50%, -50%) scale(1)'
      dot.style.background = 'var(--rose)'
      setRingState(36, 0.5)
    }

    const onMove = (event) => {
      mouseX = event.clientX
      mouseY = event.clientY
      dot.style.left = `${mouseX}px`
      dot.style.top = `${mouseY}px`
      updateTarget(event.target)
    }

    const onPointerDown = () => {
      dot.style.transform = storyHover
        ? 'translate(-50%, -50%) scale(1.1)'
        : 'translate(-50%, -50%) scale(1.7)'
      setRingState(Math.max(targetRingSize - 8, 18), 0.95, storyHover ? 'rgba(232,103,138,0.08)' : 'transparent')
    }

    const onPointerUp = () => {
      updateTarget(document.elementFromPoint(mouseX, mouseY))
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.1
      ringY += (mouseY - ringY) * 0.1
      ringSize += (targetRingSize - ringSize) * 0.18
      ring.style.left = `${ringX}px`
      ring.style.top = `${ringY}px`
      ring.style.width = `${ringSize}px`
      ring.style.height = `${ringSize}px`
      rafId = window.requestAnimationFrame(animate)
    }

    document.body.style.cursor = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    rafId = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.cancelAnimationFrame(rafId)
      document.body.style.cursor = ''
    }
  }, [])
}
