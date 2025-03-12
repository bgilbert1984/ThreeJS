/// <reference types="cypress" />

describe('LlamaCore Visualization Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
    
    // Check for WebGL support - skip test if not supported
    cy.hasWebGLSupport().then((supported) => {
      if (!supported) {
        cy.log('WebGL not supported in this browser, skipping test');
        this.skip();
      }
    });
    
    // Navigate to the LlamaCore section
    cy.contains('LlamaCore Visualization').click();
    cy.contains('h2', 'LlamaCore Visualization').should('be.visible');
  });

  it('should display the LlamaCore canvas', () => {
    // The canvas should be visible in this section
    cy.get('[data-testid="llamacore-canvas"]').should('be.visible');
  });

  it('should display technology tags', () => {
    // Check for technology tags
    cy.contains('Three.js').should('be.visible');
    cy.contains('React').should('be.visible');
    cy.contains('Animation').should('be.visible');
    cy.contains('3D Modeling').should('be.visible');
  });
  
  it('should interact with orbit controls', () => {
    // Get the element by data-testid to ensure we're targeting the right canvas
    cy.get('[data-testid="llamacore-canvas"]').should('be.visible')
      .trigger('mousedown', { clientX: 250, clientY: 250 })
      .trigger('mousemove', { clientX: 350, clientY: 300 })
      .trigger('mouseup');
  });
  
  it('should maintain canvas visibility during page scrolling', () => {
    // Get the canvas wrapper
    cy.get('[data-testid="llamacore-canvas"]').should('be.visible');
    
    // Scroll down slightly and check if canvas maintains visibility
    cy.scrollTo(0, 200);
    cy.get('[data-testid="llamacore-canvas"]').should('be.visible');
  });
});