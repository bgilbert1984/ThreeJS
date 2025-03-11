package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

const anthropicAPIEndpoint = "https://api.anthropic.com/v1/messages"

type AnthropicClient struct {
	apiKey string
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MessageRequest struct {
	Model     string    `json:"model"`
	MaxTokens int       `json:"max_tokens"`
	Messages  []Message `json:"messages"`
}

type MessageResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

func NewAnthropicClient(apiKey string) *AnthropicClient {
	return &AnthropicClient{apiKey: apiKey}
}

func (c *AnthropicClient) CreateMessage(prompt string) (*MessageResponse, error) {
	request := MessageRequest{
		Model:     "claude-3-sonnet-20240229",
		MaxTokens: 1024,
		Messages:  []Message{{Role: "user", Content: prompt}},
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request: %v", err)
	}

	req, err := http.NewRequest("POST", anthropicAPIEndpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var response MessageResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("error decoding response: %v", err)
	}

	return &response, nil
}