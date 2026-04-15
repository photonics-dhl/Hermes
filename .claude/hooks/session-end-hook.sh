#!/bin/bash
# Session end hook - session summary and cleanup

SESSION_DIR=".claude/sessions"
CURRENT_DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# Create session summary
echo "📋 Session Summary - $(date)" > "$SESSION_DIR/session_$CURRENT_DATE.md"
echo "" >> "$SESSION_DIR/session_$CURRENT_DATE.md"
echo "Files modified:" >> "$SESSION_DIR/session_$CURRENT_DATE.md"
git diff --name-only 2>/dev/null >> "$SESSION_DIR/session_$CURRENT_DATE.md" || echo "Not a git repository" >> "$SESSION_DIR/session_$CURRENT_DATE.md"
echo "" >> "$SESSION_DIR/session_$CURRENT_DATE.md"
echo "Untracked files:" >> "$SESSION_DIR/session_$CURRENT_DATE.md"
git ls-files --others --exclude-standard 2>/dev/null >> "$SESSION_DIR/session_$CURRENT_DATE.md" || echo "Not a git repository" >> "$SESSION_DIR/session_$CURRENT_DATE.md"

# Cleanup old sessions (keep last 10)
if [ -d "$SESSION_DIR" ]; then
    cd "$SESSION_DIR" || exit 1
    ls -t session_*.md 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    cd - > /dev/null
fi

echo "✅ Session summary saved to $SESSION_DIR/session_$CURRENT_DATE.md"
exit 0
