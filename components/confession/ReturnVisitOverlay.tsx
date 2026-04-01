import { useMemo } from 'react'
import { motion } from 'framer-motion'

type Props = {
  sceneTime: number
  visitCount: number
  onBackToBeginning: () => void
}

type OpeningSegment = {
  text: string
  start: number
  typeDuration: number
  end: number
}

type FadeSegment = {
  text: string
  start: number
  end: number
}

const OPENING_LINES = [
  'Hi Radhika.',
  'This is your [visit] visit.',
  "Sahil still doesn't know you keep coming back.",
  'But he thought you might.',
  'So he left one more thing here. Just for you.',
]

const MESSAGE_LINES = [
  'You said you need to focus on your dreams.',
  'He heard you.',
  "He's not here to change your mind.",
  'He just wants you to know one thing.',
]

const FINAL_LINES = [
  'No pressure. No questions. No reply needed.',
  'Take care of yourself, Radhika.',
  "Keep going. You're going to make it.",
]

const TRANSITION_LINE = "Let's go into the memories."

const LETTER_LINES = [
  "The right person doesn't pull you away from your dreams.",
  'They sit next to you while you chase them.',
  'They sit beside you at 2am when the books feel too heavy.',
  'They celebrate your wins louder than their own.',
  'They make the journey feel less lonely - not more difficult.',
  'Sahil knows your CA journey matters more than anything.',
  'He has never once thought of himself as more important than your dreams.',
  'He just wanted you to know - support and distraction are not the same thing.',
  'And he will always be the first one.',
]
const LETTER_LINE_INTERVAL = 3.35
const LETTER_LINE_REVEAL = 0.9
const LETTER_HOLD_AFTER = 7
const TRANSITION_HOLD_AFTER = 5.8

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function smoothstep(start: number, end: number, value: number) {
  if (start === end) return value >= end ? 1 : 0
  const x = clamp((value - start) / (end - start), 0, 1)
  return x * x * (3 - 2 * x)
}

function ordinal(value: number) {
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) return `${value}st`
  if (mod10 === 2 && mod100 !== 12) return `${value}nd`
  if (mod10 === 3 && mod100 !== 13) return `${value}rd`
  return `${value}th`
}

function buildOpeningSegments(): OpeningSegment[] {
  let cursor = 1.2

  return OPENING_LINES.map((line, index) => {
    const resolved = index === 1 ? line.replace('[visit]', '__VISIT__') : line
    const typeDuration = Math.min(2.5, Math.max(0.85, resolved.length * 0.045))
    const segment = {
      text: line,
      start: cursor,
      typeDuration,
      end: cursor + typeDuration + 2,
    }
    cursor = segment.end
    return segment
  })
}

const OPENING_SEGMENTS = buildOpeningSegments()
const OPENING_END = OPENING_SEGMENTS[OPENING_SEGMENTS.length - 1].end

const MESSAGE_SEGMENTS: FadeSegment[] = MESSAGE_LINES.map((text, index) => {
  const start = OPENING_END + 1.2 + index * 6.1
  return { text, start, end: start + 6 }
})

const LETTER_START = MESSAGE_SEGMENTS[MESSAGE_SEGMENTS.length - 1].end + 1.1
const LETTER_END = LETTER_START + LETTER_LINE_INTERVAL * (LETTER_LINES.length - 1) + LETTER_HOLD_AFTER
const FINAL_SEGMENTS: FadeSegment[] = FINAL_LINES.map((text, index) => {
  const start = LETTER_END + 4 + index * 5.2
  return { text, start, end: start + 4.8 }
})
const TRANSITION_SEGMENT: FadeSegment = {
  text: TRANSITION_LINE,
  start: FINAL_SEGMENTS[FINAL_SEGMENTS.length - 1].end + 1.1,
  end: FINAL_SEGMENTS[FINAL_SEGMENTS.length - 1].end + TRANSITION_HOLD_AFTER,
}
export const RETURN_VISIT_DURATION = TRANSITION_SEGMENT.end + 2.8

