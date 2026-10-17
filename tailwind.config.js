/** @type {import('tailwindcss').Config} */

// The app ramps live in index.css as "r g b" channels so that opacity
// modifiers such as bg-app-200/80 keep working. Only the steps defined
// there are exposed here, so an undefined step fails loudly (no class at
// all) instead of rendering a transparent colour.
const channelRamp = (prefix) =>
  Object.fromEntries(
    ["100", "200", "500", "700", "800", "950"].map((step) => [
      step,
      `rgb(var(${prefix}-${step}) / <alpha-value>)`,
    ]),
  );

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // <alpha-value> lets opacity modifiers work, e.g. bg-primary/20.
        // Without it Tailwind silently drops the modifier and emits no class.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        // Secondary brand (clay). Not consumed yet.
        brand: "rgb(var(--brand) / <alpha-value>)",
        app: {
          ...channelRamp("--app"),
          foreground: "rgb(var(--app-foreground) / <alpha-value>)",
          success: "rgb(var(--app-500) / <alpha-value>)",
          warning: channelRamp("--app-warning"),
          error: channelRamp("--app-error"),
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
