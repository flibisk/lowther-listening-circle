import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:  '#1a1a1a',
          secondary:'#d4af37',
          dark:     '#0a0a0a',
          light:    '#f8f8f8',
          haze:     '#2a2a2a',
          grey1:    '#666666',
          grey2:    '#999999',
          grey3:    '#cccccc',
          grey4:    '#e5e5e5',
          error:    '#ff4757',
          success:  '#2ed573',
          gold:     '#d4af37',
          bronze:   '#cd7f32',
          platinum: '#e5e4e2'
        }
      },
      borderRadius: { '2xl': '1rem' },
      fontFamily: {
        heading: ['var(--font-hvmuse)', 'ui-sans-serif', 'system-ui'],
        body: ['var(--font-sarabun)', 'ui-sans-serif', 'system-ui']
      },
      fontStyle: {
        'italic': 'italic'
      }
    }
  },
  plugins: []
}
export default config
