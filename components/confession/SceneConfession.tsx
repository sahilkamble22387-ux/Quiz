// ✓ Director's Cut — 
import { useMemo, useRef } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Figure from './Figure'

type Props = {
  sceneTime: number
  accepted: boolean
  acceptedTime: number
}

type Footstep = {
  spawn: number
  position: [number, number, number]
}

type TrailConfig = {
  color: string
  radius: number
  speed: number
  phase: number
  height: number
}

const PANEL_COUNT = 8
const PANEL_RADIUS = 7
const TILE_RADIUS = 0.225
const MEMORY_TRAILS: TrailConfig[] = [
  { color: '#AFA9EC', radius: 3.8, speed: 0.18, phase: 0.2, height: 1.4 },
  { color: '#FFD28F', radius: 4.2, speed: -0.14, phase: 1.5, height: 1.8 },
  { color: '#FFFC00', radius: 3.5, speed: 0.22, phase: 2.9, height: 2.2 },
  { color: '#C0D8FF', radius: 4.6, speed: -0.16, phase: 4.1, height: 1.05 },
]

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

function createPetalShape() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(-0.15, 0.3, -0.18, 0.6, 0, 1.0)
  shape.bezierCurveTo(0.18, 0.6, 0.15, 0.3, 0, 0)
  return shape
}

function createHeartTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, 64, 64)
  ctx.translate(32, 34)
  ctx.beginPath()
  ctx.moveTo(0, 16)
  ctx.bezierCurveTo(24, -4, 24, -28, 0, -12)
  ctx.bezierCurveTo(-24, -28, -24, -4, 0, 16)
  const gradient = ctx.createRadialGradient(0, -8, 2, 0, 0, 28)
  gradient.addColorStop(0, '#FFF7F8')
  gradient.addColorStop(0.35, '#FFADC7')
  gradient.addColorStop(1, '#FF3B6A')
  ctx.fillStyle = gradient
  ctx.fill()
  return new THREE.CanvasTexture(canvas)
}

function buildFootsteps(sceneTime: number): Footstep[] {
  const start = 4.2
  const end = 8.4
  const steps: Footstep[] = []

  for (let spawn = start, index = 0; spawn <= Math.min(sceneTime, end); spawn += 0.6, index += 1) {
    const walkProgress = smoothstep(start, end, spawn)
    const x = index % 2 === 0 ? -0.14 : 0.14
    const z = lerp(5.5, 0.26, walkProgress)
    steps.push({
      spawn,
      position: [x * (1 - walkProgress * 0.3), 0.018, z],
    })
  }

  return steps
}

