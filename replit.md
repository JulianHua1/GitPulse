# Daily Repository Activity Automation

## Overview

This repository contains a GitHub Actions automation system designed to maintain daily activity by making scheduled commits. The system is built around a simple workflow that appends timestamps to log files, ensuring consistent repository activity without adding unnecessary bloat.

## User Preferences

Preferred communication style: Simple, everyday language.
Timezone: Indian Standard Time (IST) for all timestamps and scheduling.
Date completed: 2025-07-25 - Complete daily commit automation with modern, mobile-optimized dashboard ready for GitHub Pages deployment.

## System Architecture

### Core Architecture
- **Automation Layer**: GitHub Actions workflow engine
- **Scheduling System**: Cron-based daily triggers (2:00 AM UTC)
- **Data Storage**: File-based logging system using simple text files
- **Version Control**: Git-based commit automation

### Technology Stack
- **CI/CD Platform**: GitHub Actions
- **Runtime Environment**: Ubuntu latest runner
- **File System**: Standard file operations for log management
- **Authentication**: Built-in GITHUB_TOKEN for repository access

## Key Components

### 1. Workflow Engine (`.github/workflows/daily-commit.yml`)
- **Purpose**: Orchestrates daily commit automation and GitHub Pages deployment
- **Trigger**: Time-based cron schedule (daily at 2:00 AM UTC) + manual dispatch
- **Actions**: File manipulation, git operations, repository updates, and Pages deployment
- **Permissions**: Read/write access to repository content and Pages deployment

### 2. Logging System
- **Primary Log**: `logs/daily-activity.log` - Cumulative activity record
- **Status File**: `logs/last-update.txt` - Latest update timestamp
- **Directory Structure**: Organized under `/logs/` for easy management

### 3. Git Automation
- **Commit Strategy**: Minimal, timestamp-based changes
- **Branch Management**: Operates on main/default branch
- **Message Format**: Standardized commit messages for activity tracking

## Data Flow

1. **Scheduled Trigger**: GitHub Actions cron job activates daily
2. **Environment Setup**: Runner initializes with repository checkout
3. **Log Generation**: Current timestamp appended to activity logs
4. **File Updates**: Both cumulative and status files are updated
5. **Git Operations**: Changes are staged, committed, and pushed
6. **Completion**: Workflow concludes with success/failure status

## External Dependencies

### GitHub Services
- **GitHub Actions**: Core automation platform
- **GITHUB_TOKEN**: Built-in authentication mechanism
- **Git Infrastructure**: Version control and repository management

### Runtime Dependencies
- **Ubuntu Runner**: Provides execution environment
- **Git Client**: Pre-installed on GitHub runners
- **File System Access**: Standard POSIX file operations

## Deployment Strategy

### Setup Process
1. **Repository Setup**: Push code to GitHub repository
2. **GitHub Pages**: Enable with "GitHub Actions" source in repository settings
3. **Permission Configuration**: Enable read/write permissions in Actions settings
4. **Automatic Deployment**: Workflow deploys dashboard to GitHub Pages after each update
5. **Access**: Dashboard available at `https://[username].github.io/[repository-name]`

### Maintenance Approach
- **Zero-maintenance**: Fully automated operation
- **Self-healing**: Creates necessary directories and files as needed
- **Minimal footprint**: Uses append-only operations to prevent bloat
- **Monitoring**: Built-in GitHub Actions logging and status reporting

### Customization Points
- **Schedule modification**: Cron expression can be adjusted
- **Log format changes**: Timestamp format and content customizable
- **File locations**: Log directory and file names configurable
- **Commit messages**: Message templates can be modified

The system prioritizes simplicity and reliability, avoiding complex dependencies while maintaining consistent repository activity through automated daily commits. The dashboard intelligently detects GitHub Pages hosting and loads data directly from log files, ensuring seamless operation in both development and production environments.