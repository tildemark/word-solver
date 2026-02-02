export function WordSolverBanner() {
  return (
    <svg
      viewBox="0 0 400 120"
      className="w-full max-w-md mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="textShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="400" height="120" rx="12" fill="url(#bannerGradient)" />

      {/* Decorative circles */}
      <circle cx="30" cy="30" r="15" fill="rgba(255,255,255,0.1)" />
      <circle cx="370" cy="90" r="20" fill="rgba(255,255,255,0.1)" />
      <circle cx="100" cy="100" r="10" fill="rgba(255,255,255,0.08)" />
      <circle cx="350" cy="20" r="12" fill="rgba(255,255,255,0.08)" />

      {/* Text */}
      <text
        x="200"
        y="75"
        fontSize="56"
        fontWeight="bold"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        filter="url(#textShadow)"
      >
        Word Solver
      </text>

      {/* Underline accent */}
      <rect x="80" y="85" width="240" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}
