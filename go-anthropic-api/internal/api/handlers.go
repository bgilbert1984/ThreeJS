package api

import (
	"encoding/json"
	"net/http"
	"os"

	"go-anthropic-api/internal/services"
)

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}

func HandleChat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	client := services.NewAnthropicClient(os.Getenv("ANTHROPIC_API_KEY"))
	resp, err := client.CreateMessage(req.Message)
	if err != nil {
		respondWithError(w, "Error creating message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var responseText string
	if len(resp.Content) > 0 {
		responseText = resp.Content[0].Text
	}

	response := ChatResponse{
		Response: responseText,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func respondWithError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ChatResponse{Error: message})
}