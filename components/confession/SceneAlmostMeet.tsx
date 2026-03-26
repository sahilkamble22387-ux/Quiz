// ✓ Fixed: ellipseGeometry → valid geometry, all Three.js types verified
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointMaterial, Points } from '@react-three/drei'
import * as THREE from 'three'
import Figure from './Figure'

type Props = {
  sceneTime: number
  mobile?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount
}

function smoothstep(start: number, end: number, value: number) {
  if (start === end) return value >= end ? 1 : 0
  const x = clamp((value - start) / (end - start), 0, 1)
  return x * x * (3 - 2 * x)
}

// ── SNOW ──────────────────────────────────────────────────────────────────────
function SnowLayer({
  count,
  size,
  sceneTime,
  depth,
}: {
  count: number
  size: number
  sceneTime: number
  depth: number
}) {
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      data[i * 3] = ((i * 1.37) % 16) - 8 + Math.sin(sceneTime * 0.3 + i) * 0.12
      data[i * 3 + 1] = ((i * 0.91 + sceneTime * -0.28) % 10) - 2
      data[i * 3 + 2] = ((i * 0.67) % depth) - depth / 2 + Math.cos(sceneTime * 0.2 + i) * 0.06
    }
    return data
  }, [count, depth, sceneTime])
  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial color="#f0f0ff" size={size} transparent opacity={0.85} depthWrite={false} />
    </Points>
  )
}

// ── SNOW ACCUMULATION ─────────────────────────────────────────────────────────
function SnowAccumulation() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.25, 0.022, 0]}>
        <planeGeometry args={[2.3, 40]} />
        <meshStandardMaterial color="#dde4f0" roughness={1} metalness={0} transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.25, 0.022, 0]}>
        <planeGeometry args={[2.3, 40]} />
        <meshStandardMaterial color="#dde4f0" roughness={1} metalness={0} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

// ── FIREWORKS ─────────────────────────────────────────────────────────────────
function Fireworks({ sceneTime }: { sceneTime: number }) {
  const bursts = useMemo(
    () => [
      { at: 8, x: -5.2, y: 8.3, color: '#d96b6b', z: -12 },
      { at: 22, x: 4.8, y: 8.9, color: '#d8c58a', z: -13 },
      { at: 36, x: 0.6, y: 8.5, color: '#bba8d8', z: -11 },
    ],
    [],
  )
  return (
    <>
      {bursts.map((burst, bi) => {
        const progress = (sceneTime - burst.at) / 2.1
        if (progress < 0 || progress > 1) return null
        return Array.from({ length: 10 }).map((_, idx) => {
          const angle = (idx / 10) * Math.PI * 2
          const radius = progress * (0.58 + (idx % 3) * 0.06)
          return (
            <mesh
              key={`${bi}-${idx}`}
              position={[
                burst.x + Math.cos(angle) * radius,
                burst.y + Math.sin(angle) * radius - progress * progress * 0.6,
                burst.z,
              ]}
            >
              <sphereGeometry args={[0.03, 4, 4]} />
              <meshBasicMaterial color={burst.color} transparent opacity={(1 - progress) * 0.55} />
            </mesh>
          )
        })
      })}
    </>
  )
}

// ── FIREWORK TRAILS ───────────────────────────────────────────────────────────
function FireworkTrails({ sceneTime }: { sceneTime: number }) {
  const bursts = useMemo(
    () => [
      { at: 8, x: -5.2, y: 8.3, z: -12 },
      { at: 22, x: 4.8, y: 8.9, z: -13 },
      { at: 36, x: 0.6, y: 8.5, z: -11 },
    ],
    [],
  )
  return (
    <>
      {bursts.map((burst, bi) => {
        const progress = (sceneTime - burst.at) / 3.2
        if (progress < 0 || progress > 1) return null
        return Array.from({ length: 5 }).map((_, idx) => {
          const angle = (idx / 5) * Math.PI * 2
          const r = progress * 1.1
          return (
            <mesh
              key={`trail-${bi}-${idx}`}
              position={[
                burst.x + Math.cos(angle) * r * 0.7,
                burst.y + Math.sin(angle) * r * 0.7 - progress * progress * 1.1,
                burst.z - 0.1,
              ]}
            >
              <sphereGeometry args={[0.018, 4, 4]} />
              <meshBasicMaterial color="#d7c5a0" transparent opacity={(1 - progress) * 0.22} />
            </mesh>
          )
        })
      })}
    </>
  )
}

