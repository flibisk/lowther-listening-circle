import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:  '#404040',
          secondary:'#c69963',
          dark:     '#151515',
          haze:     '#f7f7f7',
          grey1:    '#555555',
          grey2:    '#999999',
          grey3:    '#d1d1d1',
          grey4:    '#e3e3e3',
          error:    '#f14b59',
          success:  '#60be7b'
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
