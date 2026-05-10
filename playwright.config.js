/**
 * Playwright Configuration - Phase 5 E2E Tests
 * Tests frontend React + backend Express en environnement complet
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Répertoire des tests E2E
  testDir: './e2e',

  // Timeout global (upload + calculs peuvent prendre du temps)
  timeout: 30000,

  // Retries en cas d'échec (flaky tests)
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,

  // Workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // Configuration globale
  use: {
    // URL de base frontend React
    baseURL: 'http://localhost:3000',

    // Screenshots en cas d'échec
    screenshot: 'only-on-failure',
    
    // Vidéo des tests
    video: 'retain-on-failure',

    // Traces pour debug
    trace: 'on-first-retry',
  },

  // Projets (navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Mobile optionnel
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Serveur de dev (démarre backend + frontend automatiquement)
  webServer: [
    {
      command: 'cd ../backend && npm run dev',
      url: 'http://localhost:5000/api/health',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd ../frontend && npm run dev',
      url: 'http://localhost:3000',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
