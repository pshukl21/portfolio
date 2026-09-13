export default function Eye({ on = true }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1.5 8S4 3.8 8 3.8 14.5 8 14.5 8 12 12.2 8 12.2 1.5 8 1.5 8Z" />
      {on && <circle cx="8" cy="8" r="1.7" fill="currentColor" stroke="none" />}
    </svg>
  )
}
