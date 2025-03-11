/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Check if canvas exists and is visible
     * @example cy.canvasExist()
     */
    canvasExist(): Chainable<JQuery<HTMLCanvasElement>>;

    /**
     * Check if canvas has dimensions (width and height)
     * @example cy.canvasHasDimensions()
     */
    canvasHasDimensions(): Chainable<JQuery<HTMLCanvasElement>>;

    /**
     * Wait for Three.js to initialize
     * @param timeout Optional timeout in milliseconds
     * @example cy.waitForThreeJs()
     * @example cy.waitForThreeJs(10000)
     */
    waitForThreeJs(timeout?: number): Chainable<Window>;

    /**
     * Simulate a click on the canvas at specific coordinates
     * @param x X coordinate (default: 500)
     * @param y Y coordinate (default: 500)
     * @example cy.canvasClick(300, 400)
     */
    canvasClick(x?: number, y?: number): Chainable<JQuery<HTMLCanvasElement>>;

    /**
     * Check if WebGL is supported
     * @example cy.hasWebGLSupport().then((supported) => { if (supported) {...} })
     */
    hasWebGLSupport(): Chainable<boolean>;
  }
}