// ✓ Director's Cut — Skill read: frontend-design/SKILL.md (path unavailable in this environment)
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { GroupProps } from '@react-three/fiber'
import * as THREE from 'three'

const PALETTE = {
  sahil: {
    skin: '#e8aa78',
    skinDark: '#c88848',
    hair: '#1a0c00',
    hairShine: '#604018',
    shirt: '#f0f0f0',
    jeans: '#2e4a8a',
    shoes: '#f5f5f5',
    belt: '#5a3820',
    collar: '#dcdcdc',
  },
  radhika: {
    skin: '#f0c090',
    skinDark: '#d09060',
    hair: '#1a0c00',
    hairShine: '#604018',
    shirt: '#f0a8c0',
    jeans: '#303058',
    shoes: '#f0f0f0',
    belt: '#e8678a',
    collar: '#e8678a',
  },
  aryan: {
    skin: '#d89060',
    skinDark: '#b87040',
    hair: '#100800',
    hairShine: '#382000',
    shirt: '#88a8d8',
    jeans: '#283050',
    shoes: '#282828',
    belt: '#182030',
    collar: '#788ac8',
  },
  nilakshi: {
    skin: '#eec088',
    skinDark: '#cea868',
    hair: '#100800',
    hairShine: '#382000',
    shirt: '#c0a0e0',
    jeans: '#382840',
    shoes: '#383838',
    belt: '#281830',
    collar: '#b090d0',
  },
} as const

type Variant = keyof typeof PALETTE

type FigureProps = GroupProps & {
  variant?: Variant
  action?: string
  speed?: number
  blush?: boolean
  silhouette?: boolean
  benchOffsetY?: number
  phone?: boolean
  holdingPhone?: boolean
  headXOverride?: number
  headYOverride?: number
  torsoTurnOverride?: number
  leftArmXOverride?: number
  rightArmXOverride?: number
  leftArmZOverride?: number
  rightArmZOverride?: number
  holdFlower?: boolean
  flowerSide?: 'left' | 'right'
  ethereal?: boolean
  revealProgress?: number
  glowColor?: string
  glowIntensity?: number
  materialOpacity?: number
}

