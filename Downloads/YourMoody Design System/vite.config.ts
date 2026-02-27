import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Build optimizations
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'motion-vendor': ['motion/react', 'framer-motion'],
          'chart-vendor': ['recharts'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-switch', '@radix-ui/react-slot'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Source maps for production debugging (optional - remove for smaller builds)
    sourcemap: false,
  },

  // Security headers (production only)
  server: {
    headers: {
      // Content Security Policy
      'Content-Security-Policy': 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "connect-src 'self' https://*.supabase.co https://api.anthropic.com; " +
        "frame-ancestors 'none'; ",
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      // Prevent MIME sniffing
      'X-Content-Type-Options': 'nosniff',
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  // Image optimization
  assetsInlineLimit: 4096, // Inline assets smaller than 4KB
})
