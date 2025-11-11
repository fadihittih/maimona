#!/bin/bash

# mAImona GitHub Pages Deployment Script
# This script automates the deployment to GitHub Pages

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   mAImona - GitHub Pages Deployment                     ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
GITHUB_USERNAME="vajira"
REPO_NAME="maimona"
PROJECT_DIR="/Users/macbookairm1/Desktop/untitled folder"

echo "📋 Configuration:"
echo "   GitHub Username: $GITHUB_USERNAME"
echo "   Repository Name: $REPO_NAME"
echo "   Project Directory: $PROJECT_DIR"
echo ""

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Step 1: Check Git status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1: Checking Git repository status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d .git ]; then
    echo -e "${GREEN}✅ Git repository found${NC}"
else
    echo -e "${RED}❌ Git repository not found${NC}"
    exit 1
fi

git log --oneline -1
echo ""

# Step 2: Add remote
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 Step 2: Adding GitHub remote..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    echo "Current remote:"
    git remote -v
    echo ""
    read -p "Do you want to remove and re-add it? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo -e "${GREEN}✅ Removed existing remote${NC}"
    fi
fi

if ! git remote | grep -q "^origin$"; then
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo -e "${GREEN}✅ Remote added successfully${NC}"
    echo "Remote URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
else
    echo -e "${GREEN}✅ Using existing remote${NC}"
fi
echo ""

# Step 3: Show next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Next Steps to Complete Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You need to create the GitHub repository first!${NC}"
echo ""
echo "1️⃣  Create GitHub Repository:"
echo "   → Go to: https://github.com/new"
echo "   → Repository name: $REPO_NAME"
echo "   → Description: AI-powered crypto market assistant with live Binance WebSocket data."
echo "   → Visibility: ✅ Public"
echo "   → DO NOT initialize with README, .gitignore, or license"
echo "   → Click 'Create repository'"
echo ""
echo "2️⃣  Push to GitHub (run these commands):"
echo "   cd \"$PROJECT_DIR\""
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3️⃣  Enable GitHub Pages:"
echo "   → Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "   → Source: Deploy from a branch"
echo "   → Branch: main"
echo "   → Folder: / (root)"
echo "   → Click 'Save'"
echo ""
echo "4️⃣  Your live site will be at:"
echo -e "   ${GREEN}🌐 https://$GITHUB_USERNAME.github.io/$REPO_NAME/${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Quick push option
echo "Would you like to push to GitHub now?"
echo "(Only do this AFTER creating the repository on GitHub)"
read -p "Push to GitHub? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    echo ""
    
    git branch -M main
    
    if git push -u origin main; then
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ SUCCESS! Code pushed to GitHub${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "📂 Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
        echo ""
        echo "Next: Enable GitHub Pages in repository settings"
        echo "Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
        echo ""
        echo "Your site will be live at:"
        echo -e "${GREEN}🌐 https://$GITHUB_USERNAME.github.io/$REPO_NAME/${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}❌ Push failed!${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Possible reasons:"
        echo "1. Repository doesn't exist on GitHub yet"
        echo "2. Authentication issue"
        echo "3. Network problem"
        echo ""
        echo "Solutions:"
        echo "→ Create the repository at: https://github.com/new"
        echo "→ Then run: git push -u origin main"
    fi
else
    echo ""
    echo "Skipping push. When ready, run:"
    echo "  cd \"$PROJECT_DIR\""
    echo "  git push -u origin main"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 For detailed instructions, see: DEPLOY_TO_GITHUB.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
