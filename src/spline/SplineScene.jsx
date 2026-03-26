import Spline from '@splinetool/react-spline'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import './SplineScene.css'

export default function SplineScene({
  url,
  style = {},
  className = '',
  onLoad,
  fallback = null,
  interactive = false,
  opacity = 1,
}) {
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!loaded) {
        setTimedOut(true)
      }
    }, 9000)

    return () => window.clearTimeout(timer)
  }, [loaded])

  return (
    <div
      className={`spline-stage ${className}`.trim()}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      {!loaded && !timedOut ? <LoadingSpinner /> : null}
      {!loaded && timedOut ? fallback || <DefaultFallback /> : null}
      <Spline
        scene={url}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: loaded ? opacity : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: interactive ? 'auto' : 'none',
        }}
        onLoad={(app) => {
          setLoaded(true)
          setTimedOut(false)
          onLoad?.(app)
        }}
      />
    </div>
  )
}

function DefaultFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle,_rgba(232,103,138,0.12),_rgba(7,4,15,0.96))]">
      <div className="pulse-dot" />
    </div>
  )
}
