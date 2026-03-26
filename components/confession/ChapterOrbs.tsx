import { CHAPTERS } from '../../lib/sceneConfig'

type Props = {
  activeSceneId: string
  onJump: (sceneId: string) => void
}

export default function ChapterOrbs({ activeSceneId, onJump }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 22,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 50,
        padding: 8,
      }}
    >
      {CHAPTERS.map((chapter) => {
        const isActive = chapter.sceneId === activeSceneId
        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onJump(chapter.sceneId)}
            title={chapter.name}
            aria-label={`Go to ${chapter.name}`}
            style={{
              width: 18,
              height: 18,
              padding: 0,
              borderRadius: 999,
              border: `1px solid ${isActive ? `${chapter.color}99` : 'rgba(255,255,255,0.26)'}`,
              background: 'rgba(18, 6, 14, 0.18)',
              boxShadow: isActive ? `0 0 16px ${chapter.color}88` : `0 0 8px ${chapter.color}2e`,
              transform: `scale(${isActive ? 1.12 : 1})`,
              transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <span
              style={{
                width: isActive ? 8 : 6,
                height: isActive ? 8 : 6,
                borderRadius: 999,
                background: chapter.color,
                boxShadow: isActive ? `0 0 14px ${chapter.color}` : `0 0 8px ${chapter.color}88`,
                transition: 'all 180ms ease',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
