/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090d',
        surface: '#0f1016',
        surface2: '#141620',
        amber: '#d4913a',
        'amber-lt': '#e8a84a',
        sage: '#3d8070',
        'text-base': '#ddd9d0',
        'text-muted': '#6e6b64',
        'text-dim': '#38362f',
        'off-white': '#f0ece4',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        syne: ['Syne', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      animation: {
        float1: 'float1 6s ease-in-out infinite',
        float2: 'float2 7s 1s ease-in-out infinite',
        float3: 'float3 5s 0.5s ease-in-out infinite',
        orb1: 'orb 18s ease-in-out infinite',
        orb2: 'orb 22s 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite',
        pulse2: 'pulse2 2s ease-in-out infinite',
        ledPulse: 'pulse2 1.8s ease-in-out infinite',
      },
      keyframes: {
        float1: {
          '0%,100%': { transform: 'translateY(0) rotate(-1.5deg)' },
          '50%': { transform: 'translateY(-14px) rotate(-1.5deg)' },
        },
        float2: {
          '0%,100%': { transform: 'translateY(0) rotate(2.5deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2.5deg)' },
        },
        float3: {
          '0%,100%': { transform: 'translateY(0) rotate(-0.5deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-0.5deg)' },
        },
        orb: {
          '0%,100%': { transform: 'translate(0,0)' },
          '33%': { transform: 'translate(30px,-20px)' },
          '66%': { transform: 'translate(-20px,15px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulse2: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
    },
  },
  plugins: [],
}
