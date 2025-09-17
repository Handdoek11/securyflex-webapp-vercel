#!/bin/bash
# Pre-push hook for SecuryFlex
# Final validation before pushing to remote

set -e

echo "🚀 Running pre-push validation..."

# Navigate to frontend-app
cd frontend-app

# 1. Build check
echo "🏗️ Checking if project builds..."
npm run build || {
    echo "❌ Build failed. Fix build errors before pushing."
    exit 1
}

# 2. Run all tests
echo "🧪 Running test suite..."
npm test || {
    echo "❌ Tests failed. All tests must pass before pushing."
    exit 1
}

# 3. Run all validation scripts
echo "✔️ Running validation scripts..."

if [ -f "../scripts/validate-gps.ts" ]; then
    echo "  🛰️ GPS validation..."
    npx tsx ../scripts/validate-gps.ts || {
        echo "❌ GPS validation failed"
        exit 1
    }
fi

if [ -f "../scripts/validate-payments.ts" ]; then
    echo "  💰 Payment validation..."
    npx tsx ../scripts/validate-payments.ts || {
        echo "❌ Payment validation failed"
        exit 1
    }
fi

if [ -f "../scripts/validate-rbac.ts" ]; then
    echo "  🔐 RBAC validation..."
    npx tsx ../scripts/validate-rbac.ts || {
        echo "❌ RBAC validation failed"
        exit 1
    }
fi

# 4. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
fi

# 5. Security scan
echo "🔒 Running security audit..."
npm audit --audit-level=high || {
    echo "⚠️  Warning: Security vulnerabilities found. Consider fixing before push."
}

echo "✅ All pre-push checks passed! Ready to push."