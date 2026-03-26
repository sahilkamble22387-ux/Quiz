import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function map(v, a, b, c, d) { return c + (d - c) * clamp((v - a) / (b - a || 1), 0, 1) }
function ease(v) { return v * v * (3 - 2 * v) }

const ROSE = '#e8678a'
const BLUSH = '#f0a0b8'
const GOLD = '#f5c842'
const WHITE = '#faf0f4'
const CRIMSON = '#c0152a'
const DARK = '#04020a'

const CAM = {
  'chapter-01': { pos: [-2.8, 1.2, 9.0], look: [0.8, 0.1, 0], fov: 40 },   // wide observer-left
  'chapter-02': { pos: [2.2, 0.4, 7.2], look: [-0.8, -0.1, 0], fov: 38 },   // from right, looking at desk
  'chapter-03': { pos: [3.2, 0.8, 8.5], look: [-1.2, 0.2, 0], fov: 42 },   // side perspective Sahil retreating
  'chapter-04': { pos: [0, 3.8, 6.5], look: [0, 0.4, 0], fov: 34 },         // high bird's-eye on bridge
  'chapter-05': { pos: [0, 4.2, 11.0], look: [0, -1.0, -2.0], fov: 32 },   // high fate-POV on road
  'panel-01': { pos: [0, 0.1, 8.2], look: [0, 0, 0], fov: 42 },
  'panel-02': { pos: [-0.8, 0.6, 7.2], look: [0.3, 0, 0], fov: 38 },
  'panel-03': { pos: [-0.5, -0.2, 7.5], look: [0, 0.1, 0], fov: 42 },
  'panel-04': { pos: [0.6, 0.5, 8.0], look: [-0.3, 0, 0], fov: 40 },
  'panel-05': { pos: [0, 0.2, 8.4], look: [0, 0, 0], fov: 44 },
  'panel-06': { pos: [-0.8, 0.3, 8.0], look: [0.4, 0.1, 0], fov: 40 },
  'poll': { pos: [0, 0.5, 9.0], look: [0, 0, 0], fov: 42 },
}

function CameraRig({ sceneKey }) {
  const cfg = CAM[sceneKey] ?? CAM['chapter-01']
  const targetPos = useMemo(() => new THREE.Vector3(...cfg.pos), [cfg])
  const targetLook = useMemo(() => new THREE.Vector3(...cfg.look), [cfg])

  useFrame((state) => {
    const px = state.pointer.x * 0.35
    const py = state.pointer.y * 0.20
    const tp = targetPos.clone()
    tp.x += px; tp.y += py
    state.camera.position.lerp(tp, 0.055)
    const dir = new THREE.Vector3()
    state.camera.getWorldDirection(dir)
    const desired = targetLook.clone().sub(state.camera.position).normalize()
    dir.lerp(desired, 0.06)
    state.camera.lookAt(state.camera.position.clone().add(dir))
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, cfg.fov, 0.07)
    state.camera.updateProjectionMatrix()
    const tFar = sceneKey === 'chapter-05' ? 20 : 24
    state.scene.fog.near = THREE.MathUtils.lerp(state.scene.fog.near, 7, 0.04)
    state.scene.fog.far = THREE.MathUtils.lerp(state.scene.fog.far, tFar, 0.04)
  })
  return null
}

function FloatingLights() {
  const lights = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    lights.current.forEach((l, i) => {
      if (!l) return
      l.position.x = Math.sin(t * (0.22 + i * 0.05) + i) * (2.5 + i * 0.6)
      l.position.y = Math.cos(t * (0.32 + i * 0.06) + i) * (1.5 + i * 0.35)
      l.position.z = -2.5 + Math.sin(t * 0.18 + i) * 1.8
    })
  })
  return (
    <>
      <ambientLight intensity={1.0} color="#f7d7df" />
      <pointLight position={[0, 2.5, 4]} intensity={45} distance={22} color="#ffe8d9" />
      {[0, 1, 2].map((i) => (
        <pointLight key={i}
          ref={(n) => { lights.current[i] = n }}
          intensity={i === 1 ? 22 : 14}
          distance={14}
          color={i === 2 ? GOLD : CRIMSON}
        />
      ))}
    </>
  )
}

