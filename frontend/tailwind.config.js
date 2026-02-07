/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#14b8a6", // Teal-500
                secondary: "#f97316", // Orange-500
                dark: {
                    900: "#111827",
                    950: "#030712",
                }
            },
            fontFamily: {
                sans: ['"Space Grotesk"', 'sans-serif'],
            },
            boxShadow: {
                'neo': '4px 4px 0px 0px rgba(255,255,255,0.2)',
            }
        },
    },
    plugins: [],
}
