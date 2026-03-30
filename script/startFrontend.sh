#!/bin/bash
echo "starting frontend server..."

cd ..
cd ./frontend || exit 1

if [ ! -d "dist" ]; then
    echo "Warning: dist/ directory not found!"
    echo "Current directory: $(pwd)"
    npm install
    npm run build
    npx serve dist/
    ls -la
fi

npx serve dist/

read -p "Press Enter to continue..."