function Orb({ color = CRIMSON, pos = [0, 0, -2], scale = 1.4, opacity = 0.18 }) {
  return (
    <mesh position={pos} scale={scale}>
      <sphereGeometry args={[1, 28, 28]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

function HeartFormation({ progress }) {
  const group = useRef()
  const meshes = useRef([])
  const data = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const a = (i / 120) * Math.PI * 2
    const hx = 16 * Math.sin(a) ** 3 * 0.14
    const hy = (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.14
    return {
      scatter: new THREE.Vector3((Math.random() - .5) * 10, (Math.random() - .5) * 7, (Math.random() - .5) * 5),
      target: new THREE.Vector3(hx, hy * 0.82, Math.sin(a * 3) * 0.32),
      size: Math.random() * 0.055 + 0.028,
    }
  }), [])

  useFrame((state) => {
    const mix = ease(clamp(map(progress, 0.18, 0.82, 0, 1), 0, 1))
    if (group.current) {
      group.current.rotation.y += 0.0018
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.10
    }
    data.forEach((p, i) => {
      const m = meshes.current[i]; if (!m) return
      const d = state.clock.elapsedTime * 0.3 + i
      m.position.lerpVectors(p.scatter, p.target, mix)
      m.position.x += Math.sin(d * 0.65) * 0.018
      m.position.y += Math.cos(d * 0.48) * 0.018
      m.scale.setScalar(p.size * (1 + mix * 2.8))
    })
  })

  return (
    <group ref={group}>
      <Orb scale={2.8} opacity={0.14} pos={[0, 0, -2.5]} />
      {data.map((_, i) => (
        <mesh key={i} ref={(n) => { meshes.current[i] = n }}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial color={CRIMSON} transparent opacity={0.88} />
        </mesh>
      ))}
      <Sparkles count={28} scale={6} size={3.2} color={BLUSH} speed={0.28} />
    </group>
  )
}

function BesideMe({ progress }) {
  const radhikaRef = useRef()
  const warmthRef = useRef()
  useFrame(() => {
    const enter = map(progress, 0, 0.35, 3.6, 0.58)
    const leave = map(progress, 0.62, 1, 0.58, 3.0)
    const x = progress < 0.62 ? enter : leave
    const alpha = progress < 0.62 ? 1 : map(progress, 0.62, 1, 1, 0.22)

    if (radhikaRef.current) { radhikaRef.current.position.set(x, -0.14, 0); radhikaRef.current.material.opacity = alpha }
    if (warmthRef.current) { warmthRef.current.scale.setScalar(1.5 + 1.8); warmthRef.current.material.opacity = 0.10 }
  })
  return (
    <group>
      {/* Desk */}
      <mesh position={[0, -0.55, -0.6]}><boxGeometry args={[3.8, 0.08, 1.3]} /><meshStandardMaterial color="#4a2e0e" roughness={0.9} /></mesh>
      {[[-1.7, -0.5], [1.7, -0.5], [-1.7, 0.5], [1.7, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, -1.05, z]}><cylinderGeometry args={[0.05, 0.05, 1.0, 6]} /><meshStandardMaterial color="#3a2008" /></mesh>
      ))}
      <mesh position={[0.7, -0.48, -0.6]}><boxGeometry args={[0.6, 0.015, 0.78]} /><meshStandardMaterial color="#f5f0e8" roughness={0.9} /></mesh>
      {/* Warmth glow — always visible */}
      <mesh ref={warmthRef} position={[0, -0.15, -0.8]}><sphereGeometry args={[1, 24, 24]} /><meshBasicMaterial color="#ffd7b5" transparent opacity={0.10} /></mesh>
      {/* Sahil dot — bigger */}
      <mesh position={[-0.65, -0.2, 0]}><sphereGeometry args={[0.24, 24, 24]} /><meshStandardMaterial color={CRIMSON} emissive="#5a0913" emissiveIntensity={2.5} /></mesh>
      {/* Radhika dot — bigger, animated */}
      <mesh ref={radhikaRef} position={[3.4, -0.14, 0]}><sphereGeometry args={[0.24, 24, 24]} /><meshStandardMaterial color={WHITE} emissive="#a3465f" emissiveIntensity={2.0} transparent opacity={1} /></mesh>
      <Sparkles count={12} scale={3.5} size={2.2} color={BLUSH} speed={0.18} />
    </group>
  )
}

