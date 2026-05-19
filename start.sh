#!/bin/bash

set -e

echo "🏀 Basketball Game Server Starting..."

mkdir -p data logs

if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

if [ -f package-lock.json ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

echo "🚀 Starting server..."
node server.js
