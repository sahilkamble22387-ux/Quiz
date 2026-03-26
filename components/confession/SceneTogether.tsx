import { useMemo } from 'react'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import Figure from './Figure'

type Props = {
  sceneTime: number
}

export default function SceneTogether({ sceneTime }: Props) {
  const moment = sceneTime < 14 ? 1 : sceneTime < 28 ? 2 : sceneTime < 42 ? 3 : 4

  return (
    <group>
      {moment === 1 ? <TogetherChai sceneTime={sceneTime} /> : null}
      {moment === 2 ? <TogetherWalk sceneTime={sceneTime - 14} /> : null}
      {moment === 3 ? <TogetherStudy sceneTime={sceneTime - 28} /> : null}
      {moment === 4 ? <TogetherRoom sceneTime={sceneTime - 42} /> : null}
    </group>
  )
}

function Plant({ x, z }: { x: number; z: number }) {
  const leaves = useMemo(
    () => [
      [0, 0.82, 0],
      [-0.12, 0.72, 0.05],
      [0.12, 0.7, -0.04],
      [0.04, 0.96, 0.08],
    ],
    [],
  )

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.44, 10]} />
        <meshStandardMaterial color="#7e4b31" />
      </mesh>
      {leaves.map(([px, py, pz], index) => (
        <mesh key={index} position={[px, py, pz]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#658f47' : '#4f7638'} />
        </mesh>
      ))}
    </group>
  )
}

function StringLights({ sceneTime }: { sceneTime: number }) {
  const bulbs = useMemo(() => Array.from({ length: 12 }, (_, index) => index), [])

  return (
    <group>
      {bulbs.map((index) => (
        <group key={index} position={[-3.3 + index * 0.6, 2.55 + Math.sin(sceneTime * 0.8 + index * 0.4) * 0.01, -2.1]}>
          <mesh>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#ffd090" />
          </mesh>
          <pointLight color="#ffe4a0" intensity={0.16} distance={0.8} />
        </group>
      ))}
    </group>
  )
}

function ChaiCup({ x }: { x: number }) {
  return (
    <group position={[x, 0.77, 0]}>
      <mesh>
        <cylinderGeometry args={[0.045, 0.038, 0.09, 10]} />
        <meshStandardMaterial color="#e8d5c0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.01, 10]} />
        <meshStandardMaterial color="#c17a3a" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.052, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.01, 14]} />
        <meshStandardMaterial color="#f0c0d0" roughness={0.5} />
      </mesh>
      <Sparkles count={5} scale={[0.06, 0.12, 0.06]} size={0.8} color="#ffffff" speed={0.4} position={[0, 0.08, 0]} />
    </group>
  )
}

function CafeStool({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.26, 0.24, 0.05, 18]} />
        <meshStandardMaterial color="#9b6b3a" />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.045, 0.055, 0.42, 10]} />
        <meshStandardMaterial color="#7a4f25" />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 18]} />
        <meshStandardMaterial color="#6d4528" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
        <torusGeometry args={[0.18, 0.015, 8, 28]} />
        <meshStandardMaterial color="#8d623f" />
      </mesh>
    </group>
  )
}

