#!/bin/bash

echo "🚀 Starting DBMS Mini Project Python API..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📚 Installing dependencies..."
    pip install -r requirements.txt
else
    echo "⚠️  requirements.txt not found, skipping dependency installation"
fi

# Load environment variables if .env exists
if [ -f ".env" ]; then
    echo "🔧 Loading environment variables..."
    export $(cat .env | xargs)
else
    echo "⚠️  .env file not found, using default environment"
fi

# Start the FastAPI server
echo "🌟 Starting FastAPI server on http://localhost:8000"
echo "📖 API Documentation available at http://localhost:8000/docs"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
