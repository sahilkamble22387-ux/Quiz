import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useLenis(enabled = true) {
  const lenisRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined

    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    })

    lenisRef.current = lenis
    const updateScroll = () => ScrollTrigger.update()
    const tick = (time) => lenis.raf(time * 1000)

    lenis.on('scroll', updateScroll)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', updateScroll)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  return lenisRef
}
