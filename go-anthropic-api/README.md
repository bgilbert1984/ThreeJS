# README.md

# Go Anthropic API

This project is a Go backend application that integrates with the Anthropic API. It provides a simple HTTP API for sending messages and receiving responses using the Anthropic service.

## Project Structure

- `cmd/main.go`: Entry point of the application.
- `internal/api/handlers.go`: Contains HTTP handler functions for processing requests.
- `internal/api/routes.go`: Defines the routes for the application.
- `internal/config/config.go`: Loads and validates configuration settings.
- `internal/services/anthropic.go`: Logic for interacting with the Anthropic API.
- `pkg/models/message.go`: Data structures for messages exchanged with the API.
- `.env.example`: Example environment variables needed for the application.
- `go.mod`: Module definition for the Go project.
- `go.sum`: Checksums for the module's dependencies.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd go-anthropic-api
   ```

2. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.

3. Install the necessary dependencies:
   ```
   go mod tidy
   ```

4. Run the application:
   ```
   go run cmd/main.go
   ```

## Usage

Once the application is running, you can send requests to the API endpoints defined in the application. Refer to the API documentation for details on the available endpoints and their usage.

## Anthropic API Integration

This application utilizes the Anthropic API to process messages. Ensure you have a valid API key and that it is set in your environment variables.