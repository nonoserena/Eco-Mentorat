/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                eco: {
                    50: '#e6faf3',
                    100: '#c0f5e1',
                    500: '#00C48C',
                    600: '#00a376',
                    900: '#064e3b',
                },
                meta: {
                    50: '#f0ebff',
                    500: '#7B4DFF',
                    600: '#6a3df5',
                    900: '#2e1a8a',
                },
            },
            fontFamily: {
                display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}