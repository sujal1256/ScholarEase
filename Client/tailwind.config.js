/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        surface: '#f5f7f5',
        surface2: '#eef1ee',
        primary: '#4a9b8e',
        'primary-lt': '#5aab9e',
        'primary-dark': '#3d8474',
        'text-heading': '#1a1a2e',
        'text-base': '#374151',
        'text-muted': '#6b7280',
        'text-dim': '#9ca3af',
        'off-white': '#f9fafb',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      animation: {
        float1: 'float1 6s ease-in-out infinite',
        float2: 'float2 7s 1s ease-in-out infinite',
        float3: 'float3 5s 0.5s ease-in-out infinite',
        float4: 'float4 8s 0.3s ease-in-out infinite',
        float5: 'float5 6.5s 0.8s ease-in-out infinite',
        float6: 'float6 7.5s 1.2s ease-in-out infinite',
      },
      keyframes: {
        float1: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        float2: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        float3: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float4: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        float5: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        float6: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
      },
    },
  },
  plugins: [],
}
