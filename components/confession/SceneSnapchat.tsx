import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import Figure from './Figure'

type Props = {
  sceneTime: number
}

const SAHIL_MESSAGES = ['👀', 'look', 'haha 😭', 'finally', 'okay okay', '😊', 'send more']
const RADHIKA_MESSAGES = ['lol', '😂', 'what', 'haha', 'omg', 'stop 😂']

function createBubbleTexture(text: string, tone: string, timerTone: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 196
  const ctx = canvas.getContext('2d')!

  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawRoundedRect(12, 12, 488, 172, 44)
  ctx.fillStyle = tone
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 4
  ctx.stroke()

  drawRoundedRect(366, 26, 108, 34, 17)
  ctx.fillStyle = timerTone
  ctx.fill()

  ctx.fillStyle = '#fff8ff'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('3s', 420, 43)

  ctx.fillStyle = '#ffffff'
  ctx.font = '600 40px sans-serif'
  ctx.fillText(text, 256, 104)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function Platform({ x, colors }: { x: number; colors: { base: string; glow: string; rim: string; top: string } }) {
  return (
    <group position={[x, -0.86, 0]}>
      <mesh>
        <cylinderGeometry args={[1.18, 1.06, 0.16, 32]} />
        <meshStandardMaterial color={colors.base} emissive={colors.base} emissiveIntensity={0.22} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[1.06, 1.02, 0.035, 32]} />
        <meshStandardMaterial color={colors.top} emissive={colors.top} emissiveIntensity={0.12} roughness={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <torusGeometry args={[1.02, 0.028, 12, 48]} />
        <meshBasicMaterial color={colors.rim} transparent opacity={0.76} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} scale={[1.35, 1.35, 1]}>
        <circleGeometry args={[0.92, 32]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.18} />
      </mesh>
      <pointLight position={[0, -0.05, 0]} color={colors.glow} intensity={0.9} distance={2.7} />
    </group>
  )
}

function StarField() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(84 * 3)
    const colors = new Float32Array(84 * 3)
    for (let index = 0; index < 84; index += 1) {
      const angle = index * 1.47
      const radius = 8 + (index % 12) * 0.55
      const i = index * 3
      positions[i] = Math.cos(angle) * radius
      positions[i + 1] = Math.sin(angle * 1.4) * 4.8
      positions[i + 2] = Math.sin(angle * 0.8) * radius
      const color = new THREE.Color(index % 3 === 0 ? '#d4c0ff' : '#ffd6e0')
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.72} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function MessageThread({ sceneTime }: { sceneTime: number }) {
  const textures = useMemo(() => {
    const mapped = new Map<string, THREE.CanvasTexture>()
    SAHIL_MESSAGES.forEach((message) => mapped.set(`s:${message}`, createBubbleTexture(message, '#5b8ef0', '#7cabff')))
    RADHIKA_MESSAGES.forEach((message) => mapped.set(`r:${message}`, createBubbleTexture(message, '#e8507a', '#ff87aa')))
    return mapped
  }, [])

  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => {
        const cycle = 4.1
        const progress = ((sceneTime - index * 1.08) % cycle + cycle) % cycle / cycle
        const fromRadhika = index % 4 === 2
        const startX = fromRadhika ? 2.85 : -2.85
        const endX = fromRadhika ? -2.85 : 2.85
        const x = THREE.MathUtils.lerp(startX, endX, progress)
        const y = 0.25 + Math.sin(progress * Math.PI) * 0.68
        const z = Math.sin(progress * Math.PI * 2 + index) * 0.22
        const fade = progress < 0.12 ? progress / 0.12 : progress > 0.88 ? (1 - progress) / 0.12 : 1
        const scale = 0.72 + fade * 0.22
        const message = fromRadhika ? RADHIKA_MESSAGES[index % RADHIKA_MESSAGES.length] : SAHIL_MESSAGES[index % SAHIL_MESSAGES.length]
        const key = `${fromRadhika ? 'r' : 's'}:${message}`
        const tone = fromRadhika ? '#f18aae' : '#7cabff'

        return (
          <group key={index} position={[x, y, z]} rotation={[0, fromRadhika ? -0.18 : 0.18, 0]} scale={scale}>
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[1.02, 0.42]} />
              <meshBasicMaterial color={tone} transparent opacity={0.14 * fade} />
            </mesh>
            <mesh>
              <planeGeometry args={[0.94, 0.36]} />
              <meshBasicMaterial map={textures.get(key)} transparent opacity={fade} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.26, 0]} scale={0.05 + fade * 0.02}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial color="#ffd7ea" transparent opacity={0.45 * fade} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function ThreadLights({ sceneTime }: { sceneTime: number }) {
  const nodes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        progress: index / 11,
        color: index % 3 === 0 ? '#ffb6d4' : '#b8d4ff',
      })),
    [],
  )

  return (
    <>
      {nodes.map((node, index) => {
        const progress = node.progress
        const x = THREE.MathUtils.lerp(-2.7, 2.7, progress)
        const y = 0.04 + Math.sin(progress * Math.PI) * 0.28
        const pulse = 0.28 + Math.max(0, Math.sin(sceneTime * 2.2 - index * 0.55)) * 0.55
        return (
          <mesh key={index} position={[x, y, 0]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshBasicMaterial color={node.color} transparent opacity={pulse} />
          </mesh>
        )
      })}
    </>
  )
}

