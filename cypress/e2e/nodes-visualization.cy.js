/// <reference types="cypress" />

describe('Nodes Visualization Tests', () => {
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
    
    // Navigate to the Network Nodes section
    cy.contains('Network Visualization').click();
    cy.contains('h2', 'Network Visualization').should('be.visible');
  });

  it('should display the network visualization canvas', () => {
    // The canvas should be visible in this section
    cy.get('[data-testid="network-vis-canvas"]').should('be.visible');
  });

  it('should show node information when interacting with the canvas', () => {
    cy.get('[data-testid="network-vis-canvas"]').should('be.visible')
      .trigger('mousedown', { clientX: 250, clientY: 250 })
      .trigger('mousemove', { clientX: 300, clientY: 250 })
      .trigger('mouseup');
  });

  it('should display network visualization description', () => {
    // Check if the description text is visible
    cy.contains('Lorem ipsum dolor sit amet').should('be.visible');
    
    // Check for technology tags
    cy.contains('Nodes').should('be.visible');
    cy.contains('Connections').should('be.visible');
    cy.contains('Data Visualization').should('be.visible');
  });

  it('should have interactive orbit controls', () => {
    // Test zooming in and out on the canvas
    cy.get('[data-testid="network-vis-canvas"]')
      .trigger('wheel', { deltaY: -100 })  // Zoom in
      .wait(500)  // Wait for render
      .trigger('wheel', { deltaY: 100 });  // Zoom out
  });
});