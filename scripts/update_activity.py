#!/usr/bin/env python3
"""Create up to two daily activity commits when their time windows have passed."""

from __future__ import annotations

import hashlib
import os
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parent.parent
LOGS = ROOT / "logs"
ACTIVITY_LOG = LOGS / "daily-activity.log"
REPO = "JulianHua1/GitPulse"


def targets(day: date) -> tuple[datetime, datetime]:
    digest = hashlib.sha256(f"{REPO}:{day.isoformat()}".encode()).digest()
    start = datetime.combine(day, time(2, 17), timezone.utc)
    return (
        start + timedelta(seconds=int.from_bytes(digest[:2], "big") % 3001),
        start + timedelta(hours=1, seconds=int.from_bytes(digest[2:4], "big") % 3001),
    )


def activity_dates() -> list[str]:
    if not ACTIVITY_LOG.exists():
        return []
    return [
        line[24:34]
        for line in ACTIVITY_LOG.read_text().splitlines()
        if line.startswith("Daily activity commit - ") and len(line) >= 34
    ]


def update_logs(now: datetime) -> None:
    LOGS.mkdir(exist_ok=True)
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    entries = ACTIVITY_LOG.read_text().splitlines() if ACTIVITY_LOG.exists() else []
    entries.append(f"Daily activity commit - {timestamp}")
    ACTIVITY_LOG.write_text("\n".join(entries[-1000:]) + "\n")
    (LOGS / "last-update.txt").write_text(f"Last updated: {timestamp}\n")

    active_days = set(activity_dates())
    cursor = now.date()
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
    day = now.date().isoformat()
    target_times = targets(now.date())
    due = sum(now >= target for target in target_times)
    existing = activity_dates().count(day)
    print(f"UTC date: {day}; target times: {target_times}; due: {due}; existing: {existing}")

    if due > existing:
        git("config", "--local", "user.email", "197464004+JulianHua1@users.noreply.github.com")
        git("config", "--local", "user.name", "JulianHua1")
        for _ in range(due - existing):
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
            output.write(f"changed={'true' if due > existing else 'false'}\n")


if __name__ == "__main__":
    main()
