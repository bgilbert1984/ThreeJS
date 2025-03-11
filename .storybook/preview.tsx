import React from 'react';
import type { Preview } from "@storybook/react";
import { Canvas } from '@react-three/fiber';

const ThreeDecorator = (Story: React.ComponentType) => (
  <div style={{ width: '100%', height: '100vh' }}>
    <Canvas>
      <Story />
    </Canvas>
  </div>
);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
  // Apply the Three.js decorator only to stories that need it
  decorators: [],
};

export const threejsDecorator = ThreeDecorator;
export default preview;