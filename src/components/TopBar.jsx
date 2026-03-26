export default function TopBar({ visible, activeIndex, total, activeLabel }) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="h-[60px] border-b border-[rgba(255,255,255,0.05)] bg-[rgba(7,4,15,0.8)] px-6 backdrop-blur-[20px] sm:px-10 lg:px-16">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between">
          <div className="flex flex-col">
            <p className="font-ui text-[10px] uppercase tracking-[0.38em] text-[rgba(250,240,244,0.34)]">
              Scene
            </p>
            <p className="font-romance text-[18px] text-[var(--white)]">{activeLabel}</p>
          </div>
          <div className="text-right">
            <p className="font-ui text-[11px] uppercase tracking-[0.3em] text-[var(--dimmer)]">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-[rgba(250,240,244,0.3)]">
              keep scrolling
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
