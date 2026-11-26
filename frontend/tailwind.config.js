/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#10b981", // Green
          moderate: "#f59e0b", // Yellow/Amber
          sensitive: "#f97316", // Orange
          unhealthy: "#ef4444", // Red
          veryUnhealthy: "#8b5cf6", // Purple
          hazardous: "#881337", // Maroon / Deep burgundy
        },
        smog: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'breeze': 'breeze 8s ease-in-out infinite',
        'breeze-fast': 'breeze 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'aurora': 'aurora 12s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breeze: {
          '0%, 100%': { transform: 'translateX(-2%) translateY(0)' },
          '50%': { transform: 'translateX(3%) translateY(-6px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-14px) scale(1.05)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      }
    },
  },
  plugins: [],
}
