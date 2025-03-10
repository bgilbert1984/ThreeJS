import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function queryClaude(prompt: string) {
  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return response;
}

// Register commands in your VS Code extension to invoke `queryClaude`
