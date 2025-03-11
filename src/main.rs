// src/main.rs
use actix_web::{web, App, HttpResponse, HttpServer, Responder, post, Result};
use serde::{Deserialize, Serialize};
use std::env;
use dotenv::dotenv;
use anthropic::{Anthropic, Client, types::CreateMessageRequest};


// Data Structures (for request and response)

#[derive(Deserialize)]
struct ClaudeRequest {
    message: String,
}

#[derive(Serialize)]
struct ClaudeResponse {
    response: String,
}
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

// Handler Function (for the /api/ask-claude route)
#[post("/api/ask-claude")]
async fn ask_claude(req_body: web::Json<ClaudeRequest>) -> Result<impl Responder> {
    dotenv().ok(); // Load .env variables

    let api_key = env::var("ANTHROPIC_API_KEY")
        .map_err(|_| HttpResponse::InternalServerError().json(ErrorResponse {error: "ANTHROPIC_API_KEY not set".to_string()}))?;

    let client = Anthropic::new(&api_key);

     let request = CreateMessageRequest {
        model: "claude-3.5-sonnet-20240229".to_string(), //Or other model
        max_tokens: 1024,
        messages: vec![
            anthropic::types::Message {
                role: "user".to_string(),
                content: req_body.message.clone(),
            }
        ],
        ..Default::default() //For other parameters

    };

    let response = client.create_message(request).await;
    match response {
        Ok(message) => {
          Ok(HttpResponse::Ok().json(ClaudeResponse { response: message.content[0].text.clone() }))

        },
        Err(e) => {

            // Handle different error types from the Anthropic crate
            let error_message = match e {
                anthropic::Error::APIConnectionError(_) => "Failed to connect to Anthropic API.".to_string(),
                anthropic::Error::AuthenticationError(_) => "Authentication failed. Check your API key.".to_string(),
                anthropic::Error::BadRequestError { message, .. } => format!("Bad request to Anthropic API: {}", message),
                anthropic::Error::RateLimitError { .. } => "Rate limit exceeded.".to_string(),
                anthropic::Error::APIStatusError { status_code, .. } => format!("Anthropic API returned status code: {}", status_code),
                _ => format!("An unexpected error occurred: {}", e),
            };
            Ok(HttpResponse::InternalServerError().json(ErrorResponse { error: error_message }))
        }
    }
}



#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok(); // Load environment variables

    HttpServer::new(|| {
        App::new()
            .service(ask_claude) // Register the handler function
    })
    .bind(("127.0.0.1", 8080))? // Bind to localhost, port 8080
    .run()
    .await
}