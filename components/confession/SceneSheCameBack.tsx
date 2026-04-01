import { useMemo, useRef } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Props = {
  sceneTime: number
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function MorningBlossoms() {
  const pointsRef = useRef<THREE.Points>(null)
  const { positions, drift, speed, offset } = useMemo(() => {
    const count = 140
    const random = seededRandom(37)
    const basePositions = new Float32Array(count * 3)
    const driftValues = new Float32Array(count)
    const speedValues = new Float32Array(count)
    const offsetValues = new Float32Array(count)

    for (let index = 0; index < count; index += 1) {
      const i = index * 3
      basePositions[i] = (random() - 0.5) * 13
      basePositions[i + 1] = 1.5 + random() * 5.5
      basePositions[i + 2] = (random() - 0.5) * 13
      driftValues[index] = 0.12 + random() * 0.24
      speedValues[index] = 0.09 + random() * 0.11
      offsetValues[index] = random() * Math.PI * 2
    }

    return {
      positions: basePositions,
      drift: driftValues,
      speed: speedValues,
      offset: offsetValues,
    }
  }, [])

  useFrame(({ clock }) => {
    const points = pointsRef.current
    if (!points) return
    const attribute = points.geometry.getAttribute('position') as THREE.BufferAttribute
    const pointPositions = attribute.array as Float32Array

    for (let index = 0; index < drift.length; index += 1) {
      const i = index * 3
      const phase = clock.elapsedTime * speed[index] + offset[index]
      const baseX = positions[i]
      const baseY = positions[i + 1]
      const baseZ = positions[i + 2]

      pointPositions[i] = baseX + Math.sin(phase * 0.7) * drift[index]
      pointPositions[i + 1] = ((baseY - (clock.elapsedTime * speed[index] * 0.8 + offset[index]) % 6.8) + 6.8) % 6.8 - 0.25
      pointPositions[i + 2] = baseZ + Math.cos(phase) * drift[index] * 0.5
    }

    attribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#F2B8CC"
        size={0.08}
        transparent
        opacity={0.72}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function GoldenOrbs({ sceneTime }: { sceneTime: number }) {
  const orbData = useMemo(
    () => [
      { position: [-3.8, 2.45, -1.6], scale: 0.2, color: '#F9D58D', phase: 0.2 },
      { position: [-2.4, 3.1, 2.2], scale: 0.16, color: '#F6C568', phase: 1.1 },
      { position: [0, 3.4, -3.6], scale: 0.19, color: '#FFE3A2', phase: 2.5 },
      { position: [2.6, 2.7, 2.5], scale: 0.17, color: '#EBC36F', phase: 3.4 },
      { position: [3.7, 3, -1.1], scale: 0.22, color: '#FFD77C', phase: 4.4 },
    ],
    [],
  )

  return (
    <group>
      {orbData.map((orb) => {
        const y = orb.position[1] + Math.sin(sceneTime * 0.28 + orb.phase) * 0.16
        const glow = 0.55 + (Math.sin(sceneTime * 0.4 + orb.phase) * 0.5 + 0.5) * 0.35
        return (
          <group key={`${orb.position.join('-')}`} position={[orb.position[0], y, orb.position[2]]}>
            <mesh>
              <sphereGeometry args={[orb.scale, 20, 20]} />
              <meshStandardMaterial
                color={orb.color}
                emissive={orb.color}
                emissiveIntensity={1.1}
                roughness={0.14}
                metalness={0.2}
                transparent
                opacity={0.92}
              />
            </mesh>
            <pointLight color={orb.color} intensity={glow} distance={3.8} decay={2.2} />
          </group>
        )
      })}
    </group>
  )
}

function GardenPillars() {
  const pillars = useMemo(() => {
    return Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2
      return {
        angle,
        x: Math.cos(angle) * 5.2,
        z: Math.sin(angle) * 5.2,
        height: 2.65 + (index % 2) * 0.24,
      }
    })
  }, [])

  return (
    <group>
      {pillars.map((pillar) => (
        <group key={pillar.angle} position={[pillar.x, 0, pillar.z]} rotation={[0, pillar.angle + Math.PI, 0]}>
          <mesh castShadow receiveShadow position={[0, pillar.height / 2, 0]}>
            <cylinderGeometry args={[0.09, 0.11, pillar.height, 12]} />
            <meshStandardMaterial color="#8D765E" roughness={0.8} metalness={0.08} />
          </mesh>
          <mesh position={[0, pillar.height + 0.12, 0]}>
            <sphereGeometry args={[0.18, 18, 18]} />
            <meshStandardMaterial color="#F1D38C" emissive="#E7BE65" emissiveIntensity={0.5} roughness={0.22} />
          </mesh>
          <mesh position={[0, pillar.height - 0.04, -0.52]} rotation={[0.28, 0, 0]}>
            <planeGeometry args={[0.78, 1.12]} />
            <meshBasicMaterial color="#F5DEB3" transparent opacity={0.08} depthWrite={false} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[4.6, 5.6, 80]} />
        <meshBasicMaterial color="#D4B164" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  )
}

function SkyWash() {
  return (
    <group>
      <mesh position={[0, 5.2, -6.8]}>
        <planeGeometry args={[22, 12]} />
        <meshBasicMaterial color="#D9E6F6" transparent opacity={0.92} depthWrite={false} />
      </mesh>
      <mesh position={[0, 4.1, -5.5]}>
        <planeGeometry args={[18, 7]} />
        <meshBasicMaterial color="#FFF0CF" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function SceneSheCameBack({ sceneTime }: Props) {
  const floorPulse = 0.9 + Math.sin(sceneTime * 0.22) * 0.02

  return (
    <group scale={floorPulse}>
      <color attach="background" args={['#E7EFF9']} />
      <fog attach="fog" args={['#E7EFF9', 11, 22]} />

      <ambientLight intensity={1.05} color="#FFF5E0" />
      <hemisphereLight intensity={0.72} color="#FFF4D8" groundColor="#BFD0E4" />
      <directionalLight
        castShadow
        position={[5.5, 8.5, 3.5]}
        intensity={1.85}
        color="#FFD28F"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 4.8, -3.5]} intensity={0.55} color="#C7DFFF" />

      <SkyWash />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <circleGeometry args={[7.4, 96]} />
        <MeshReflectorMaterial
          color="#AFC7DF"
          roughness={0.1}
          metalness={0.5}
          mirror={0.68}
          blur={[160, 42]}
          mixBlur={1.2}
          mixStrength={18}
          resolution={512}
          transparent
          opacity={0.96}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]}>
        <circleGeometry args={[7.65, 96]} />
        <meshBasicMaterial color="#C8D9EA" transparent opacity={0.56} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3.4, 80]} />
        <meshBasicMaterial color="#FFF1C8" transparent opacity={0.08} depthWrite={false} />
      </mesh>

      <GardenPillars />
      <GoldenOrbs sceneTime={sceneTime} />
      <MorningBlossoms />
    </group>
  )
}
