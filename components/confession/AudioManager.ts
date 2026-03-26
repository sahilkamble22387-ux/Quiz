import { Howl } from 'howler'
import { AUDIO_FILES, SCENE_CONFIG } from '../../lib/sceneConfig'

type SceneAudioKey = keyof typeof AUDIO_FILES
type SceneTrackKey = Extract<SceneAudioKey, `scene${number}`>

const audioEls: Partial<Record<SceneTrackKey, HTMLAudioElement>> = {}
const fadeFrames = new Map<string, number>()
let audioUnlocked = false

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function cancelFade(key: string) {
  const frame = fadeFrames.get(key)
  if (frame !== undefined) {
    window.cancelAnimationFrame(frame)
    fadeFrames.delete(key)
  }
}

function fadeAudio(key: string, audio: HTMLAudioElement, from: number, to: number, duration: number, onDone?: () => void) {
  cancelFade(key)

  const start = performance.now()
  const tick = (now: number) => {
    const progress = clamp((now - start) / duration, 0, 1)
    audio.volume = from + (to - from) * progress
    if (progress < 1) {
      const frame = window.requestAnimationFrame(tick)
      fadeFrames.set(key, frame)
      return
    }
    fadeFrames.delete(key)
    onDone?.()
  }

  const frame = window.requestAnimationFrame(tick)
  fadeFrames.set(key, frame)
}

function getSceneKey(index: number): SceneTrackKey | null {
  const scene = SCENE_CONFIG[index]
  if (!scene) return null
  return scene.audio.key
}

function createAudio(src: string) {
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.loop = false
  audio.volume = 0
  audio.playsInline = true
  audio.crossOrigin = 'anonymous'
  return audio
}

function silenceAudio(audio: HTMLAudioElement) {
  audio.pause()
  audio.currentTime = 0
  audio.volume = 0
}

export function unlockAudio() {
  audioUnlocked = true
}

export function loadScene(sceneKey: string, src: string) {
  const key = sceneKey as SceneTrackKey
  if (audioEls[key]) return
  audioEls[key] = createAudio(src)
}

export function loadAllScenes() {
  loadScene('scene1', AUDIO_FILES.scene1)
  loadScene('scene2', AUDIO_FILES.scene2)
  loadScene('scene3', AUDIO_FILES.scene3)
  loadScene('scene4', AUDIO_FILES.scene4)
  loadScene('scene5', AUDIO_FILES.scene5)
  loadScene('scene6', AUDIO_FILES.scene6)
}

function stopOtherScenes(exceptKeys: SceneTrackKey[] = []) {
  Object.entries(audioEls).forEach(([key, audio]) => {
    if (!audio || exceptKeys.includes(key as SceneTrackKey)) return
    cancelFade(key)
    silenceAudio(audio)
  })
}

export function playScene(sceneKey: string, startAt = 0, targetVolume = 0.75) {
  const key = sceneKey as SceneTrackKey
  const audio = audioEls[key]
  if (!audio) return

  stopOtherScenes([key])
  cancelFade(key)
  audio.currentTime = startAt
  audio.volume = 0

  void audio.play().then(() => {
    fadeAudio(key, audio, 0, targetVolume, 1500)
  }).catch(() => {})
}

export function crossfadeTo(fromKey: string, toKey: string, toStartAt = 0, toVolume = 0.75) {
  const from = audioEls[fromKey as SceneTrackKey]
  const to = audioEls[toKey as SceneTrackKey]
  const keepKeys = [fromKey, toKey].filter(Boolean) as SceneTrackKey[]

  stopOtherScenes(keepKeys)

  if (from && fromKey !== toKey) {
    fadeAudio(fromKey, from, from.volume, 0, 1200, () => {
      silenceAudio(from)
    })
  }

  if (to) {
    cancelFade(toKey)
    to.currentTime = toStartAt
    to.volume = 0
    void to.play().then(() => {
      fadeAudio(toKey, to, 0, toVolume, 1500)
    }).catch(() => {})
  }
}

