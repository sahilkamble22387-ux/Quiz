// ✓ Director's Cut — 
export type Vector3Tuple = [number, number, number]

export type NarrationLine = {
  text: string
  delay: number
  duration: number
}

export type CameraKeyframe = {
  at: number
  position: Vector3Tuple
  target: Vector3Tuple
  duration?: number
  ease?: string
}

export type SceneAudioConfig = {
  key: 'scene1' | 'scene2' | 'scene3' | 'scene4' | 'scene5' | 'scene6'
  startAt: number
  volume: number
}

export type SceneDefinition = {
  id: 'portal' | 'firstSight' | 'assignment' | 'snapchat' | 'almostMeet' | 'confession'
  index: number
  label: string
  chapterLabel: string
  duration: number | null
  audio: SceneAudioConfig
  narration: NarrationLine[]
  camera: CameraKeyframe[]
}

export const CHAPTERS = [
  { id: 1, sceneId: 'firstSight', name: 'First Sight', color: '#AFA9EC' },
  { id: 2, sceneId: 'assignment', name: 'The Desk', color: '#9FE1CB' },
  { id: 3, sceneId: 'snapchat', name: 'The Bridge', color: '#FAC775' },
  { id: 4, sceneId: 'almostMeet', name: "New Year's Eve", color: '#F5C4B3' },
  { id: 5, sceneId: 'confession', name: 'Today', color: '#FF6B9D' },
] as const

