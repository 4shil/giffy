import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brutalism: {
          bg: '#FAFAF9',
          panel: '#FFFFFF',
          dark: '#18181B',
          border: '#27272A',
          accent: '#6366F1',
          hover: '#F4F4F5',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
      }
    },
  },
  plugins: [],
} satisfies Config;
