package api

import (
    "net/http"
)

// SetupRoutes configures all API routes
func SetupRoutes() http.Handler {
    mux := http.NewServeMux()
    
    // API endpoints
    mux.HandleFunc("/api/chat", HandleChat)
    
    // CORS middleware
    return enableCORS(mux)
}

// enableCORS adds CORS headers to responses
func enableCORS(h http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
        
        // Handle preflight OPTIONS requests
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        h.ServeHTTP(w, r)
    })
}