import { useMemo } from 'react'
import { PointMaterial, Points, Sparkles } from '@react-three/drei'
import Figure from './Figure'

type Props = {
  sceneTime: number
}

function DustField({ sceneTime }: { sceneTime: number }) {
  const positions = useMemo(() => {
    const count = 50
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = Math.sin(sceneTime * 0.2 + i) * 1.8 + ((i % 5) - 2) * 0.55
      data[i * 3 + 1] = 0.8 + ((i * 0.29) % 3.8) + sceneTime * 0.01
      data[i * 3 + 2] = Math.cos(sceneTime * 0.15 + i) * 1.4 - 2.4 - (i % 9) * 0.32
    }
    return data
  }, [sceneTime])

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial color="#ffe0a6" size={0.012} transparent opacity={0.75} depthWrite={false} />
    </Points>
  )
}

function WallClock({ sceneTime }: { sceneTime: number }) {
  const minuteRotation = -sceneTime * 0.12
  const hourRotation = -sceneTime * 0.01 - 0.7

  return (
    <group position={[-6.8, 3.7, -2]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
        <meshStandardMaterial color="#fff6eb" />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[0.28, 32]} />
        <meshBasicMaterial color="#f8f4ec" />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation={[0, 0, minuteRotation]}>
        <boxGeometry args={[0.018, 0.18, 0.01]} />
        <meshBasicMaterial color="#654222" />
      </mesh>
      <mesh position={[0, 0, 0.045]} rotation={[0, 0, hourRotation]}>
        <boxGeometry args={[0.022, 0.12, 0.01]} />
        <meshBasicMaterial color="#654222" />
      </mesh>
    </group>
  )
}

function NotebookDetail({ opacity }: { opacity: number }) {
  return (
    <group>
      <mesh position={[0.6, 0.945, -0.35]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[0.45, 0.015, 0.55]} />
        <meshStandardMaterial color="#f8f4ec" transparent opacity={opacity} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0.6, 0.96, -0.20 + i * 0.09]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.39, 0.0025, 0.005]} />
          <meshBasicMaterial color="#9cb7e6" transparent opacity={0.45 * opacity} />
        </mesh>
      ))}
      <group position={[0.44, 0.956, -0.11]} scale={[opacity, opacity, opacity]}>
        <mesh position={[-0.02, 0, 0]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#e8678a" />
        </mesh>
        <mesh position={[0.02, 0, 0]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#e8678a" />
        </mesh>
        <mesh position={[0, -0.032, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.038, 0.038, 0.005]} />
          <meshBasicMaterial color="#e8678a" />
        </mesh>
      </group>
    </group>
  )
}

