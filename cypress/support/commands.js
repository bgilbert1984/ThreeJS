// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- Custom commands for Three.js testing --

/**
 * Check if canvas exists and is visible
 */
Cypress.Commands.add('canvasExist', () => {
  return cy.get('canvas').should('exist').should('be.visible');
});

/**
 * Check if canvas has dimensions (width and height)
 */
Cypress.Commands.add('canvasHasDimensions', () => {
  return cy.get('canvas').should(($canvas) => {
    const canvas = $canvas[0];
    expect(canvas.width).to.be.greaterThan(0);
    expect(canvas.height).to.be.greaterThan(0);
  });
});

/**
 * Wait for Three.js to initialize by checking for canvas attributes
 * that indicate Three.js has rendered something
 */
Cypress.Commands.add('waitForThreeJs', (timeout = 5000) => {
  // Wait until canvas has actual content
  return cy.window({ timeout }).should((win) => {
    const canvas = win.document.querySelector('canvas');
    if (!canvas) return false;
    
    // Check if canvas has any WebGL context
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    } catch (e) {
      return false;
    }
  });
});

/**
 * Simulate a click on the canvas at specific coordinates
 */
Cypress.Commands.add('canvasClick', (x = 500, y = 500) => {
  return cy.get('canvas').trigger('mousedown', x, y)
    .trigger('mouseup', x, y);
});

/**
 * Check if WebGL is supported
 */
Cypress.Commands.add('hasWebGLSupport', () => {
  return cy.window().then((win) => {
    try {
      const canvas = win.document.createElement('canvas');
      return !!(
        win.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('webgl2'))
      );
    } catch (e) {
      return false;
    }
  });
});