import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ghana: {
          red: '#CE1126',
          gold: '#FCD116',
          green: '#006B3F',
          black: '#000000',
        },
        water: {
          clean: '#3B82F6',
          moderate: '#F59E0B',
          polluted: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};

export default config;
