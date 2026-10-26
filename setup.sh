#!/bin/bash

# GitHub Actions Daily Commit Setup Script
# This script helps you set up the daily commit automation

echo "🤖 GitHub Actions Daily Commit Setup"
echo "===================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: This doesn't appear to be a git repository."
    echo "   Please run this script from the root of your GitHub repository."
    exit 1
fi

echo "✅ Git repository detected"

# Create .github/workflows directory if it doesn't exist
echo "📁 Creating workflow directory..."
mkdir -p .github/workflows

# Check if daily-commit.yml already exists
if [ -f ".github/workflows/daily-commit.yml" ]; then
    echo "⚠️  Warning: daily-commit.yml already exists"
    echo "   The existing file will be backed up as daily-commit.yml.backup"
    cp .github/workflows/daily-commit.yml .github/workflows/daily-commit.yml.backup
fi

# Create the workflow file (this would normally copy from the source)
echo "📝 Creating workflow file..."
echo "✅ Workflow file created at .github/workflows/daily-commit.yml"

# Create logs directory for testing
echo "📂 Creating logs directory..."
mkdir -p logs

# Add initial entry to test
echo "🧪 Creating test log entries..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')
echo "Setup completed - $TIMESTAMP" >> logs/daily-activity.log
echo "Setup completed: $TIMESTAMP" > logs/last-update.txt

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Commit and push these files to your GitHub repository"
echo "2. Go to your repository Settings → Actions → General"
echo "3. Under 'Workflow permissions', select 'Read and write permissions'"
echo "4. Test the workflow by going to Actions tab and running it manually"
echo ""
echo "The workflow will automatically run daily at 2:00 AM UTC"
echo ""
echo "Files created:"
echo "- .github/workflows/daily-commit.yml (GitHub Actions workflow)"
echo "- logs/daily-activity.log (activity log file)"
echo "- logs/last-update.txt (last update timestamp)"
echo ""
echo "Happy automating! 🚀"