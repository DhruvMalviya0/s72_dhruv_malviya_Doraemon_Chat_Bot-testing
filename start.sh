#!/bin/bash

echo "Starting Doraemon Chat Bot..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in PATH"
    exit 1
fi

echo "Installing dependencies..."
npm run install-all

echo
echo "Starting the application..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:5000"
echo
echo "Press Ctrl+C to stop the application"
echo

npm run dev 