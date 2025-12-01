#!/bin/bash

echo "🚀 Pushing to YOUR GitHub repository..."
echo ""

# Remove old remote
echo "1️⃣ Removing old remote..."
git remote remove origin

# Add YOUR remote (replace khero691 with your username if different)
echo "2️⃣ Adding new remote..."
git remote add origin https://github.com/khero691/heroes-battle-server.git

# Push all commits
echo "3️⃣ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Render.com Dashboard"
echo "2. Open your service settings"
echo "3. Build & Deploy → Disconnect old repository"
echo "4. Connect Repository → khero691/heroes-battle-server"
echo "5. Save and deploy!"
echo ""
