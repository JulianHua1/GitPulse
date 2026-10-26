# GitHub Pages Setup Instructions

## Quick Setup (3 minutes)

### 1. Repository Setup
1. Push this code to your GitHub repository
2. Go to your repository settings
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"

### 2. Workflow Permissions
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Click "Save"

### 3. Activate the Workflow
The workflow will automatically:
- Run daily at 2:00 AM UTC
- Update activity logs
- Deploy the updated dashboard to GitHub Pages
- Your dashboard will be available at: `https://[username].github.io/[repository-name]`

## Manual Testing
To test the workflow manually:
1. Go to Actions tab
2. Click "Daily Commit Tracker"
3. Click "Run workflow"

## What the Automation Does
- ✅ Creates daily commit entries
- ✅ Updates streak counters
- ✅ Maintains activity logs
- ✅ Deploys dashboard to GitHub Pages
- ✅ Works completely hands-free

## Files Created
- `.github/workflows/daily-commit.yml` - GitHub Actions workflow
- `logs/daily-activity.log` - Activity tracking
- `logs/streak-count.txt` - Current streak count
- `logs/last-update.txt` - Last update timestamp

## Troubleshooting
If the workflow fails:
1. Check workflow permissions are set correctly
2. Ensure GitHub Pages is enabled with "GitHub Actions" source
3. Check the Actions tab for error details

The dashboard automatically detects GitHub Pages hosting and loads data directly from the log files.