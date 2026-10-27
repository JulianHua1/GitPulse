#!/usr/bin/env python3
"""Create up to two daily activity commits when their time windows have passed."""

from __future__ import annotations

import hashlib
import os
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
import subprocess
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parent.parent
LOGS = ROOT / "logs"
ACTIVITY_LOG = LOGS / "daily-activity.log"
REPO = "JulianHua1/GitPulse"
LOCAL_TZ = ZoneInfo("America/Los_Angeles")


def targets(day: date) -> tuple[datetime, datetime]:
    digest = hashlib.sha256(f"{REPO}:{day.isoformat()}".encode()).digest()
    start = datetime.combine(day, time(13, 17), LOCAL_TZ)
    return (
        start + timedelta(seconds=int.from_bytes(digest[:2], "big") % 3001),
        start + timedelta(hours=2, seconds=int.from_bytes(digest[2:4], "big") % 3001),
    )


def activity_dates() -> list[str]:
    if not ACTIVITY_LOG.exists():
        return []
    dates = []
    for line in ACTIVITY_LOG.read_text().splitlines():
        if not line.startswith("Daily activity commit - "):
            continue
        try:
            timestamp = datetime.strptime(line[24:], "%Y-%m-%d %H:%M:%S UTC")
        except ValueError:
            continue
        dates.append(timestamp.replace(tzinfo=timezone.utc).astimezone(LOCAL_TZ).date().isoformat())
    return dates


def update_logs(now: datetime) -> None:
    LOGS.mkdir(exist_ok=True)
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    entries = ACTIVITY_LOG.read_text().splitlines() if ACTIVITY_LOG.exists() else []
    entries.append(f"Daily activity commit - {timestamp}")
    ACTIVITY_LOG.write_text("\n".join(entries[-1000:]) + "\n")
    (LOGS / "last-update.txt").write_text(f"Last updated: {timestamp}\n")

    active_days = set(activity_dates())
    cursor = now.astimezone(LOCAL_TZ).date()
    streak = 0
    while cursor.isoformat() in active_days:
        streak += 1
        cursor -= timedelta(days=1)
    (LOGS / "streak-count.txt").write_text(f"{streak}\n")
    (LOGS / "streak-info.txt").write_text(
        f"Streak started: {(cursor + timedelta(days=1)).isoformat()}\n"
    )


def git(*args: str) -> None:
    subprocess.run(["git", *args], cwd=ROOT, check=True)


def main() -> None:
    now = datetime.now(timezone.utc)
    day = now.astimezone(LOCAL_TZ).date().isoformat()
    target_times = targets(now.astimezone(LOCAL_TZ).date())
    due = sum(now >= target for target in target_times)
    existing = activity_dates().count(day)
    forced = os.environ.get("GITHUB_EVENT_NAME") == "workflow_dispatch" and os.environ.get("FORCE_COMMIT") == "true"
    commits_to_make = 1 if forced else max(0, due - existing)
    print(f"Los Angeles date: {day}; target times: {target_times}; due: {due}; existing: {existing}; forced: {forced}")

    if commits_to_make:
        git("config", "--local", "user.email", "197464004+JulianHua1@users.noreply.github.com")
        git("config", "--local", "user.name", "JulianHua1")
        for _ in range(commits_to_make):
            commit_time = datetime.now(timezone.utc)
            update_logs(commit_time)
            git("add", "logs/")
            git("commit", "-m", f"Daily activity update - {commit_time:%Y-%m-%d %H:%M:%S UTC}")
            for attempt in range(3):
                result = subprocess.run(["git", "push", "origin", "HEAD:main"], cwd=ROOT)
                if result.returncode == 0:
                    break
                if attempt == 2:
                    raise RuntimeError("Could not push activity commit")
                git("pull", "--rebase", "origin", "main")

    output_file = os.environ.get("GITHUB_OUTPUT")
    if output_file:
        with open(output_file, "a") as output:
            output.write(f"changed={'true' if commits_to_make else 'false'}\n")


if __name__ == "__main__":
    main()
