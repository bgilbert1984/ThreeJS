const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:browser:launch', (browser = {}, launchOptions) => {
        // Add GPU acceleration arguments for better WebGL support
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--ignore-gpu-blacklist');
          launchOptions.args.push('--disable-gpu-sandbox');
          launchOptions.args.push('--use-gl=desktop');
        }
        return launchOptions;
      });
    },
    env: {
      // Environment variables for tests
      viewportWidth: 1280,
      viewportHeight: 720,
      waitForAnimations: true,
      animationDistanceThreshold: 20
    },
    experimentalStudio: true,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    // Add these configurations
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    pageLoadTimeout: 30000,
    watchForFileChanges: true
  },
  // Configuration for headless environments
  video: false,
  screenshotOnRunFailure: false,
  chromeWebSecurity: false,
  retries: {
    runMode: 2,
    openMode: 0
  },
});