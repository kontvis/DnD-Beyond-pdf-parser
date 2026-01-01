#!/bin/bash
set -e

echo "=== D&D Beyond PDF Parser Setup ==="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

node_version=$(node -v)
echo "✓ Node.js $node_version found"

# Enable corepack to manage yarn automatically
echo "Enabling corepack..."
corepack enable

# corepack will now use the yarn version specified in package.json
yarn_version=$(yarn -v)
echo "✓ Yarn $yarn_version ready (managed by corepack)"
echo ""

# Install dependencies
echo "Installing dependencies..."
yarn install

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Place D&D Beyond character PDFs in input_pdfs/ folder (optional)"
echo "  2. Start the server:  yarn start"
echo "  3. Download a character from D&D Beyond and get its character ID"
echo "  4. Query the API:     curl 'http://localhost:8080/rolls?characterId=12345'"
echo ""
echo "For live reload during development:"
echo "  yarn watch"
echo ""
echo "For linting:"
echo "  yarn lint"
echo ""
