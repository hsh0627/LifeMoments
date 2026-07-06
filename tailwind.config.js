/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7C5C3E',    // 深棕
        secondary: '#C4885A',  // 焦糖棕
        accent: '#5A7A4A',     // 苔蘚綠
        xp: '#D4A017',         // 古金
        background: '#F5EDD8', // 羊皮紙米色
        card: '#FDF6E3',       // 淡米黃
        text: '#3B2A1A',       // 深咖啡
        muted: '#9C8570',      // 霧棕
        border: '#D9C9B0',     // 淺棕邊框
      },
    },
  },
  plugins: [],
};
