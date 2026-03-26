# Confession System Skill

Use this document when you need to understand, maintain, or extend the live 3D confession flow in this project.

## Live App Path

The active runtime path is:

`src/main.jsx` -> `src/App.jsx` -> `src/screens/Notification.jsx` -> `src/screens/HeartDoor.jsx` -> `components/confession/ConfessionExperience.tsx`

That means the live 3D experience is owned by the `components/confession` folder and the timing/data layer in `lib/sceneConfig.ts`.

## Core Ownership

### Routing and entry

- `src/main.jsx`
  - React entrypoint.
  - Mounts the router.
- `src/App.jsx`
  - Defines app routes.
  - `/heartdoor` is the confession route.
- `src/screens/Notification.jsx`
  - User click path that unlocks audio and sends the user into the confession route.
- `src/screens/HeartDoor.jsx`
  - Thin wrapper that mounts `ConfessionExperience`.

### Confession controller

- `components/confession/ConfessionExperience.tsx`
  - Root state machine for the full cinematic flow.
  - Controls active scene index, narration time, accepted/YES state, epilogue stage, replay.
  - Picks camera keyframes from `sceneConfig`.
  - Mounts the active 3D scene.
  - Mounts `NarrationText`, `ChapterOrbs`, `YesExplosion`.

### Timing and storytelling

- `lib/sceneConfig.ts`
  - Single source of truth for:
    - scene ids
    - scene durations
    - audio start offsets
    - narration timing
    - camera keyframes
    - chapter orb labels
  - If a scene feels wrong rhythmically, this is usually the first place to check.

### Character system

- `components/confession/Figure.tsx`
  - Low-poly procedural character actor.
  - Handles:
    - idle / walk / sit / shy / offer flower / receive flower / phone / celebrate states
    - head and torso overrides from scenes
    - flower prop, phone prop, blush, hair sway
  - If expressions or poses look wrong, this file is usually the fix point.

### Camera system

- `components/confession/CameraRig.tsx`
  - Smooth camera tweening layer.
  - Accepts active target position/look-at from `ConfessionExperience`.
  - Also exposes `flyTo()` for instant/special transitions.

### Audio system

- `components/confession/AudioManager.ts`
  - Owns scene music playback, preload, crossfades, volume fades, and SFX.
  - Confession music continuity is handled here.

### Scene components

- `components/confession/ScenePortal.tsx`
  - Opening heart portal.
- `components/confession/SceneFirstSight.tsx`
  - Corridor memory.
- `components/confession/SceneAssignment.tsx`
  - Introduction + assignment memory.
- `components/confession/SceneSnapchat.tsx`
  - Snap-thread connection scene.
- `components/confession/SceneAlmostMeet.tsx`
  - New Year’s almost-meet.
- `components/confession/SceneConfession.tsx`
  - Main proposal/confession chamber.
- `components/confession/SceneTogether.tsx`
  - Imagined future montage after YES.

### Shared overlays/effects

- `components/confession/NarrationText.tsx`
  - Lower-third style line-by-line caption system.
- `components/confession/ChapterOrbs.tsx`
  - Right-side memory navigation.
- `components/confession/YesExplosion.tsx`
  - Post-YES overlay and transition beat.
- `components/confession/ParticleHeart.tsx`
  - Shared heart particle effect.

## Scene Intent

### First Sight

Purpose:
- Quiet recognition.
- Memory of the first emotional shift.

Implementation:
- Warm corridor scene.
- Camera is observational, not flashy.
- Narration explains what Sahil felt rather than over-staging the scene.

### Assignment

Purpose:
- Proximity as emotional escalation.

Implementation:
- Split into introduction beat and assignment beat.
- Uses seated figure states and warm classroom lighting.

### Snapchat

Purpose:
- The connection thread stayed alive through fleeting snaps.

Implementation:
- Two floating islands.
- Message-thread bubbles moving between characters.
- Characters hold phones and stay subtle instead of over-performing.

### Almost Meet

Purpose:
- Timing as physical distance.

Implementation:
- Long road, snowfall, barrier, slow push-in camera.

### Confession

Purpose:
- Stop remembering. Start speaking.

Implementation:
- Sahil moves from speaking toward Radhika’s shadow to finally sharing space with her.
- Accept flow controls camera, body orientation, flower handoff, then transition to epilogue.

### Together

Purpose:
- Not history. Possibility.

Implementation:
- 4 imagined future fragments:
  - chai
  - walk
  - study night
  - stillness together

## How Changes Flow

When changing a scene, check in this order:

1. `lib/sceneConfig.ts`
   - timing
   - camera keyframes
   - narration
2. the scene file itself
   - world layout
   - lights
   - scene-specific movement
3. `Figure.tsx`
   - if pose or body language is wrong
4. `ConfessionExperience.tsx`
   - if state transitions, accepted flow, replay, chapter jumps, or global sequencing are wrong
5. `AudioManager.ts`
   - if music timing or crossfades are wrong

## Debug Checklist

### If a scene looks black

- Check scene lights first.
- Check camera target in `sceneConfig.ts`.
- Check if scene state/time is resetting correctly in `ConfessionExperience.tsx`.

### If a character pose looks broken

- Check body rotation in scene component.
- Check animation branch in `Figure.tsx`.
- Check head/arm override props from the scene.

### If chapter orb jump feels wrong

- Check `handleJump()` in `ConfessionExperience.tsx`.
- Check `CameraRig` `flyTo()` path.

### If narration feels off

- Check `delay` and `duration` in `sceneConfig.ts`.

## Current Architectural Rule

The `components/confession` + `lib/sceneConfig.ts` path is the canonical system.

Do not rebuild features into old prototype folders.
Extend the live route only.
