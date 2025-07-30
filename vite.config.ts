import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    // Add headers to handle CSP issues in development
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension:; object-src 'none';"
    }
  },
  build: {
    // Optimize for Vercel deployment
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production for better performance
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Improve chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'react-icons', 'framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['zustand', 'clsx', 'dayjs'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2pdf.js'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // Feature chunks
          'pages-auth': [
            './src/pages/auth/Login.tsx',
            './src/pages/auth/CreateTenant.tsx',
            './src/pages/auth/DeveloperSetup.tsx'
          ],
          'pages-branch': [
            './src/pages/branch/Sales/POS.tsx',
            './src/pages/branch/Stock/Inventory.tsx',
            './src/pages/branch/Customers/Customers.tsx'
          ],
          'pages-tenant': [
            './src/pages/tenant/Dashboard/index.tsx',
            './src/pages/tenant/Users/index.tsx'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: () => {
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Performance optimizations
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    // Compression settings
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  // Resolve react-is issue for recharts and Supabase module resolution
  optimizeDeps: {
    include: [
      'react-is', 
      'react', 
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js',
      '@supabase/postgrest-js',
      '@supabase/realtime-js',
      '@supabase/storage-js',
      '@supabase/functions-js',
      '@supabase/auth-js'
    ],
    exclude: []
  },
  // Fix Supabase module resolution issues
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  ssr: {
    noExternal: ['@supabase/supabase-js']
  },
  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    __DEV__: process.env.NODE_ENV !== 'production',
  },
  // Preview configuration for production testing
  preview: {
    port: 3000,
    host: true,
    strictPort: true
  }
})