export default function SceneAssignment({ sceneTime }: Props) {
  const introBeat = sceneTime < 32
  const deskFade = sceneTime < 28 ? 0 : Math.min(1, (sceneTime - 28) / 4)
  const nilakshiX = sceneTime < 5 ? 4.2 : 4.2 - Math.min((sceneTime - 5) / 10, 1) * 3.1
  const radhikaIntroX = sceneTime < 5 ? 5.1 : 5.1 - Math.min((sceneTime - 5) / 10, 1) * 3.25
  const sunbeamOpacity = 0.05 + ((Math.sin(sceneTime * 1.4) + 1) / 2) * 0.07

  const sahilIntroAction = sceneTime < 5 ? 'idle' : sceneTime < 10 ? 'idleconfident' : sceneTime < 28 ? 'shy' : 'idle'
  const radhikaIntroAction = sceneTime < 8 ? 'walk' : 'idle'
  const nilakshiAction = sceneTime < 12 ? 'wave' : 'idle'
  const radhikaDeskAction = sceneTime < 52 ? 'sitwrite' : 'sitidle'
  const sahilDeskAction = sceneTime < 60 ? 'sitnervous' : 'sitidle'

  const BENCH_Y = 0.48

  return (
    <group>
      <color attach="background" args={['#3d1f0a']} />
      <fog attach="fog" args={['#2a1205', 8, 22]} />

      <ambientLight color="#ffe4b5" intensity={1.2} />
      <directionalLight position={[-3, 5, 2]} color="#ffd28f" intensity={1.8} castShadow />
      <directionalLight position={[3, 3, 1]} color="#fff0d0" intensity={0.9} />
      <pointLight position={[0, 3, -3]} color="#ffaa44" intensity={1} distance={8} />
      <pointLight position={[0, -0.5, 1]} color="#c87a30" intensity={0.4} distance={5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 22]} />
        <meshStandardMaterial color="#a0622a" roughness={0.58} />
      </mesh>
      <mesh position={[0, 5, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color="#f6ead9" />
      </mesh>
      <mesh position={[0, 3, -5]}>
        <boxGeometry args={[18, 8, 0.2]} />
        <meshStandardMaterial color="#f5e6cc" roughness={0.9} />
      </mesh>
      <mesh position={[-8, 3, -1]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 8, 0.2]} />
        <meshStandardMaterial color="#edd9b8" roughness={0.9} />
      </mesh>

      {[-4, 0, 4].map((x) => (
        <group key={x} position={[x, 3.2, -4.85]}>
          <mesh>
            <boxGeometry args={[2.2, 3.2, 0.08]} />
            <meshStandardMaterial color="#c8a870" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[1.9, 2.85, 0.04]} />
            <meshStandardMaterial color="#ffe090" transparent opacity={0.55} emissive="#ffd060" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      <mesh position={[-3.8, 2.6, -2.2]} rotation={[0.18, 0.15, -0.55]}>
        <boxGeometry args={[0.55, 4.2, 0.16]} />
        <meshBasicMaterial color="#ffe4a0" transparent opacity={sunbeamOpacity} />
      </mesh>

      <mesh position={[0, 2.8, -4.82]}>
        <boxGeometry args={[5.5, 2, 0.06]} />
        <meshStandardMaterial color="#2d5a3d" roughness={0.95} />
      </mesh>

      {[-2.4, 0, 2.4].flatMap((x) =>
        [-2.2, -3.4, -4.6].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[1.2, 0.06, 0.65]} />
              <meshStandardMaterial color="#715239" roughness={0.72} />
            </mesh>
            <mesh position={[0, 0.42, 0.25]}>
              <boxGeometry args={[1.05, 0.05, 0.45]} />
              <meshStandardMaterial color="#6b4a30" roughness={0.78} />
            </mesh>
          </group>
        )),
      )}

      <WallClock sceneTime={sceneTime} />

      {introBeat ? (
        <group>
          <Figure variant="sahil" action={sahilIntroAction} position={[-1.1, 0, 1.5]} rotation={[0, Math.PI * 0.06, 0]} blush={sceneTime > 10} />
          <Figure variant="nilakshi" action={nilakshiAction} position={[nilakshiX, 0, 1.7]} rotation={[0, -Math.PI * 0.18, 0]} />
          <Figure variant="radhika" action={radhikaIntroAction} position={[radhikaIntroX, 0, 1.95]} rotation={[0, -Math.PI * 0.15, 0]} />
        </group>
      ) : null}

      {sceneTime >= 28 ? (
        <group>
          <mesh position={[0, BENCH_Y, 0.6]} receiveShadow castShadow>
            <boxGeometry args={[2.4, 0.07, 0.55]} />
            <meshStandardMaterial color="#9b6b3a" roughness={0.65} transparent opacity={deskFade} />
          </mesh>
          {([
            [-1, 0.24, 0.42],
            [1, 0.24, 0.42],
            [-1, 0.24, 0.78],
            [1, 0.24, 0.78],
          ] as [number, number, number][]).map(([x, y, z]) => (
            <mesh key={`leg-${x}-${z}`} position={[x, y, z]}>
              <boxGeometry args={[0.08, 0.48, 0.08]} />
              <meshStandardMaterial color="#7a4f25" transparent opacity={deskFade} />
            </mesh>
          ))}

          <mesh position={[0, 0.9, -0.35]} receiveShadow castShadow>
            <boxGeometry args={[2.6, 0.07, 0.9]} />
            <meshStandardMaterial color="#8b5e3c" roughness={0.55} transparent opacity={deskFade} />
          </mesh>
          {([
            [-1.1, 0.45, -0.15],
            [1.1, 0.45, -0.15],
            [-1.1, 0.45, -0.75],
            [1.1, 0.45, -0.75],
          ] as [number, number, number][]).map(([x, y, z]) => (
            <mesh key={`desk-${x}-${z}`} position={[x, y, z]}>
              <boxGeometry args={[0.08, 0.9, 0.08]} />
              <meshStandardMaterial color="#6b4423" transparent opacity={deskFade} />
            </mesh>
          ))}

          <NotebookDetail opacity={deskFade} />
          <mesh position={[0.55, 0.95, -0.12]} rotation={[0, 0.3, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.28, 6]} />
            <meshStandardMaterial color="#2244aa" transparent opacity={deskFade} />
          </mesh>

          <Figure variant="sahil" action={sahilDeskAction} position={[-0.75, 0, 0.6]} rotation={[0, 0.15, 0]} blush={sceneTime > 50} benchOffsetY={BENCH_Y} />
          <Figure variant="radhika" action={radhikaDeskAction} position={[0.75, 0, 0.6]} rotation={[0, -0.15, 0]} blush={sceneTime > 58} benchOffsetY={BENCH_Y} />
        </group>
      ) : null}

      <DustField sceneTime={sceneTime} />
      <Sparkles count={36} scale={[10, 5, 7]} size={1.8} color="#ffd890" speed={0.15} />
    </group>
  )
}