function HexTileFloor({ sceneTime, footsteps }: { sceneTime: number; footsteps: Footstep[] }) {
  const tileRefs = useRef<(THREE.Mesh | null)[]>([])
  const tiles = useMemo(() => {
    const result: { x: number; z: number; dist: number; color: string }[] = []
    for (let row = -16; row <= 16; row += 1) {
      for (let col = -16; col <= 16; col += 1) {
        const x = col * TILE_RADIUS * 1.72 + (Math.abs(row) % 2 ? TILE_RADIUS * 0.86 : 0)
        const z = row * TILE_RADIUS * 1.5
        const dist = Math.hypot(x, z)
        if (Math.abs(x) > 6.25 || Math.abs(z) > 6.25 || dist > 6.65) continue
        result.push({
          x,
          z,
          dist,
          color: dist < 2 ? '#FF1A55' : dist < 4 ? '#FF4070' : '#FF8090',
        })
      }
    }
    return result
  }, [])

  useFrame(({ clock }) => {
    const floorReveal = smoothstep(0, 1.1, sceneTime)
    tiles.forEach((tile, index) => {
      const mesh = tileRefs.current[index]
      if (!mesh) return

      const material = mesh.material as THREE.MeshStandardMaterial
      const wave = Math.sin(clock.elapsedTime * 1.8 - tile.dist * 0.9) * 0.5 + 0.5
      let stepBoost = 0

      footsteps.forEach((footstep) => {
        const age = sceneTime - footstep.spawn
        if (age < 0 || age > 1.5) return
        const footprintDist = Math.hypot(tile.x - footstep.position[0], tile.z - footstep.position[2])
        const influence = Math.max(0, 1 - footprintDist / 0.42)
        stepBoost = Math.max(stepBoost, influence * (1 - age / 1.5) * 0.72)
      })

      material.opacity = floorReveal
      material.emissiveIntensity = floorReveal * (0.08 + wave * 0.22 + stepBoost)
      mesh.position.y = floorReveal * (wave * 0.015 + stepBoost * 0.018)
    })
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <circleGeometry args={[6.55, 96]} />
        <MeshReflectorMaterial
          color="#13020A"
          roughness={0.02}
          metalness={0.95}
          blur={[0, 0]}
          mixBlur={0}
          mixStrength={1}
          mirror={0.88}
          resolution={512}
          depthScale={0}
          minDepthThreshold={0.9}
          maxDepthThreshold={1}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]}>
        <circleGeometry args={[6.7, 96]} />
        <meshBasicMaterial color="#0A0005" transparent opacity={0.45} />
      </mesh>

      {tiles.map((tile, index) => (
        <mesh
          key={`${tile.x}-${tile.z}`}
          ref={(mesh) => {
            tileRefs.current[index] = mesh
          }}
          position={[tile.x, 0, tile.z]}
          rotation={[0, Math.PI / 6, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[TILE_RADIUS, TILE_RADIUS, 0.03, 6]} />
          <meshStandardMaterial
            color={tile.color}
            emissive={tile.color}
            emissiveIntensity={0.1}
            roughness={0.05}
            metalness={0.6}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      {footsteps.map((footstep) => {
        const age = sceneTime - footstep.spawn
        if (age < 0 || age > 1.5) return null
        const glow = Math.max(0, 0.9 - age * 0.6)
        const scale = 0.12 + age * 0.03
        return (
          <mesh
            key={footstep.spawn}
            position={footstep.position}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[scale, 24]} />
            <meshBasicMaterial color="#FF8090" transparent opacity={glow * 0.4} depthWrite={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function ConfessionWallPanel({
  angle,
  sceneTime,
  petalGeometry,
}: {
  angle: number
  sceneTime: number
  petalGeometry: THREE.ShapeGeometry
}) {
  const petalRefs = useRef<(THREE.Mesh | null)[]>([])
  const petals = useMemo(() => {
    const result: {
      layer: number
      position: [number, number, number]
      rotation: [number, number, number]
      scale: [number, number, number]
      phase: number
      speed: number
    }[] = []

    for (let layer = 0; layer < 5; layer += 1) {
      for (let index = 0; index < 12; index += 1) {
        const fan = index / 11
        const spread = (index - 5.5) * 0.24
        const overheadCurve = Math.sin(fan * Math.PI) * 1.6
        result.push({
          layer,
          position: [
            spread * (1 + layer * 0.05),
            0.45 + fan * 5.8,
            -layer * 0.4 - overheadCurve * 0.4,
          ],
          rotation: [
            -0.26 + fan * 0.65,
            spread * 0.08,
            (index - 5.5) * 0.1,
          ],
          scale: [
            0.34 + fan * 0.16 + layer * 0.02,
            (0.82 + fan * 1.6) * (1 + layer * 0.15),
            1,
          ],
          phase: Math.random() * Math.PI * 2,
          speed: 0.55 + Math.random() * 0.35,
        })
      }
    }

    return result
  }, [])

  useFrame(({ clock }) => {
    const reveal = smoothstep(1.8, 3.2, sceneTime) * 0.85

    petals.forEach((petal, index) => {
      const mesh = petalRefs.current[index]
      if (!mesh) return
      const layerOpacity = 0.15 + petal.layer * 0.14
      const layerGlow = 0.05 + petal.layer * 0.08
      const sway = Math.sin(clock.elapsedTime * petal.speed + petal.phase) * 0.012
      mesh.rotation.z = petal.rotation[2] + sway
      mesh.rotation.x = petal.rotation[0] + sway * 0.3

      const material = mesh.material as THREE.MeshStandardMaterial
      material.opacity = layerOpacity * reveal
      material.emissiveIntensity = layerGlow * reveal
    })
  })

  return (
    <group
      rotation={[0, angle + Math.PI, 0]}
      position={[Math.sin(angle) * PANEL_RADIUS, 0, Math.cos(angle) * PANEL_RADIUS]}
    >
      {petals.map((petal, index) => (
        <mesh
          key={`${petal.layer}-${index}`}
          ref={(mesh) => {
            petalRefs.current[index] = mesh
          }}
          geometry={petalGeometry}
          position={petal.position}
          rotation={petal.rotation}
          scale={petal.scale}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={petal.layer < 3 ? '#4A0820' : '#FF2255'}
            emissive={petal.layer < 3 ? '#4A0820' : '#FF2255'}
            emissiveIntensity={0}
            roughness={0.26}
            metalness={0.08}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function PetalWalls({ sceneTime, petalGeometry }: { sceneTime: number; petalGeometry: THREE.ShapeGeometry }) {
  const beamReveal = smoothstep(2, 3.4, sceneTime)

  return (
    <group>
      {Array.from({ length: PANEL_COUNT }, (_, index) => {
        const angle = (index / PANEL_COUNT) * Math.PI * 2
        return <ConfessionWallPanel key={index} angle={angle} sceneTime={sceneTime} petalGeometry={petalGeometry} />
      })}

      {Array.from({ length: PANEL_COUNT }, (_, index) => {
        const angle = ((index + 0.5) / PANEL_COUNT) * Math.PI * 2
        return (
          <group
            key={`beam-${index}`}
            position={[Math.sin(angle) * 6.5, 2.55, Math.cos(angle) * 6.5]}
            rotation={[0, angle, 0]}
          >
            <mesh position={[0, 0, 0]} scale={[1, 1 + beamReveal * 0.1, 1]}>
              <boxGeometry args={[0.28, 5.2, 0.28]} />
              <meshBasicMaterial
                color="#FFE0C0"
                transparent
                opacity={0.04 * beamReveal}
                depthWrite={false}
              />
            </mesh>
            <pointLight color="#FFD6E0" intensity={0.5 * beamReveal} distance={4} />
          </group>
        )
      })}
    </group>
  )
}

function CeilingOpening({ sceneTime, petalGeometry }: { sceneTime: number; petalGeometry: THREE.ShapeGeometry }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 20 }, () => {
        const radius = Math.random() * 2.5
        const angle = Math.random() * Math.PI * 2
        return {
          position: [Math.cos(angle) * radius, 8 + Math.random() * 4, Math.sin(angle) * radius] as [number, number, number],
          scale: 0.02 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        }
      }),
    [],
  )

  const fringe = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2
        return {
          position: [Math.sin(angle) * 1.8, 6.45, Math.cos(angle) * 1.8] as [number, number, number],
          rotation: [Math.PI * 0.72, 0, angle] as [number, number, number],
          scale: [0.28, 1.2 + Math.sin(angle * 2) * 0.12, 1] as [number, number, number],
        }
      }),
    [],
  )

  const starRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const reveal = smoothstep(0, 2.4, sceneTime)
    stars.forEach((star, index) => {
      const mesh = starRefs.current[index]
      if (!mesh) return
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = reveal * (0.45 + (Math.sin(clock.elapsedTime * 0.9 + star.phase) * 0.5 + 0.5) * 0.4)
    })
  })

  return (
    <group>
      <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.5, 32]} />
        <meshBasicMaterial color="#060818" side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, 6.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 1.2, 32]} />
        <meshBasicMaterial color="#FFD6E0" transparent opacity={0.4} depthWrite={false} />
      </mesh>

      <pointLight position={[0, 7, 0]} color="#FFD6E0" intensity={0.8} distance={6} />

      {stars.map((star, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            starRefs.current[index] = mesh
          }}
          position={star.position}
        >
          <sphereGeometry args={[star.scale, 8, 8]} />
          <meshBasicMaterial color="#FFF7D8" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {fringe.map((petal, index) => (
        <mesh
          key={index}
          geometry={petalGeometry}
          position={petal.position}
          rotation={petal.rotation}
          scale={petal.scale}
        >
          <meshStandardMaterial
            color="#21020F"
            emissive="#330012"
            emissiveIntensity={0.08}
            roughness={0.7}
            metalness={0.02}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function PetalRain({ sceneTime }: { sceneTime: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: 40 }, () => {
        const radius = Math.random() * 0.7
        const angle = Math.random() * Math.PI * 2
        const colorOptions = ['#E8507A', '#FF8090', '#FFB4C0']
        return {
          baseX: Math.cos(angle) * radius,
          baseZ: Math.sin(angle) * radius,
          speed: 0.4 + Math.random() * 0.28,
          phase: Math.random(),
          sway: 0.8 + Math.random() * 0.7,
          color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        }
      }),
    [],
  )
  const refs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const reveal = smoothstep(0.8, 2.4, sceneTime)
    petals.forEach((petal, index) => {
      const mesh = refs.current[index]
      if (!mesh) return
      const cycle = (clock.elapsedTime * petal.speed + petal.phase) % 1
      const y = 7 - cycle * 7.1
      const sway = Math.sin(clock.elapsedTime * petal.sway + petal.phase * Math.PI * 2) * 0.18
      mesh.position.set(petal.baseX + sway, y, petal.baseZ)
      mesh.rotation.x = clock.elapsedTime * 1.5 + petal.phase * Math.PI * 2
      mesh.rotation.z = clock.elapsedTime * 0.8 + petal.phase * Math.PI
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = 0.8 * reveal
    })
  })

  return (
    <group>
      {petals.map((petal, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            refs.current[index] = mesh
          }}
          position={[petal.baseX, 7, petal.baseZ]}
        >
          <circleGeometry args={[0.06, 12]} />
          <meshBasicMaterial color={petal.color} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function GoldDust({ sceneTime }: { sceneTime: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 500 }, () => {
        const radius = Math.random() * 6
        const angle = Math.random() * Math.PI * 2
        return {
          radius,
          angle,
          baseY: -1 + Math.random() * 7,
          spin: 0.05 + Math.random() * 0.12,
          rise: 0.14 + Math.random() * 0.08,
          wobble: 0.08 + Math.random() * 0.15,
          phase: Math.random() * Math.PI * 2,
        }
      }),
    [],
  )

  const geometry = useMemo(() => {
    const positions = new Float32Array(particles.length * 3)
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return buffer
  }, [particles.length])

  useFrame(({ clock }) => {
    const positions = geometry.attributes.position.array as Float32Array
    particles.forEach((particle, index) => {
      const angle = particle.angle + clock.elapsedTime * particle.spin
      const rise = (particle.baseY + clock.elapsedTime * particle.rise + 2) % 8 - 2
      positions[index * 3] = Math.cos(angle) * particle.radius + Math.sin(clock.elapsedTime * particle.wobble + particle.phase) * 0.18
      positions[index * 3 + 1] = rise
      positions[index * 3 + 2] = Math.sin(angle) * particle.radius + Math.cos(clock.elapsedTime * particle.wobble + particle.phase) * 0.18
    })
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#FFD090"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.55 * smoothstep(1, 2, sceneTime)}
        depthWrite={false}
      />
    </points>
  )
}

function HeartSparks({ sceneTime }: { sceneTime: number }) {
  const texture = useMemo(() => createHeartTexture(), [])
  const hearts = useMemo(
    () =>
      Array.from({ length: 120 }, () => {
        const colors = ['#FF6B9D', '#FFB0C8', '#FF3366']
        return {
          x: (Math.random() - 0.5) * 7.4,
          y: Math.random() * 4.8,
          z: (Math.random() - 0.5) * 7.4,
          rise: 0.12 + Math.random() * 0.1,
          freq: 0.6 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          scale: 0.06 + Math.random() * 0.06,
          color: colors[Math.floor(Math.random() * colors.length)],
        }
      }),
    [],
  )
  const refs = useRef<(THREE.Sprite | null)[]>([])

  useFrame(({ clock }) => {
    const reveal = smoothstep(1.4, 2.5, sceneTime)
    hearts.forEach((heart, index) => {
      const sprite = refs.current[index]
      if (!sprite) return
      const cycle = (heart.y + clock.elapsedTime * heart.rise) % 6.8
      sprite.position.set(
        heart.x + Math.sin(clock.elapsedTime * heart.freq + heart.phase) * 0.16,
        cycle,
        heart.z + Math.cos(clock.elapsedTime * (heart.freq * 0.8) + heart.phase) * 0.1,
      )
      sprite.scale.setScalar(heart.scale)
      const material = sprite.material as THREE.SpriteMaterial
      material.opacity = reveal * (0.3 + (Math.sin(clock.elapsedTime * 1.2 + heart.phase) * 0.5 + 0.5) * 0.5)
    })
  })

  if (!texture) return null

  return (
    <group>
      {hearts.map((heart, index) => (
        <sprite
          key={index}
          ref={(sprite) => {
            refs.current[index] = sprite
          }}
        >
          <spriteMaterial
            map={texture}
            color={heart.color}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}

function ConstellationStars({ sceneTime }: { sceneTime: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, () => {
        const angle = Math.random() * Math.PI * 2
        const radius = 6.55 + Math.random() * 0.25
        return {
          position: [Math.sin(angle) * radius, 0.8 + Math.random() * 5.2, Math.cos(angle) * radius] as [number, number, number],
          scale: 0.018 + Math.random() * 0.015,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 0.8,
        }
      }),
    [],
  )
  const refs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const reveal = smoothstep(2.3, 3.4, sceneTime)
    stars.forEach((star, index) => {
      const mesh = refs.current[index]
      if (!mesh) return
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = reveal * (0.4 + (Math.sin(clock.elapsedTime * star.speed + star.phase) * 0.5 + 0.5) * 0.6)
    })
  })

  return (
    <group>
      {stars.map((star, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            refs.current[index] = mesh
          }}
          position={star.position}
        >
          <sphereGeometry args={[star.scale, 6, 6]} />
          <meshBasicMaterial color="#FFFAE0" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function MemoryWisps({ sceneTime }: { sceneTime: number }) {
  const segmentRefs = useRef<(THREE.Mesh | null)[][]>([])
  const orbRefs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }) => {
    MEMORY_TRAILS.forEach((trail, trailIndex) => {
      const reveal = smoothstep(3.1 + trailIndex * 0.28, 4.1 + trailIndex * 0.28, sceneTime)
      const baseAngle = clock.elapsedTime * trail.speed + trail.phase
      const orb = orbRefs.current[trailIndex]

      if (orb) {
        orb.position.set(
          Math.cos(baseAngle) * trail.radius,
          trail.height + Math.sin(baseAngle * 1.4) * 0.18,
          Math.sin(baseAngle) * trail.radius,
        )
        orb.scale.setScalar(0.7 + reveal * 0.3)
      }

      const trailRefs = segmentRefs.current[trailIndex] ?? []
      trailRefs.forEach((mesh, segmentIndex) => {
        if (!mesh) return
        const angle = baseAngle - segmentIndex * 0.18
        const x = Math.cos(angle) * trail.radius
        const y = trail.height + Math.sin(angle * 1.4) * 0.18
        const z = Math.sin(angle) * trail.radius
        mesh.position.set(x, y, z)
        const material = mesh.material as THREE.MeshBasicMaterial
        material.opacity = reveal * (1 - segmentIndex / 30) * 0.65
      })
    })
  })

  return (
    <group>
      {MEMORY_TRAILS.map((trail, trailIndex) => (
        <group key={trail.color}>
          {Array.from({ length: 30 }, (_, segmentIndex) => (
            <mesh
              key={segmentIndex}
              ref={(mesh) => {
                if (!segmentRefs.current[trailIndex]) segmentRefs.current[trailIndex] = []
                segmentRefs.current[trailIndex][segmentIndex] = mesh
              }}
            >
              <sphereGeometry args={[0.09 - segmentIndex * 0.002, 8, 8]} />
              <meshBasicMaterial color={trail.color} transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}

          <group
            ref={(group) => {
              orbRefs.current[trailIndex] = group
            }}
          >
            <mesh>
              <sphereGeometry args={[0.14, 18, 18]} />
              <meshStandardMaterial color={trail.color} emissive={trail.color} emissiveIntensity={0.75} roughness={0.12} metalness={0.2} />
            </mesh>
            <pointLight color={trail.color} intensity={trailIndex === 1 ? 0.6 : 0.5} distance={3.8} />
          </group>
        </group>
      ))}
    </group>
  )
}

function FloatingCalligraphy({ sceneTime }: { sceneTime: number }) {
  const geometries = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const spread = (index - 2.5) * 0.55
        const points = [
          new THREE.Vector3(-0.6 + spread, -0.2, 0),
          new THREE.Vector3(-0.2 + spread, 0.35, 0.12),
          new THREE.Vector3(0.18 + spread, -0.1, -0.12),
          new THREE.Vector3(0.52 + spread, 0.45, 0.08),
          new THREE.Vector3(0.8 + spread, 0.05, 0),
        ]
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, 0.02, 8, false)
      }),
    [],
  )
  const refs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const reveal = smoothstep(2.8, 4, sceneTime)
    refs.current.forEach((mesh, index) => {
      if (!mesh) return
      mesh.rotation.y = clock.elapsedTime * 0.12 + index * 0.7
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = 0.08 * reveal
    })
  })

  return (
    <group>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            refs.current[index] = mesh
          }}
          geometry={geometry}
          position={[
            Math.sin(index * 1.2) * 2.6,
            1.4 + index * 0.55,
            Math.cos(index * 1.1) * 2.2,
          ]}
          rotation={[0.2 + index * 0.08, index * 0.45, 0.1]}
        >
          <meshBasicMaterial color="#FFD6E0" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function SceneConfession({ sceneTime, accepted, acceptedTime }: Props) {
  const footsteps = useMemo(() => buildFootsteps(sceneTime), [sceneTime])
  const petalGeometry = useMemo(() => new THREE.ShapeGeometry(createPetalShape(), 24), [])

  const walkProgress = smoothstep(4, 8.4, sceneTime)
  const faceCameraProgress = smoothstep(8.4, 13.2, sceneTime)
  const offerProgress = smoothstep(96, 108, sceneTime)
  const duetProgress = smoothstep(92, 108, sceneTime)
  const revealProgress = accepted ? smoothstep(0.18, 2.9, acceptedTime) : 0
  const togetherProgress = accepted ? smoothstep(0.4, 3.5, acceptedTime) : 0
  const shoulderRestProgress = accepted ? smoothstep(1.9, 4.2, acceptedTime) : 0
  const relaxProgress = accepted ? smoothstep(0.45, 1.9, acceptedTime) : 0
  const sahilBaseZ = lerp(5.6, 0.22, walkProgress) - smoothstep(50, 70, sceneTime) * 0.04
  const sahilBaseX = Math.sin(walkProgress * Math.PI) * 0.08
  const frontalSahilX = lerp(sahilBaseX, 0, faceCameraProgress)
  const frontalSahilZ = lerp(sahilBaseZ, 0.34, faceCameraProgress)
  const frontalSahilRotation = lerp(Math.PI, 0, faceCameraProgress)
  const stagedSahilX = lerp(frontalSahilX, -0.1, duetProgress)
  const stagedSahilZ = lerp(frontalSahilZ, 0.4, duetProgress)
  const stagedSahilRotation = lerp(frontalSahilRotation, 0.04, duetProgress)
  const sahilX = lerp(stagedSahilX, -0.34, togetherProgress)
  const sahilZ = lerp(stagedSahilZ, 0.34, togetherProgress)
  const sahilRotation = lerp(stagedSahilRotation, 0.05, relaxProgress)
  const sahilOfferArm = lerp(0.18, -0.42, offerProgress)
  const sahilRightArm = lerp(sahilOfferArm, 0.16, togetherProgress)
  const sahilRightArmZ = lerp(lerp(-0.12, 0.08, offerProgress), -0.08, togetherProgress)
  const sahilLeftArm = lerp(0.18, 0.16, togetherProgress)
  const radhikaShadowX = lerp(0, 0.58, duetProgress)
  const radhikaX = accepted ? lerp(radhikaShadowX, 0.3, togetherProgress) : radhikaShadowX
  const radhikaY = accepted ? lerp(0, -0.06, shoulderRestProgress) : 0
  const radhikaZ = accepted ? lerp(-8, -0.02, togetherProgress) : -8
  const radhikaRotation = accepted ? lerp(lerp(0, -0.48, duetProgress), -0.16, togetherProgress) : lerp(0, -0.48, duetProgress)
  const radhikaHeadTilt = 0.02 + duetProgress * 0.05
  const radhikaArms = 0.18 + smoothstep(95, 103, sceneTime) * 0.18
  const radhikaOpacity = accepted ? 0.46 + revealProgress * 0.54 : 0.3 + duetProgress * 0.14
  const radhikaShadowOpacity = accepted ? 0.18 + revealProgress * 0.14 : 0.16 + duetProgress * 0.06
  const haloIntensity = smoothstep(100, 112, sceneTime) * 0.22 + revealProgress * 0.18
  const roomReveal = smoothstep(0, 4.5, sceneTime)

  return (
    <group>
      <color attach="background" args={['#05010A']} />
      <fog attach="fog" args={['#09020A', 6.5, 17]} />

      <ambientLight color="#200810" intensity={0.7} />
      <spotLight
        position={[1.5, 4, 3]}
        color="#FFD090"
        intensity={2.2}
        angle={0.38}
        penumbra={0.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[-2, 3, 2.5]}
        color="#FFB0C0"
        intensity={0.9}
        angle={0.5}
        penumbra={0.95}
      />
      <pointLight position={[0, 1.8, -2]} color="#FF3366" intensity={1.4} distance={5} />
      <pointLight position={[0, 0.05, 0]} color="#FF1A55" intensity={0.5} distance={6} />
      <spotLight
        position={[0, 3.5, -11]}
        color="#FFE8F0"
        intensity={2.5}
        angle={0.22}
        penumbra={0.98}
      />

      {haloIntensity > 0.001 ? <pointLight position={[0, 2.5, 0]} color="#FFD090" intensity={haloIntensity} distance={4} /> : null}

      <HexTileFloor sceneTime={sceneTime} footsteps={footsteps} />
      <PetalWalls sceneTime={sceneTime} petalGeometry={petalGeometry} />
      <CeilingOpening sceneTime={sceneTime} petalGeometry={petalGeometry} />
      <PetalRain sceneTime={sceneTime} />
      <GoldDust sceneTime={sceneTime} />
      <HeartSparks sceneTime={sceneTime} />
      <ConstellationStars sceneTime={sceneTime} />
      <MemoryWisps sceneTime={sceneTime} />
      <FloatingCalligraphy sceneTime={sceneTime} />

      <mesh position={[0, 1.95, -4]} transparent>
        <planeGeometry args={[9.5, 4.6]} />
        <meshBasicMaterial
          color="#FFF7F4"
          transparent
          opacity={0.035 * (1 - revealProgress)}
          depthWrite={false}
        />
      </mesh>

      <group position={[sahilX, 0, sahilZ]} rotation={[0, sahilRotation, 0]}>
        <Figure
          variant="sahil"
          action={accepted ? 'idle shy' : sceneTime >= 96 ? 'offerflower' : sceneTime >= 4 && sceneTime < 8.4 ? 'walkforward' : 'idle confident'}
          holdFlower={!accepted}
          flowerSide="right"
          blush={sceneTime > 30 || accepted}
          headYOverride={lerp(lerp(Math.sin(sceneTime * 0.12) * 0.06, 0, faceCameraProgress), 0.08, shoulderRestProgress)}
          headXOverride={lerp(0.02, 0.04, relaxProgress)}
          torsoTurnOverride={accepted ? -0.03 : 0}
          rightArmXOverride={sahilRightArm}
          rightArmZOverride={sahilRightArmZ}
          leftArmXOverride={sahilLeftArm}
          leftArmZOverride={lerp(lerp(0.12, 0.1, offerProgress), 0.07, togetherProgress)}
        />
      </group>

      <mesh position={[radhikaX, 0.014, radhikaZ + 0.22]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.78, 1]}>
        <circleGeometry args={[0.52, 28]} />
        <meshBasicMaterial color="#040106" transparent opacity={radhikaShadowOpacity} depthWrite={false} />
      </mesh>

      <group position={[radhikaX, radhikaY, radhikaZ]} rotation={[0, radhikaRotation, 0]}>
        <Figure
          variant="radhika"
          action={accepted ? 'idle shy' : 'idle'}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          silhouette={false}
          ethereal={accepted && acceptedTime < 1.25}
          revealProgress={revealProgress}
          glowColor="#FFD6E0"
          glowIntensity={accepted ? 0.12 : 0.02}
          materialOpacity={radhikaOpacity}
          blush={accepted || sceneTime > 98}
          headXOverride={accepted ? lerp(0.02, 0.22, shoulderRestProgress) : radhikaHeadTilt}
          headYOverride={accepted ? lerp(-0.04, -0.52, shoulderRestProgress) : -0.04}
          torsoTurnOverride={accepted ? 0.06 : undefined}
          leftArmXOverride={accepted ? lerp(0.2, 0.22, shoulderRestProgress) : radhikaArms}
          rightArmXOverride={accepted ? lerp(0.2, 0.16, shoulderRestProgress) : radhikaArms}
          leftArmZOverride={accepted ? lerp(0.1, 0.14, shoulderRestProgress) : 0.16}
          rightArmZOverride={accepted ? lerp(-0.1, -0.06, shoulderRestProgress) : -0.08}
        />
      </group>

      {accepted ? (
        <pointLight position={[radhikaX, 2.15, radhikaZ + 0.36]} color="#FFE8F0" intensity={0.45 + revealProgress * 0.28} distance={4.2} />
      ) : null}

      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 28, 28]} />
        <meshBasicMaterial color="#040106" side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 48]} />
        <meshBasicMaterial color="#FFD090" transparent opacity={0.04 * haloIntensity} depthWrite={false} />
      </mesh>

      <pointLight position={[0, 1.2, 4.5]} color="#2C0814" intensity={0.45 * roomReveal} distance={8} />
    </group>
  )
}
