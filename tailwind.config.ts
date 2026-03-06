import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Figma palette
        black:        '#1A1A18',
        gray:         '#7A7A6C',
        'gray-light': '#C8C8BC',
        cream:        '#F0F0E8',
        'olive-light':'#D8E0B8',
        olive:        '#8A9A5A',
        'olive-dark': '#4A5A28',

        // Semantic tokens
        primary:      'var(--color-primary)',
        secondary:    'var(--color-secondary)',
        accent:       'var(--color-accent)',
        background:   'var(--color-background)',
        surface:      'var(--color-surface)',
        'surface-white': 'var(--color-surface-white)',
        foreground:   'var(--color-foreground)',
        muted:        'var(--color-muted)',
        border:       'var(--color-border)',
        success:      'var(--color-success)',
        warning:      'var(--color-warning)',
        error:        'var(--color-error)',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'pill': '9999px',
      },
      fontSize: {
        'h1': ['64px', { lineHeight: '1.1', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.2', fontWeight: '500' }],
        'h3': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'keypoint': ['16px', { lineHeight: '1.5', fontWeight: '700' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'label': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'ui': ['14px', { lineHeight: '1.4', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};

export default config;
