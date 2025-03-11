# ThreeJS Test Project: AI-Powered Development with Claude 3.5 Sonnet

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project demonstrates integrating Anthropic's Claude 3.5 Sonnet API for advanced agentic coding and visual simulations, using Node.js, React, Three.js, and a Python backend (optional, for QuestDB integration). It serves as a foundation for leveraging AI to optimize development workflows, particularly when working with timeseries data (e.g., RF and neural network data from QuestDB).  This README was updated using AI assistance!

## Overview

This repository shows how to:

*   Integrate Anthropic's Claude 3.5 Sonnet API using the official Node.js SDK.
*   Build interactive 3D visual simulations with React and Three.js.
*   (Optionally) Process timeseries data from QuestDB using a Python backend.
*   Securely manage API keys and other sensitive information using environment variables.

The project aims to provide a baseline for AI-augmented development. Claude 3.5 Sonnet can streamline code reviews, debugging, architectural planning, and more.

## Features

*   **Anthropic API Integration:** Uses the Anthropic SDK to interact with Claude 3.5 Sonnet.
*   **3D Visualizations:**  Provides a starting point for creating immersive 3D visualizations using React and Three.js.
*   **Secure Configuration:**  Uses a `.env` file to securely store your Anthropic API key (and other sensitive configuration).
*   **Extensible Architecture:** Designed for easy expansion. Integrate additional tools, CI/CD pipelines, and custom AI-driven workflows.
*   **(Optional) QuestDB Integration:** Demonstrates how to connect to and process data from a QuestDB database (requires a Python backend, not fully implemented in the base project).

## Prerequisites

*   Node.js (v14 or higher; v18+ recommended)
*   npm (or yarn, or pnpm)
*   Git
*   An Anthropic API key (get one from your [Anthropic Console](https://console.anthropic.com/))
*   (Optional) Python 3.7+ and pip (for QuestDB integration)
*   (Optional) A QuestDB instance running (for QuestDB integration)

## Installation

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/bgilbert1984/threejs-test-project.git](https://www.google.com/search?q=https://github.com/bgilbert1984/threejs-test-project.git)
    cd threejs-test-project
    ```

2.  **Install Dependencies:**

    ```bash
    npm install  # Or yarn install, or pnpm install
    ```

3.  **Configure Environment Variables:**

    *   Create a `.env` file in the root of the project:

        ```bash
        touch .env
        ```

    *   Add your Anthropic API key to the `.env` file:

        ```
        ANTHROPIC_API_KEY=your-anthropic-api-key-here
        ```
        Replace `your-anthropic-api-key-here` with your actual API key.  **Never commit your `.env` file to version control.**  It's included in `.gitignore` by default.

    *   (Optional) If you are using the QuestDB integration, add your QuestDB connection details to the `.env` file as well.  See the "QuestDB Integration" section below for details.

4. **Run the Development Server**
