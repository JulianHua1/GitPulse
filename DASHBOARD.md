# Dashboard Setup Guide

## Quick Setup for GitHub Pages

### Step 1: Enable GitHub Pages
1. Go to your repository **Settings**
2. Scroll down to **Pages** section
3. Under "Source", select **"Deploy from a branch"**
4. Choose **"main"** branch and **"/ (root)"** folder
5. Click **Save**

### Step 2: Access Your Dashboard
After 2-3 minutes, your dashboard will be available at:
```
https://yourusername.github.io/repository-name
```

### Step 3: Dashboard Features

**Live Statistics:**
- 🔥 Current streak counter
- 📊 Total commits made
- 🏆 Longest streak achieved
- ✅ Success rate percentage

**Visual Components:**
- **Activity Heatmap**: 90-day visual history (like GitHub's contribution graph)
- **Streak Trend Chart**: Line chart showing streak progression over last 30 days
- **Recent Activity**: List of your last 7 commits
- **Milestones**: Progress toward streak goals (1 week, 1 month, 100 days, 1 year)

**Auto-Refresh:**
- Dashboard updates automatically every 5 minutes
- Pulls real data from your repository logs
- Shows live streak information

### Customization Options

**Colors and Styling:**
Edit `dashboard.css` to change:
- Color schemes
- Animation effects
- Layout and spacing

**Data Display:**
Edit `dashboard.js` to modify:
- Milestone targets
- Chart types and styles
- Refresh intervals
- Data calculations

**Content:**
Edit `index.html` to change:
- Page title and descriptions
- Dashboard sections
- Additional features

### Troubleshooting

**Dashboard shows demo data:**
- Make sure your repository has the workflow running
- Check that log files exist in the `logs/` directory
- Verify GitHub Pages is enabled and deployed

**Charts not displaying:**
- Check browser console for JavaScript errors
- Ensure internet connection (uses CDN for Chart.js)
- Try refreshing the page

**Data not updating:**
- Wait a few minutes for GitHub Pages to update
- Check if new commits are being made by the workflow
- Verify log files are being updated

### Technical Details

**Data Sources:**
- `logs/streak-count.txt` - Current streak number
- `logs/daily-activity.log` - All commit history
- `logs/last-update.txt` - Latest update timestamp

**APIs Used:**
- GitHub Contents API for reading log files
- Chart.js for interactive charts
- Vanilla JavaScript for dashboard logic

**Browser Compatibility:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Works offline after initial load

Your dashboard is now ready to track and visualize your daily commit streaks!