package config

import (
    "os"
    "fmt"
    "github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
    AnthropicAPIKey string
    Port            string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
    // Try to load from .env file if it exists
    _ = godotenv.Load()
    
    apiKey := os.Getenv("ANTHROPIC_API_KEY")
    if apiKey == "" {
        return nil, fmt.Errorf("ANTHROPIC_API_KEY environment variable not set")
    }
    
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080" // Default port
    }
    
    return &Config{
        AnthropicAPIKey: apiKey,
        Port:            port,
    }, nil
}