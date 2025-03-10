// src/claudeIntegration.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // set your API key in environment variables
});

async function getClaudeResponse(prompt: string) {
  const msg = await anthropropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return msg;
}

(async () => {
  const response = await getClaudeResponse("How can I optimize realtime rendering for my Three.js visual simulation using timeseries RF data?");
  console.log("Claude Response:", response);
})();
