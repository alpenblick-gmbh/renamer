/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- GLOBAL ---
        background: '#111827', // gray-900: Globaler App-Hintergrund (App.tsx, MainApp.tsx), Hover Text auf Buttons
        container: '#1f2937',  // gray-800: Container um Dropzone/Listen (MainApp.tsx), Dropzone inaktiv (Dropzone.tsx)
        
        // --- SURFACES (Karten, Menüs) ---
        surface: {
          DEFAULT: '#2c3544', // Custom: Karten-Hintergrund (FileItem), Dropdown (Dropdown), Buttons (FileList), Dropzone aktiv
          hover: '#374151',   // gray-700: Hover-Status für Dropdown-Einträge (Dropdown), Dropzone Hover, Borders
        },

        // --- PRIMARY (Akzent, Interaktion) ---
        primary: {
          DEFAULT: '#60A5FA', // blue-400: Icons (Heart, Info), Spinner, Hover-States Buttons, Link Hover
          dark: '#3B82F6',    // blue-500: Login Button Normalzustand, Heart Icon Hover Animation
        },
        
        secondary: '#4B5563', // gray-600: Sign Out Button Background

        // --- STATUS ---
        success: '#4ADE80',   // green-400: Check-Icon, Status "Umbenannt", Download-Button Hover
        error: '#F87171',     // red-400: Error-Icon, Status "Fehler", Delete/Clear Buttons Hover, "Unbefugter Zugriff"
        warning: '#FACC15',   // yellow-400: Permission Error Icon/Text

        // --- TYPOGRAPHY ---
        text: {
          main: '#D1D5DB',    // gray-300: Primärer Text auf Surface (Dropdown/List Buttons)
          muted: '#9CA3AF',   // gray-400: Sekundärtext ("Wird geladen", "Dateien hier ablegen", Icons in Buttons)
          dim: '#6B7280',     // gray-500: Footer, Status "Gespeichert", Info-Box Text
        }
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
}
