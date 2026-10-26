# Installation Guide

## Quick Copy-Paste Installation

This is the complete repository structure for GitHub Actions daily commit automation. Follow these simple steps:

### Step 1: Copy All Files

Copy this entire folder structure to your GitHub repository:

```
your-repository/
├── .github/
│   └── workflows/
│       └── daily-commit.yml
├── .gitignore
├── README.md
├── INSTALL.md
└── setup.sh
```

### Step 2: Commit and Push

```bash
git add .
git commit -m "Add GitHub Actions daily commit automation"
git push origin main
```

### Step 3: Enable Repository Permissions

1. Go to your repository on GitHub.com
2. Click **Settings** (top menu)
3. Click **Actions** → **General** (left sidebar)
4. Under "Workflow permissions":
   - Select **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**

### Step 4: Test the Setup

1. Go to **Actions** tab in your repository
2. Find **"Daily Repository Activity"** workflow
3. Click **"Run workflow"**
4. Select your branch (usually `main`)
5. Click **"Run workflow"** button
6. Watch it complete successfully

## That's It!

Your repository will now automatically commit daily at 2:00 AM UTC. You'll see:

- New commits appearing daily
- A `logs/` directory with activity files
- Workflow runs in the Actions tab

## Alternative: Run Setup Script

If you prefer using a script:

```bash
chmod +x setup.sh
./setup.sh
```

Then follow steps 2-4 above.

## Troubleshooting

**No commits appearing?**
- Check repository permissions (Step 3)
- Verify the workflow file is in `.github/workflows/`

**Workflow failing?**
- Check Actions tab for error details
- Ensure you have admin access to the repository

**Wrong timing?**
- Edit the cron schedule in `daily-commit.yml`
- Use [crontab.guru](https://crontab.guru/) to check your schedule

Need help? Check the main README.md for detailed documentation.