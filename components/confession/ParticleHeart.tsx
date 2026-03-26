import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

type Props = {
  count?: number
  size?: number
  color?: string
  upwardSpeed?: number
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

export default function ParticleHeart({
  count = 320,
  size = 0.02,
  color = '#FF6B9D',
  upwardSpeed = 0.001,
}: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const frameRef = useRef(0)
  const positions = useMemo(() => {
    const random = seededRandom(42)
    const data = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      const i = index * 3
      data[i] = (random() - 0.5) * 18
      data[i + 1] = (random() - 0.5) * 10
      data[i + 2] = (random() - 0.5) * 14
    }

    return data
  }, [count])

  useFrame(() => {
    if (!pointsRef.current) return
    frameRef.current += 1
    if (frameRef.current % 2 !== 0) return

    const attribute = pointsRef.current.geometry.attributes.position
    const array = attribute.array as Float32Array
    for (let index = 1; index < array.length; index += 3) {
      const y = array[index] + upwardSpeed * 2
      array[index] = y > 5 ? -5 : y
    }
    attribute.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}
