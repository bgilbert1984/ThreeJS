package config

import (
	"github.com/joho/godotenv"
	"os"
)

type Config struct {
	Port         string
	AnthropicKey string
}

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		return nil, err
	}

	return &Config{
		Port:         getEnvOrDefault("PORT", "8080"),
		AnthropicKey: os.Getenv("ANTHROPIC_API_KEY"),
	}, nil
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}