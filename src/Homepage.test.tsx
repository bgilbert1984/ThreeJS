import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Homepage from './Homepage'

// Mock the Three.js related imports since they're not needed for most tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas-mock">{children}</div>
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
    render(<Homepage />)
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
      expect(screen.getByText(section)).toBeInTheDocument()
    })
  })

  it('changes active section when clicking navigation buttons', async () => {
    render(<Homepage />)
    const llamaButton = screen.getByText('LlamaCore Visualization')
    
    await userEvent.click(llamaButton)
    
    // The clicked section should have the purple background color class
    expect(llamaButton.parentElement).toHaveClass('bg-purple-600')
  })

  it('renders 3D canvas elements', () => {
    render(<Homepage />)
    const canvases = screen.getAllByTestId('canvas-mock')
    expect(canvases.length).toBeGreaterThan(0)
  })

  it('renders monitor component section with all visualizations', () => {
    render(<Homepage />)
    expect(screen.getByText('Monitor Components')).toBeInTheDocument()
    expect(screen.getByText('Processing Load')).toBeInTheDocument()
    expect(screen.getByText('Synaptic Connections')).toBeInTheDocument()
    expect(screen.getByText('Data Flow')).toBeInTheDocument()
    expect(screen.getByText('Anticipation Index')).toBeInTheDocument()
    expect(screen.getByText('Prompt Completion')).toBeInTheDocument()
  })

  it('renders contact form with required fields', () => {
    render(<Homepage />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(screen.getByText('Send Message')).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(<Homepage />)
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })
})