function RetreatScene({ progress }) {
  const sahilRef = useRef(), aryanRef = useRef(), shadowRef = useRef()
  useFrame(() => {
    const r = ease(progress)
    if (sahilRef.current) { sahilRef.current.position.set(-1.3 - r * 2.1, -0.1 - r * 1.3, 0); sahilRef.current.scale.setScalar(1 - r * 0.22); sahilRef.current.material.emissiveIntensity = 0.7 - r * 0.5 }
    if (aryanRef.current) aryanRef.current.position.set(1.8 - r * 1.7, 0.22 - r * 0.10, 0.2)
    if (shadowRef.current) { shadowRef.current.position.set(-3.6, -2.2, -1.5); shadowRef.current.material.opacity = 0.10 + r * 0.25 }
  })
  return (
    <group>
      <mesh ref={shadowRef}><planeGeometry args={[5, 5]} /><meshBasicMaterial color="#000000" transparent opacity={0.18} /></mesh>
      <mesh position={[0.1, 0.15, 0]}><sphereGeometry args={[0.19, 24, 24]} /><meshStandardMaterial color={WHITE} emissive="#5d2a3a" emissiveIntensity={0.55} /></mesh>
      <mesh ref={sahilRef}><sphereGeometry args={[0.17, 24, 24]} /><meshStandardMaterial color={CRIMSON} emissive="#540913" emissiveIntensity={0.7} /></mesh>
      <mesh ref={aryanRef} position={[1.8, 0.22, 0.2]}><sphereGeometry args={[0.20, 24, 24]} /><meshStandardMaterial color="#ffffff" emissive="#888888" emissiveIntensity={0.8} /></mesh>
    </group>
  )
}

