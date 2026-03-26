export default function LoadingSpinner({ label = '' }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[rgba(7,4,15,0.88)] text-center">
      <div className="pulse-dot" />
      {label ? (
        <p className="font-ui text-[10px] uppercase tracking-[0.45em] text-[var(--dimmer)]">
          {label}
        </p>
      ) : null}
    </div>
  )
}
