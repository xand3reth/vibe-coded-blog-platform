/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            'max-width': 'none',
            color: '#374151',
            fontFamily: 'var(--font-merriweather)',
            h1: {
              color: '#111827',
              fontWeight: '700',
              fontFamily: 'var(--font-inter)',
            },
            h2: {
              color: '#111827',
              fontWeight: '600',
              marginTop: '2.5em',
              fontFamily: 'var(--font-inter)',
            },
            h3: {
              color: '#111827',
              fontWeight: '600',
              marginTop: '2em',
              fontFamily: 'var(--font-inter)',
            },
            'h4,h5,h6': {
              color: '#111827',
              fontWeight: '600',
              fontFamily: 'var(--font-inter)',
            },
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              lineHeight: '1.75',
              fontFamily: 'var(--font-merriweather)',
              fontWeight: '300',
            },
            a: {
              color: '#2563eb',
              textDecoration: 'none',
              fontFamily: 'var(--font-merriweather)',
              '&:hover': {
                color: '#1d4ed8',
                textDecoration: 'underline',
              },
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1.5em',
              marginBottom: '1.5em',
              fontFamily: 'var(--font-inter)',
            },
            code: {
              color: '#ef4444',
              fontFamily: 'var(--font-inter)',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            'pre code': {
              color: '#e5e7eb',
              fontFamily: 'var(--font-inter)',
            },
            blockquote: {
              borderLeftColor: '#e5e7eb',
              color: '#6b7280',
              fontFamily: 'var(--font-merriweather)',
              fontStyle: 'italic',
            },
            'ul,ol': {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              fontFamily: 'var(--font-merriweather)',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
              fontFamily: 'var(--font-merriweather)',
            },
            img: {
              borderRadius: '0.5rem',
              marginTop: '2em',
              marginBottom: '2em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 