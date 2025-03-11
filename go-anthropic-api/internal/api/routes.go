package api

import (
	"net/http"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()
	
	// Register routes
	mux.HandleFunc("/api/chat", HandleChat)
	
	return mux
}