// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Handle uncaught exceptions from ThreeJS/WebGL
Cypress.on('uncaught:exception', (err) => {
  // Check if the error is related to Canvas or WebGL
  if (err.message.includes('Canvas') || 
      err.message.includes('WebGL') || 
      err.message.includes('GPU process') || 
      err.message.includes('SwiftShader') ||
      err.message.includes('R3F') ||  // Added for React Three Fiber errors
      err.message.includes('THREE namespace')) { // Added for specific R3F extension errors
    // Returning false prevents Cypress from failing the test
    return false
  }
  // If it's not a WebGL related error, let the test fail
  return true
})