// ── BREATH MIST ───────────────────────────────────────────────────────────────
function BreathMist({ x, sceneTime }: { x: number; sceneTime: number }) {
  const pulse = (sceneTime % 2.6) / 2.6
  return (
    <group position={[x, 1.42 + pulse * 0.16, 0.45]}>
      <mesh scale={0.025 + pulse * 0.065}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color="#e8ecf8"
          transparent
          opacity={0.28 * (1 - pulse)}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ── BALLOONS ──────────────────────────────────────────────────────────────────
const BALLOON_DATA = [
  { x: -4.0, z: 3.0, ph: 0.0 },
  { x: -3.7, z: -2.5, ph: 2.1 },
  { x: 4.1, z: 2.5, ph: 4.3 },
  { x: 3.8, z: -4.0, ph: 1.7 },
  { x: -2.0, z: 6.0, ph: 6.2 },
  { x: 2.2, z: 5.5, ph: 3.5 },
  { x: -4.2, z: -6.5, ph: 8.0 },
  { x: 4.3, z: 7.0, ph: 5.4 },
  { x: -1.8, z: -8.5, ph: 9.7 },
  { x: 2.0, z: -7.5, ph: 7.3 },
  { x: -3.9, z: 9.5, ph: 11.2 },
  { x: 3.7, z: -9.0, ph: 10.5 },
  { x: -2.3, z: 3.5, ph: 12.8 },
  { x: 2.1, z: -2.0, ph: 14.1 },
  { x: -4.1, z: 0.8, ph: 13.5 },
  { x: 4.0, z: -1.2, ph: 15.8 },
]

function BalloonBatch({ mobile }: { mobile: boolean }) {
  const data = mobile ? BALLOON_DATA.slice(0, 3) : BALLOON_DATA.slice(0, 5)
  const count = data.length
  const ptsRef = useRef<THREE.Points>(null)

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    data.forEach((d, i) => {
      pos[i * 3] = d.x
      pos[i * 3 + 1] = -1
      pos[i * 3 + 2] = d.z
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [count, data])

  useFrame(({ clock }) => {
    if (!ptsRef.current) return
    const t = clock.elapsedTime
    const pos = ptsRef.current.geometry.attributes.position.array as Float32Array
    data.forEach((d, i) => {
      pos[i * 3] = d.x + Math.sin(t * 0.6 + d.ph) * 0.28
      pos[i * 3 + 1] = ((t * 0.72 + d.ph * 2.1) % 24) - 1
      pos[i * 3 + 2] = d.z + Math.cos(t * 0.5 + d.ph) * 0.18
    })
    ptsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ptsRef} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color="#FF88AA"
        size={0.22}
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ── DISTANT CITYSCAPE ─────────────────────────────────────────────────────────
function DistantCityscape() {
  const buildings = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: -15 + i * 1.45,
        w: 0.7 + (i % 4) * 0.18,
        h: 1.2 + (i % 7) * 0.6,
        z: -26,
        lit: i % 3 !== 2,
      })),
    [],
  )
  return (
    <>
      {buildings.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x, b.h / 2 - 0.3, b.z]}>
            <boxGeometry args={[b.w, b.h, 0.1]} />
            <meshStandardMaterial color="#12121C" roughness={0.8} />
          </mesh>
          {b.lit &&
            Array.from({ length: Math.floor(b.h * 1.8) }).map((_, wi) => (
              <mesh
                key={wi}
                position={[b.x + (wi % 2 === 0 ? -0.12 : 0.12), wi * 0.28 - 0.2, b.z + 0.06]}
              >
                <planeGeometry args={[0.09, 0.09]} />
                <meshBasicMaterial
                  color="#C59A63"
                  transparent
                  opacity={0.28 + (wi % 4) * 0.04}
                />
              </mesh>
            ))}
        </group>
      ))}
    </>
  )
}

function DistantCelebration() {
  const bulbs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        x: -15 + index * 2,
        y: 0.5 + (index % 3) * 0.08,
        z: -20,
        color: index % 3 === 0 ? '#FFB15A' : index % 3 === 1 ? '#FFDFA8' : '#FF7D7D',
      })),
    [],
  )
  return (
    <>
      {bulbs.map((bulb, index) => (
        <mesh key={index} position={[bulb.x, bulb.y, bulb.z]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial color={bulb.color} transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  )
}

// ── PARKED CARS ───────────────────────────────────────────────────────────────
function ParkedCar({ x, z, color }: { x: number; z: number; color: string }) {
  const sx = x > 0 ? 1 : -1
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.55, 0.28, 1.1]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.52, -0.06]}>
        <boxGeometry args={[0.46, 0.2, 0.62]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.52, 0.24]} rotation={[0.18, 0, 0]}>
        <planeGeometry args={[0.38, 0.18]} />
        <meshBasicMaterial color="#3a4a60" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {([-0.22, 0.22] as number[]).flatMap((xo) =>
        ([-0.4, 0.4] as number[]).map((zo) => (
          <mesh
            key={`${xo}${zo}`}
            position={[xo * sx, 0.1, zo]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.08, 10]} />
            <meshStandardMaterial color="#1a1a20" roughness={0.9} />
          </mesh>
        )),
      )}
      <pointLight position={[0, 0.28, -0.56]} color="#FF3020" intensity={0.35} distance={1.6} />
    </group>
  )
}

