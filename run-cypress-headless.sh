#!/bin/bash

# Kill any existing dev servers
pkill -f "vite" > /dev/null 2>&1 || true

# Start the development server in the background with the specific port
VITE_PORT=5173 npm run dev &
SERVER_PID=$!

echo "Starting dev server (PID: $SERVER_PID)..."

# Give the server time to start
sleep 8
echo "Dev server should be running now"

# Run Cypress tests with xvfb-run to provide a virtual display
echo "Running Cypress tests in headless mode..."
CYPRESS_REMOTE_DEBUGGING_PORT=9222 xvfb-run --server-args="-screen 0 1280x720x24" npm run cypress:run

# Capture the exit code from Cypress
TEST_EXIT_CODE=$?

# Kill the dev server when tests are done
echo "Shutting down dev server..."
kill $SERVER_PID

# Wait for server to fully shut down
sleep 2

echo "Test run complete with exit code: $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE