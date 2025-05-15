/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c4a03c',
        secondary: '#333333',
        background: '#ffffff',
        border: '#e5e5e5',
        text: {
          DEFAULT: '#333333',
          light: '#666666',
        },
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
} 