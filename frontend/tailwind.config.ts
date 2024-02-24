import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "secondary-light": "#FFD280",
      },
    },
  },
  daisyui: {
    themes: ["bumblebee"],
  },
  plugins: [require("daisyui")],
};
export default config;
