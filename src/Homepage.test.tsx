import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Homepage from './Homepage'

// Mock the Three.js related imports since they're not needed for most tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas-mock">{children}</div>,
  AmbientLight: ({ intensity }: any) => <div data-testid="ambient-light-mock" data-intensity={intensity} />,
  PointLight: (props: any) => <div data-testid="point-light-mock" data-props={JSON.stringify(props)} />,
  SpotLight: (props: any) => <div data-testid="spot-light-mock" data-props={JSON.stringify(props)} />,
  Color: ({ attach, args }: any) => <div data-testid="color-mock" data-attach={attach} data-args={JSON.stringify(args)} />,
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls-mock" />,
  Text: () => <div data-testid="text-mock" />,
  ScrollControls: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-controls-mock">{children}</div>,
  Scroll: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-mock">{children}</div>
}))

// Mock all component imports
vi.mock('./components/LlamaCore', () => ({
  LlamaCore: () => <div data-testid="llama-core-mock" />
}))

vi.mock('./components/LlamaCore_2D', () => ({
  LlamaCoreD3: () => <div data-testid="llama-core-2d-mock" />
}))

vi.mock('./components/particle_effects', () => ({
  App: () => <div data-testid="particle-effects-mock" />
}))

vi.mock('./components/object-clump', () => ({
  App: () => <div data-testid="object-clump-mock" />
}))

vi.mock('./components/Nodes', () => ({
  Nodes: ({ children }: { children: React.ReactNode }) => <div data-testid="nodes-mock">{children}</div>,
  Node: () => <div data-testid="node-mock" />
}))

vi.mock('./components/MonitorComponents', () => ({
  ProcessingLoadBar: () => <div data-testid="processing-load-mock" />,
  SynapticConnections: () => <div data-testid="synaptic-connections-mock" />,
  DataFlow: () => <div data-testid="data-flow-mock" />,
  AnticipationIndex: () => <div data-testid="anticipation-index-mock" />,
  PromptCompletionProbability: () => <div data-testid="prompt-completion-mock" />
}))

vi.mock('./components/CopilotVisualization', () => ({
  default: () => <div data-testid="copilot-visualization-mock" />
}))

describe('Homepage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<Homepage />)
    expect(screen.getByText('Interactive 3D Web Development')).toBeInTheDocument()
  })

  it('renders all navigation sections', () => {
    const { container } = render(<Homepage />)
    
    const navElement = container.querySelector('nav')
    expect(navElement).toBeInTheDocument()
    
    if (!navElement) return // Type guard
    
    const navigationSection = within(navElement)
    
    const sections = [
      'Interactive 3D Portfolio',
      'LlamaCore Visualization',
      'Particle Effects',
      'Interactive Objects',
      'Network Visualization',
      'Monitor Components',
      'Contact Me'
    ]
    
    sections.forEach(section => {
      expect(navigationSection.getByText(section)).toBeInTheDocument()
    })
  })

  it('changes active section when clicking navigation buttons', async () => {
    const { container } = render(<Homepage />)
    
    // Find the button specifically within the navigation bar
    const navElement = container.querySelector('nav')
    expect(navElement).toBeInTheDocument()
    
    const navBar = within(navElement as HTMLElement)
    const llamaButton = navBar.getByText('LlamaCore Visualization')
    
    // Mock scrollIntoView since JSDOM doesn't support it
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    
    await userEvent.click(llamaButton)
    
    // The clicked section should have the purple background color class
    expect(llamaButton).toHaveClass('bg-purple-600')
  })

  it('renders 3D canvas elements', () => {
    render(<Homepage />)
    const canvases = screen.getAllByTestId('canvas-mock')
    expect(canvases.length).toBeGreaterThan(0)
  })

  it('renders monitor component section with all visualizations', () => {
    const { container } = render(<Homepage />)
    
    const sections = Array.from(container.querySelectorAll('section'))
    
    // Find the section with the Monitor Components heading
    const monitorSection = sections.find(section => {
      const heading = section.querySelector('h2')
      return heading?.textContent === 'Monitor Components'
    })
    
    expect(monitorSection).toBeDefined()
    if (!monitorSection) return
    
    // Now check for the visualization headings within this section
    const monitorSectionElement = within(monitorSection)
    expect(monitorSectionElement.getByText('Processing Load')).toBeInTheDocument()
    expect(monitorSectionElement.getByText('Synaptic Connections')).toBeInTheDocument()
    expect(monitorSectionElement.getByText('Data Flow')).toBeInTheDocument()
    expect(monitorSectionElement.getByText('Anticipation Index')).toBeInTheDocument()
    expect(monitorSectionElement.getByText('Prompt Completion')).toBeInTheDocument()
  })

  it('renders contact form with required fields', () => {
    render(<Homepage />)
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument()
  })

  it('renders social media links', () => {
    const { container } = render(<Homepage />)
    
    const sections = Array.from(container.querySelectorAll('section'))
    const contactSection = sections.find(
      section => section.textContent?.includes('Contact Me') || 
                section.querySelector('form') !== null
    )
    
    expect(contactSection).toBeInTheDocument()
    expect(contactSection).not.toBeNull()
    
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer?.textContent).toContain('© 2025')
    expect(footer?.textContent).toContain('Built with React, Three.js')
  })
})