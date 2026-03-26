// ✓ Director's Cut — 
'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import { Howl } from 'howler'
import { AudioManager, confessionAudio } from './AudioManager'
import CameraRig from './CameraRig'
import type { CameraRigHandle } from './CameraRig'
import ChapterOrbs from './ChapterOrbs'
import EngagementAdmin from './EngagementAdmin'
import NarrationText from './NarrationText'
import ScenePortal from './ScenePortal'
import SceneFirstSight from './SceneFirstSight'
import SceneAssignment from './SceneAssignment'
import SceneSnapchat from './SceneSnapchat'
import SceneAlmostMeet from './SceneAlmostMeet'
import SceneConfession from './SceneConfession'
import SceneTogether from './SceneTogether'
import YesExplosion from './YesExplosion'
import { CHAPTERS, LOADING_MIN_MS, SCENE_CONFIG, TOGETHER_NARRATION, type SceneDefinition } from '../../lib/sceneConfig'
import { startTrackingSession, trackButtonClick, trackSceneView } from '../../lib/engagementTracker'

type EpilogueStage = 'none' | 'yesExplosion' | 'together'

type DisplayScene = {
  id: string
  index: number
  label: string
  chapterLabel: string
  narration: { text: string; delay: number; duration: number }[]
  camera: SceneDefinition['camera']
  duration: number | null
}

const TOGETHER_SCENE: DisplayScene = {
  id: 'together',
  index: 6,
  label: 'Together',
  chapterLabel: 'What comes next',
  duration: 60,
  narration: TOGETHER_NARRATION,
  camera: [
    { at: 0, position: [0, 2.3, 6.8], target: [0, 1.1, 0], duration: 2 },
    { at: 14, position: [2.4, 1.7, 4.8], target: [0, 1.2, 1.8], duration: 4 },
    { at: 28, position: [0, 2.1, 5.8], target: [0, 1.15, 0.2], duration: 4 },
    { at: 42, position: [2.4, 1.7, 3.8], target: [0, 1.3, 0], duration: 5 },
    { at: 56, position: [0, 1.8, 2.8], target: [0, 1.3, 0], duration: 3 },
  ],
}

const SCENE_STATE_FPS = 48
const SCENE_STATE_STEP = 1 / SCENE_STATE_FPS

function getSceneById(id: string) {
  return SCENE_CONFIG.find((scene) => scene.id === id) ?? SCENE_CONFIG[0]
}

function sceneByIndex(index: number) {
  return SCENE_CONFIG[index] ?? SCENE_CONFIG[0]
}

