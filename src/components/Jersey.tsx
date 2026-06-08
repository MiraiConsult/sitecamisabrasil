export function Jersey({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 350"
      className={className}
      role="img"
      aria-label="Camiseta Brasil Retrô em listras verde e amarelo, número 10"
    >
      <defs>
        <pattern
          id="rr-stripes"
          width="48"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <rect width="24" height="12" fill="#009C3B" />
          <rect x="24" width="24" height="12" fill="#FFDF00" />
        </pattern>
        <filter id="rr-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="10"
            floodColor="#000"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      <g filter="url(#rr-shadow)">
        {/* Mangas */}
        <path
          d="M70 58 L18 96 L42 156 L84 132 Z"
          fill="url(#rr-stripes)"
          stroke="#0B2A5B"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M250 58 L302 96 L278 156 L236 132 Z"
          fill="url(#rr-stripes)"
          stroke="#0B2A5B"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Corpo */}
        <path
          d="M70 58 Q108 44 130 56 Q160 82 190 56 Q212 44 250 58 L236 132 L236 318 Q160 334 84 318 L84 132 Z"
          fill="url(#rr-stripes)"
          stroke="#0B2A5B"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Gola */}
        <path
          d="M130 56 Q160 82 190 56 L181 72 Q160 92 139 72 Z"
          fill="#0B2A5B"
        />
      </g>

      {/* BRASIL + estrelas */}
      <text
        x="160"
        y="118"
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="22"
        letterSpacing="4"
        fill="#FFFFFF"
        stroke="#0B2A5B"
        strokeWidth="0.6"
      >
        BRASIL
      </text>
      <text
        x="160"
        y="136"
        textAnchor="middle"
        fontSize="13"
        letterSpacing="3"
        fill="#FFDF00"
      >
        ★ ★ ★ ★ ★
      </text>

      {/* Número 10 */}
      <text
        x="160"
        y="268"
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="130"
        fill="#FFFFFF"
        stroke="#0B2A5B"
        strokeWidth="3"
      >
        10
      </text>
    </svg>
  );
}