function SnapchatBridge({ progress }) {
  const bubbleRefs = useRef([])
  const ringRefs = useRef([])
  const sahilRef = useRef()
  const radhikaRef = useRef()

  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.2, 0.3, -0.3),
    new THREE.Vector3(-2.1, 1.0, -0.1),
    new THREE.Vector3(0, 0.4, 0.2),
    new THREE.Vector3(2.1, 1.0, -0.1),
    new THREE.Vector3(4.2, 0.3, -0.3),
  ]), [])

  const linePoints = useMemo(() => curve.getPoints(120).map(p => p.toArray()), [curve])

  const bubbleData = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    dir: i % 2 === 0 ? 1 : -1, speed: 0.55 + i * 0.08, offset: i * 0.42, phase: i * 1.2,
    color: ['#fffc00', '#ffe44d', '#ffd700', '#ffe880', '#ffeb80'][i],
  })), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (sahilRef.current) sahilRef.current.position.y = 0.35 + Math.sin(t * 0.7) * 0.14
    if (radhikaRef.current) radhikaRef.current.position.y = 0.35 + Math.sin(t * 0.7 + Math.PI) * 0.14

    bubbleData.forEach((bd, i) => {
      const m = bubbleRefs.current[i]; if (!m) return
      const raw = ((t * bd.speed + bd.offset) % 2) / 2
      const tVal = bd.dir === 1 ? raw : 1 - raw
      const pt = curve.getPoint(clamp(tVal, 0.01, 0.99))
      m.position.copy(pt)
      m.position.y += Math.sin(t * 2.2 + bd.phase) * 0.055
      m.scale.setScalar(0.88 + Math.sin(t * 3 + bd.phase) * 0.10)
    })

    ringRefs.current.forEach((r, i) => {
      if (!r) return
      const prog = ((t * 0.9 + i * 0.55) % 1)
      r.scale.setScalar(0.3 + prog * 2.2)
      r.material.opacity = Math.max(0, 0.5 - prog * 0.5)
    })
  })

  return (
    <group>
      <Orb color="#100820" scale={12} opacity={0.55} pos={[0, 0, -5]} />
      <Line points={linePoints} color={GOLD} transparent opacity={0.38} lineWidth={2.5} />
      <mesh ref={sahilRef} position={[-4.2, 0.35, -0.3]}><sphereGeometry args={[0.22, 20, 20]} /><meshStandardMaterial color={BLUSH} emissive={BLUSH} emissiveIntensity={2.2} /></mesh>
      <Sparkles count={6} scale={1.2} size={2.5} color={BLUSH} speed={0.3} position={[-4.2, 0.35, -0.3]} />
      <mesh ref={radhikaRef} position={[4.2, 0.35, -0.3]}><sphereGeometry args={[0.22, 20, 20]} /><meshStandardMaterial color={ROSE} emissive={ROSE} emissiveIntensity={2.8} /></mesh>
      <Sparkles count={8} scale={1.4} size={2.8} color={ROSE} speed={0.35} position={[4.2, 0.35, -0.3]} />
      {bubbleData.map((bd, i) => (
        <mesh key={i} ref={(n) => { bubbleRefs.current[i] = n }}>
          <sphereGeometry args={[0.20, 14, 14]} />
          <meshStandardMaterial color={bd.color} emissive={bd.color} emissiveIntensity={0.9} transparent opacity={0.92} />
        </mesh>
      ))}
      <Sparkles count={24} scale={9} size={1.6} color={ROSE} speed={0.18} />
      {Array.from({ length: 6 }).map((_, i) => {
        const isSahil = i < 3
        const pos = isSahil ? [-4.2, 0.35, -0.3] : [4.2, 0.35, -0.3]
        return (
          <mesh key={i} ref={(n) => { ringRefs.current[i] = n }} position={pos} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.007, 8, 32]} />
            <meshBasicMaterial color={isSahil ? BLUSH : ROSE} transparent opacity={0} />
          </mesh>
        )
      })}
    </group>
  )
}

