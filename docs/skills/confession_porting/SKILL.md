# Confession Porting Skill

Use this when moving the live confession experience into another repo, another router setup, or another framework.

## What Must Move Together

At minimum, port these files as one unit:

- `components/confession/*`
- `lib/sceneConfig.ts`
- `public/audio/scene1.mp3`
- `public/audio/scene2.mp3`
- `public/audio/scene3.mp3`
- `public/audio/scene4.mp3`
- `public/audio/scene5.mp3`
- `public/audio/scene6.mp3`

If you want the exact current route behavior, also port:

- `src/screens/Notification.jsx`
- `src/screens/HeartDoor.jsx`

## Runtime Requirements

The current live implementation expects:

- React 18
- Vite or another client-side React runtime
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`
- `three`
- `gsap`
- `howler`
- `framer-motion`

## Current Mount Model

In this repo the experience is mounted here:

- route entry: `src/screens/HeartDoor.jsx`
- component: `components/confession/ConfessionExperience.tsx`

If porting to another app, you only need a screen/page component that renders:

```tsx
<ConfessionExperience />
```

## Audio Porting Notes

Audio is not passive. It depends on a real click path.

Current unlock path:

- `src/screens/Notification.jsx`
  - unlocks scene audio
  - preloads tracks
  - starts scene 1 before navigation

If you port the experience without this click path, music can fail because of browser autoplay policy.

If you change the entry flow, preserve:

1. user click
2. audio unlock
3. scene preload
4. start confession route

## Router Porting Notes

### Vite / React Router

Current working setup:

- router in `src/main.jsx`
- route in `src/App.jsx`

### Next.js

A previous Next-style scaffold existed, but the live app is not using Next right now.

If porting to Next:

1. create a client page
2. mount `ConfessionExperience`
3. keep the audio unlock path on a client-side click
4. serve the audio files from `/public/audio`

## Scene Porting Notes

### Data coupling

The scenes rely on `lib/sceneConfig.ts` for:

- camera
- duration
- narration
- audio offsets

Do not copy scene files without that config file.

### Character coupling

All scenes rely on `Figure.tsx`.

If you replace `Figure.tsx`, you must preserve:

- action names used by scenes
- override props:
  - `headXOverride`
  - `headYOverride`
  - `torsoTurnOverride`
  - arm overrides
  - `holdFlower`
  - `flowerSide`

## What Was Removed From This Repo

These were legacy or dead branches and are not part of the live confession route:

- old Next stub
- old `insideHeart` prototype
- old non-React scene-manager prototype

If you see older references online or in notes, prefer the live confession system only.

## Porting Checklist

1. Copy `components/confession/*`
2. Copy `lib/sceneConfig.ts`
3. Copy `/public/audio/*`
4. Install R3F / drei / gsap / howler / framer-motion dependencies
5. Mount `ConfessionExperience` in a client component
6. Recreate the click-based audio unlock path
7. Verify:
   - chapter jump
   - confession accept flow
   - yes explosion
   - together scene
   - replay

## If Something Breaks After Port

### No audio

- check unlock click path first
- then check public audio paths

### Camera wrong

- check `sceneConfig.ts`
- check `CameraRig.tsx`

### Character looks wrong

- check `Figure.tsx`
- check scene-level body rotation props

### Scene jump weird

- check `handleJump()` in `ConfessionExperience.tsx`

## Canonical Port Target

If you ever need to rebuild this cleanly in another repo, the safest approach is:

- port only the live confession module
- do not revive deleted prototype systems
- keep one entry, one controller, one scene config source of truth
