#!/usr/bin/env bash

set -euo pipefail

REPO_URL="${1:-}"
COMMIT_MESSAGE="${2:-Update portfolio}"

if [[ -z "$REPO_URL" ]]; then
  echo "Usage: ./scripts/publish-github.sh <github-repo-url> [commit-message]"
  echo "Example: ./scripts/publish-github.sh https://github.com/martin-motion/portfolio.git \"Update home\""
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Git is required but not installed."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

HAS_HEAD="true"
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  HAS_HEAD="false"
fi

git branch -M main
git add .

if [[ "$HAS_HEAD" == "false" ]] || ! git diff --cached --quiet; then
  git commit -m "$COMMIT_MESSAGE"
else
  echo "No local changes to commit."
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git push -u origin main

echo
echo "GitHub push complete."
echo "If the repository is linked in Vercel, deployment will start automatically."