function SnapGhost({ sceneTime }: { sceneTime: number }) {
  const yBob = 1.78 + Math.sin(sceneTime * 0.85) * 0.05
  return (
    <group position={[0, yBob, 0]} rotation={[0, sceneTime * 0.22, 0]} scale={0.15}>
      <mesh scale={[1, 1.1, 0.9]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#fffc00" />
      </mesh>
      <mesh position={[-0.48, -0.84, 0]}>
        <sphereGeometry args={[0.26, 10, 10]} />
        <meshBasicMaterial color="#fffc00" />
      </mesh>
      <mesh position={[0.48, -0.84, 0]}>
        <sphereGeometry args={[0.26, 10, 10]} />
        <meshBasicMaterial color="#fffc00" />
      </mesh>
      <mesh position={[0, -0.98, 0.02]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshBasicMaterial color="#1a0a2e" />
      </mesh>
      <mesh position={[-0.25, 0.16, 0.82]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshBasicMaterial color="#1a0a2e" />
      </mesh>
      <mesh position={[0.25, 0.16, 0.82]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshBasicMaterial color="#1a0a2e" />
      </mesh>
      <mesh position={[0, -0.08, 0.85]} rotation={[0, 0, -0.08]}>
        <torusGeometry args={[0.18, 0.026, 8, 20, Math.PI]} />
        <meshBasicMaterial color="#1a0a2e" />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#fffc00" intensity={0.38} distance={2.6} />
    </group>
  )
}

function PlatformGlow({ x, color, sceneTime }: { x: number; color: string; sceneTime: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const positions = new Float32Array(32 * 3)
    for (let index = 0; index < 32; index += 1) {
      const angle = (index / 32) * Math.PI * 2
      const radius = 0.48 + (index % 5) * 0.04
      const i = index * 3
      positions[i] = Math.cos(angle) * radius
      positions[i + 1] = -0.14 + (index % 4) * 0.03
      positions[i + 2] = Math.sin(angle) * radius
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = sceneTime * 0.12
  })

  return (
    <points ref={pointsRef} geometry={geometry} position={[x, -0.72, 0]}>
      <pointsMaterial color={color} size={0.08} transparent opacity={0.34} sizeAttenuation depthWrite={false} />
    </points>
  )
}

export default function SceneSnapchat({ sceneTime }: Props) {
  const sahilBob = Math.sin(sceneTime * 1.05) * 0.035
  const radhikaBob = Math.sin(sceneTime * 1.05 + 1.2) * 0.035
  const beat = Math.floor(sceneTime / 6) % 3
  const sahilAction = beat === 1 ? 'lookAround' : 'idlePhone'
  const radhikaAction = beat === 2 ? 'lookAround' : 'idlePhone'

  return (
    <group>
      <color attach="background" args={['#1a0a2e']} />
      <ambientLight color="#d4a0ff" intensity={0.78} />
      <pointLight position={[-3.5, -0.8, 0]} color="#88aaff" intensity={1.2} distance={4} />
      <pointLight position={[3.5, -0.8, 0]} color="#ffb0d0" intensity={1.2} distance={4} />
      <pointLight position={[0, 0.4, 0]} color="#ffd6ff" intensity={0.45} distance={6} />

      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[16, 30, 30]} />
        <meshBasicMaterial color="#1a0a2e" side={THREE.BackSide} />
      </mesh>

      <StarField />

      <Platform x={-3.55} colors={{ base: '#48507f', glow: '#88aaff', rim: '#9bb2ff', top: '#59649a' }} />
      <Platform x={3.55} colors={{ base: '#7a4363', glow: '#ffb0d0', rim: '#ff9cc1', top: '#915475' }} />
      <PlatformGlow x={-3.55} color="#88aaff" sceneTime={sceneTime} />
      <PlatformGlow x={3.55} color="#ffb0d0" sceneTime={sceneTime} />

      <ThreadLights sceneTime={sceneTime} />
      <MessageThread sceneTime={sceneTime} />

      <Figure
        variant="sahil"
        action={sahilAction}
        holdingPhone
        position={[-3.55, -0.76 + sahilBob, 0.08]}
        rotation={[0, -0.42, 0]}
        scale={[0.54, 0.54, 0.54]}
        blush
      />
      <Figure
        variant="radhika"
        action={radhikaAction}
        holdingPhone
        position={[3.55, -0.76 + radhikaBob, 0.08]}
        rotation={[0, 0.42, 0]}
        scale={[0.54, 0.54, 0.54]}
      />

      <pointLight position={[-3.35, 0.05, 0.45]} color="#ffe090" intensity={0.32} distance={1.5} />
      <pointLight position={[3.35, 0.05, 0.45]} color="#ffe4c0" intensity={0.32} distance={1.5} />

      <SnapGhost sceneTime={sceneTime} />
      <Sparkles count={34} scale={[14, 8, 14]} size={1.1} color="#ffd6e0" speed={0.05} />
    </group>
  )
}