function TogetherChai({ sceneTime }: { sceneTime: number }) {
  const turnPhase = Math.floor(sceneTime / 6) % 2
  const sahilLook = turnPhase === 0 ? 0.35 : 0.12
  const radhikaLook = turnPhase === 1 ? -0.35 : -0.12

  return (
    <group>
      <color attach="background" args={['#f5deb3']} />
      <ambientLight color="#fff0cc" intensity={1.1} />
      <directionalLight position={[-3, 6, 3]} color="#ffd080" intensity={1.5} castShadow />
      <directionalLight position={[3, 3, 1]} color="#fff0e0" intensity={0.6} />
      <pointLight position={[0, 2.5, -1]} color="#ffe4a0" intensity={0.6} distance={7} />
      <pointLight position={[0, 0.9, 0]} color="#ff9040" intensity={0.8} distance={2.5} />
      <spotLight position={[-4, 3, 1]} color="#ffd080" intensity={0.8} angle={0.45} penumbra={0.95} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#c8a87a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.6, -3]}>
        <boxGeometry args={[8, 3.6, 0.2]} />
        <meshStandardMaterial color="#d4805a" />
      </mesh>
      <mesh position={[-4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6, 3.6, 0.2]} />
        <meshStandardMaterial color="#d4805a" />
      </mesh>
      <mesh position={[4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6, 3.6, 0.2]} />
        <meshStandardMaterial color="#d4805a" />
      </mesh>
      <mesh position={[-3.95, 1.7, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.5, 2.4, 0.08]} />
        <meshStandardMaterial color="#fff3dc" emissive="#ffd090" emissiveIntensity={0.25} transparent opacity={0.6} />
      </mesh>

      <StringLights sceneTime={sceneTime} />
      <Plant x={-3.1} z={-2} />
      <Plant x={3.1} z={-2} />

      <mesh position={[0, 1.6, -2.9]}>
        <boxGeometry args={[1.8, 0.85, 0.04]} />
        <meshStandardMaterial color="#3b2d24" />
      </mesh>
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[0, 1.85 - row * 0.24, -2.86]}>
          <boxGeometry args={[1.2, 0.025, 0.01]} />
          <meshBasicMaterial color="#eacb7d" />
        </mesh>
      ))}

      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshStandardMaterial color="#f5e6cc" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.72, 8]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      <group position={[0.05, 0.76, 0]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.018, 0.1, 8]} />
          <meshStandardMaterial color="#f5f0e0" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <coneGeometry args={[0.012, 0.04, 6]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.085, 0]}>
          <coneGeometry args={[0.006, 0.028, 5]} />
          <meshBasicMaterial color="#ffff80" />
        </mesh>
        <pointLight position={[0, 0.12, 0]} color="#ff8c20" intensity={0.6} distance={1.8} />
      </group>

      <CafeStool x={-0.85} />
      <CafeStool x={0.85} />

      <ChaiCup x={-0.22} />
      <ChaiCup x={0.22} />

      <Figure variant="sahil" action="sitidle" position={[-0.85, -0.18, 0]} rotation={[0, 0.15, 0]} blush={sceneTime > 4} headYOverride={sahilLook} />
      <Figure variant="radhika" action="sitidle" position={[0.85, -0.18, 0]} rotation={[0, -0.15, 0]} headYOverride={radhikaLook} />

      <Sparkles count={12} scale={[8, 4, 6]} size={1.25} color="#ffd890" speed={0.08} />
    </group>
  )
}

