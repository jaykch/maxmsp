import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    alias: {
      '@/': new URL('./src/renderer/', import.meta.url).pathname
    }
  }
})