function Crossroads({ progress }) {
  const leftRef = useRef()
  const rightRef = useRef()
  const glowRef = useRef()
  const snowRefs = useRef([])
  const snowData = useMemo(() => Array.from({ length: 120 }, () => ({
    x: (Math.random() - .5) * 14, y: Math.random() * 10 - 1, z: (Math.random() - .5) * 8,
    vy: 0.010 + Math.random() * 0.015, vx: (Math.random() - .5) * 0.004, phase: Math.random() * Math.PI * 2,
  })), [])

  useFrame((state) => {
    const ph = clamp(progress, 0, 1), t = state.clock.elapsedTime
    const lx = ph < 0.5 ? map(ph, 0, 0.5, -4.5, -0.12) : map(ph, 0.5, 0.78, -0.12, 3.4)
    const rx = ph < 0.5 ? map(ph, 0, 0.5, 4.5, 0.12) : map(ph, 0.5, 0.78, 0.12, -3.4)
    const ca = ph < 0.78 ? 1 : map(ph, 0.78, 1, 1, 0.25)
    const eg = ph > 0.78 ? map(ph, 0.78, 1, 0.25, 0.65) : 0.10
    if (leftRef.current) { leftRef.current.position.set(lx, -0.20 + Math.abs(Math.sin(t * 4.5)) * 0.04, 0.22); leftRef.current.material.opacity = ca }
    if (rightRef.current) { rightRef.current.position.set(rx, -0.20 + Math.abs(Math.sin(t * 4.5 + 1.0)) * 0.04, -0.22); rightRef.current.material.opacity = ca }
    if (glowRef.current) { glowRef.current.material.opacity = eg; glowRef.current.scale.setScalar(1 + eg * 3.5) }
    snowRefs.current.forEach((s, i) => {
      if (!s || i >= snowData.length) return
      const d = snowData[i]
      d.y -= d.vy; d.x += d.vx + Math.sin(t * 0.5 + d.phase) * 0.003
      if (d.y < -2.5) { d.y = 9; d.x = (Math.random() - .5) * 14 }
      s.position.set(d.x, d.y, d.z)
    })
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -1.5, -1.4]}><planeGeometry args={[14, 12]} /><meshStandardMaterial color="#09070f" roughness={1} metalness={0.04} /></mesh>
      {/* Road dashes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-2.5 + i * 1.0, -0.92, -0.1]} rotation={[-Math.PI / 2.3, 0, 0]}><planeGeometry args={[0.07, 0.4]} /><meshBasicMaterial color="#2a2040" /></mesh>
      ))}
      {/* Street lamps — brighter, amber glow */}
      {[-2.6, 2.6].map((x, si) => [0, -1.8, -3.6].map((z, li) => (
        <group key={`${si}-${li}`}>
          <mesh position={[x, -0.2, z]}><cylinderGeometry args={[0.03, 0.03, 2.2, 6]} /><meshBasicMaterial color="#1a1828" /></mesh>
          <mesh position={[x, 0.95, z]}><sphereGeometry args={[0.10, 8, 8]} /><meshBasicMaterial color={GOLD} /></mesh>
          {/* Bright lamp — every lamp lit */}
          <pointLight position={[x, 0.92, z]} intensity={4.5} distance={6} color="#f5c842" />
        </group>
      )))}
      {/* Gold fate barrier glow — more visible */}
      <mesh ref={glowRef} position={[0, -0.18, -0.4]}><sphereGeometry args={[0.65, 24, 24]} /><meshBasicMaterial color={GOLD} transparent opacity={0.10} /></mesh>
      {/* Dots — bigger and brighter */}
      <mesh ref={leftRef} position={[-4.5, -0.20, 0.22]}><sphereGeometry args={[0.22, 22, 22]} /><meshStandardMaterial color={BLUSH} emissive={CRIMSON} emissiveIntensity={2.5} transparent opacity={1} /></mesh>
      <mesh ref={rightRef} position={[4.5, -0.20, -0.22]}><sphereGeometry args={[0.22, 22, 22]} /><meshStandardMaterial color={WHITE} emissive={GOLD} emissiveIntensity={2.2} transparent opacity={1} /></mesh>
      {/* Snow — more dense */}
      {Array.from({ length: 120 }).map((_, i) => (
        <mesh key={i} ref={(n) => { snowRefs.current[i] = n }} position={[snowData[i].x, snowData[i].y, snowData[i].z]} scale={0.022 + (i % 3) * 0.007}>
          <sphereGeometry args={[1, 4, 4]} /><meshBasicMaterial color={WHITE} transparent opacity={0.70} depthWrite={false} />
        </mesh>
      ))}
      <Sparkles count={14} scale={10} size={1.8} color={BLUSH} speed={0.14} />
    </group>
  )
}

function SmileScene() {
  const refs = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return; const time = t * 0.65 + i; const r = 0.85 + Math.sin(time * 1.05) * 0.38 + i * 0.10
      m.position.set(Math.cos(time * 1.15) * r, Math.sin(time * 1.3) * r * 0.55, Math.sin(time * 0.75) * 0.45)
      m.rotation.z += 0.028; m.scale.setScalar(0.11 + Math.sin(time * 1.2) * 0.025)
    })
  })
  return (
    <group>
      <Orb scale={1.8} color={GOLD} opacity={0.10} pos={[0, 0, -2]} />
      <mesh><sphereGeometry args={[0.22, 24, 24]} /><meshStandardMaterial color={WHITE} emissive={GOLD} emissiveIntensity={0.95} /></mesh>
      {Array.from({ length: 6 }).map((_, i) => (<mesh key={i} ref={(n) => { refs.current[i] = n }}><octahedronGeometry args={[1, 0]} /><meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1} /></mesh>))}
      <Sparkles count={22} scale={5.5} size={3} color={GOLD} speed={0.28} />
    </group>
  )
}

