/// <reference types="cypress" />

describe('Homepage ThreeJS Tests', () => {
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
  });

  it('should load the application successfully', () => {
    // Check that the page has loaded
    cy.get('body').should('be.visible');
    cy.title().should('not.be.empty');
  });

  it('should render the Three.js canvas', () => {
    // Check that the canvas exists and has dimensions
    cy.canvasExist();
    cy.canvasHasDimensions();
  });

  it('should render the navigation menu', () => {
    // Check for the navigation elements
    cy.contains('3D Interactive Portfolio').should('be.visible');
    cy.contains('Interactive 3D Web Development').should('be.visible');
    cy.contains('Explore Projects').should('be.visible');
  });

  it('should navigate to sections when clicked', () => {
    // Click on the "LlamaCore Visualization" button
    cy.contains('LlamaCore Visualization').click();

    // Check that the section is now visible
    cy.contains('h2', 'LlamaCore Visualization').should('be.visible');

    // Click on the "Particle Systems" button
    cy.contains('Particle Systems').click({ force: true });
    cy.contains('h2', 'Particle Systems').should('be.visible');
  });

  it('should interact with the canvas via orbit controls', () => {
    // Since we can't directly test Three.js rendering, we'll simulate interaction
    // with the canvas to test the orbit controls
    
    // First click on canvas to focus
    cy.canvasClick();
    
    // Simulate dragging on the canvas to rotate the view
    cy.get('canvas')
      .trigger('mousedown', 200, 200)
      .trigger('mousemove', 300, 250)
      .trigger('mouseup');
    
    // We can't assert on 3D state directly, but at least we can verify
    // the actions don't cause errors
  });

  it('should load monitor components', () => {
    // Navigate to the monitor components section
    cy.contains('Monitor Components').click();
    cy.contains('h2', 'Monitor Components').should('be.visible');
    
    // Check if all expected monitor component titles are visible
    cy.contains('Processing Load').should('be.visible');
    cy.contains('Synaptic Connections').should('be.visible');
    cy.contains('Data Flow').should('be.visible');
    cy.contains('Anticipation Index').should('be.visible');
    cy.contains('Prompt Completion').should('be.visible');
    cy.contains('Copilot Visualization').should('be.visible');
  });
});