import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import type { Vector3Tuple } from '../../lib/sceneConfig'

export type CameraRigHandle = {
  flyTo: (position: Vector3Tuple, target: Vector3Tuple, duration?: number, ease?: string) => void
}

type Props = {
  activePosition: Vector3Tuple
  activeTarget: Vector3Tuple
  duration?: number
  ease?: string
  onReady?: (handle: CameraRigHandle) => void
}

export default function CameraRig({
  activePosition,
  activeTarget,
  duration = 1.5,
  ease = 'power2.inOut',
  onReady,
}: Props) {
  const { camera } = useThree()
  const targetRef = useRef(new THREE.Vector3(...activeTarget))
  const lookRef = useRef(new THREE.Vector3(...activeTarget))
  const positionRef = useRef(new THREE.Vector3(...activePosition))
  const tweensRef = useRef<gsap.core.Tween[]>([])

  const handle = useMemo<CameraRigHandle>(
    () => ({
      flyTo: (position, target, nextDuration = duration, nextEase = ease) => {
        tweensRef.current.forEach((tween) => tween.kill())
        tweensRef.current = [
          gsap.to(positionRef.current, {
            x: position[0],
            y: position[1],
            z: position[2],
            duration: nextDuration,
            ease: nextEase,
          }),
          gsap.to(targetRef.current, {
            x: target[0],
            y: target[1],
            z: target[2],
            duration: nextDuration,
            ease: nextEase,
          }),
        ]
      },
    }),
    [duration, ease],
  )

  useEffect(() => {
    onReady?.(handle)
  }, [handle, onReady])

  useEffect(() => {
    handle.flyTo(activePosition, activeTarget, duration, ease)
  }, [activePosition, activeTarget, duration, ease, handle])

  useFrame(() => {
    camera.position.lerp(positionRef.current, 0.12)
    lookRef.current.lerp(targetRef.current, 0.12)
    camera.lookAt(lookRef.current)
  })

  useEffect(
    () => () => {
      tweensRef.current.forEach((tween) => tween.kill())
    },
    [],
  )

  return null
}
