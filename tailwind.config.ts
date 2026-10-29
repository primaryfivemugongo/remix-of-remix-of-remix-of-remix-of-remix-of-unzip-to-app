import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'century-gothic': ['"Century Gothic"', '"Gothic A1"', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
			},
			fontSize: {
				'application': ['14px', '1.4'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					glow: 'hsl(var(--primary-glow))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
				},
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-destructive': 'var(--gradient-destructive)',
				'gradient-subtle': 'var(--gradient-subtle)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				spin: {
					to: {
						transform: 'rotate(360deg)'
					}
				},
				'spin-slow': {
					to: {
						transform: 'rotate(360deg)'
					}
				},
				'pulse-slow': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.5'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1'
					},
					'100%': {
						opacity: '0'
					}
				},
				'zoom-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'zoom-out': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(0.8)',
						opacity: '0'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-down': {
					'0%': {
						transform: 'translateY(-100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'flip-in': {
					'0%': {
						transform: 'rotateY(90deg)',
						opacity: '0'
					},
					'100%': {
						transform: 'rotateY(0)',
						opacity: '1'
					}
				},
				'swipe-in': {
					'0%': {
						transform: 'translateX(-100%) rotate(-10deg)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0) rotate(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-in-left': {
					'0%': {
						transform: 'translateX(-20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'pulse-heart': {
					'0%': {
						transform: 'scale(1)'
					},
					'25%': {
						transform: 'scale(1.1)'
					},
					'50%': {
						transform: 'scale(1)'
					},
					'75%': {
						transform: 'scale(1.05)'
					},
					'100%': {
						transform: 'scale(1)'
					}
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0.3) translateY(-100px)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.05) translateY(0)',
						opacity: '1'
					},
					'70%': {
						transform: 'scale(0.9)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'bounce-out': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'30%': {
						transform: 'scale(1.1)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(0.3) translateY(-100px)',
						opacity: '0'
					}
				},
				'swipe-left': {
					'0%': {
						transform: 'translateX(100%) rotate(10deg)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0) rotate(0)',
						opacity: '1'
					}
				},
				'swipe-right': {
					'0%': {
						transform: 'translateX(-100%) rotate(-10deg)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0) rotate(0)',
						opacity: '1'
					}
				},
				'swipe-up': {
					'0%': {
						transform: 'translateY(100%) rotate(5deg) scale(0.8)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0) rotate(0) scale(1)',
						opacity: '1'
					}
				},
				'swipe-down': {
					'0%': {
						transform: 'translateY(-100%) rotate(-5deg) scale(0.8)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0) rotate(0) scale(1)',
						opacity: '1'
					}
				},
				'flip-x': {
					'0%': {
						transform: 'rotateX(90deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'rotateX(45deg)',
						opacity: '0.5'
					},
					'100%': {
						transform: 'rotateX(0)',
						opacity: '1'
					}
				},
				'flip-y': {
					'0%': {
						transform: 'rotateY(90deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'rotateY(45deg)',
						opacity: '0.5'
					},
					'100%': {
						transform: 'rotateY(0)',
						opacity: '1'
					}
				},
				'zoom-bounce': {
					'0%': {
						transform: 'scale(0) rotate(180deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.2) rotate(90deg)',
						opacity: '0.8'
					},
					'100%': {
						transform: 'scale(1) rotate(0)',
						opacity: '1'
					}
				},
				'wiggle': {
					'0%, 100%': {
						transform: 'rotate(-3deg)'
					},
					'50%': {
						transform: 'rotate(3deg)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(-5px)'
					},
					'50%': {
						transform: 'translateY(5px)'
					}
				},
				'rainbow': {
					'0%': { transform: 'rotate(0deg) hue-rotate(0deg)' },
					'100%': { transform: 'rotate(360deg) hue-rotate(360deg)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				spin: 'spin 1s linear infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'zoom-in': 'zoom-in 0.2s ease-out',
				'zoom-out': 'zoom-out 0.2s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'pulse-heart': 'pulse-heart 1.5s ease-in-out infinite',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'flip-in': 'flip-in 0.4s ease-out',
				'swipe-in': 'swipe-in 0.3s ease-out',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'bounce-out': 'bounce-out 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'swipe-left': 'swipe-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'swipe-right': 'swipe-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'swipe-up': 'swipe-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'swipe-down': 'swipe-down 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'flip-x': 'flip-x 0.5s ease-out',
				'flip-y': 'flip-y 0.5s ease-out',
				'zoom-bounce': 'zoom-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'wiggle': 'wiggle 0.5s ease-in-out infinite',
				'float': 'float 2s ease-in-out infinite',
				'rainbow': 'rainbow 3s linear infinite',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;