#!/bin/bash

echo "🔧 Building Linux..."
if ! npm run tauri build; then
  echo "❌ Linux build failed."
  exit 1
fi

echo "🔧 Building Windows (x86_64-pc-windows-gnu)..."
if ! npm run tauri build -- --target x86_64-pc-windows-gnu; then
  echo "❌ Windows build failed."
  exit 1
fi

echo "✅ Both builds completed successfully!"

