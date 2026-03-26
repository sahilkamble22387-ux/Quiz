import { motion } from 'framer-motion'

export default function ProgressDots({ sections, activeIndex, onSelect }) {
  return (
    <div className="pointer-events-none fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="pointer-events-auto flex flex-col gap-3">
        {sections.map((section, index) => {
          const isActive = index === activeIndex
          const isCompleted = index < activeIndex
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className="group relative flex items-center justify-end bg-transparent p-0"
              data-cursor="interactive"
              aria-label={section.label}
            >
              {isActive ? (
                <motion.div
                  layoutId="story-active-dot"
                  className="h-2 w-8 rounded-full bg-[var(--rose)] shadow-[0_0_12px_rgba(232,103,138,0.5)]"
                />
              ) : (
                <div
                  className={`h-2 w-2 rounded-full ${
                    isCompleted ? 'bg-[rgba(232,103,138,0.4)]' : 'bg-[rgba(255,255,255,0.1)]'
                  }`}
                />
              )}
              <div
                className={`absolute right-10 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(7,4,15,0.82)] px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-[var(--dimmer)] backdrop-blur-md transition-all duration-300 ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              >
                {section.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
