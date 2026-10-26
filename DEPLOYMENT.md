# Deployment Guide

## GitHub Pages Deployment (Recommended)

This dashboard is fully optimized for GitHub Pages with zero configuration needed.

### Prerequisites
- GitHub repository with this code
- GitHub Actions enabled

### Deployment Steps

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"

2. **Set Workflow Permissions**
   - Go to Settings → Actions → General
   - Select "Read and write permissions"
   - Enable "Allow GitHub Actions to create and approve pull requests"

3. **Deploy**
   - Push code to main branch
   - Workflow runs automatically
   - Dashboard available at: `https://[username].github.io/[repo-name]`

### Features
- ✅ Automatic daily commits at 2:00 AM UTC
- ✅ Real-time activity tracking
- ✅ Responsive design for all devices
- ✅ Colorful, animated dashboard
- ✅ 90-day activity heatmap
- ✅ Streak tracking and statistics

### Local Development
For local testing:
```bash
python server.py
```
Dashboard runs on `http://localhost:5000`

### Data Sources
- **GitHub Pages**: Loads from `logs/` files via GitHub API
- **Local Development**: Uses Python server endpoints
- **Fallback**: Demo data for testing

The dashboard automatically detects the environment and uses the appropriate data source.