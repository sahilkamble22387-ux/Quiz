import { useMemo } from 'react'
import { PointMaterial, Points, Sparkles } from '@react-three/drei'
import Figure from './Figure'

type Props = {
  sceneTime: number
}

function DustMotes({ sceneTime }: { sceneTime: number }) {
  const positions = useMemo(() => {
    const count = 80
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = Math.sin(i * 1.37 + sceneTime * 0.12) * 4.2
      data[i * 3 + 1] = 0.5 + ((i * 0.23) % 4.2) + Math.cos(i * 0.91 + sceneTime * 0.1) * 0.18
      data[i * 3 + 2] = ((i * 0.71) % 12) - 6 + Math.sin(i * 0.61 + sceneTime * 0.08) * 0.15
    }
    return data
  }, [sceneTime])

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial color="#ffe4b0" size={0.008} transparent opacity={0.8} depthWrite={false} />
    </Points>
  )
}

function CorridorStudent({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.4, 0]}>
        <capsuleGeometry args={[0.16, 0.85, 4, 8]} />
        <meshStandardMaterial color="#7e6b78" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.7, 8]} />
        <meshStandardMaterial color="#6f5d69" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

export default function SceneFirstSight({ sceneTime }: Props) {
  const sahilX = sceneTime < 18 ? -1.8 + (sceneTime / 18) * 1.15 : sceneTime < 52 ? -0.65 : -0.75 + ((sceneTime - 52) / 13) * 0.55
  const sahilZ = sceneTime < 52 ? 1.85 : 1.75 - ((sceneTime - 52) / 13) * 0.3
  const radhikaProgress = sceneTime < 8 ? 0 : Math.min((sceneTime - 8) / 10, 1)
  const radhikaX = 6 - radhikaProgress * 4.8
  const radhikaZ = sceneTime < 52 ? 1.75 : 1.65 - ((sceneTime - 52) / 13) * 0.25
  const aryanProgress = sceneTime < 30 ? 0 : Math.min((sceneTime - 30) / 10, 1)
  const aryanX = 5.8 - aryanProgress * 3.6
  const aryanZ = sceneTime < 52 ? 1.35 : 1.25 - ((sceneTime - 52) / 13) * 0.2
  const lightPulse = 0.9 + Math.sin(sceneTime * (Math.PI * 2 / 3)) * 0.3

  const sahilAction = sceneTime < 18 ? 'walk' : sceneTime < 40 ? 'idleshy' : sceneTime < 52 ? 'idleshy' : 'walk'
  const radhikaAction = sceneTime < 8 ? 'idle' : sceneTime < 22 ? 'walk' : sceneTime < 30 ? 'wave' : sceneTime < 52 ? 'idle' : 'walk'
  const aryanAction = sceneTime >= 30 ? 'walk' : 'idle'

  return (
    <group>
      <color attach="background" args={['#f5e6d0']} />
      <ambientLight intensity={0.9} color="#fff0d8" />
      <hemisphereLight args={['#ffe5b4', '#d4956a', 0.95]} />
      <pointLight position={[-5, 4, 0]} intensity={0.65} color="#ffb6c1" />
      <pointLight position={[5, 4, 0]} intensity={0.65} color="#ffd700" />
      {[-3.8, -1.2, 1.2, 3.8].map((x, index) => (
        <spotLight
          key={x}
          position={[x, 4.4, -2.8]}
          rotation={[0.3, 0, x > 0 ? 0.18 : -0.18]}
          angle={0.36}
          penumbra={0.95}
          intensity={lightPulse * (index % 2 === 0 ? 1.05 : 0.92)}
          distance={18}
          color="#ffd28f"
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[14, 30]} />
        <meshStandardMaterial color="#f2e8da" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.008, 0]}>
        <planeGeometry args={[14, 30]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} transparent opacity={0.25} />
      </mesh>

      {Array.from({ length: 6 }).map((_, index) => {
        const z = 4 - index * 4
        return (
          <group key={z}>
            {[-5.2, 5.2].map((x) => (
              <group key={`${x}-${z}`} position={[x, 1.2, z]}>
                <mesh>
                  <boxGeometry args={[1.1, 2.4, 0.5]} />
                  <meshStandardMaterial
                    color={index % 2 === 0 ? '#b8cce0' : '#c4d4c0'}
                    metalness={0.3}
                    roughness={0.4}
                  />
                </mesh>
                {[-0.18, 0, 0.18].map((slot) => (
                  <mesh key={slot} position={[0, 0.36 + slot, 0.255]}>
                    <boxGeometry args={[0.46, 0.03, 0.01]} />
                    <meshBasicMaterial color="#f6fbff" transparent opacity={0.35} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )
      })}

      {[-3.8, 0, 3.8].map((x) => (
        <group key={x} position={[x, 2.65, -4.85]}>
          <mesh>
            <boxGeometry args={[2.3, 3.1, 0.08]} />
            <meshStandardMaterial color="#f6ecd9" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[2.0, 2.7, 0.04]} />
            <meshStandardMaterial color="#fff6dc" emissive="#ffd090" emissiveIntensity={0.32} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      <CorridorStudent x={-0.75} z={-6} />
      <CorridorStudent x={0.95} z={-6.5} />

      <Figure
        variant="sahil"
        action={sahilAction}
        position={[sahilX, 0, sahilZ]}
        rotation={[0, Math.PI * 0.08, 0]}
        blush={sceneTime > 18 && sceneTime < 52}
      />
      <Figure
        variant="radhika"
        action={radhikaAction}
        position={[radhikaX, 0, radhikaZ]}
        rotation={[0, sceneTime < 30 ? -Math.PI * 0.12 : -Math.PI * 0.2, 0]}
      />
      {sceneTime >= 30 ? (
        <Figure
          variant="aryan"
          action={aryanAction}
          position={[aryanX, 0, aryanZ]}
          rotation={[0, -Math.PI * 0.18, 0]}
        />
      ) : null}

      <DustMotes sceneTime={sceneTime} />
      <Sparkles count={28} scale={[10, 5, 10]} size={2} color="#fffaf0" />
    </group>
  )
}