function activeCamera(scene: DisplayScene, sceneTime: number) {
  return [...scene.camera].reverse().find((keyframe) => sceneTime >= keyframe.at) ?? scene.camera[0]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function smoothstep(start: number, end: number, value: number) {
  if (start === end) return value >= end ? 1 : 0
  const x = clamp((value - start) / (end - start), 0, 1)
  return x * x * (3 - 2 * x)
}

function renderScene(sceneId: string, sceneTime: number, accepted: boolean, acceptedTime: number) {
  switch (sceneId) {
    case 'portal':
      return <ScenePortal sceneTime={sceneTime} />
    case 'firstSight':
      return <SceneFirstSight sceneTime={sceneTime} />
    case 'assignment':
      return <SceneAssignment sceneTime={sceneTime} />
    case 'snapchat':
      return <SceneSnapchat sceneTime={sceneTime} />
    case 'almostMeet':
      return <SceneAlmostMeet sceneTime={sceneTime} />
    case 'confession':
      return <SceneConfession sceneTime={sceneTime} accepted={accepted} acceptedTime={acceptedTime} />
    case 'together':
      return <SceneTogether sceneTime={sceneTime} />
    default:
      return null
  }
}

function LoadingHeart() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#0A0008',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        zIndex: 100,
      }}
    >
      <div className="confession-loading-heart" />
      <p
        style={{
          color: '#FFFAF0',
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(20px, 3vw, 28px)',
          margin: 0,
        }}
      >
        Loading a memory...
      </p>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          overflow: 'hidden',
        }}
      >
        <div className="confession-loading-bar" />
      </div>
      <style>{`
        .confession-loading-heart {
          width: 86px;
          height: 86px;
          background: #FF6B9D;
          position: relative;
          transform: rotate(-45deg);
          animation: confession-heart-pulse 1.1s ease-in-out infinite;
          border-radius: 16px;
          box-shadow: 0 0 28px rgba(255,107,157,0.4);
        }
        .confession-loading-heart::before,
        .confession-loading-heart::after {
          content: "";
          position: absolute;
          width: 86px;
          height: 86px;
          border-radius: 50%;
          background: inherit;
        }
        .confession-loading-heart::before { top: -43px; left: 0; }
        .confession-loading-heart::after { left: 43px; top: 0; }
        .confession-loading-bar {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #FF6B9D, #FFD28F);
          transform-origin: left center;
          animation: confession-loading-progress 1.5s linear forwards;
        }
        @keyframes confession-heart-pulse {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.08); }
        }
        @keyframes confession-loading-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}

export default function ConfessionExperience() {
  const audioRef = useRef<AudioManager>(confessionAudio)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [sceneTime, setSceneTime] = useState(0)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [needsAudioTap, setNeedsAudioTap] = useState(false)
  const [showRotateHint, setShowRotateHint] = useState(false)
  const [epilogueStage, setEpilogueStage] = useState<EpilogueStage>('none')
  const [epilogueTime, setEpilogueTime] = useState(0)
  const [acceptedTime, setAcceptedTime] = useState(0)
  const startRef = useRef<number>(performance.now())
  const epilogueStartRef = useRef<number>(0)
  const acceptedStartRef = useRef<number>(0)
  const lastSceneRenderRef = useRef<number>(0)
  const lastAcceptedRenderRef = useRef<number>(0)
  const lastEpilogueRenderRef = useRef<number>(0)
  const confessionVolumeRef = useRef<number | null>(null)
  const cameraRigRef = useRef<CameraRigHandle | null>(null)
  const rafRef = useRef<number>()
  const epilogueRafRef = useRef<number>()
  const acceptedRafRef = useRef<number>()
  const activeScene = sceneByIndex(sceneIndex)
  const displayScene = epilogueStage === 'together' ? TOGETHER_SCENE : activeScene
  const displayTime = epilogueStage === 'together' ? epilogueTime : sceneTime
  const acceptedCamera = accepted && epilogueStage === 'none' && activeScene.id === 'confession'
    ? acceptedTime < 1.4
      ? { position: [0, 1.7, 4.15] as [number, number, number], target: [0, 1.34, 0.16] as [number, number, number], duration: 1.0, ease: 'power2.out' }
      : acceptedTime < 3.8
        ? { position: [0, 1.66, 3.95] as [number, number, number], target: [0, 1.32, 0.15] as [number, number, number], duration: 1.7, ease: 'power2.inOut' }
        : acceptedTime < 5.8
          ? { position: [0, 1.7, 4.05] as [number, number, number], target: [0, 1.34, 0.14] as [number, number, number], duration: 1.4, ease: 'power2.inOut' }
          : { position: [0, 1.74, 4.2] as [number, number, number], target: [0, 1.36, 0.12] as [number, number, number], duration: 1.2, ease: 'power2.inOut' }
    : null

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), LOADING_MIN_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const updateRotateHint = () => {
      const isPhoneSized = window.innerWidth <= 900
      const isPortrait = window.innerHeight > window.innerWidth
      setShowRotateHint(isPhoneSized && isPortrait)
    }

    updateRotateHint()
    window.addEventListener('resize', updateRotateHint)
    window.addEventListener('orientationchange', updateRotateHint)

    return () => {
      window.removeEventListener('resize', updateRotateHint)
      window.removeEventListener('orientationchange', updateRotateHint)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    startTrackingSession()
  }, [loading])

  useEffect(() => {
    if (loading) return
    trackSceneView(displayScene.id, {
      chapterLabel: displayScene.chapterLabel,
      sceneIndex: displayScene.index,
      epilogueStage,
    })
  }, [displayScene.chapterLabel, displayScene.id, displayScene.index, epilogueStage, loading])

  useEffect(() => {
    if (loading || epilogueStage !== 'none') return
    if (!audioRef.current.isScenePlaying(sceneIndex)) {
      audioRef.current.ensureScene(sceneIndex)
    }
    startRef.current = performance.now()
    lastSceneRenderRef.current = 0
    setSceneTime(0)

    const timer = window.setTimeout(() => {
      if (!audioRef.current.isActivePlaying()) {
        setNeedsAudioTap(true)
      } else {
        setNeedsAudioTap(false)
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [loading, sceneIndex, epilogueStage])

  useEffect(() => {
    if (loading || epilogueStage !== 'none') return

    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000
      if (elapsed - lastSceneRenderRef.current >= SCENE_STATE_STEP) {
        lastSceneRenderRef.current = elapsed
        setSceneTime(elapsed)
      }

      if (activeScene.duration && elapsed >= activeScene.duration) {
        setSceneIndex((current) => Math.min(current + 1, SCENE_CONFIG.length - 1))
        return
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [activeScene.duration, epilogueStage, loading])

  useEffect(() => {
    if (!accepted || epilogueStage !== 'none') return

    acceptedStartRef.current = performance.now()
    lastAcceptedRenderRef.current = 0
    setAcceptedTime(0)

    const tick = () => {
      const elapsed = (performance.now() - acceptedStartRef.current) / 1000
      if (elapsed - lastAcceptedRenderRef.current >= SCENE_STATE_STEP) {
        lastAcceptedRenderRef.current = elapsed
        setAcceptedTime(elapsed)
      }
      acceptedRafRef.current = window.requestAnimationFrame(tick)
    }

    acceptedRafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (acceptedRafRef.current) window.cancelAnimationFrame(acceptedRafRef.current)
    }
  }, [accepted, epilogueStage])

  useEffect(() => {
    if (epilogueStage === 'none') return

    epilogueStartRef.current = performance.now()
    lastEpilogueRenderRef.current = 0
    setEpilogueTime(0)

    const tick = () => {
      const elapsed = (performance.now() - epilogueStartRef.current) / 1000
      if (elapsed - lastEpilogueRenderRef.current >= SCENE_STATE_STEP) {
        lastEpilogueRenderRef.current = elapsed
        setEpilogueTime(elapsed)
      }
      epilogueRafRef.current = window.requestAnimationFrame(tick)
    }

    epilogueRafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (epilogueRafRef.current) window.cancelAnimationFrame(epilogueRafRef.current)
    }
  }, [epilogueStage])

  useEffect(() => {
    if (accepted && epilogueStage === 'none' && acceptedTime >= 8) {
      const sound = new Howl({ src: ['/audio/yes_explosion.mp3'], volume: 1, html5: true })
      sound.play()
      setEpilogueStage('yesExplosion')
    }
  }, [accepted, acceptedTime, epilogueStage])

  useEffect(() => {
    if (epilogueStage === 'yesExplosion' && epilogueTime >= 14) {
      if (audioRef.current.isScenePlaying(5)) {
        audioRef.current.fadeActiveVolume(0.42, 1200)
      } else {
        audioRef.current.playCustomScene('scene6', 44, 0.42)
      }
      setEpilogueStage('together')
    }
  }, [epilogueStage, epilogueTime])

  useEffect(() => {
    if (loading || epilogueStage !== 'none' || activeScene.id !== 'confession' || accepted) return

    const targetVolume = sceneTime >= 115
      ? 0.55
      : sceneTime >= 109
        ? 0.72
        : sceneTime >= 100
          ? 0.85
          : sceneTime >= 80
            ? 0.78
            : 0.65

    if (confessionVolumeRef.current === null || Math.abs(confessionVolumeRef.current - targetVolume) > 0.001) {
      confessionVolumeRef.current = targetVolume
      audioRef.current.fadeActiveVolume(targetVolume, 900)
    }
  }, [accepted, activeScene.id, epilogueStage, loading, sceneTime])

  useEffect(
    () => () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      if (epilogueRafRef.current) window.cancelAnimationFrame(epilogueRafRef.current)
      if (acceptedRafRef.current) window.cancelAnimationFrame(acceptedRafRef.current)
      audioRef.current.stopAll()
    },
    [],
  )

  const camera = useMemo(
    () => acceptedCamera ?? activeCamera(displayScene, displayTime),
    [acceptedCamera, displayScene, displayTime],
  )
  const handleJump = (sceneId: string) => {
    const nextScene = getSceneById(sceneId)
    trackButtonClick('chapter_orb', {
      fromSceneId: activeScene.id,
      toSceneId: nextScene.id,
    })
    startRef.current = performance.now()
    lastSceneRenderRef.current = 0
    setSceneTime(0)
    setAccepted(false)
    setAcceptedTime(0)
    setEpilogueStage('none')
    setEpilogueTime(0)
    cameraRigRef.current?.flyTo(nextScene.camera[0].position, nextScene.camera[0].target, 0.01, 'none')
    audioRef.current.crossfadeTo(nextScene.index)
    setSceneIndex(nextScene.index)
  }

  const handleYes = () => {
    trackButtonClick('i_feel_the_same_way', {
      sceneId: activeScene.id,
      sceneTime: Number(sceneTime.toFixed(2)),
    })
    if (activeScene.id === 'confession') {
      confessionVolumeRef.current = 0.9
      audioRef.current.fadeActiveVolume(0.9, 900)
    }
    setAccepted(true)
  }

  const handleReplay = () => {
    trackButtonClick('replay_from_beginning', {
      sceneId: displayScene.id,
      epilogueStage,
    })
    setAccepted(false)
    setAcceptedTime(0)
    setEpilogueStage('none')
    setEpilogueTime(0)
    setSceneIndex(0)
    startRef.current = performance.now()
    lastSceneRenderRef.current = 0
    audioRef.current.crossfadeTo(0)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#1A0A14' }}>
      <style>{`
        @keyframes confessionButtonPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255,80,120,0.3), 0 0 40px rgba(255,80,120,0.1);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 35px rgba(255,80,120,0.5), 0 0 70px rgba(255,80,120,0.2);
            transform: scale(1.025);
          }
        }
      `}</style>

      {loading ? <LoadingHeart /> : null}

      {showRotateHint ? (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            top: 12,
            left: 0,
            right: 0,
            zIndex: 110,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 12px',
          }}
        >
          <div
            style={{
              width: 'min(100%, 340px)',
              borderRadius: 16,
              padding: '10px 14px',
              background: 'rgba(18, 6, 14, 0.84)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.32)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,248,242,0.54)',
              }}
            >
              Best View
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(18px, 4.6vw, 24px)',
                lineHeight: 1.15,
                color: '#FFF8F2',
                textWrap: 'balance',
              }}
            >
              Rotate your phone to view the heart better.
            </div>
          </div>
        </motion.div>
      ) : null}

      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: camera.position, fov: 38 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={null}>
          <CameraRig
            activePosition={camera.position}
            activeTarget={camera.target}
            duration={camera.duration ?? 1.5}
            ease={camera.ease ?? 'power2.inOut'}
            onReady={(handle) => {
              cameraRigRef.current = handle
            }}
          />
          {renderScene(displayScene.id, displayTime, accepted, acceptedTime)}
          <EffectComposer>
            <Bloom
              intensity={displayScene.id === 'confession' ? 0.75 : displayScene.id === 'portal' ? 0.5 : 0.4}
              luminanceThreshold={displayScene.id === 'confession' ? 0.38 : displayScene.id === 'portal' ? 0.5 : 0.6}
              luminanceSmoothing={displayScene.id === 'confession' ? 0.8 : 0.9}
            />
            <Vignette offset={displayScene.id === 'confession' ? 0.28 : 0.4} darkness={displayScene.id === 'confession' ? 0.72 : 0.5} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {!loading && epilogueStage !== 'yesExplosion' ? <NarrationText lines={displayScene.narration} sceneTime={displayTime} /> : null}

      {!loading && activeScene.id === 'confession' && epilogueStage === 'none' ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#FFFDF8',
            opacity: 1 - smoothstep(0.2, 2.2, sceneTime),
            pointerEvents: 'none',
            zIndex: 36,
          }}
        />
      ) : null}

      {!loading && displayScene.id !== 'portal' && displayScene.id !== 'confession' && epilogueStage !== 'yesExplosion' && displayTime <= 4.8 ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            zIndex: 55,
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 11,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: 'rgba(255,250,240,0.55)',
            }}
          >
            Memory {displayScene.index}
          </span>
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 3.4vw, 48px)',
              color: '#FFFAF0',
              textShadow: '0 0 24px rgba(0,0,0,0.25)',
            }}
          >
            {displayScene.label}
          </span>
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 'clamp(11px, 1vw, 13px)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,250,240,0.42)',
            }}
          >
            {displayScene.chapterLabel}
          </span>
        </motion.div>
      ) : null}

      {!loading && needsAudioTap && epilogueStage === 'none' ? (
        <motion.button
          type="button"
          onClick={() => {
            trackButtonClick('start_with_sound', {
              sceneId: activeScene.id,
            })
            audioRef.current.unlock()
            audioRef.current.preloadAll()
            audioRef.current.playScene(sceneIndex)
            setNeedsAudioTap(false)
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 999,
            background: 'rgba(26,10,20,0.68)',
            color: '#FFFAF0',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 20,
            padding: '12px 24px',
            zIndex: 70,
            cursor: 'pointer',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 0 24px rgba(255,107,157,0.18)',
          }}
        >
          Start with sound
        </motion.button>
      ) : null}

      {!loading && activeScene.id !== 'portal' && epilogueStage === 'none' && !accepted ? (
        <ChapterOrbs
          activeSceneId={activeScene.id}
          onJump={handleJump}
        />
      ) : null}

      {!loading && activeScene.id === 'confession' && sceneTime >= 115 && sceneTime < 117.5 && !accepted ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 38,
            background: `rgba(8,2,10,${clamp((sceneTime - 115) / 2.5, 0, 0.18)})`,
          }}
        />
      ) : null}

      {!loading && activeScene.id === 'confession' && sceneTime >= 117.5 && !accepted ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '10%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            width: 'min(92vw, 480px)',
          }}
        >
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 13,
              color: 'rgba(255,220,220,0.6)',
              letterSpacing: '0.05em',
              textAlign: 'center',
            }}
          >
            He&apos;s been waiting to ask you this for a long time.
          </span>
          <motion.button
            type="button"
            onClick={handleYes}
            whileHover={{
              scale: 1.04,
              y: -2,
              backgroundColor: 'rgba(255, 80, 120, 0.35)',
              borderColor: 'rgba(255, 200, 220, 0.8)',
              textShadow: '0 0 30px rgba(255, 120, 160, 0.9)',
            }}
            whileTap={{ scale: 0.99 }}
            style={{
              border: '1px solid rgba(255, 200, 200, 0.4)',
              borderRadius: 50,
              background: 'rgba(255, 80, 120, 0.18)',
              color: '#FFF8F2',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(22px, 2.6vw, 24px)',
              letterSpacing: '0.12em',
              padding: '16px 44px',
              cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              textShadow: '0 0 20px rgba(255, 100, 140, 0.6)',
              animation: 'confessionButtonPulse 2.5s ease-in-out infinite',
            }}
          >
            I feel the same way 💛
          </motion.button>
        </motion.div>
      ) : null}

      <YesExplosion active={epilogueStage === 'yesExplosion'} sceneTime={epilogueTime} />

      {epilogueStage === 'together' && epilogueTime > 57 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: `rgba(255,255,255,${Math.min((epilogueTime - 57) / 3, 0.92)})`,
            pointerEvents: 'none',
            zIndex: 82,
          }}
        />
      ) : null}

      {epilogueStage === 'together' && epilogueTime >= 58 ? (
        <motion.button
          type="button"
          onClick={handleReplay}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '10%',
            transform: 'translateX(-50%)',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.12)',
            color: '#5a2a30',
            borderRadius: 999,
            padding: '14px 22px',
            fontFamily: '"DM Sans", sans-serif',
            cursor: 'pointer',
            zIndex: 90,
          }}
        >
          Replay from the beginning
        </motion.button>
      ) : null}

      <EngagementAdmin />
    </div>
  )
}