function TogetherWalk({ sceneTime }: { sceneTime: number }) {
  const handReach = sceneTime > 6 ? Math.min((sceneTime - 6) / 4, 1) : 0
  const stones = useMemo(
    () =>
      Array.from({ length: 52 }, (_, index) => ({
        x: ((index % 4) - 1.5) * 0.95,
        z: -12 + Math.floor(index / 4) * 0.85,
        y: ((index % 3) - 1) * 0.005,
      })),
    [],
  )

  return (
    <group>
      <color attach="background" args={['#ff8c42']} />
      <fog attach="fog" args={['#ffa854', 8, 20]} />
      <ambientLight color="#ffc090" intensity={1.2} />
      <directionalLight position={[8, 1.5, -8]} color="#ff7040" intensity={2.5} castShadow />
      <directionalLight position={[-4, 2, 2]} color="#8090d0" intensity={0.3} />
      <pointLight position={[0, -0.5, -12]} color="#ff8040" intensity={3} distance={30} />

      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[18, 24, 24]} />
        <meshBasicMaterial color="#ff9a5c" side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, -0.6, -12]}>
        <sphereGeometry args={[1.1, 18, 18]} />
        <meshBasicMaterial color="#ffd54f" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0, 0]}>
        <planeGeometry args={[6, 30]} />
        <meshStandardMaterial color="#7a9a40" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0, 0]}>
        <planeGeometry args={[6, 30]} />
        <meshStandardMaterial color="#7a9a40" roughness={0.9} />
      </mesh>

      {stones.map((stone, index) => (
        <mesh key={index} position={[stone.x, stone.y, stone.z + sceneTime * 0.16]}>
          <boxGeometry args={[0.9, 0.03, 0.72]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#c8a870' : '#b89060'} roughness={0.88} />
        </mesh>
      ))}

      {[-3, 0, 3, 6, 9].map((z, i) => (
        <group key={z}>
          {[-2.2, 2.2].map((x) => (
            <group key={`${x}-${z}`} position={[x, 0, z - sceneTime * 0.09]}>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.08, 0.12, 1, 6]} />
                <meshStandardMaterial color="#5a3820" />
              </mesh>
              <mesh position={[0, 1.8, 0]}>
                <coneGeometry args={[0.55, 1.4, 7]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#4a7a2a' : '#5a8a32'} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      <mesh position={[1.8, 0.32, -6]}>
        <boxGeometry args={[0.8, 0.08, 0.28]} />
        <meshStandardMaterial color="#7a5534" />
      </mesh>
      <mesh position={[1.55, 0.28, -6]}>
        <boxGeometry args={[0.08, 0.56, 0.08]} />
        <meshStandardMaterial color="#7a5534" />
      </mesh>
      <mesh position={[2.05, 0.28, -6]}>
        <boxGeometry args={[0.08, 0.56, 0.08]} />
        <meshStandardMaterial color="#7a5534" />
      </mesh>

      {Array.from({ length: 20 }).map((_, index) => (
        <mesh key={index} position={[-2.6 + (index % 5) * 1.1, 1.2 + Math.sin(sceneTime + index) * 0.12, -4 + Math.floor(index / 5) * 1.2]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#d7ff72" transparent opacity={0.35 + Math.sin(sceneTime * 1.5 + index) * 0.18} />
        </mesh>
      ))}

      <Figure variant="sahil" action="walk" position={[-0.32, 0, 1.5]} blush={sceneTime > 5} rightArmZOverride={-0.12 + handReach * 0.18} />
      <Figure variant="radhika" action="walk" position={[0.32, 0, 1.5]} />

      <Sparkles count={25} scale={[6, 3, 6]} size={1.6} color="#ffd060" speed={0.2} />
    </group>
  )
}

function TogetherStudy({ sceneTime }: { sceneTime: number }) {
  const chaiAppear = sceneTime > 8 ? Math.min((sceneTime - 8) / 3, 1) : 0
  const charSitY = 0.52 - 0.64
  const chaiX = THREE.MathUtils.lerp(-0.15, 0.28, chaiAppear)
  const radhikaLook = sceneTime > 11 ? 0.3 * Math.max(0, 1 - (sceneTime - 11) / 2.2) : 0
  const cityLights = useMemo(() => Array.from({ length: 8 }, (_, index) => index), [])
  const shelfBooks = useMemo(() => Array.from({ length: 6 }, (_, index) => index), [])

  return (
    <group>
      <color attach="background" args={['#0d0a1a']} />
      <fog attach="fog" args={['#0d0a1a', 6, 16]} />
      <ambientLight color="#050508" intensity={0.4} />
      <pointLight position={[0.2, 1.8, 0.2]} color="#ffb347" intensity={3} distance={3.5} castShadow />
      <pointLight position={[0, 2, -5]} color="#1a2a50" intensity={0.2} distance={8} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2, -4]}>
        <boxGeometry args={[8, 4, 0.2]} />
        <meshStandardMaterial color="#15111d" />
      </mesh>
      <mesh position={[0, 2.4, -3.9]}>
        <boxGeometry args={[2.8, 1.5, 0.05]} />
        <meshStandardMaterial color="#25344f" emissive="#1a2a50" emissiveIntensity={0.15} transparent opacity={0.55} />
      </mesh>
      {cityLights.map((index) => (
        <pointLight
          key={index}
          position={[-1.1 + (index % 5) * 0.55, 2 + Math.floor(index / 5) * 0.4, -4.1]}
          color="#ffcc88"
          intensity={0.08 + Math.sin(sceneTime + index) * 0.04}
          distance={0.5}
        />
      ))}

      <mesh position={[-2.6, 1.55, -2.5]}>
        <boxGeometry args={[1.4, 2.2, 0.24]} />
        <meshStandardMaterial color="#2a232f" />
      </mesh>
      {shelfBooks.map((index) => (
        <mesh key={index} position={[-2.6 + ((index % 2) - 0.5) * 0.38, 0.7 + Math.floor(index / 2) * 0.42, -2.35]}>
          <boxGeometry args={[0.22, 0.28, 0.08]} />
          <meshStandardMaterial color={['#6b3c3c', '#314f7e', '#35613d', '#8a6d30'][index % 4]} />
        </mesh>
      ))}

      <mesh position={[0, 0.88, -0.5]} receiveShadow castShadow>
        <boxGeometry args={[2.8, 0.07, 1]} />
        <meshStandardMaterial color="#5a3820" roughness={0.6} />
      </mesh>
      <group position={[0.2, 0.92, -0.2]}>
        <mesh><cylinderGeometry args={[0.04, 0.06, 0.06, 8]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
        <mesh position={[0, 0.28, 0.12]} rotation={[0.6, 0, 0]}><coneGeometry args={[0.12, 0.18, 10, 1, true]} /><meshStandardMaterial color="#c8b040" side={2} emissive="#ffd060" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.015, 0.015, 0.28, 6]} /><meshStandardMaterial color="#3a3a3a" /></mesh>
      </group>
      <group position={[1.7, 2.9, -3.8]}>
        <mesh><cylinderGeometry args={[0.3, 0.3, 0.04, 20]} /><meshStandardMaterial color="#f4e7d2" /></mesh>
        <mesh position={[0, 0.1, 0.03]} rotation={[0, 0, -1.2]}><boxGeometry args={[0.02, 0.2, 0.01]} /><meshBasicMaterial color="#4c3729" /></mesh>
        <mesh position={[0, 0.05, 0.035]} rotation={[0, 0, 1.1]}><boxGeometry args={[0.018, 0.12, 0.01]} /><meshBasicMaterial color="#4c3729" /></mesh>
      </group>

      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.6, 0.924 + i * 0.028, -0.6]} rotation={[0, i * 0.06 - 0.06, 0]}>
          <boxGeometry args={[0.38, 0.028, 0.5]} />
          <meshStandardMaterial color={['#1a3a6a', '#8b2020', '#1a5a2a'][i]} />
        </mesh>
      ))}

      <group position={[-0.55, 0.92, -0.5]}>
        <mesh><boxGeometry args={[0.42, 0.02, 0.3]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
        <mesh position={[0, 0.11, -0.14]} rotation={[-1.1, 0, 0]}><boxGeometry args={[0.42, 0.02, 0.28]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <pointLight position={[0, 0.14, -0.14]} color="#b8d4ff" intensity={0.3} distance={1.5} />
      </group>

      <group position={[chaiX, 0.77, -0.45]}>
        <mesh><cylinderGeometry args={[0.04, 0.034, 0.08, 10]} /><meshStandardMaterial color="#e8d5c0" /></mesh>
        <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.034, 0.034, 0.008, 10]} /><meshStandardMaterial color="#c17a3a" /></mesh>
        {chaiAppear > 0.8 ? <Sparkles count={4} scale={[0.05, 0.1, 0.05]} size={0.7} color="#ffffff" speed={0.4} position={[0, 0.06, 0]} /> : null}
      </group>

      <mesh position={[0, 0.52, 0.3]}><boxGeometry args={[2.5, 0.07, 0.55]} /><meshStandardMaterial color="#4a3020" roughness={0.8} /></mesh>

      <Figure variant="sahil" action="sitidle" position={[-0.72, charSitY, 0.55]} rotation={[0, 0.1, 0]} blush={sceneTime > 6} benchOffsetY={0} rightArmXOverride={sceneTime > 8 ? 0.22 : undefined} />
      <Figure variant="radhika" action="sitwrite" position={[0.72, charSitY, 0.55]} rotation={[0, -0.1, 0]} benchOffsetY={0} headYOverride={radhikaLook} />
    </group>
  )
}