function EyesScene() {
  const r1 = useRef(), r2 = useRef(), r3 = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (r1.current) r1.current.scale.setScalar(1 + Math.sin(t * 1.55) * 0.11)
    if (r2.current) r2.current.scale.setScalar((1 + Math.sin(t * 1.55 + 1.1) * 0.11) * 1.22)
    if (r3.current) r3.current.scale.setScalar((1 + Math.sin(t * 0.8) * 0.08) * 1.55)
  })
  return (
    <group rotation={[0.55, 0.12, 0]}>
      <mesh ref={r1}><torusGeometry args={[1.1, 0.058, 16, 100]} /><meshStandardMaterial color={WHITE} emissive={BLUSH} emissiveIntensity={0.72} /></mesh>
      <mesh ref={r2}><torusGeometry args={[1.65, 0.038, 16, 100]} /><meshStandardMaterial color={BLUSH} emissive={BLUSH} emissiveIntensity={0.60} transparent opacity={0.72} /></mesh>
      <mesh ref={r3}><torusGeometry args={[2.3, 0.022, 12, 100]} /><meshStandardMaterial color={ROSE} emissive={ROSE} emissiveIntensity={0.45} transparent opacity={0.40} /></mesh>
      <mesh scale={0.24}><sphereGeometry args={[1, 24, 24]} /><meshStandardMaterial color={WHITE} emissive={WHITE} emissiveIntensity={0.9} /></mesh>
      <Sparkles count={12} scale={4} size={2.2} color={WHITE} speed={0.18} />
    </group>
  )
}

function CommitmentScene({ progress }) {
  const bars = useRef([])
  useFrame(() => { bars.current.forEach((b, i) => { if (!b) return; const fill = clamp(progress + i * 0.07, 0, 1); b.scale.y = 0.32 + fill * (0.82 + i * 0.10); b.position.y = -1.05 + b.scale.y * 0.52 }) })
  return (
    <group>
      <Line points={[[-2.5, -1.06, 0], [2.5, -1.06, 0]]} color={WHITE} transparent opacity={0.07} />
      {Array.from({ length: 5 }).map((_, i) => (<mesh key={i} ref={(n) => { bars.current[i] = n }} position={[-1.6 + i * 0.8, -0.8, 0]}><boxGeometry args={[0.32, 1, 0.32]} /><meshStandardMaterial color={i === 4 ? GOLD : CRIMSON} emissive={i === 4 ? GOLD : '#6a0913'} emissiveIntensity={0.72} /></mesh>))}
      <Sparkles count={8} scale={4} size={2} color={GOLD} speed={0.20} />
    </group>
  )
}

function TraditionalScene() {
  const drops = useRef([])
  useFrame((state) => { drops.current.forEach((d, i) => { if (!d) return; const t = state.clock.elapsedTime * 0.5 + i * 0.28; d.position.y = 2.5 - ((t * 0.85 + i * 0.11) % 5.0); d.position.x = ((i % 5) - 2) * 0.70 + Math.sin(t) * 0.07; d.position.z = -1 + (i % 4) * 0.14 }) })
  return (
    <group>
      <mesh position={[0, 0, -0.65]}><planeGeometry args={[2.4, 3.2]} /><meshStandardMaterial color="#1a111f" emissive="#231722" emissiveIntensity={0.22} transparent opacity={0.70} /></mesh>
      {Array.from({ length: 22 }).map((_, i) => (<mesh key={i} ref={(n) => { drops.current[i] = n }} scale={0.055 + (i % 3) * 0.012}><sphereGeometry args={[1, 10, 10]} /><meshBasicMaterial color={GOLD} transparent opacity={0.72} /></mesh>))}
      <Sparkles count={14} scale={4.5} size={2.4} color={GOLD} speed={0.22} />
    </group>
  )
}

