// .storybook/main.ts (or .storybook/main.js)
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    return {
      ...config,
      server: {
        ...config.server,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: 6006,
        },
      },
    };
  },
};

export default config;