export const SCENE_CONFIG: SceneDefinition[] = [
  {
    id: 'portal',
    index: 0,
    label: 'Heart Portal Entry',
    chapterLabel: 'ENTRY',
    duration: 18,
    audio: {
      key: 'scene1',
      startAt: 0,
      volume: 0.7,
    },
    narration: [
      { text: 'There are feelings you carry for years...', delay: 1.5, duration: 5 },
      { text: "that you've never found the words for.", delay: 7, duration: 6 },
      { text: 'Until now.', delay: 13.5, duration: 3 },
    ],
    camera: [
      { at: 0, position: [0, 0, -4], target: [0, 0, 0], duration: 0.8, ease: 'power2.out' },
      { at: 2, position: [0, 0, 8], target: [0, 0, 12], duration: 14, ease: 'power1.in' },
      { at: 16, position: [0, 0, 10.8], target: [0, 0, 15], duration: 1.5, ease: 'power2.out' },
    ],
  },
  {
    id: 'firstSight',
    index: 1,
    label: 'First Sight',
    chapterLabel: '11th Standard · 2022',
    duration: 65,
    audio: {
      key: 'scene2',
      startAt: 24,
      volume: 0.75,
    },
    narration: [
      { text: '2022.', delay: 2, duration: 3 },
      { text: 'I remember the light. Afternoon gold across the corridor floor.', delay: 6, duration: 6 },
      { text: 'And then you walked in.', delay: 14, duration: 4 },
      { text: "You were just going somewhere. You didn't know you'd just changed something.", delay: 19, duration: 7 },
      { text: 'I had something to say.', delay: 29, duration: 4 },
      { text: 'Then Aryan showed up — your face lit up the way it does.', delay: 34, duration: 6 },
      { text: 'And whatever I was about to say just... stayed inside.', delay: 42, duration: 6 },
      { text: "Some moments don't wait.", delay: 51, duration: 5 },
      { text: 'I learned that the hard way.', delay: 57, duration: 5 },
    ],
    camera: [
      { at: 0, position: [-1.2, 1.6, 4.5], target: [-1.2, 1, 0] },
      { at: 8, position: [-0.8, 1.5, 3.6], target: [-0.4, 1.2, 1.9], duration: 10, ease: 'power2.inOut' },
      { at: 18, position: [1.1, 1.5, 3.9], target: [0.5, 1.25, 1.8], duration: 10, ease: 'power2.inOut' },
      { at: 30, position: [1.2, 1.55, 2.7], target: [1.2, 1.35, 1.85], duration: 6, ease: 'power2.inOut' },
      { at: 40, position: [0, 2.2, 7], target: [0, 1.2, 1.7], duration: 6, ease: 'power1.inOut' },
      { at: 52, position: [0.3, 2.2, 7.4], target: [0, 1.2, 1.7], duration: 6, ease: 'power1.inOut' },
    ],
  },
  {
    id: 'assignment',
    index: 2,
    label: 'The Introduction + The Assignment',
    chapterLabel: 'The Introduction · Then The Assignment',
    duration: 75,
    audio: {
      key: 'scene3',
      startAt: 0,
      volume: 0.75,
    },
    narration: [
      { text: 'She came with Nilakshi that day.', delay: 2, duration: 4 },
      { text: 'Radhika introduced us.', delay: 7, duration: 3.5 },
      { text: 'I said two words. Maybe three.', delay: 11, duration: 4 },
      { text: "Something like 'hi' and probably 'thumhe'.", delay: 16, duration: 5 },
      { text: 'That was the whole conversation.', delay: 22, duration: 4 },
      { text: 'Then came the assignment day.', delay: 30, duration: 4 },
      { text: "You sat next to me. I don't think you planned it.", delay: 36, duration: 6 },
      { text: 'I tried to say something for eleven minutes.', delay: 44, duration: 5 },
      { text: 'The words kept dying somewhere between my chest and my mouth.', delay: 51, duration: 7 },
      { text: 'But your shoulder was six inches from mine for forty minutes.', delay: 60, duration: 7 },
      { text: 'That was enough.', delay: 68, duration: 4 },
    ],
    camera: [
      { at: 0, position: [0, 2.8, 7], target: [0, 1.35, 1.6] },
      { at: 10, position: [0, 2.2, 5.6], target: [0, 1.3, 1.7], duration: 10 },
      { at: 20, position: [0.8, 1.95, 4.8], target: [0.6, 1.3, 1.7], duration: 8 },
      { at: 32, position: [0, 2.8, 6.2], target: [0, 1, 0.2], duration: 4 },
      { at: 46, position: [-3.8, 1.8, 0.1], target: [0, 1.1, 0.2], duration: 5 },
      { at: 54, position: [0, 0.95, 1.8], target: [0, 0.55, 0.15], duration: 5 },
      { at: 60, position: [-0.9, 1.7, 1.05], target: [-0.25, 1.35, 0.15], duration: 4 },
      { at: 68, position: [0, 2.5, 5.4], target: [0, 1, 0.15], duration: 6 },
    ],
  },
  {
    id: 'snapchat',
    index: 3,
    label: 'The Snapchat Bridge',
    chapterLabel: '12th · Then College · Then Life',
    duration: 45,
    audio: {
      key: 'scene4',
      startAt: 50,
      volume: 0.75,
    },
    narration: [
      { text: 'Different colleges.', delay: 2, duration: 4 },
      { text: 'Same city — but somehow it felt further.', delay: 7, duration: 6 },
      { text: 'Your snaps were the best part of some of my days.', delay: 16, duration: 7 },
      { text: 'You put everything on timer though.', delay: 22, duration: 5 },
      { text: 'Three seconds and gone.', delay: 28, duration: 4 },
      { text: 'I still waited for every single one.', delay: 36, duration: 5 },
    ],
    camera: [
      { at: 0, position: [0, 1.35, 8.4], target: [0, 0.22, 0], duration: 8, ease: 'power1.inOut' },
      { at: 14, position: [0, 1.15, 6.2], target: [0, 0.28, 0], duration: 4, ease: 'power2.inOut' },
      { at: 21, position: [3.6, 1.3, 4.7], target: [0, 0.24, 0], duration: 10, ease: 'power1.inOut' },
      { at: 34, position: [-3.2, 1.28, 4.9], target: [0, 0.26, 0], duration: 8, ease: 'power1.inOut' },
    ],
  },
  {
    id: 'almostMeet',
    index: 4,
    label: '31 December 2025',
    chapterLabel: '31 December, 2025 · 11:57 PM',
    duration: 50,
    audio: {
      key: 'scene5',
      startAt: 0,
      volume: 0.75,
    },
    narration: [
      { text: '31st December, 2025.', delay: 3, duration: 4 },
      { text: "New Year's Eve.", delay: 8, duration: 3 },
      { text: 'You were on the same road as me.', delay: 12, duration: 5 },
      { text: "I didn't know until after.", delay: 18, duration: 5 },
      { text: 'We were that close.', delay: 25, duration: 4 },
      { text: "That's the thing about timing —", delay: 31, duration: 4 },
      { text: "it doesn't wait for you to be ready.", delay: 35.5, duration: 6 },
      { text: "So I'm done waiting.", delay: 44, duration: 5 },
    ],
    camera: [
      { at: 0, position: [0, 4.4, 14.5], target: [0, 1.05, 0] },
      { at: 0, position: [0, 2.7, 10.5], target: [0, 1.08, 0], duration: 28, ease: 'power1.inOut' },
      { at: 28, position: [0, 1.95, 5.4], target: [0, 1.08, 0], duration: 8, ease: 'power2.inOut' },
      { at: 42, position: [0, 2.8, 9.2], target: [0, 1.02, 0], duration: 2.6, ease: 'power2.out' },
    ],
  },
  {
    id: 'confession',
    index: 5,
    label: 'The Confession',
    chapterLabel: 'Today',
    duration: null,
    audio: {
      key: 'scene6',
      startAt: 0,
      volume: 0.65,
    },
    narration: [
      { text: 'Radhika.', delay: 8, duration: 4 },
      { text: "It's Sahil.", delay: 13, duration: 3.5 },
      { text: "I don't know how to start this, so I'll just say the true thing.", delay: 18, duration: 5.8 },
      { text: "I've liked you since the first time I saw you walk into that corridor.", delay: 25, duration: 7.4 },
      { text: 'Not the idea of you. You — the way you carry yourself, the way you laugh, the way you take your dreams seriously.', delay: 33.5, duration: 8.8 },
      { text: 'I noticed the day you sat next to me. I counted the minutes.', delay: 43, duration: 6.6 },
      { text: 'You sent every snap on timer.', delay: 52, duration: 4.3 },
      { text: "I'd stare at it for the full three seconds like it would help.", delay: 57, duration: 5.8 },
      { text: 'It never did.', delay: 64, duration: 3.2 },
      { text: "I'm not saying this to make you feel something you don't.", delay: 68, duration: 4.8 },
      { text: "I've been quiet about it for four years.", delay: 73.6, duration: 3.7 },
      { text: "And I'm tired of being quiet.", delay: 78, duration: 5 },
      { text: "You're in the middle of your CA journey. I know that matters more than anything right now.", delay: 90, duration: 8 },
      { text: "I'm not asking you to feel what I feel.", delay: 99, duration: 4.5 },
      { text: 'I\'m just asking — do you want to find out if you could?', delay: 104, duration: 4.4 },
      { text: 'Because I already know what I feel.', delay: 109, duration: 6 },
    ],
    camera: [
      { at: 0, position: [0, 0.8, -5], target: [0, 1.8, 4], duration: 5, ease: 'power1.out' },
      { at: 4, position: [1.5, 1.3, 1.5], target: [0, 1.4, 0], duration: 3.5, ease: 'power2.inOut' },
      { at: 8, position: [0.3, 1.55, -2.8], target: [0, 1.4, -8], duration: 2.5, ease: 'power3.inOut' },
      { at: 13, position: [0, 1.6, 2.2], target: [0, 1.6, 0], duration: 1.8, ease: 'power3.inOut' },
      { at: 17, position: [0, 5.5, 5.5], target: [0, 1, 0], duration: 4, ease: 'power2.inOut' },
      { at: 25, position: [0, 1.42, 2.75], target: [0, 1.5, 0.2], duration: 3.5, ease: 'power2.inOut' },
      { at: 43, position: [0, 1.54, 3.05], target: [0, 1.46, 0.24], duration: 4.2, ease: 'power2.inOut' },
      { at: 78, position: [0.2, 1.56, 3.15], target: [0, 1.42, 0.28], duration: 5, ease: 'power2.inOut' },
      { at: 92, position: [0, 1.64, 3.5], target: [0, 1.36, 0.18], duration: 6, ease: 'power2.inOut' },
      { at: 109, position: [0, 1.6, 3.25], target: [0, 1.34, 0.12], duration: 2.6, ease: 'power2.inOut' },
    ],
  },
]

