#!/bin/bash
# Pre-commit hook for SecuryFlex
# Ensures code quality before commits

set -e

echo "🔍 Running pre-commit checks..."

# Navigate to frontend-app
cd frontend-app

# 1. Type checking
echo "📝 Checking TypeScript types..."
npm run check-types || {
    echo "❌ Type checking failed. Please fix type errors before committing."
    exit 1
}

# 2. Linting
echo "🧹 Running ESLint..."
npm run lint || {
    echo "❌ Linting failed. Run 'npm run lint:fix' to auto-fix issues."
    exit 1
}

# 3. Check for hardcoded secrets
echo "🔐 Checking for hardcoded secrets..."
if grep -r "sk_live_\|pk_live_\|sbp_" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir="node_modules" --exclude-dir=".next" . 2>/dev/null; then
    echo "❌ Found hardcoded API keys or secrets. Use environment variables instead."
    exit 1
fi

# 4. Check for console.log in production code
echo "🚫 Checking for console.log statements..."
if grep -r "console\.log" --include="*.tsx" --include="*.ts" --exclude-dir="node_modules" --exclude-dir=".next" --exclude="*.test.*" --exclude="*.stories.*" src/ 2>/dev/null; then
    echo "⚠️  Warning: console.log statements found. Consider removing for production."
fi

# 5. Translation completeness
echo "🌍 Checking translation files..."
NL_KEYS=$(grep -o '"[^"]*":' src/locales/nl.json | sort | uniq | wc -l)
EN_KEYS=$(grep -o '"[^"]*":' src/locales/en.json | sort | uniq | wc -l)

if [ "$NL_KEYS" -ne "$EN_KEYS" ]; then
    echo "⚠️  Warning: Translation files have different number of keys (nl: $NL_KEYS, en: $EN_KEYS)"
fi

# 6. Check if migrations are needed
echo "💾 Checking database schema..."
npm run db:generate -- --dry-run > /dev/null 2>&1 || {
    echo "⚠️  Warning: Database schema changes detected. Run 'npm run db:generate' if needed."
}

echo "✅ All pre-commit checks passed!"