function ParkedCars() {
  return (
    <>
      <ParkedCar x={-5.8} z={-5} color="#1C2840" />
      <ParkedCar x={-5.8} z={-10} color="#2A1810" />
      <ParkedCar x={5.8} z={-7} color="#1A1F28" />
      <ParkedCar x={5.8} z={-13} color="#0F1E16" />
      <ParkedCar x={-5.8} z={3} color="#2C2020" />
      <ParkedCar x={5.8} z={4} color="#18202A" />
    </>
  )
}

// ── BENCH ─────────────────────────────────────────────────────────────────────
function Bench({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[0.6, 0.045, 0.24]} />
        <meshStandardMaterial color="#3A2A1A" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.56, -0.09]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.6, 0.22, 0.038]} />
        <meshStandardMaterial color="#3A2A1A" roughness={0.85} />
      </mesh>
      {([-0.24, 0.24] as number[]).map((xo) => (
        <mesh key={xo} position={[xo, 0.18, 0]}>
          <boxGeometry args={[0.045, 0.36, 0.22]} />
          <meshStandardMaterial color="#4A3A28" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.58, 0.22]} />
        <meshStandardMaterial color="#d8e0f0" roughness={1} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// ── SHOP FRONTS ───────────────────────────────────────────────────────────────
function ShopFront({
  x,
  z,
  color,
}: {
  x: number
  z: number
  sign: string
  color: string
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.8, 3.2, 0.12]} />
        <meshStandardMaterial color="#1C1820" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.0, 0.07]}>
        <boxGeometry args={[1.3, 1.2, 0.05]} />
        <meshBasicMaterial color="#0A0E18" />
      </mesh>
      <mesh position={[0, 1.0, 0.1]}>
        <planeGeometry args={[1.26, 1.16]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 1.7, 0.32]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.7, 0.06, 0.6]} />
        <meshStandardMaterial color="#2A1A2A" roughness={0.85} />
      </mesh>
      <pointLight position={[0, 2.6, 0.2]} color={color} intensity={0.6} distance={2.5} />
    </group>
  )
}

// ── STREET LAMP ───────────────────────────────────────────────────────────────
function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.16, 8]} />
        <meshStandardMaterial color="#2A2838" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.34, 0]}>
        <cylinderGeometry args={[0.05, 0.058, 4.68, 10]} />
        <meshStandardMaterial color="#3A3A4A" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4.74, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 10]} />
        <meshStandardMaterial color="#343444" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position={[0, 4.88, 0]}>
        <boxGeometry args={[0.24, 0.16, 0.24]} />
        <meshStandardMaterial color="#2A2A38" />
      </mesh>
      <mesh position={[0, 4.77, 0]}>
        <sphereGeometry args={[0.082, 8, 8]} />
        <meshStandardMaterial
          color="#f0b8c0"
          emissive="#7a1126"
          emissiveIntensity={0.42}
          roughness={0.78}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 4.77, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial color="#b81434" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── HANGING STRING LIGHTS ─────────────────────────────────────────────────────