function textPanelStyle(maxWidth: string, tone: 'light' | 'warm' = 'light') {
  return {
    width: maxWidth,
    margin: '0 auto',
    padding: 'clamp(14px, 2.8vw, 24px) clamp(18px, 3.4vw, 28px)',
    borderRadius: 26,
    background: tone === 'warm'
      ? 'linear-gradient(180deg, rgba(255,248,236,0.86), rgba(252,236,206,0.72))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,248,235,0.18))',
    border: tone === 'warm'
      ? '1px solid rgba(190, 146, 77, 0.24)'
      : '1px solid rgba(126, 92, 45, 0.16)',
    boxShadow: tone === 'warm'
      ? '0 28px 80px rgba(115, 90, 52, 0.18)'
      : '0 18px 50px rgba(82, 60, 34, 0.12)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  } as const
}

function renderTypewriterText(segment: OpeningSegment, sceneTime: number, visitCount: number) {
  const localTime = sceneTime - segment.start
  const resolvedText = segment.text.replace('[visit]', ordinal(Math.min(visitCount, 4)))
  const reveal = segment.typeDuration <= 0
    ? 1
    : clamp(localTime / segment.typeDuration, 0, 1)
  const visibleChars = Math.max(1, Math.round(resolvedText.length * reveal))
  return {
    text: resolvedText.slice(0, visibleChars),
    opacity: Math.min(smoothstep(0, 0.4, localTime), 1 - smoothstep(segment.end - segment.start - 0.7, segment.end - segment.start, localTime) * 0.04),
  }
}

function activeFadeSegment(segments: FadeSegment[], sceneTime: number) {
  return segments.find((segment) => sceneTime >= segment.start && sceneTime <= segment.end) ?? null
}

function fadeOpacity(segment: FadeSegment | null, sceneTime: number) {
  if (!segment) return 0
  const localTime = sceneTime - segment.start
  return Math.min(
    smoothstep(0, 1, localTime),
    1 - smoothstep(Math.max(segment.end - segment.start - 0.8, 0), segment.end - segment.start, localTime),
  )
}

function lineOpacity(index: number, sceneTime: number) {
  const lineStart = LETTER_START + index * LETTER_LINE_INTERVAL
  const localTime = sceneTime - lineStart
  if (localTime <= 0) return 0
  return Math.min(
    smoothstep(0, LETTER_LINE_REVEAL, localTime),
    1 - smoothstep(Math.max(LETTER_END - lineStart - 1, 0), LETTER_END - lineStart, localTime),
  )
}

export default function ReturnVisitOverlay({ sceneTime, visitCount, onBackToBeginning }: Props) {
  const openingSegment = useMemo(
    () => [...OPENING_SEGMENTS].reverse().find((segment) => sceneTime >= segment.start && sceneTime <= segment.end) ?? null,
    [sceneTime],
  )
  const messageSegment = useMemo(() => activeFadeSegment(MESSAGE_SEGMENTS, sceneTime), [sceneTime])
  const finalSegment = useMemo(() => activeFadeSegment(FINAL_SEGMENTS, sceneTime), [sceneTime])
  const transitionSegment = useMemo(() => activeFadeSegment([TRANSITION_SEGMENT], sceneTime), [sceneTime])

  const openingState = openingSegment ? renderTypewriterText(openingSegment, sceneTime, visitCount) : null
  const messageOpacity = fadeOpacity(messageSegment, sceneTime)
  const finalOpacity = fadeOpacity(finalSegment, sceneTime)
  const transitionOpacity = fadeOpacity(transitionSegment, sceneTime)
  const showLetter = sceneTime >= LETTER_START && sceneTime <= LETTER_END
  const letterOpacity = showLetter
    ? Math.min(smoothstep(0, 1.1, sceneTime - LETTER_START), 1 - smoothstep(LETTER_END - LETTER_START - 1.2, LETTER_END - LETTER_START, sceneTime - LETTER_START))
    : 0
  const showBackLink = sceneTime >= RETURN_VISIT_DURATION - 7.2

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 68,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(255,244,225,0.08), rgba(113, 88, 44, 0.08))',
      }}
    >
      {openingState ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            padding: 'clamp(20px, 5vw, 48px)',
          }}
        >
          <div
            style={{
              ...textPanelStyle('min(92vw, 880px)'),
              color: '#5F4330',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 4.2vw, 58px)',
              lineHeight: 1.2,
              letterSpacing: '0.03em',
              textAlign: 'center',
              textWrap: 'balance',
              textShadow: '0 0 18px rgba(255, 247, 234, 0.36)',
              opacity: openingState.opacity,
            }}
          >
            {openingState.text}
          </div>
        </div>
      ) : null}

      {messageSegment ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(92vw, 920px)',
            padding: '0 16px',
          }}
        >
          <div
            style={{
              ...textPanelStyle('min(92vw, 920px)'),
              color: '#5F4330',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(24px, 3.2vw, 44px)',
              lineHeight: 1.26,
              letterSpacing: '0.03em',
              textAlign: 'center',
              textWrap: 'balance',
              opacity: messageOpacity,
              transform: `translateY(${(1 - messageOpacity) * 10}px)`,
              textShadow: '0 0 16px rgba(255, 247, 234, 0.28)',
            }}
          >
            {messageSegment.text}
          </div>
        </div>
      ) : null}

      {showLetter ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(92vw, 760px)',
            padding: '0 12px',
          }}
        >
          <div
            style={{
              opacity: letterOpacity,
              transform: `translateY(${(1 - letterOpacity) * 14}px)`,
              ...textPanelStyle('min(92vw, 760px)', 'warm'),
              color: '#5F4632',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 2.3vw, 29px)',
              lineHeight: 1.45,
              letterSpacing: '0.015em',
              textAlign: 'center',
            }}
          >
            {LETTER_LINES.map((line, index) => {
              const opacity = lineOpacity(index, sceneTime)
              return (
                <div
                  key={line}
                  style={{
                    opacity,
                    transform: `translateY(${(1 - opacity) * 8}px)`,
                    transition: 'opacity 220ms linear, transform 220ms linear',
                    minHeight: '1.45em',
                    marginTop: index === 0 ? 0 : 10,
                  }}
                >
                  {line}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {finalSegment ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '18%',
            transform: 'translateX(-50%)',
            width: 'min(88vw, 760px)',
            padding: '0 14px',
          }}
        >
          <div
            style={{
              ...textPanelStyle('min(88vw, 760px)'),
              color: '#5F4330',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 2.4vw, 30px)',
              lineHeight: 1.4,
              letterSpacing: '0.02em',
              textAlign: 'center',
              opacity: finalOpacity,
              transform: `translateY(${(1 - finalOpacity) * 8}px)`,
              textShadow: '0 0 14px rgba(255, 247, 234, 0.22)',
            }}
          >
            {finalSegment.text}
          </div>
        </div>
      ) : null}

      {transitionSegment ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(90vw, 700px)',
            padding: '0 14px',
          }}
        >
          <div
            style={{
              ...textPanelStyle('min(90vw, 700px)', 'warm'),
              color: '#684A30',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(24px, 3vw, 42px)',
              lineHeight: 1.24,
              letterSpacing: '0.03em',
              textAlign: 'center',
              opacity: transitionOpacity,
              transform: `translateY(${(1 - transitionOpacity) * 10}px)`,
            }}
          >
            {transitionSegment.text}
          </div>
        </div>
      ) : null}

      {showBackLink ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onClick={onBackToBeginning}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            background: 'transparent',
            border: 'none',
            padding: 0,
            color: 'rgba(101, 74, 48, 0.8)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
            pointerEvents: 'auto',
          }}
        >
          ← back to the beginning
        </motion.button>
      ) : null}
    </div>
  )
}
