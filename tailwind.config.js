/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dragon: {
          black: "#07140c",
          forest: "#14532d",
          green: "#1b7a3a",
          lime: "#4ade80",
          gold: "#f5d90a",
          red: "#e11d2e",
          turf: "#157a3a",
          turfDark: "#0f5c2c",
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', "Impact", "sans-serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        token: "0 8px 18px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
