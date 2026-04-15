#!/bin/bash
# Post-write hook for Write/Edit operations

FILE_PATH="$1"
shift

# Check file extension
EXT="${FILE_PATH##*.}"

case "$EXT" in
    "ts"|"tsx")
        echo "📝 TypeScript file modified - running checks..."
        if command -v npx &> /dev/null; then
            npx tsc --noEmit --skipLibCheck "$FILE_PATH" 2>/dev/null || true
        fi
        ;;
    "md")
        echo "📄 Markdown file modified"
        ;;
    "json")
        echo "📋 JSON file modified - validating..."
        if command -v node &> /dev/null; then
            node -e "JSON.parse(require('fs').readFileSync('$FILE_PATH', 'utf8'))" 2>/dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"
        fi
        ;;
    *)
        echo "📄 File modified: $FILE_PATH"
        ;;
esac

exit 0
