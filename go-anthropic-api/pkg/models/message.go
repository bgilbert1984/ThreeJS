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