function ExistenceScene() {
  const orbs = useRef([])
  useFrame((state) => { const t = state.clock.elapsedTime; orbs.current.forEach((o, i) => { if (!o) return; const r = 0.75 + i * 0.26; o.position.set(Math.cos(t * (0.48 + i * 0.05) + i) * r, Math.sin(t * (0.52 + i * 0.06) + i) * r * 0.48, Math.sin(t * (0.38 + i * 0.04) + i * 0.2) * 0.75) }) })
  return (
    <group>
      <mesh scale={0.24}><sphereGeometry args={[1, 24, 24]} /><meshStandardMaterial color={WHITE} emissive={WHITE} emissiveIntensity={0.92} /></mesh>
      <Orb scale={1.6} color={CRIMSON} opacity={0.07} pos={[0, 0, -1.5]} />
      {Array.from({ length: 6 }).map((_, i) => (<mesh key={i} ref={(n) => { orbs.current[i] = n }} scale={0.075 + i * 0.018}><sphereGeometry args={[1, 18, 18]} /><meshStandardMaterial color={i === 0 ? GOLD : i % 2 === 0 ? BLUSH : ROSE} emissive={i === 0 ? GOLD : ROSE} emissiveIntensity={0.82} /></mesh>))}
      <Sparkles count={16} scale={5} size={2} color={ROSE} speed={0.20} />
    </group>
  )
}

function MemoryScene({ progress }) {
  const bead = useRef()
  const points = useMemo(() => [[-5, -0.1, -0.8], [-3.2, 0.28, -0.2], [-1.4, -0.20, 0], [1, 0.22, -0.1], [3.2, 0.05, -0.32], [5, 0.10, -0.8]], [])
  const visCount = Math.max(2, Math.floor(map(progress, 0, 0.9, 2, points.length)))
  useFrame(() => { const t = clamp(progress * 1.1, 0, 1); if (bead.current) { bead.current.position.x = map(t, 0, 1, -4.7, 4.7); bead.current.position.y = Math.sin(t * Math.PI * 2) * 0.20 } })
  return (
    <group>
      <Line points={points.slice(0, visCount)} color={BLUSH} transparent opacity={0.38} lineWidth={2.2} />
      <mesh ref={bead} scale={0.12} position={[-4.7, 0, 0]}><sphereGeometry args={[1, 18, 18]} /><meshStandardMaterial color={CRIMSON} emissive="#8b0000" emissiveIntensity={0.92} /></mesh>
      <Sparkles count={12} scale={5} size={2.2} speed={0.15} color={BLUSH} />
    </group>
  )
}

function PollAura() {
  return (
    <group>
      <Sparkles count={26} scale={6} size={2.8} speed={0.30} color={GOLD} />
      <Orb scale={2.2} color={CRIMSON} opacity={0.10} pos={[0, 0, -2.2]} />
      <Orb scale={1.4} color={GOLD} opacity={0.08} pos={[0, 0, -1.0]} />
    </group>
  )
}

function SceneContent({ sceneKey, progress }) {
  switch (sceneKey) {
    case 'chapter-01': return <HeartFormation progress={progress} />
    case 'chapter-02': return <BesideMe progress={progress} />
    case 'chapter-03': return <RetreatScene progress={progress} />
    case 'chapter-04': return <SnapchatBridge progress={progress} />
    case 'chapter-05': return <Crossroads progress={progress} />
    case 'panel-01': return <SmileScene />
    case 'panel-02': return <EyesScene />
    case 'panel-03': return <CommitmentScene progress={progress} />
    case 'panel-04': return <TraditionalScene />
    case 'panel-05': return <ExistenceScene />
    case 'panel-06': return <MemoryScene progress={progress} />
    default: return <PollAura />
  }
}

function SceneRoot({ sceneKey, progress }) {
  return (
    <>
      <fog attach="fog" args={[DARK, 7, 24]} />
      <FloatingLights />
      <Stars radius={60} depth={30} count={2000} factor={2.8} saturation={0} fade speed={0.28} />
      <SceneContent sceneKey={sceneKey} progress={progress} />
      <CameraRig sceneKey={sceneKey} />
    </>
  )
}

export default function CinematicBackdrop({ sceneKey, progress }) {
  return (
    <div className="cinematic-backdrop" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.25, 9.2], fov: 42 }}
      >
        <SceneRoot sceneKey={sceneKey} progress={progress} />
      </Canvas>
    </div>
  )
}