function StringLights({ mobile }: { mobile: boolean }) {
  const lightRef = useRef<THREE.Points>(null)
  const count = mobile ? 30 : 60

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -14 + (i / count) * 28
      pos[i * 3 + 1] = 5.0 + Math.sin((i / count) * Math.PI * 8) * 0.35
      pos[i * 3 + 2] = -1.5 + (i % 3) * 0.5
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [count])

  useFrame(({ clock }) => {
    if (!lightRef.current) return
    const t = clock.elapsedTime
    const pos = lightRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] = 5.0 + Math.sin((i / count) * Math.PI * 8 + t * 0.3) * 0.35
    }
    lightRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={lightRef} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color="#FFD88A"
        size={0.09}
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ── STAR FIELD ────────────────────────────────────────────────────────────────
function StarField() {
  const positions = useMemo(() => {
    const arr = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) {
      const phi = Math.random() * Math.PI
      const theta = Math.random() * Math.PI * 2
      arr[i * 3] = Math.sin(phi) * Math.cos(theta) * 32
      arr[i * 3 + 1] = Math.abs(Math.cos(phi)) * 16 + 3
      arr[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * 32
    }
    return arr
  }, [])

  const ptsRef = useRef<THREE.Points>(null)
  useFrame(({ clock }) => {
    if (!ptsRef.current) return
    const mat = ptsRef.current.material as THREE.PointsMaterial
    mat.opacity = 0.55 + Math.sin(clock.elapsedTime * 1.4) * 0.1
  })

  return (
    <Points ref={ptsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial color="#d8e4ff" size={0.022} transparent opacity={0.65} depthWrite={false} />
    </Points>
  )
}

// ── MOON ─────────────────────────────────────────────────────────────────────
function Moon() {
  return (
    <group position={[12, 14, -22]}>
      <mesh>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshStandardMaterial
          color="#E8EAF0"
          emissive="#C8CADC"
          emissiveIntensity={0.35}
          roughness={0.9}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.6, 14, 14]} />
        <meshBasicMaterial
          color="#B0B8D8"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#C0C8E8" intensity={0.28} distance={60} />
    </group>
  )
}

