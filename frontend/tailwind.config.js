/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "outline": "#7e7576",
        "surface-bright": "#fcf9f8",
        "on-surface": "#1b1c1c",
        "on-secondary-fixed-variant": "#421cca",
        "on-tertiary-fixed": "#1b1c1c",
        "on-error": "#ffffff",
        "on-tertiary-fixed-variant": "#464747",
        "primary-fixed": "#e2e2e2",
        "background": "#fcf9f8",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#1b1b1b",
        "inverse-on-surface": "#f3f0ef",
        "error-container": "#ffdad6",
        "surface": "#fcf9f8",
        "surface-tint": "#5e5e5e",
        "secondary": "#583cdf",
        "primary-fixed-dim": "#c6c6c6",
        "on-primary-container": "#848484",
        "surface-container-low": "#f6f3f2",
        "on-surface-variant": "#4c4546",
        "secondary-fixed-dim": "#c8bfff",
        "on-primary-fixed-variant": "#474747",
        "inverse-surface": "#303030",
        "surface-container": "#f0eded",
        "on-tertiary": "#ffffff",
        "outline-variant": "#cfc4c5",
        "surface-container-highest": "#e4e2e1",
        "tertiary": "#000000",
        "on-tertiary-container": "#848484",
        "tertiary-container": "#1b1c1c",
        "error": "#ba1a1a",
        "secondary-container": "#7259f9",
        "surface-variant": "#e4e2e1",
        "tertiary-fixed": "#e3e2e2",
        "on-secondary-container": "#fffbff",
        "secondary-fixed": "#e5deff",
        "surface-dim": "#dcd9d9",
        "surface-container-lowest": "#ffffff",
        "on-background": "#1b1c1c",
        "on-secondary-fixed": "#190064",
        "inverse-primary": "#c6c6c6",
        "primary": "#000000",
        "on-error-container": "#93000a",
        "primary-container": "#1b1b1b",
        "surface-container-high": "#eae7e7",
        "on-secondary": "#ffffff",
        "tertiary-fixed-dim": "#c7c6c6"
      },
      fontFamily: {
        headline: ['Space Grotesk', 'Inter', 'sans-serif'],
        editorial: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif']
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
