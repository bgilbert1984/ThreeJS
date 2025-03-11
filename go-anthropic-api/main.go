package main

import (
	"log"
	"net/http"

	"go-anthropic-api/internal/api"
	"go-anthropic-api/internal/config"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	// Set up routes
	router := api.NewRouter()

	// Start the server
	log.Printf("Starting server on port %s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
