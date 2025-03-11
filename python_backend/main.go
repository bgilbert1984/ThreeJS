package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/joho/godotenv" // For loading .env files
)

// MessageRequest is the structure for incoming requests from the Next.js frontend.
type MessageRequest struct {
	Prompt string `json:"prompt"`
}

// MessageResponse is the structure for responses sent back to the Next.js frontend.
type MessageResponse struct {
	Content string `json:"content"`
	Error   string `json:"error"` // Include an error field
}

func main() {
	// Load environment variables from .env file (if it exists)
	err := godotenv.Load()
	if err != nil && !os.IsNotExist(err) { // Only log if the error isn't "file not found"
		log.Fatal("Error loading .env file")
	}

	// Retrieve the API key from the environment variable.
	apiKey := os.Getenv("ANTHROPIC_API_KEY")
	if apiKey == "" {
		log.Fatal("ANTHROPIC_API_KEY environment variable not set")
	}

	// Create the Anthropic client.
	client := anthropic.NewClient(option.WithAPIKey(apiKey))

	// Set up HTTP handler.
	http.HandleFunc("/api/message", func(w http.ResponseWriter, r *http.Request) {
		// Only allow POST requests.
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Decode the request body.
		var req MessageRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate the prompt.
		if req.Prompt == "" {
			http.Error(w, "Prompt cannot be empty", http.StatusBadRequest)
			return
		}
		// Create the message to send to Anthropic.
		message, err := client.Messages.New(context.TODO(), anthropic.MessageNewParams{
			Model:     anthropic.F(anthropic.ModelClaude35Sonnet), // Use 3.5 Sonnet!
			MaxTokens: anthropic.F(int64(1024)),
			Messages: anthropic.F([]anthropic.MessageParam{
				anthropic.NewUserMessage(anthropic.NewTextBlock(req.Prompt)),
			}),
		})
		if err != nil {
			http.Error(w, fmt.Sprintf("Error from Anthropic API: %v", err), http.StatusInternalServerError)
			return
		}
        if len(message.Content) == 0 {
           	http.Error(w, "No Content from Anthropic API", http.StatusInternalServerError)
        }

		// Prepare the response.  Handles if content array is empty
		response := MessageResponse{
			Content: message.Content[0].Text,
			Error:   "", // No error
		}


		// Encode and send the response.
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(&response); err != nil {
			http.Error(w, "Error encoding response", http.StatusInternalServerError)
			return
		}
	})

	// Start the server.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port
	}
	fmt.Printf("Server listening on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}