export const AUDIO_FILES = {
  scene1: '/audio/scene1.mp3',
  scene2: '/audio/scene2.mp3',
  scene3: '/audio/scene3.mp3',
  scene4: '/audio/scene4.mp3',
  scene5: '/audio/scene5.mp3',
  scene6: '/audio/scene6.mp3',
  yesExplosion: '/audio/yes_explosion.mp3',
  heartbeat: '/audio/heartbeat.mp3',
  whoosh: '/audio/whoosh.mp3',
} as const

export const MODEL_FILES = {
  sahil: '/models/sahil.glb',
  radhika: '/models/radhika.glb',
  aryan: '/models/aryan.glb',
  nilakshi: '/models/nilakshi.glb',
} as const

export const LOADING_MIN_MS = 1500

export const YES_SEQUENCE_NARRATION: NarrationLine[] = [
  { text: '💛', delay: 0.4, duration: 1.2 },
  { text: "Sahil doesn't know that you said yes.", delay: 1.8, duration: 3.5 },
  { text: 'Snap this and send it to him.', delay: 5.8, duration: 3.2 },
  { text: "He's been waiting for 5 years. 🥺", delay: 8.8, duration: 4.2 },
  { text: "Now let's show you what comes next.", delay: 13.2, duration: 3 },
]

export const TOGETHER_NARRATION: NarrationLine[] = [
  { text: 'This is just the beginning.', delay: 57, duration: 4 },
]
