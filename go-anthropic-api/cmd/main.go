package main

import (
    "fmt"
    "log"
    "net/http"

    "go-anthropic-api/internal/api"
    "go-anthropic-api/internal/config"
)

func main() {
    // Load configuration
    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("Failed to load configuration: %v", err)
    }
    
    // Setup routes
    router := api.SetupRoutes()
    
    // Start the server
    addr := fmt.Sprintf(":%s", cfg.Port)
    log.Printf("Server starting on %s", addr)
    if err := http.ListenAndServe(addr, router); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}