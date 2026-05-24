import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Artisan Palette
        'cream': '#fcf9f3',
        'charcoal': '#1c1c18',
        'forest': '#2D5A27',   // Primary Button
        'oak': '#A67B5B',      // Accent
        'accent': '#e66d3e',
        'surface-low': '#f6f3ed',
        'surface-lowest': '#ffffff',
        'outline-variant': 'rgba(28, 28, 24, 0.15)',
        // Standard colors for compatibility
        primary: '#2D5A27',
        secondary: '#A67B5B',
        surface: '#f6f3ed',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        work: ['var(--font-work)', 'sans-serif'],
      },
      borderRadius: {
        'artisan': '0.375rem',
      },
      boxShadow: {
        'artisan': '0 20px 40px rgba(28, 28, 24, 0.06)',
      }
    },
  },
  plugins: [],
};

export default config;