function blendColor(base: string, target: string, progress: number) {
  const mixed = new THREE.Color(target).lerp(new THREE.Color(base), progress)
  return `#${mixed.getHexString()}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function Eye({ x, big = false }: { x: number; big?: boolean }) {
  const scleraR = big ? 0.065 : 0.055
  const irisR = big ? 0.044 : 0.036
  const pupilR = big ? 0.026 : 0.02
  return (
    <group position={[x, 0.055, 0.245]}>
      <mesh><sphereGeometry args={[scleraR, 12, 12]} /><meshBasicMaterial color="#fdf8f0" /></mesh>
      <mesh position={[0, 0, 0.03]}><sphereGeometry args={[irisR, 12, 12]} /><meshBasicMaterial color="#3a1e00" /></mesh>
      <mesh position={[0, 0, 0.042]}><sphereGeometry args={[irisR * 0.7, 10, 10]} /><meshBasicMaterial color="#2a1200" /></mesh>
      <mesh position={[0, 0, 0.05]}><sphereGeometry args={[pupilR, 8, 8]} /><meshBasicMaterial color="#060200" /></mesh>
      <mesh position={[0.016, 0.018, 0.065]}><sphereGeometry args={[0.013, 6, 6]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[-0.012, -0.01, 0.063]}><sphereGeometry args={[0.007, 5, 5]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.6} /></mesh>
    </group>
  )
}

export default function Figure({
  variant = 'sahil',
  action = 'idle',
  speed = 1,
  blush = false,
  silhouette = false,
  benchOffsetY = 0,
  phone = false,
  holdingPhone = false,
  headXOverride,
  headYOverride,
  torsoTurnOverride,
  leftArmXOverride,
  rightArmXOverride,
  leftArmZOverride,
  rightArmZOverride,
  holdFlower = false,
  flowerSide = 'right',
  ethereal = false,
  revealProgress = 1,
  glowColor = '#FFD6E0',
  glowIntensity = 0.6,
  materialOpacity = 1,
  ...props
}: FigureProps) {
  const c = PALETTE[variant] ?? PALETTE.sahil
  const isFem = variant === 'radhika' || variant === 'nilakshi'
  const act = action.toLowerCase()
  const visibleProgress = ethereal ? clamp(revealProgress, 0, 1) : 1
  const detailVisible = !silhouette && (!ethereal || visibleProgress > 0.72)
  const mixedSkin = useMemo(() => silhouette ? '#ffcce0' : ethereal ? blendColor(c.skin, glowColor, visibleProgress) : c.skin, [c.skin, ethereal, glowColor, visibleProgress, silhouette])
  const mixedSkinDark = useMemo(() => ethereal ? blendColor(c.skinDark, glowColor, visibleProgress) : c.skinDark, [c.skinDark, ethereal, glowColor, visibleProgress])
  const mixedHair = useMemo(() => silhouette ? '#ffcce0' : ethereal ? blendColor(c.hair, glowColor, visibleProgress) : c.hair, [c.hair, ethereal, glowColor, visibleProgress, silhouette])
  const mixedShirt = useMemo(() => silhouette ? '#ffcce0' : ethereal ? blendColor(c.shirt, glowColor, visibleProgress) : c.shirt, [c.shirt, ethereal, glowColor, visibleProgress, silhouette])
  const mixedJeans = useMemo(() => silhouette ? '#ffcce0' : ethereal ? blendColor(c.jeans, glowColor, visibleProgress) : c.jeans, [c.jeans, ethereal, glowColor, visibleProgress, silhouette])
  const mixedShoes = useMemo(() => silhouette ? '#ffcce0' : ethereal ? blendColor(c.shoes, glowColor, visibleProgress) : c.shoes, [c.shoes, ethereal, glowColor, visibleProgress, silhouette])
  const mixedBelt = useMemo(() => silhouette ? '#ffcce0' : ethereal ? blendColor(c.belt, glowColor, visibleProgress) : c.belt, [c.belt, ethereal, glowColor, visibleProgress, silhouette])
  const mixedCollar = useMemo(() => silhouette ? '#ffcce0' : ethereal ? blendColor(c.collar, glowColor, visibleProgress) : c.collar, [c.collar, ethereal, glowColor, visibleProgress, silhouette])
  const mixedHairShine = useMemo(() => ethereal ? glowColor : c.hairShine, [c.hairShine, ethereal, glowColor])
  const effectiveOpacity = silhouette ? 1 : ethereal ? (0.7 + visibleProgress * 0.3) * materialOpacity : materialOpacity

  const outerGroup = useRef<THREE.Group>(null)
  const group = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const leftHip = useRef<THREE.Group>(null)
  const rightHip = useRef<THREE.Group>(null)
  const leftKnee = useRef<THREE.Group>(null)
  const rightKnee = useRef<THREE.Group>(null)
  const hairGroup = useRef<THREE.Group>(null)
  const blushL = useRef<THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>>(null)
  const blushR = useRef<THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>>(null)

  const skinMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: mixedSkin,
        roughness: ethereal ? 0.58 : silhouette ? 0.85 : 0.72,
        metalness: 0,
        emissive: ethereal ? glowColor : silhouette ? '#000000' : mixedSkin,
        emissiveIntensity: ethereal ? glowIntensity * (1 - visibleProgress) : silhouette ? 0 : 0.08,
        transparent: ethereal || materialOpacity < 1,
        opacity: effectiveOpacity,
        depthWrite: !ethereal,
      }),
    [effectiveOpacity, ethereal, glowColor, glowIntensity, materialOpacity, mixedSkin, silhouette, visibleProgress],
  )
  const hairMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: mixedHair,
        emissive: ethereal ? glowColor : '#000000',
        emissiveIntensity: ethereal ? glowIntensity * 0.75 * (1 - visibleProgress) : 0,
        transparent: ethereal || materialOpacity < 1,
        opacity: effectiveOpacity,
        depthWrite: !ethereal,
      }),
    [effectiveOpacity, ethereal, glowColor, glowIntensity, materialOpacity, mixedHair, visibleProgress],
  )
  const shirtMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: mixedShirt,
        emissive: ethereal ? glowColor : '#000000',
        emissiveIntensity: ethereal ? glowIntensity * 0.95 * (1 - visibleProgress) : 0,
        transparent: ethereal || materialOpacity < 1,
        opacity: effectiveOpacity,
        depthWrite: !ethereal,
      }),
    [effectiveOpacity, ethereal, glowColor, glowIntensity, materialOpacity, mixedShirt, visibleProgress],
  )
  const jeansMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: mixedJeans,
        emissive: ethereal ? glowColor : '#000000',
        emissiveIntensity: ethereal ? glowIntensity * 0.45 * (1 - visibleProgress) : 0,
        transparent: ethereal || materialOpacity < 1,
        opacity: effectiveOpacity,
        depthWrite: !ethereal,
      }),
    [effectiveOpacity, ethereal, glowColor, glowIntensity, materialOpacity, mixedJeans, visibleProgress],
  )
  const shoesMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: mixedShoes,
        emissive: ethereal ? glowColor : '#000000',
        emissiveIntensity: ethereal ? glowIntensity * 0.35 * (1 - visibleProgress) : 0,
        transparent: ethereal || materialOpacity < 1,
        opacity: effectiveOpacity,
        depthWrite: !ethereal,
      }),
    [effectiveOpacity, ethereal, glowColor, glowIntensity, materialOpacity, mixedShoes, visibleProgress],
  )
  const beltMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: mixedBelt,
        emissive: ethereal ? glowColor : '#000000',
        emissiveIntensity: ethereal ? glowIntensity * 0.35 * (1 - visibleProgress) : 0,
        transparent: ethereal || materialOpacity < 1,
        opacity: effectiveOpacity,
        depthWrite: !ethereal,
      }),
    [effectiveOpacity, ethereal, glowColor, glowIntensity, materialOpacity, mixedBelt, visibleProgress],
  )
  const collarMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: mixedCollar,
        emissive: ethereal ? glowColor : '#000000',
        emissiveIntensity: ethereal ? glowIntensity * 0.55 * (1 - visibleProgress) : 0,
        transparent: ethereal || materialOpacity < 1,
        opacity: effectiveOpacity,
        depthWrite: !ethereal,
      }),
    [effectiveOpacity, ethereal, glowColor, glowIntensity, materialOpacity, mixedCollar, visibleProgress],
  )
  const hairShine = useMemo(
    () => new THREE.MeshBasicMaterial({ color: mixedHairShine, transparent: true, opacity: ethereal ? 0.3 : 0.55, depthWrite: false }),
    [ethereal, mixedHairShine],
  )

  const mouthGeo = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.07, -0.09, 0.265),
      new THREE.Vector3(0, isFem ? -0.155 : -0.13, 0.285),
      new THREE.Vector3(0.07, -0.09, 0.265),
    )
    return new THREE.TubeGeometry(curve, 12, 0.009, 6, false)
  }, [isFem])

  // Animation targets — all start at neutral
  const T = useRef({
    gy: 0, gz: 0, sc: 1, tyScl: 1, tx: 0,
    ty: 0,
    hx: 0, hy: 0,
    alx: 0.18, alz: 0.12,
    arx: 0.18, arz: -0.12,
    // Hip = upper leg rotation pivot
    lhx: 0, rhx: 0,
    // Knee = lower leg rotation pivot (child of hip)
    lkx: 0, rkx: 0,
    blushA: 0,
  })

  useFrame(({ clock }, delta) => {
    if (!outerGroup.current || !group.current || !torso.current || !head.current ||
      !leftArm.current || !rightArm.current || !leftHip.current || !rightHip.current ||
      !leftKnee.current || !rightKnee.current) return

    const t = clock.elapsedTime * speed
    const tg = T.current

    // Reset to defaults every frame
    Object.assign(tg, {
      gy: 0, gz: 0, sc: 1, tyScl: 1, tx: 0,
      ty: 0,
      hx: 0, hy: 0,
      alx: 0.18, alz: 0.12,
      arx: 0.18, arz: -0.12,
      lhx: 0, rhx: 0,
      lkx: 0, rkx: 0,
      blushA: blush ? 0.38 : 0,
    })

    let hairSway = 0

    // ── IDLE ──────────────────────────────────────────────────────
    if (act.includes('idle') && !act.includes('sit') && !act.includes('phone')) {
      tg.tyScl = 1 + Math.sin(t * 1.6) * 0.018
      tg.gz = Math.sin(t * 0.55) * 0.018
      if (act.includes('confident')) { tg.alz = 0.22; tg.arz = -0.22 }
      if (act.includes('shy')) {
        tg.hx = 0.10; tg.blushA = blush ? 0.38 : 0.18
        tg.hy = Math.sin(t * 0.4) * 0.06
      }
      if (act.includes('lookaround')) {
        tg.hy = Math.sin(t * 0.6) * 0.7
        tg.hx = Math.sin(t * 0.3) * 0.08
      }
      hairSway = isFem ? Math.sin(t * 1.1) * 0.014 : 0
    }

    // ── WALK ──────────────────────────────────────────────────────
    else if (act.includes('walk') || act.includes('forward')) {
      tg.gy = Math.abs(Math.sin(t * 8)) * 0.055
      tg.hx = 0.07
      tg.alx = Math.sin(t * 7.5) * 0.55
      tg.arx = -Math.sin(t * 7.5) * 0.55
      tg.lhx = -Math.sin(t * 7.5) * 0.55
      tg.rhx = Math.sin(t * 7.5) * 0.55
      hairSway = isFem ? Math.sin(t * 6.2) * 0.026 : 0
    }

    // ── SHY / EMBARRASSED ─────────────────────────────────────────
    else if (act.includes('shy') || act.includes('embarrassed')) {
      tg.hx = 0.32; tg.alz = 0.14; tg.arz = -0.14
      tg.blushA = 0.42; tg.sc = 0.97
      hairSway = isFem ? Math.sin(t * 1.4) * 0.012 : 0
    }

    // ─────────────────────────────────────────────────────────────
    // ── SIT ──────────────────────────────────────────────────────
    // MATH: Hip joint is at local y=0.64. Bench top is at world y=BENCH_Y.
    // Character outerGroup is placed at world y = BENCH_Y - 0.64 by the scene.
    // So benchOffsetY=0 here — no gy offset needed. T.gy stays 0.
    //
    // Leg geometry (two-joint):
    //   leftHip  at [−0.118, 0.64, 0]   ← pivot for thigh
    //   leftKnee at [0, −0.38, 0]       ← pivot for shin (child of hip)
    //
    // To sit: thigh goes HORIZONTAL FORWARD
    //   lhx = −π/2 ≈ −1.57  (negative = rotates thigh forward/toward +Z)
    // Shin hangs STRAIGHT DOWN from knee:
    //   lkx = +π/2 ≈ +1.57  (counteracts hip rotation so shin points down)
    // ─────────────────────────────────────────────────────────────
    else if (act.includes('sit')) {
      tg.gy = 0            // scene handles Y placement, no extra offset
      tg.tx = -0.06        // torso leans very slightly forward (natural seated posture)
      tg.lhx = -1.52        // left thigh horizontal forward
      tg.rhx = -1.52        // right thigh horizontal forward
      tg.lkx = 1.52        // left shin hangs down (cancels hip rotation)
      tg.rkx = 1.52        // right shin hangs down

      // Arms rest forward on desk surface
      tg.alx = 0.50; tg.alz = 0.10
      tg.arx = 0.50; tg.arz = -0.10
      tg.hx = 0.05         // head very slightly forward — natural seated gaze

      // ── sitnervous: Sahil staring at Radhika ────────────────────
      if (act.includes('nervous')) {
        tg.gz = Math.sin(t * 15) * 0.006   // tiny micro-tremor
        // Head slowly turns RIGHT toward Radhika (she's on right side)
        // Oscillates between looking at desk and looking at her
        const lookCycle = Math.sin(t * 0.35)
        tg.hy = lookCycle > 0.3
          ? THREE.MathUtils.lerp(0, 0.55, (lookCycle - 0.3) / 0.7)  // turn toward her
          : 0                                                           // look forward
        tg.hx = tg.hy > 0.2 ? -0.05 : 0.05  // slight upward look when gazing at her
        tg.blushA = blush ? 0.42 : 0.20        // always slightly blushing
        // Arms — nervous hands on desk, left hand fidgets slightly
        tg.alx = 0.48 + Math.sin(t * 3.2) * 0.03
        tg.alz = 0.12 + Math.sin(t * 2.1) * 0.02
      }

      // ── sitwrite: Radhika writing ────────────────────────────────
      if (act.includes('write')) {
        tg.tx = -0.10                                          // lean forward more over desk
        tg.hx = 0.22                                          // look DOWN at notebook
        tg.hy = -0.08                                         // slight left tilt (right-hand writer)
        // Right arm — continuous small writing loops
        tg.arx = 0.60 + Math.sin(t * 9) * 0.045
        tg.arz = -0.22 + Math.cos(t * 9) * 0.04
        // Left arm — rests flat on desk holding paper
        tg.alx = 0.52
        tg.alz = 0.18
        tg.blushA = blush ? 0.25 : 0
      }

      // ── sitidle ───────────────────────────────────────────────────
      if (act === 'sitidle') {
        tg.tyScl = 1 + Math.sin(t * 1.4) * 0.012  // gentle breathing
        tg.hx = 0.02
        tg.hy = 0
      }
      hairSway = isFem ? Math.sin(t * 0.8) * 0.008 : 0
    }

    // ── WAVE ──────────────────────────────────────────────────────
    else if (act.includes('wave')) {
      tg.arx = -0.75
      tg.arz = -1.1 + Math.sin(t * 14) * 0.38
      hairSway = isFem ? Math.sin(t * 1.6) * 0.012 : 0
    }

    // ── PHONE ─────────────────────────────────────────────────────
    else if (act.includes('phone')) {
      tg.arx = 0.85; tg.arz = -0.15; tg.alx = 0.25; tg.hx = 0.25
      if (act.includes('check')) {
        tg.hx = act.includes('shocked') ? -0.25 : 0.15
        tg.sc = 1.05
        tg.blushA = 0.5
      }
      hairSway = isFem ? Math.sin(t * 1.1) * 0.01 : 0
    }

    // ── SURPRISED ─────────────────────────────────────────────────
    else if (act.includes('surprised')) {
      tg.sc = 1.04
      tg.hx = -0.2
      tg.tyScl = 0.95
      tg.alz = 0.45
      tg.arz = -0.45
      tg.blushA = 0
    }

    // ── CELEBRATE / JUMP ──────────────────────────────────────────
    else if (act.includes('jump') || act.includes('celebrate')) {
      const jumpPhase = Math.abs(Math.sin(t * 4))
      tg.gy = jumpPhase * 0.35
      tg.tyScl = 1 + jumpPhase * 0.06
      tg.alx = -0.8 + Math.sin(t * 4) * 0.3
      tg.arx = -0.8 - Math.sin(t * 4) * 0.3
      tg.lhx = -Math.sin(t * 4) * 0.4
      tg.rhx = Math.sin(t * 4) * 0.4
      tg.gz = Math.sin(t * 8) * 0.025
      tg.blushA = 0.45
    }

    // ── CRY HAPPY ─────────────────────────────────────────────────
    else if (act.includes('cryhappy')) {
      tg.hx = -0.12
      tg.tyScl = 1 + Math.sin(t * 6) * 0.025
      tg.alx = 0.6
      tg.alz = 0.14
      tg.arx = 0.6
      tg.arz = -0.14
      tg.blushA = 0.55
      tg.gz = Math.sin(t * 5) * 0.01
    }

    // ── OFFER FLOWER ─────────────────────────────────────────────
    else if (act.includes('offerflower') || act === 'flower') {
      tg.gy = Math.sin(t * 1.4) * 0.01
      tg.tx = -0.03
      tg.hx = 0.02
      tg.hy = -0.12
      tg.arx = -0.18
      tg.arz = 0.22
      tg.alx = 0.24
      tg.alz = 0.16
      tg.tyScl = 1 + Math.sin(t * 1.1) * 0.012
      tg.gz = Math.sin(t * 0.7) * 0.008
      tg.blushA = blush ? 0.44 : 0.2
      hairSway = isFem ? Math.sin(t * 0.75) * 0.006 : 0
    }

    // ── RECEIVE FLOWER ───────────────────────────────────────────
    else if (act.includes('receiveflower')) {
      tg.gy = Math.sin(t * 1.35 + 0.5) * 0.01
      tg.tx = -0.04
      tg.hx = 0.12
      tg.hy = -0.16
      tg.alx = -0.24
      tg.alz = 0.24
      tg.arx = 0.26
      tg.arz = -0.12
      tg.tyScl = 1 + Math.sin(t * 1.2) * 0.014
      tg.blushA = blush ? 0.52 : 0.26
      hairSway = isFem ? Math.sin(t * 0.7) * 0.008 : 0
    }

    // ── PROPOSE ──────────────────────────────────────────────────
    else if (act.includes('propose')) {
      tg.gy = 0
      tg.hx = -0.18
      tg.arx = -0.85; tg.arz = 0.12
      tg.alx = 0.20; tg.alz = 0.15
      tg.lhx = 1.55   // left knee bent (kneeling leg)
      tg.rhx = -0.15  // right leg grounded
      tg.gz = 0
      tg.tyScl = 1 + Math.sin(t * 1.4) * 0.015
      tg.blushA = blush ? 0.4 : 0.18
      hairSway = isFem ? Math.sin(t * 0.9) * 0.008 : 0
    }

    // ── HIDE / PEEK ───────────────────────────────────────────────
    else if (act.includes('hide') || act.includes('peek')) {
      tg.gy = -0.22; tg.hy = 0.38; tg.hx = 0.18
      tg.alx = -0.55; tg.alz = 0.65
    }

    // ── Lerp all values ───────────────────────────────────────────
    if (typeof headXOverride === 'number') tg.hx = headXOverride
    if (typeof headYOverride === 'number') tg.hy = headYOverride
    if (typeof torsoTurnOverride === 'number') tg.ty = torsoTurnOverride
    if (typeof leftArmXOverride === 'number') tg.alx = leftArmXOverride
    if (typeof rightArmXOverride === 'number') tg.arx = rightArmXOverride
    if (typeof leftArmZOverride === 'number') tg.alz = leftArmZOverride
    if (typeof rightArmZOverride === 'number') tg.arz = rightArmZOverride

    const s = Math.min(12 * delta, 0.15)
    const L = THREE.MathUtils.lerp

    group.current.position.y = L(group.current.position.y, tg.gy, s)
    group.current.rotation.z = L(group.current.rotation.z, tg.gz, s)
    group.current.scale.setScalar(L(group.current.scale.x, tg.sc, s))
    torso.current.scale.y = L(torso.current.scale.y, tg.tyScl, s)
    torso.current.rotation.x = L(torso.current.rotation.x, tg.tx, s)
    torso.current.rotation.y = L(torso.current.rotation.y, tg.ty, s)
    head.current.rotation.x = L(head.current.rotation.x, tg.hx, s)
    head.current.rotation.y = L(head.current.rotation.y, tg.hy, s)
    leftArm.current.rotation.x = L(leftArm.current.rotation.x, tg.alx, s)
    leftArm.current.rotation.z = L(leftArm.current.rotation.z, tg.alz, s)
    rightArm.current.rotation.x = L(rightArm.current.rotation.x, tg.arx, s)
    rightArm.current.rotation.z = L(rightArm.current.rotation.z, tg.arz, s)
    leftHip.current.rotation.x = L(leftHip.current.rotation.x, tg.lhx, s)
    rightHip.current.rotation.x = L(rightHip.current.rotation.x, tg.rhx, s)
    leftKnee.current.rotation.x = L(leftKnee.current.rotation.x, tg.lkx, s)
    rightKnee.current.rotation.x = L(rightKnee.current.rotation.x, tg.rkx, s)
    if (hairGroup.current) {
      hairGroup.current.rotation.z = L(hairGroup.current.rotation.z, hairSway, s)
    }

    if (blushL.current && blushR.current && !silhouette) {
      blushL.current.material.opacity = L(blushL.current.material.opacity, tg.blushA, s)
      blushR.current.material.opacity = L(blushR.current.material.opacity, tg.blushA, s)
    }
  })

  return (
    <group ref={outerGroup} {...props}>
      <group ref={group}>

        {/* ── HEAD ──────────────────────────────────────────── */}
        <group ref={head} position={[0, 1.46, 0]}>
          <mesh material={skinMat} castShadow>
            <sphereGeometry args={[0.285, 18, 18]} />
          </mesh>

          {detailVisible && (
            <group>
              <Eye x={-0.092} big={isFem} />
              <Eye x={0.092} big={isFem} />

              {isFem ? (
                [-0.092, 0.092].map((x, ei) => (
                  <group key={ei} position={[x, 0.112, 0.275]}>
                    {[-0.03, -0.01, 0.01, 0.03].map((lx, li) => (
                      <mesh key={li} position={[lx, 0, 0]}
                        rotation={[0, 0, (ei === 0 ? 1 : -1) * (li - 1.5) * 0.18]}>
                        <boxGeometry args={[0.007, 0.03, 0.007]} />
                        <meshBasicMaterial color="#080300" />
                      </mesh>
                    ))}
                  </group>
                ))
              ) : (
                <>
                  <mesh position={[-0.092, 0.108, 0.272]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.1, 0.01, 0.008]} /><meshBasicMaterial color="#1a0800" /></mesh>
                  <mesh position={[0.092, 0.108, 0.272]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.1, 0.01, 0.008]} /><meshBasicMaterial color="#1a0800" /></mesh>
                </>
              )}

              <mesh position={[-0.092, 0.148, 0.256]} rotation={[0, 0, isFem ? 0.12 : 0.20]}><boxGeometry args={[isFem ? 0.105 : 0.098, 0.018, 0.012]} /><meshBasicMaterial color="#180800" /></mesh>
              <mesh position={[0.092, 0.148, 0.256]} rotation={[0, 0, isFem ? -0.12 : -0.20]}><boxGeometry args={[isFem ? 0.105 : 0.098, 0.018, 0.012]} /><meshBasicMaterial color="#180800" /></mesh>

              <mesh position={[0, -0.015, 0.285]}><sphereGeometry args={[0.028, 8, 8]} /><meshToonMaterial color={mixedSkinDark} /></mesh>
              <mesh position={[-0.018, -0.026, 0.282]}><sphereGeometry args={[0.007, 5, 5]} /><meshBasicMaterial color={mixedSkinDark} /></mesh>
              <mesh position={[0.018, -0.026, 0.282]}><sphereGeometry args={[0.007, 5, 5]} /><meshBasicMaterial color={mixedSkinDark} /></mesh>

              <mesh geometry={mouthGeo}><meshBasicMaterial color="#a03828" /></mesh>

              {([[-0.145, -0.055, 0.255, false], [0.145, -0.055, 0.255, true]] as [number, number, number, boolean][]).map(([x, y, z, flip], i) => (
                <mesh key={i} ref={i === 0 ? blushL : blushR} position={[x, y, z]} rotation={[0, flip ? 0.45 : -0.45, 0]}>
                  <circleGeometry args={[0.058, 18]} />
                  <meshBasicMaterial color="#f08090" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
              ))}

              {variant === 'aryan' && (
                <group position={[0, 0.03, 0.3]}>
                  <mesh position={[-0.092, 0.03, 0]}><torusGeometry args={[0.05, 0.008, 8, 16]} /><meshBasicMaterial color="#43321f" /></mesh>
                  <mesh position={[0.092, 0.03, 0]}><torusGeometry args={[0.05, 0.008, 8, 16]} /><meshBasicMaterial color="#43321f" /></mesh>
                  <mesh position={[0, 0.03, 0]}><boxGeometry args={[0.065, 0.01, 0.01]} /><meshBasicMaterial color="#43321f" /></mesh>
                </group>
              )}
            </group>
          )}

          {/* Hair */}
          {isFem ? (
            <group>
              <mesh position={[0, 0.08, -0.06]} material={hairMat} castShadow><sphereGeometry args={[0.315, 16, 16]} /></mesh>
              <mesh position={[0, -0.10, -0.22]} material={hairMat} castShadow><sphereGeometry args={[0.26, 12, 12]} /></mesh>
              <mesh position={[0, 0, -0.28]} material={hairMat} castShadow><sphereGeometry args={[0.22, 10, 10]} /></mesh>
              <mesh position={[0.05, 0.18, 0.06]} material={hairShine}><sphereGeometry args={[0.16, 8, 8]} /></mesh>
              <mesh position={[0, 0.30, 0.10]} rotation={[0.4, 0, 0]}><boxGeometry args={[0.012, 0.18, 0.01]} /><meshBasicMaterial color={ethereal ? glowColor : '#2a1400'} transparent={ethereal} opacity={ethereal ? 0.42 : 1} depthWrite={false} /></mesh>
              <group ref={hairGroup}>
                <mesh position={[0, -0.52, -0.14]} material={hairMat} castShadow rotation={[-0.06, 0, 0]}><coneGeometry args={[0.28, 1.1, 14]} /></mesh>
                <mesh position={[-0.20, -0.48, -0.10]} material={hairMat} castShadow rotation={[-0.04, 0.3, 0.10]}><coneGeometry args={[0.14, 0.9, 10]} /></mesh>
                <mesh position={[0.20, -0.48, -0.10]} material={hairMat} castShadow rotation={[-0.04, -0.3, -0.10]}><coneGeometry args={[0.14, 0.9, 10]} /></mesh>
                <mesh position={[0.06, -0.45, -0.05]} material={hairShine} rotation={[-0.06, 0, 0]}><coneGeometry args={[0.09, 0.6, 10]} /></mesh>
              </group>
            </group>
          ) : (
            <group>
              <mesh position={[0, 0.10, -0.05]} material={hairMat} castShadow><sphereGeometry args={[0.30, 14, 14]} /></mesh>
              <mesh position={[0, -0.04, -0.20]} material={hairMat} castShadow><sphereGeometry args={[0.195, 10, 10]} /></mesh>
              <mesh position={[-0.24, 0.04, -0.02]} material={hairMat} castShadow><sphereGeometry args={[0.14, 8, 8]} /></mesh>
              <mesh position={[0.24, 0.04, -0.02]} material={hairMat} castShadow><sphereGeometry args={[0.14, 8, 8]} /></mesh>
              <mesh position={[0.04, 0.20, 0.08]} material={hairShine}><sphereGeometry args={[0.13, 8, 8]} /></mesh>
              <mesh position={[-0.10, 0.28, 0.20]} rotation={[0.52, 0, 0.52]} material={hairMat} castShadow><coneGeometry args={[0.042, 0.14, 5]} /></mesh>
              <mesh position={[0.00, 0.32, 0.22]} rotation={[0.58, 0, 0.00]} material={hairMat} castShadow><coneGeometry args={[0.042, 0.14, 5]} /></mesh>
              <mesh position={[0.10, 0.28, 0.20]} rotation={[0.52, 0, -0.52]} material={hairMat} castShadow><coneGeometry args={[0.042, 0.14, 5]} /></mesh>
              <mesh position={[-0.06, 0.30, 0.21]} rotation={[0.55, 0, 0.25]} material={hairMat} castShadow><coneGeometry args={[0.030, 0.10, 4]} /></mesh>
            </group>
          )}
        </group>

        {/* ── NECK ────────────────────────────────────────── */}
        <mesh position={[0, 1.16, 0]} material={skinMat} castShadow>
          <cylinderGeometry args={[0.1, 0.115, 0.14, 10]} />
        </mesh>

        {/* ── TORSO ───────────────────────────────────────── */}
        <group ref={torso} position={[0, 0.86, 0]}>
          <mesh material={shirtMat} castShadow receiveShadow>
            <cylinderGeometry args={[isFem ? 0.23 : 0.22, isFem ? 0.28 : 0.255, 0.55, 12]} />
          </mesh>
          <mesh position={[0, 0.268, 0]} rotation={[Math.PI / 2, 0, 0]} material={collarMat}>
            <torusGeometry args={[0.115, 0.022, 8, 18]} />
          </mesh>
          <mesh position={[0, -0.258, 0]} material={beltMat}>
            <cylinderGeometry args={[0.26, 0.26, isFem ? 0.028 : 0.04, 12]} />
          </mesh>
          {isFem && !silhouette && (
            <>
              <mesh position={[0, -0.295, 0]}><cylinderGeometry args={[0.30, 0.30, 0.025, 12]} /><meshToonMaterial color={c.collar} /></mesh>
              <mesh position={[0, 0.05, 0.248]}><boxGeometry args={[0.012, 0.42, 0.008]} /><meshBasicMaterial color={c.collar} /></mesh>
              <mesh position={[0, 0.22, 0.248]}><sphereGeometry args={[0.018, 6, 6]} /><meshBasicMaterial color={c.collar} /></mesh>
            </>
          )}
          {!isFem && !silhouette && (
            <mesh position={[-0.10, 0.10, 0.245]}><boxGeometry args={[0.095, 0.085, 0.006]} /><meshBasicMaterial color="#e0e0e0" /></mesh>
          )}
        </group>

        {/* ── ARMS ────────────────────────────────────────── */}
        {([[-0.285, 0.12], [0.285, -0.12]] as [number, number][]).map(([x], side) => (
          <group key={side} ref={side === 0 ? leftArm : rightArm} position={[x, 1.06, 0]}>
            <mesh position={[0, -0.148, 0]} material={shirtMat} castShadow><cylinderGeometry args={[0.068, 0.062, 0.295, 9]} /></mesh>
            <mesh position={[0, -0.435, 0]} material={skinMat} castShadow><cylinderGeometry args={[0.062, 0.056, 0.275, 9]} /></mesh>
            <group position={[0, -0.618, 0]}>
              <mesh material={skinMat} castShadow><sphereGeometry args={[0.072, 9, 9]} /></mesh>
              {(phone || holdingPhone) && side === 1 && (
                <group position={[0, -0.05, 0.06]} rotation={[0.4, 0, 0]}>
                  <mesh><boxGeometry args={[0.055, 0.11, 0.01]} /><meshStandardMaterial color="#111111" /></mesh>
                  <mesh position={[0, 0, 0.006]}><planeGeometry args={[0.048, 0.098]} /><meshBasicMaterial color="#fffc00" /></mesh>
                </group>
              )}
              {(holdFlower || act === 'flower' || act.includes('propose')) &&
                side === (flowerSide === 'left' ? 0 : 1) && (
                <group position={[0, -0.12, 0.06]} rotation={[0.6, 0, 0]}>
                  <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.008, 0.008, 0.28, 6]} /><meshStandardMaterial color="#3d6b45" /></mesh>
                  <mesh position={[0, 0.28, 0]}><dodecahedronGeometry args={[0.055, 0]} /><meshStandardMaterial color="#cc1033" roughness={0.5} /></mesh>
                  <mesh position={[0, 0.28, 0]}><dodecahedronGeometry args={[0.072, 1]} /><meshStandardMaterial color="#e8204a" roughness={0.6} transparent opacity={0.7} /></mesh>
                  <mesh position={[0.025, 0.10, 0]} rotation={[0, 0, -0.5]}><sphereGeometry args={[0.022, 5, 5]} /><meshStandardMaterial color="#2d5a35" /></mesh>
                  <mesh position={[-0.025, 0.16, 0]} rotation={[0, 0, 0.5]}><sphereGeometry args={[0.018, 5, 5]} /><meshStandardMaterial color="#2d5a35" /></mesh>
                </group>
              )}
            </group>
          </group>
        ))}

        {/* ── LEGS — two-joint system ─────────────────────── */}
        {/* Left leg */}
        <group ref={leftHip} position={[-0.118, 0.64, 0]}>
          {/* Thigh — child of hip pivot */}
          <mesh position={[0, -0.19, 0]} material={jeansMat} castShadow>
            <cylinderGeometry args={[0.098, 0.088, 0.38, 9]} />
          </mesh>
          {/* Knee pivot — at end of thigh */}
          <group ref={leftKnee} position={[0, -0.38, 0]}>
            {/* Shin */}
            <mesh position={[0, -0.17, 0]} material={jeansMat} castShadow>
              <cylinderGeometry args={[0.088, 0.078, 0.34, 9]} />
            </mesh>
            {/* Shoe */}
            <mesh position={[0, -0.36, 0.06]} material={shoesMat} castShadow>
              <boxGeometry args={[0.115, 0.095, 0.215]} />
            </mesh>
          </group>
        </group>

        {/* Right leg */}
        <group ref={rightHip} position={[0.118, 0.64, 0]}>
          <mesh position={[0, -0.19, 0]} material={jeansMat} castShadow>
            <cylinderGeometry args={[0.098, 0.088, 0.38, 9]} />
          </mesh>
          <group ref={rightKnee} position={[0, -0.38, 0]}>
            <mesh position={[0, -0.17, 0]} material={jeansMat} castShadow>
              <cylinderGeometry args={[0.088, 0.078, 0.34, 9]} />
            </mesh>
            <mesh position={[0, -0.36, 0.06]} material={shoesMat} castShadow>
              <boxGeometry args={[0.115, 0.095, 0.215]} />
            </mesh>
          </group>
        </group>

      </group>
    </group>
  )
}
