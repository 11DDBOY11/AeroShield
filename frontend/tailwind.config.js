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
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
