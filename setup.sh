#!/bin/zsh
# Setup script for TODO Application

# Install dependencies
if [ -f package.json ]; then
  echo "Installing npm dependencies..."
  npm install
else
  echo "Initializing npm and installing dependencies..."
  npm init -y
  npm install typescript ts-node @types/node hono jest ts-jest @types/jest --save-dev
fi

# Initialize TypeScript config
if [ ! -f tsconfig.json ]; then
  npx tsc --init
fi

# Initialize Jest config for TDD
if [ ! -f jest.config.js ]; then
  npx ts-jest config:init
fi

echo "Project setup complete!"
