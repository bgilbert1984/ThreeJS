package models

// MessageRequest represents the structure of a request to the Anthropic API.
type MessageRequest struct {
	Prompt string `json:"prompt"`
}

// MessageResponse represents the structure of a response from the Anthropic API.
type MessageResponse struct {
	Content string `json:"content"`
	Error   string `json:"error"` // Include an error field
}

// ChatRequest represents the request format for chat API
type ChatRequest struct {
    Message string `json:"message"`
}

// ChatResponse represents the response format for chat API
type ChatResponse struct {
    Response string `json:"response"`
    Error    string `json:"error,omitempty"`
}