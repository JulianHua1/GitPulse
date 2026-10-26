// Dashboard JavaScript for GitHub Pages
class StreakDashboard {
    constructor() {
        this.data = {
            currentStreak: 0,
            totalCommits: 0,
            longestStreak: 0,
            successRate: 0,
            activityData: [],
            lastUpdate: null
        };
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderStats();
            this.renderHeatmap();
            this.renderStreakChart();
            this.renderRecentActivity();
            this.renderMilestones();
            this.startAutoRefresh();
            
            // Re-render on window resize for responsive design
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    this.renderHeatmap();
                    this.renderStreakChart();
                }, 100);
            });
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError();
        }
    }

    async loadData() {
        try {
            // Get repository info from current URL
            const repoInfo = this.getRepoInfo();
            
            // Load data from log files via GitHub API
            const streakData = await this.fetchFile('logs/streak-count.txt');
            const activityData = await this.fetchFile('logs/daily-activity.log');
            const lastUpdateData = await this.fetchFile('logs/last-update.txt');
            
            this.parseData(streakData, activityData, lastUpdateData);
        } catch (error) {
            console.error('Error loading data:', error);
            // Use demo data for development/testing
            this.loadDemoData();
        }
    }

    getRepoInfo() {
        // Extract repository information from GitHub Pages URL
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        if (hostname.includes('github.io')) {
            const parts = hostname.split('.');
            const username = parts[0];
            const repoName = pathname.split('/')[1] || hostname.split('.')[0];
            return { username, repoName };
        }
        
        return { username: 'demo', repoName: 'demo' };
    }

    async fetchFile(path) {
        // Check if we're running locally (Replit) or on GitHub Pages
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname.includes('replit') ||
                       window.location.port !== '';
        
        if (isLocal) {
            // Use local API endpoints for Replit
            const apiMap = {
                'logs/streak-count.txt': '/api/streak-count',
                'logs/daily-activity.log': '/api/activity-log',
                'logs/last-update.txt': '/api/last-update',
                'logs/streak-info.txt': '/api/streak-info'
            };
            
            const apiEndpoint = apiMap[path];
            if (apiEndpoint) {
                const response = await fetch(apiEndpoint);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${path}`);
                }
                return await response.text();
            }
        } else {
            // Use GitHub API for GitHub Pages
            const repoInfo = this.getRepoInfo();
            const url = `https://api.github.com/repos/${repoInfo.username}/${repoInfo.repoName}/contents/${path}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${path}`);
            }
            
            const data = await response.json();
            return atob(data.content); // Decode base64 content
        }
        
        throw new Error(`Unknown file path: ${path}`);
    }

    parseData(streakData, activityData, lastUpdateData) {
        // Parse current streak
        this.data.currentStreak = parseInt(streakData.trim()) || 0;
        
        // Parse activity log
        const activityLines = activityData.trim().split('\n').filter(line => line.length > 0);
        this.data.totalCommits = activityLines.length;
        
        // Calculate longest streak and success rate
        this.calculateStreakStats(activityLines);
        
        // Ensure longest streak is at least equal to current streak
        this.data.longestStreak = Math.max(this.data.longestStreak, this.data.currentStreak);
        
        // Parse last update
        const lastUpdateLines = lastUpdateData.trim().split('\n');
        this.data.lastUpdate = lastUpdateLines[0].replace('Last updated: ', '');
        
        // Generate activity data for charts
        this.generateActivityData(activityLines);
    }

    calculateStreakStats(activityLines) {
        let longestStreak = 0;
        let currentStreak = 0;
        let lastDate = null;
        
        const dates = activityLines.map(line => {
            const match = line.match(/(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : null;
        }).filter(date => date).sort();
        
        // Remove duplicates (same day multiple commits)
        const uniqueDates = [...new Set(dates)];
        
        uniqueDates.forEach(dateStr => {
            const date = new Date(dateStr);
            if (lastDate) {
                const diffDays = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            lastDate = date;
        });
        
        longestStreak = Math.max(longestStreak, currentStreak);
        this.data.longestStreak = longestStreak;
        
        // Calculate success rate more accurately
        if (uniqueDates.length > 0) {
            const startDate = new Date(uniqueDates[0]);
            const endDate = new Date();
            const totalDaysPossible = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            // Success rate = (unique commit days / total days possible) * 100
            // Ensure it never exceeds 100%
            this.data.successRate = Math.min(100, Math.round((uniqueDates.length / totalDaysPossible) * 100));
        } else {
            this.data.successRate = 0;
        }
    }

    generateActivityData(activityLines) {
        const last90Days = [];
        const today = new Date();
        
        // Extract all dates from activity lines and count commits per day
        const activityByDate = {};
        activityLines.forEach(line => {
            const match = line.match(/(\d{4}-\d{2}-\d{2})/);
            if (match) {
                const dateStr = match[1];
                activityByDate[dateStr] = (activityByDate[dateStr] || 0) + 1;
            }
        });
        
        // Generate last 90 days from today backwards
        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const commitCount = activityByDate[dateStr] || 0;
            const hasActivity = commitCount > 0;
            
            // Calculate activity level based on commit count
            let level = 0;
            if (hasActivity) {
                if (commitCount >= 4) level = 4;
                else if (commitCount >= 3) level = 3;
                else if (commitCount >= 2) level = 2;
                else level = 1;
            }
            
            last90Days.push({
                date: dateStr,
                activity: commitCount,
                level: level,
                commits: commitCount
            });
        }
        
        this.data.activityData = last90Days;
    }

    loadDemoData() {
        // Demo data for development/testing
        const currentStreak = 7;
        const longestStreak = 15;
        
        this.data = {
            currentStreak: currentStreak,
            totalCommits: 28,
            longestStreak: Math.max(longestStreak, currentStreak), // Ensure longest >= current
            successRate: 85, // Realistic success rate under 100%
            lastUpdate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
            activityData: []
        };
        
        // Generate demo activity data
        this.generateDemoActivity();
    }

    generateDemoActivity() {
        const last90Days = [];
        const today = new Date();
        
        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // More realistic activity pattern - 85% success rate
            // Higher chance for recent days, some gaps for realism
            let activityChance;
            if (i < 7) {
                activityChance = Math.random() > 0.1; // 90% for last week
            } else if (i < 30) {
                activityChance = Math.random() > 0.2; // 80% for last month
            } else {
                activityChance = Math.random() > 0.3; // 70% for older days
            }
            
            const commits = activityChance ? Math.floor(Math.random() * 3) + 1 : 0;
            let level = 0;
            if (commits > 0) {
                if (commits >= 3) level = 4;
                else if (commits >= 2) level = 3;
                else level = Math.floor(Math.random() * 2) + 1;
            }
            
            last90Days.push({
                date: dateStr,
                activity: commits,
                level: level,
                commits: commits
            });
        }
        
        this.data.activityData = last90Days;
    }

    renderStats() {
        document.getElementById('current-streak').textContent = this.data.currentStreak;
        document.getElementById('total-commits').textContent = this.data.totalCommits;
        document.getElementById('longest-streak').textContent = this.data.longestStreak;
        document.getElementById('success-rate').textContent = this.data.successRate + '%';
        document.getElementById('last-update').textContent = this.data.lastUpdate;
        
        // Add success animation for good streaks
        if (this.data.currentStreak >= 7) {
            document.querySelector('.stat-card.primary').classList.add('success-pulse');
            setTimeout(() => {
                document.querySelector('.stat-card.primary').classList.remove('success-pulse');
            }, 600);
        }
    }

    renderHeatmap() {
        const container = document.getElementById('activity-heatmap');
        container.innerHTML = '';
        
        // Check if mobile view
        const isMobile = window.innerWidth <= 768;
        
        // Show last 42 days (6 weeks) on mobile, full 90 days on desktop
        const dataToShow = isMobile ? 
            this.data.activityData.slice(-42) : 
            this.data.activityData;
        
        if (isMobile) {
            // Mobile: simple sequential layout
            dataToShow.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = `heatmap-day${day.level > 0 ? ' level-' + day.level : ''}`;
                dayElement.setAttribute('data-date', day.date);
                dayElement.title = `${day.date}: ${day.commits || day.activity} commit${(day.commits || day.activity) === 1 ? '' : 's'}`;
                container.appendChild(dayElement);
            });
        } else {
            // Desktop: arrange in weekly grid (13 weeks x 7 days)
            // Create 91 slots (13 weeks * 7 days) to fill the grid properly
            const totalSlots = 13 * 7; // 91 slots
            const startIndex = Math.max(0, dataToShow.length - totalSlots);
            
            // Fill grid from oldest to newest, left to right, top to bottom
            for (let i = 0; i < totalSlots; i++) {
                const dayIndex = startIndex + i;
                const day = dayIndex < dataToShow.length ? dataToShow[dayIndex] : null;
                
                const dayElement = document.createElement('div');
                if (day) {
                    dayElement.className = `heatmap-day${day.level > 0 ? ' level-' + day.level : ''}`;
                    dayElement.setAttribute('data-date', day.date);
                    dayElement.title = `${day.date}: ${day.commits || day.activity} commit${(day.commits || day.activity) === 1 ? '' : 's'}`;
                } else {
                    // Empty slot for padding
                    dayElement.className = 'heatmap-day empty';
                    dayElement.style.opacity = '0.3';
                }
                container.appendChild(dayElement);
            }
        }
        
        // Update chart header for mobile
        if (isMobile) {
            const chartHeader = container.closest('.chart-card').querySelector('.chart-header p');
            if (chartHeader) {
                chartHeader.textContent = 'Last 6 weeks of commits';
            }
        } else {
            const chartHeader = container.closest('.chart-card').querySelector('.chart-header p');
            if (chartHeader) {
                chartHeader.textContent = 'Last 90 days of commits';
            }
        }
    }

    renderStreakChart() {
        const ctx = document.getElementById('streak-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.streakChart) {
            this.streakChart.destroy();
        }
        
        // Generate streak data for last 30 days
        const last30Days = this.data.activityData.slice(-30);
        const labels = last30Days.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        let streakData = [];
        let currentStreak = 0;
        
        last30Days.forEach(day => {
            if (day.activity) {
                currentStreak++;
            } else {
                currentStreak = 0;
            }
            streakData.push(currentStreak);
        });
        
        this.streakChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Streak',
                    data: streakData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(...streakData) + 2,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 10
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    renderRecentActivity() {
        const container = document.getElementById('activity-list');
        const recentActivities = this.data.activityData
            .filter(day => day.activity)
            .slice(-7)
            .reverse();
        
        if (recentActivities.length === 0) {
            container.innerHTML = '<p>No recent activity found.</p>';
            return;
        }
        
        container.innerHTML = recentActivities.map(day => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <div class="activity-content">
                    <h4>Daily commit completed</h4>
                    <p>${new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                </div>
                <div class="activity-time">
                    ${this.getTimeAgo(day.date)}
                </div>
            </div>
        `).join('');
        
        // Re-initialize icons for new content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderMilestones() {
        const milestones = [
            { days: 7, icon: 'target', text: '1 Week Streak' },
            { days: 30, icon: 'medal', text: '1 Month Streak' },
            { days: 100, icon: 'award', text: '100 Day Streak' },
            { days: 365, icon: 'trophy', text: '1 Year Streak' }
        ];
        
        const container = document.getElementById('milestones-list');
        container.innerHTML = milestones.map(milestone => {
            const achieved = this.data.longestStreak >= milestone.days;
            const daysToGo = milestone.days - this.data.currentStreak;
            return `
                <div class="milestone ${achieved ? 'achieved' : ''}">
                    <div class="milestone-icon">
                        <i data-lucide="${milestone.icon}"></i>
                    </div>
                    <div class="milestone-text">${milestone.text}</div>
                    <div class="milestone-progress">
                        ${achieved ? 'Completed!' : (daysToGo > 0 ? `${daysToGo} days to go` : 'Almost there!')}
                    </div>
                </div>
            `;
        }).join('');
        
        // Re-initialize icons for new content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    startAutoRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            this.loadData().then(() => {
                this.renderStats();
                this.renderRecentActivity();
            }).catch(error => {
                console.log('Auto-refresh failed:', error);
            });
        }, 5 * 60 * 1000);
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    showError() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 4rem; font-family: Inter, sans-serif;">
                    <div style="background: white; border-radius: 12px; padding: 3rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <i data-lucide="alert-triangle" style="width: 64px; height: 64px; color: #f97316; margin-bottom: 1rem;"></i>
                        <h2 style="font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem;">Unable to load dashboard data</h2>
                        <p style="color: #6b7280; margin-bottom: 0.5rem;">Make sure your repository has the daily commit workflow set up and running.</p>
                        <p style="color: #6b7280;">The dashboard will show demo data for now.</p>
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        this.loadDemoData();
        setTimeout(() => this.init(), 1000);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StreakDashboard();
});