export function playSFX(src: string, volume = 1) {
  const sfx = new Howl({ src: [src], volume, html5: true })
  sfx.play()
  return sfx
}

export function stopAll() {
  Object.entries(audioEls).forEach(([key, audio]) => {
    if (!audio) return
    fadeAudio(key, audio, audio.volume, 0, 800, () => {
      audio.pause()
      audio.currentTime = 0
    })
  })
}

export class AudioManager {
  private activeSceneKey: SceneTrackKey | null = null

  preloadAll() {
    loadAllScenes()
  }

  unlock() {
    unlockAudio()
  }

  playScene(index: number) {
    const scene = SCENE_CONFIG[index]
    const key = getSceneKey(index)
    if (!scene || !key) return

    loadScene(key, AUDIO_FILES[key])
    if (this.activeSceneKey === key && this.isActivePlaying()) {
      stopOtherScenes([key])
      return
    }

    playScene(key, scene.audio.startAt, scene.audio.volume)
    this.activeSceneKey = key
  }

  ensureScene(index: number) {
    const scene = SCENE_CONFIG[index]
    const key = getSceneKey(index)
    if (!scene || !key) return

    loadScene(key, AUDIO_FILES[key])
    if (this.activeSceneKey === key && this.isActivePlaying()) {
      stopOtherScenes([key])
      return
    }

    stopOtherScenes()
    playScene(key, scene.audio.startAt, scene.audio.volume)
    this.activeSceneKey = key
  }

  playCustomScene(key: SceneTrackKey, startAt: number, volume = 0.55) {
    loadScene(key, AUDIO_FILES[key])
    playScene(key, startAt, volume)
    this.activeSceneKey = key
  }

  crossfadeTo(index: number) {
    const scene = SCENE_CONFIG[index]
    const key = getSceneKey(index)
    if (!scene || !key) return

    loadScene(key, AUDIO_FILES[key])
    crossfadeTo(this.activeSceneKey ?? '', key, scene.audio.startAt, scene.audio.volume)
    this.activeSceneKey = key
  }

  stopAll() {
    stopAll()
    this.activeSceneKey = null
  }

  playSFX(name: 'yesExplosion' | 'heartbeat' | 'whoosh') {
    return playSFX(AUDIO_FILES[name], 1)
  }

  fadeOutActive(duration = 1500) {
    if (!this.activeSceneKey) return
    const audio = audioEls[this.activeSceneKey]
    if (!audio) return
    stopOtherScenes([this.activeSceneKey])
    fadeAudio(this.activeSceneKey, audio, audio.volume, 0, duration, () => {
      silenceAudio(audio)
    })
  }

  fadeActiveVolume(to: number, duration = 1200) {
    if (!this.activeSceneKey) return
    const audio = audioEls[this.activeSceneKey]
    if (!audio) return
    stopOtherScenes([this.activeSceneKey])
    fadeAudio(this.activeSceneKey, audio, audio.volume, clamp(to, 0, 1), duration)
  }

  setRate(name: SceneAudioKey, rate: number) {
    const audio = audioEls[name as SceneTrackKey]
    if (audio) {
      audio.playbackRate = rate
    }
  }

  isActivePlaying() {
    if (!this.activeSceneKey) return false
    const audio = audioEls[this.activeSceneKey]
    return Boolean(audio && !audio.paused && !audio.ended)
  }

  isScenePlaying(index: number) {
    const key = getSceneKey(index)
    if (!key || this.activeSceneKey !== key) return false
    return this.isActivePlaying()
  }

  debugState() {
    return {
      unlocked: audioUnlocked,
      activeSceneKey: this.activeSceneKey,
      tracks: Object.fromEntries(
        Object.entries(audioEls).map(([key, audio]) => [
          key,
          audio
            ? {
                paused: audio.paused,
                currentTime: audio.currentTime,
                volume: audio.volume,
                readyState: audio.readyState,
              }
            : null,
        ]),
      ),
    }
  }
}

export const confessionAudio = new AudioManager()