// ── PUDDLE REFLECTIONS — FIX: use circleGeometry scaled, not ellipseGeometry ──
// THREE.EllipseGeometry does not exist — was causing the black screen crash
function PuddleReflections() {
  const puddles: [number, number, number, number, number][] = [
    [-1.2, -3, 0.28, 0.55, 0],
    [0.8, -8, 0.22, 0.48, 0.2],
    [-0.4, -12, 0.30, 0.52, -0.1],
    [1.1, 0.5, 0.25, 0.45, 0.15],
    [-0.9, 6, 0.20, 0.42, -0.05],
  ]
  return (
    <group>
      {puddles.map(([x, z, rx, rz, rot], i) => (
        <mesh
          key={i}
          // scale x and z to create ellipse from circle
          position={[x, 0.007, z]}
          rotation={[-Math.PI / 2, rot, 0]}
          scale={[rx * 2, rz * 2, 1]}
        >
          {/* circleGeometry radius=0.5 scaled via parent scale to get ellipse */}
          <circleGeometry args={[0.5, 14]} />
          <meshBasicMaterial color="#2A3850" transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ── LAMP GARLAND ──────────────────────────────────────────────────────────────
function LampGarland({ x, z }: { x: number; z: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(12 * 3)
    for (let i = 0; i < 12; i++) {
      arr[i * 3] = x + Math.sin(i * 0.8) * 0.05
      arr[i * 3 + 1] = 1.2 + i * 0.28 + Math.sin(i * 1.1) * 0.04
      arr[i * 3 + 2] = z
    }
    return arr
  }, [x, z])
  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        color="#FF7090"
        size={0.055}
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

const LAMP_Z = [-14, -10, -6, -2, 2, 6, 10, 14]

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function SceneAlmostMeet({ sceneTime, mobile = false }: Props) {
  const walkProgress = smoothstep(0.6, 29, sceneTime)
  const walk = lerp(0, 7.68, walkProgress)
  const shoulderSway = (1 - walkProgress) * Math.sin(sceneTime * 1.9) * 0.06
  const barrierOpacity = sceneTime < 18 ? 0 : 0.02 + smoothstep(18, 28, sceneTime) * 0.12
  const crackOpacity = smoothstep(33, 39, sceneTime)
  const nearBarrier = walkProgress >= 0.88

  return (
    <group>
      <color attach="background" args={['#050910']} />
      <fog attach="fog" args={['#0A0818', 14, 36]} />

      {/* Lighting */}
      <ambientLight intensity={0.56} color="#161124" />
      <directionalLight position={[2, 12, 5]} color="#BFC6DF" intensity={0.26} />
      <directionalLight position={[12, 14, -22]} color="#8090C8" intensity={0.06} />
      <spotLight
        position={[-3.6, 6.2, 2.6]}
        color="#b8bfd6"
        intensity={0.18}
        angle={0.44}
        penumbra={0.8}
        distance={7.2}
      />
      <spotLight
        position={[3.6, 6.2, 2.6]}
        color="#b8bfd6"
        intensity={0.18}
        angle={0.44}
        penumbra={0.8}
        distance={7.2}
      />
      <pointLight position={[0, -2, -20]} color="#FF6030" intensity={0.18} distance={14} />
      <pointLight position={[-8, -1, -15]} color="#FF5020" intensity={0.08} distance={9} />
      <pointLight position={[8, -1, -15]} color="#FF5020" intensity={0.08} distance={9} />
      <pointLight position={[-0.8, 2.1, 1.4]} color="#FFD9AE" intensity={0.12} distance={3} />
      <pointLight position={[0.8, 2.1, 1.4]} color="#FFD9AE" intensity={0.12} distance={3} />

      {/* Wet road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 48]} />
        <meshStandardMaterial
          color="#040404"
          roughness={0.14}
          metalness={0.12}
          envMapIntensity={0.25}
        />
      </mesh>
      {/* Lane dashes */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[0, 0.003, -7 + i * 2.2]}>
          <boxGeometry args={[0.06, 0.004, 0.9]} />
          <meshBasicMaterial color="#E8E8E8" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Pavements */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.25, 0.005, 0]}>
        <planeGeometry args={[2.5, 48]} />
        <meshStandardMaterial color="#22202C" roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.25, 0.005, 0]}>
        <planeGeometry args={[2.5, 48]} />
        <meshStandardMaterial color="#22202C" roughness={0.88} metalness={0.04} />
      </mesh>
      {/* Curb edges */}
      <mesh position={[-3.0, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.08, 48]} />
        <meshStandardMaterial color="#1A1826" roughness={0.9} />
      </mesh>
      <mesh position={[3.0, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.08, 48]} />
        <meshStandardMaterial color="#1A1826" roughness={0.9} />
      </mesh>

      <SnowAccumulation />

      {/* Street lamps + garlands */}
      {LAMP_Z.map((z) => (
        <group key={z}>
          <StreetLamp x={-4.0} z={z} />
          <StreetLamp x={4.0} z={z} />
        </group>
      ))}

      {!mobile && (
        <>
          <Bench x={-5.2} z={-4} />
          <Bench x={-5.2} z={4} />
          <Bench x={5.2} z={-8} />
          <Bench x={5.2} z={2} />
        </>
      )}

      {!mobile && <ParkedCars />}

      <BalloonBatch mobile={mobile} />
      <Moon />
      <StarField />

      {/* Characters */}
      <Figure
        variant="sahil"
        action={nearBarrier ? 'idleshy' : 'walk'}
        position={[-8 + walk, 0, shoulderSway]}
      />
      <Figure
        variant="radhika"
        action={nearBarrier ? 'phone' : 'walk'}
        phone
        holdingPhone
        position={[8 - walk, 0, -shoulderSway]}
      />
      <BreathMist x={-8 + walk + 0.08} sceneTime={sceneTime} />
      <BreathMist x={8 - walk - 0.08} sceneTime={sceneTime + 0.9} />

      {/* Fate barrier */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshPhysicalMaterial
          transmission={0.92}
          roughness={0}
          metalness={0}
          thickness={0.1}
          color="#ffd6e0"
          transparent
          opacity={barrierOpacity}
        />
      </mesh>

      {/* Crack lines */}
      {crackOpacity > 0 && (
        <>
          {[
            { x1: 0, y1: 2.4, x2: -0.22, y2: 1.5 },
            { x1: -0.22, y1: 1.5, x2: 0.14, y2: 1.0 },
            { x1: 0.14, y1: 1.0, x2: -0.12, y2: 0.32 },
            { x1: 0, y1: 2.4, x2: 0.28, y2: 1.8 },
            { x1: 0.28, y1: 1.8, x2: 0.12, y2: 1.2 },
            { x1: -0.22, y1: 1.5, x2: -0.46, y2: 1.1 },
            { x1: 0.14, y1: 1.0, x2: 0.38, y2: 0.6 },
          ].map(({ x1, y1, x2, y2 }, idx) => {
            const cx = (x1 + x2) / 2
            const cy = (y1 + y2) / 2
            const dx = x2 - x1
            const dy = y2 - y1
            const len = Math.sqrt(dx * dx + dy * dy)
            return (
              <mesh key={idx} position={[cx, cy, 0.04]} rotation={[0, 0, Math.atan2(dy, dx)]}>
                <boxGeometry args={[len, 0.007, 0.01]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={crackOpacity} />
              </mesh>
            )
          })}
        </>
      )}

      <Fireworks sceneTime={sceneTime} />
      <FireworkTrails sceneTime={sceneTime} />

      <SnowLayer
        count={mobile ? 150 : 320}
        size={0.01}
        depth={20}
        sceneTime={sceneTime}
      />
      <SnowLayer
        count={mobile ? 60 : 130}
        size={0.018}
        depth={18}
        sceneTime={sceneTime * 0.95}
      />
      <SnowLayer
        count={mobile ? 20 : 50}
        size={0.025}
        depth={16}
        sceneTime={sceneTime * 0.9}
      />
    </group>
  )
}
