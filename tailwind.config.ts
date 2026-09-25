import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SchemeSetu primary palette
        primary:    "#001428",
        "primary-container": "#0f2942",
        "on-primary": "#ffffff",
        "on-primary-container": "#7991af",
        "primary-fixed": "#d1e4ff",
        "primary-fixed-dim": "#b0c9e8",
        "inverse-primary": "#b0c9e8",

        // Secondary (teal)
        secondary: "#006a61",
        "secondary-container": "#86f2e4",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#006f66",
        "secondary-fixed": "#89f5e7",
        "secondary-fixed-dim": "#6bd8cb",
        "on-secondary-fixed": "#00201d",
        "on-secondary-fixed-variant": "#005049",

        // Surface system
        surface:                    "#f8f9ff",
        "surface-dim":              "#ccdbf3",
        "surface-bright":           "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low":    "#eff4ff",
        "surface-container":        "#e6eeff",
        "surface-container-high":   "#dce9ff",
        "surface-container-highest":"#d5e3fc",
        "surface-variant":          "#d5e3fc",
        "surface-tint":             "#49607c",

        // On-surface
        "on-surface":         "#0d1c2e",
        "on-surface-variant": "#43474d",
        "inverse-surface":    "#233144",
        "inverse-on-surface": "#eaf1ff",

        // Tertiary (amber/warm)
        tertiary:           "#220e00",
        "tertiary-container": "#401f00",
        "on-tertiary":        "#ffffff",
        "on-tertiary-container": "#d77503",
        "tertiary-fixed":     "#ffdcc3",
        "tertiary-fixed-dim": "#ffb77d",
        "on-tertiary-fixed":  "#2f1500",
        "on-tertiary-fixed-variant": "#6e3900",

        // System
        background:       "#f8f9ff",
        "on-background":  "#0d1c2e",
        outline:          "#74777e",
        "outline-variant":"#c3c6ce",
        error:            "#ba1a1a",
        "error-container":"#ffdad6",
        "on-error":       "#ffffff",
        "on-error-container": "#93000a",

        // Legacy aliases for compatibility
        navy:  "#001428",
        brand: { orange: "#006a61", navy: "#001428", green: "#006a61" },
      },
      fontFamily: {
        sans:      ["Inter", "system-ui", "sans-serif"],
        display:   ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm:  "0.25rem",
        md:  "0.375rem",
        lg:  "0.5rem",
        xl:  "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full:"9999px",
      },
      animation: {
        "fade-in":   "fadeIn 0.2s ease",
        "slide-up":  "slideUp 0.3s ease",
        "slide-in":  "slideIn 0.25s ease-out",
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" },                               to: { opacity: "1" } },
        slideUp:   { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        slideIn:   { from: { transform: "translateX(-8px)", opacity: "0" },to: { transform: "translateX(0)",  opacity: "1" } },
        pulseDot:  { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
      boxShadow: {
        card:         "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px -6px rgba(0,20,40,0.14)",
        header:       "0 1px 8px rgba(0,0,0,0.06)",
        chip:         "0 1px 3px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
