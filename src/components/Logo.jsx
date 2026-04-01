export default function Logo({ size = 'md' }) {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.4 : 1
  const iconW = Math.round(38 * scale)
  const iconH = Math.round(44 * scale)
  const textSize = size === 'sm' ? 16 : size === 'lg' ? 26 : 20
  const subSize  = size === 'sm' ? 7  : size === 'lg' ? 11 : 9

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Shield crest */}
      <svg width={iconW} height={iconH} viewBox="0 0 38 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield body */}
        <path
          d="M19 2L3 8v14c0 9.5 6.8 18.2 16 20.8C28.2 40.2 35 31.5 35 22V8L19 2z"
          fill="#FF5500"
          opacity="0.12"
        />
        <path
          d="M19 2L3 8v14c0 9.5 6.8 18.2 16 20.8C28.2 40.2 35 31.5 35 22V8L19 2z"
          stroke="#FF5500"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Inner shield line */}
        <path
          d="M19 5.5L6 10.5v11.3c0 7.8 5.6 14.9 13 17.2 7.4-2.3 13-9.4 13-17.2V10.5L19 5.5z"
          stroke="#FF5500"
          strokeWidth="0.6"
          strokeLinejoin="round"
          opacity="0.35"
        />
        {/* Football */}
        <circle cx="19" cy="21" r="7.5" stroke="#FF5500" strokeWidth="1.2" opacity="0.9"/>
        {/* Pentagon */}
        <path
          d="M19 16.2l2.7 1.9-1 3.2h-3.4l-1-3.2L19 16.2z"
          fill="#FF5500"
          opacity="0.8"
        />
        {/* Ball panels */}
        <path d="M19 16.2l-2.8-1.6M19 16.2l2.8-1.6" stroke="#FF5500" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
        <path d="M21.7 18.1l2.5 1.4M16.3 18.1l-2.5 1.4" stroke="#FF5500" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
        <path d="M20.7 21.3l1.6 2.8M17.3 21.3l-1.6 2.8" stroke="#FF5500" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
      </svg>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, lineHeight: 1 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: textSize,
          letterSpacing: '0.06em',
          color: 'var(--text)',
          lineHeight: 1,
        }}>
          PELADA
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: textSize,
          letterSpacing: '0.06em',
          color: 'var(--accent)',
          lineHeight: 1,
        }}>
          SELVAGEM
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: subSize,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: 'var(--text-3)',
          textTransform: 'uppercase',
          marginTop: 3,
        }}>
          Futebol de Rua
        </div>
      </div>
    </div>
  )
}
