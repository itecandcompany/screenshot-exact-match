export function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <span className="brand">
      <svg width="39" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M7 40V12h9l14 17V12h9v28h-9L16 23v17Z" fill="currentColor" />
        <path d="M26 8h17v17h-7V20L24 32l-5-5L31 15h-5Z" className="fill-lime" />
        <path d="M3 5h5v5H3zM11 2h4v4h-4z" className="fill-lime" />
      </svg>
      {!iconOnly && (
        <span className="brand-word">
          NEXTDOOR <span className="text-lime">ADS</span>
          <small>Your Brand. Our Creativity. More Impact.</small>
        </span>
      )}
    </span>
  );
}
