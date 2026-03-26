import { useMemo } from 'react'
import { PointMaterial, Points } from '@react-three/drei'
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

function heartPoint(t: number): [number, number] {
  const x = 1.2 * 16 * Math.pow(Math.sin(t), 3) / 16
  const y = 1.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16
  return [x, y]
}

function HeartTunnelPoints({
  positions,
  opacity,
  zOffset = 0,
}: {
  positions: Float32Array
  opacity: number
  zOffset?: number
}) {
  return (
    <group position={[0, 0, zOffset]}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          color="#FF6B9D"
          size={0.08}
          transparent
          opacity={opacity}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

export default function ScenePortal({ sceneTime }: Props) {
  const tunnelPositions = useMemo(() => {
    const random = seededRandom(11)
    const sliceCount = 18
    const pointsPerSlice = 112
    const positions = new Float32Array(sliceCount * pointsPerSlice * 3)

    for (let slice = 0; slice < sliceCount; slice += 1) {
      const sliceProgress = slice / (sliceCount - 1)
      const sliceZ = -4.4 + sliceProgress * 13.4
      const scale = 0.92 + sliceProgress * 0.82
      const verticalStretch = 0.92 + sliceProgress * 0.18

      for (let point = 0; point < pointsPerSlice; point += 1) {
        const t = (point / pointsPerSlice) * Math.PI * 2
        const [baseX, baseY] = heartPoint(t)
        const jitterScale = 0.03 + sliceProgress * 0.02
        const jitterX = (random() - 0.5) * jitterScale
        const jitterY = (random() - 0.5) * jitterScale
        const jitterZ = (random() - 0.5) * 0.08
        const index = (slice * pointsPerSlice + point) * 3

        positions[index] = baseX * scale + jitterX
        positions[index + 1] = baseY * scale * verticalStretch + jitterY
        positions[index + 2] = sliceZ + jitterZ
      }
    }

    return positions
  }, [])

  const starPositions = useMemo(() => {
    const random = seededRandom(23)
    const positions = new Float32Array(60 * 3)
    for (let index = 0; index < 60; index += 1) {
      const i = index * 3
      positions[i] = (random() - 0.5) * 16
      positions[i + 1] = (random() - 0.5) * 10
      positions[i + 2] = -9 - random() * 12
    }
    return positions
  }, [])

  const pulse = 1 + Math.sin(sceneTime * 2.2) * 0.04

  return (
    <group scale={pulse}>
      <color attach="background" args={['#0A0008']} />

      <pointLight position={[0, 0, 0]} color="#FF6B9D" intensity={2.2} distance={5.8} />
      <pointLight position={[0, 0, 7.2]} color="#FFD7E3" intensity={0.8} distance={6.5} />

      <HeartTunnelPoints positions={tunnelPositions} opacity={0.9} />
      <HeartTunnelPoints positions={tunnelPositions} opacity={0.3} zOffset={0.3} />
      <HeartTunnelPoints positions={tunnelPositions} opacity={0.2} zOffset={0.6} />
      <HeartTunnelPoints positions={tunnelPositions} opacity={0.1} zOffset={0.9} />

      <Points positions={starPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          color="#FFD6E0"
          size={0.015}
          transparent
          opacity={0.72}
          depthWrite={false}
          sizeAttenuation
        />
      </Points>
    </group>
  )
}
