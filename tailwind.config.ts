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
                // Modern Teal & Aurora Palette
                teal: {
                    50: '#F0FDFA',
                    100: '#CCFBF1',
                    200: '#99F6E4',
                    300: '#5EEAD4',
                    400: '#2DD4BF',
                    500: '#14B8A6',
                    600: '#0D9488',
                    700: '#0F766E',
                    800: '#115E59',
                    900: '#134E4A',
                    950: '#042F2E',
                },
                aurora: {
                    deep: '#1e3a45',
                    mid: '#2d5a61',
                    light: '#4e9a96',
                    glow: '#b2fef4',
                },
                blue: {
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                },
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'vina-gradient': 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
                'aurora-mesh': 'radial-gradient(circle at 20% 20%, #1e3a45 0%, transparent 50%), radial-gradient(circle at 80% 80%, #0D948820 0%, transparent 50%), radial-gradient(circle at 50% 50%, #2d5a61 0%, #1a2e35 100%)',
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(13, 148, 136, 0.5)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'orb': '0 0 40px 10px rgba(178, 254, 244, 0.3)',
            },
            dropShadow: {
                'glow': '0 0 15px rgba(20, 184, 166, 0.4)',
                'star': '0 0 20px rgba(255, 255, 255, 0.8)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'sparkle': 'sparkle 10s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                sparkle: {
                    '0%': { strokeDashoffset: '100' },
                    '100%': { strokeDashoffset: '0' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
