import { Howl } from 'howler'
import { createContext, createElement, useContext, useMemo, useRef, useState } from 'react'

const PRIMARY_TRACK =
  'https://cdn.pixabay.com/audio/2023/10/09/audio_9488bfeb70.mp3'
const FALLBACK_TRACK =
  'https://cdn.pixabay.com/audio/2022/10/30/audio_947f8b2be8.mp3'

const MusicContext = createContext(null)

function buildTrack(src, { onLoadError }) {
  return new Howl({
    src: [src],
    html5: true,
    loop: true,
    volume: 0,
    preload: true,
    onloaderror: (_id, error) => {
      onLoadError?.(error)
    },
  })
}

export function MusicProvider({ children }) {
  const musicRef = useRef(null)
  const trackIdRef = useRef(null)
  const usingFallbackRef = useRef(false)
  const shouldAutoStartRef = useRef(false)
  const audioContextRef = useRef(null)
  const [started, setStarted] = useState(false)

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null
    if (audioContextRef.current) return audioContextRef.current
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return null
    audioContextRef.current = new AudioContextCtor()
    return audioContextRef.current
  }

  const ensureTrack = () => {
    if (musicRef.current) return musicRef.current

    const handleFallback = () => {
      if (usingFallbackRef.current) return
      usingFallbackRef.current = true
      musicRef.current?.unload()
      musicRef.current = buildTrack(FALLBACK_TRACK, {})
      if (shouldAutoStartRef.current) {
        const id = musicRef.current.play()
        trackIdRef.current = id
        musicRef.current.fade(0, 0.5, 3000, id)
      }
    }

    musicRef.current = buildTrack(PRIMARY_TRACK, {
      onLoadError: handleFallback,
    })

    return musicRef.current
  }

  const setMusicVolume = (target, duration = 1000) => {
    const track = ensureTrack()
    const id = trackIdRef.current
    const currentVolume = track.volume(id)
    track.fade(currentVolume, target, duration, id)
  }

  const setMusicRate = (rate) => {
    const track = ensureTrack()
    const id = trackIdRef.current
    if (id != null) {
      track.rate(rate, id)
    }
  }

  const triggerTone = (freq, duration, type = 'sine', delay = 0) => {
    const ctx = getAudioContext()
    if (!ctx) return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    const startAt = ctx.currentTime + delay
    oscillator.frequency.value = freq
    oscillator.type = type
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(0.3, startAt + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
    oscillator.start(startAt)
    oscillator.stop(startAt + duration)
  }

  const playQuizHover = () => triggerTone(523, 0.1)
  const playQuizClick = () => triggerTone(659, 0.15)
  const playNotificationSound = () => {
    if (typeof window === 'undefined') return
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return
    const ctx = new AudioContextCtor()

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.value = 1046.5
    gain1.gain.setValueAtTime(0, ctx.currentTime)
    gain1.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.2)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = 1318.5
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08)
    gain2.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.09)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.08)
    osc2.stop(ctx.currentTime + 0.3)

    window.navigator.vibrate?.([15, 30, 10])
  }
  const playHeartDoorSweep = () => {
    ;[261, 329, 392, 523].forEach((freq, index) => {
      triggerTone(freq, 0.18, 'sine', index * 0.1)
    })
  }
  const playYesChord = () => {
    ;[523, 659, 784].forEach((freq) => triggerTone(freq, 0.2))
  }
  const playNoEscape = () => triggerTone(200, 0.05, 'sawtooth')

  const startExperience = async () => {
    shouldAutoStartRef.current = true
    setStarted(true)
    const ctx = getAudioContext()
    if (ctx?.state === 'suspended') {
      await ctx.resume()
    }
    const track = ensureTrack()
    if (track.playing(trackIdRef.current)) return
    const id = track.play()
    trackIdRef.current = id
    track.rate(1, id)
    track.fade(0, 0.5, 3000, id)
  }

  const value = useMemo(
    () => ({
      started,
      startExperience,
      setMusicVolume,
      setMusicRate,
      playQuizHover,
      playQuizClick,
      playNotificationSound,
      playHeartDoorSweep,
      playYesChord,
      playNoEscape,
      setDramaticVolume: () => setMusicVolume(0.15, 1000),
      restoreMusic: () => setMusicVolume(0.5, 1000),
      swellCelebration: () => {
        setMusicVolume(0.8, 1200)
        setMusicRate(1.1)
      },
      normalizeCelebrationRate: () => {
        setMusicRate(1)
      },
    }),
    [started],
  )

  return createElement(MusicContext.Provider, { value }, children)
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider')
  }
  return context
}
