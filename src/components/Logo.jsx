export default function Logo({ size = 'md' }) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 30
  const textSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 22

  return (
    <div className="logo">
      {/* Football icon — minimal, stylized */}
      <svg
        className="logo-icon"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="16" cy="16" r="14.5" stroke="#00FF87" strokeWidth="1.5" />
        {/* Pentagon center */}
        <path
          d="M16 9.5l4.5 3.2-1.7 5.3h-5.6l-1.7-5.3L16 9.5z"
          fill="#00FF87"
          opacity="0.85"
        />
        {/* Panel lines */}
        <path d="M16 9.5L11 6.8M16 9.5l5 -2.7" stroke="#00FF87" strokeWidth="1" opacity="0.4" />
        <path d="M18.8 18l3.8 2.2M13.2 18l-3.8 2.2" stroke="#00FF87" strokeWidth="1" opacity="0.4" />
        <path d="M14.3 18h3.4l1 4.2M14.3 18l-1 4.2" stroke="#00FF87" strokeWidth="1" opacity="0.4" />
        {/* Outer panels */}
        <path
          d="M21.5 7L26 10.5M10.5 7L6 10.5M26 21.5l-3.5 3.5M6 21.5l3.5 3.5M15.3 26.5h1.4"
          stroke="#00FF87"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.25"
        />
      </svg>

      <div className="logo-text" style={{ fontSize: textSize }}>
        <span className="white">Pelada</span>
        <span className="green">Selvagem</span>
      </div>
    </div>
  )
}