function HeartPlane({ y, opacity, pulse }: { y: number; opacity: number; pulse: number }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const points = Array.from({ length: 140 }, (_, index) => {
      const t = (index / 139) * Math.PI * 2
      const x = 1.2 * 16 * Math.pow(Math.sin(t), 3) / 16
      const yPoint = 1.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16
      return new THREE.Vector2(x * 1.2, yPoint * 1.15)
    })
    s.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach((point) => s.lineTo(point.x, point.y))
    s.closePath()
    return new THREE.ShapeGeometry(s)
  }, [])

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={shape} scale={pulse}>
      <meshStandardMaterial color="#ff6b9d" emissive="#ff6b9d" emissiveIntensity={0.35} transparent opacity={opacity} />
    </mesh>
  )
}

function TogetherRoom({ sceneTime }: { sceneTime: number }) {
  const lookAtEach = sceneTime > 10 ? Math.min((sceneTime - 10) / 3, 1) : 0
  const stepIn = sceneTime > 14 ? Math.min((sceneTime - 14) / 3, 1) : 0
  const pulse = 1 + Math.sin(sceneTime * 2) * 0.03
  const sahilX = -0.4 + stepIn * 0.12
  const radhikaX = 0.4 - stepIn * 0.12
  const orbConfigs = useMemo(
    () => [
      { radius: 3.5, height: 1.2, speed: 0.018, color: '#afa9ec' },
      { radius: 4, height: 1.5, speed: 0.014, color: '#9fe1cb' },
      { radius: 3.2, height: 1.8, speed: 0.022, color: '#fac775' },
      { radius: 4.5, height: 1, speed: 0.011, color: '#d9e8ff' },
    ],
    [],
  )
  const petals = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        x: ((index % 5) - 2) * 0.75,
        z: -1 + Math.floor(index / 5) * 0.5,
        phase: index * 0.09,
      })),
    [],
  )

  return (
    <group>
      <color attach="background" args={['#1a0a14']} />
      <ambientLight color="#ffd6e0" intensity={1} />
      <spotLight position={[0, 5, 3]} color="#ffd28f" intensity={2} angle={0.4} penumbra={0.7} castShadow />
      <pointLight position={[-3, 2, 1]} color="#ff6b9d" intensity={0.6} distance={7} />
      <pointLight position={[3, 2, 1]} color="#ffaa44" intensity={0.6} distance={7} />

      <HeartPlane y={0.01} opacity={0.42} pulse={pulse} />
      <HeartPlane y={5} opacity={0.2} pulse={pulse * 0.98} />

      {orbConfigs.map((orb, index) => {
        const angle = sceneTime * 2 * orb.speed + index * 1.5
        return (
          <mesh key={index} position={[Math.sin(angle) * orb.radius, orb.height, Math.cos(angle) * orb.radius]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color={orb.color} emissive={orb.color} emissiveIntensity={0.5} transparent opacity={0.82} />
          </mesh>
        )
      })}

      {petals.map((petal, index) => {
        const cycle = (sceneTime * 0.18 + petal.phase) % 1
        return (
          <mesh key={index} position={[petal.x, 6 - cycle * 6, petal.z]} rotation={[cycle * 4, 0, cycle * 6]}>
            <circleGeometry args={[0.05, 10]} />
            <meshBasicMaterial color="#e8507a" transparent opacity={0.7} side={2} />
          </mesh>
        )
      })}

      <Sparkles count={90} scale={[6, 6, 5]} size={1} color="#ffd28f" speed={0.04} />

      <Figure variant="sahil" action="idleconfident" position={[sahilX, 0, 0]} rotation={[0, 0, 0]} blush headYOverride={0.35 * lookAtEach} />
      <Figure variant="radhika" action="idle" position={[radhikaX, 0, 0]} rotation={[0, 0, 0]} blush headYOverride={-0.35 * lookAtEach} />
    </group>
  )
}
