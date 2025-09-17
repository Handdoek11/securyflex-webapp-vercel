#!/bin/bash
# Post-code-change hook for SecuryFlex
# Automatically runs relevant tests after code changes

set -e

echo "🔄 Code changes detected, running relevant tests..."

# Get changed files (if available from git)
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || echo "")

# Navigate to frontend-app
cd frontend-app

# Determine what tests to run based on changed files
RUN_GPS_TESTS=false
RUN_PAYMENT_TESTS=false
RUN_AUTH_TESTS=false
RUN_ALL_TESTS=false

if [ -z "$CHANGED_FILES" ]; then
    # No git info, run based on most recent changes
    RUN_ALL_TESTS=true
else
    # Check what was changed
    if echo "$CHANGED_FILES" | grep -q "gps\|GPS\|location\|checkin"; then
        RUN_GPS_TESTS=true
    fi

    if echo "$CHANGED_FILES" | grep -q "payment\|finqle\|invoice\|transaction"; then
        RUN_PAYMENT_TESTS=true
    fi

    if echo "$CHANGED_FILES" | grep -q "auth\|role\|permission\|clerk"; then
        RUN_AUTH_TESTS=true
    fi

    if echo "$CHANGED_FILES" | grep -q "Schema\.ts\|migration"; then
        RUN_ALL_TESTS=true
    fi
fi

# Run type checking
echo "📝 Running type check..."
npm run check-types || {
    echo "⚠️  Type errors detected"
}

# Run specific tests based on changes
if [ "$RUN_ALL_TESTS" = true ]; then
    echo "🧪 Running all tests..."
    npm test 2>/dev/null || echo "⚠️  Some tests failed"

    # Run validation scripts if they exist
    if [ -f "../scripts/validate-gps.ts" ]; then
        echo "🛰️ Running GPS validation..."
        npx tsx ../scripts/validate-gps.ts 2>/dev/null || echo "⚠️  GPS validation issues"
    fi

    if [ -f "../scripts/validate-payments.ts" ]; then
        echo "💰 Running payment validation..."
        npx tsx ../scripts/validate-payments.ts 2>/dev/null || echo "⚠️  Payment validation issues"
    fi
else
    if [ "$RUN_GPS_TESTS" = true ]; then
        echo "🛰️ Running GPS-related tests..."
        npm test -- --grep "gps\|location\|checkin" 2>/dev/null || echo "⚠️  GPS tests need attention"

        if [ -f "../scripts/validate-gps.ts" ]; then
            npx tsx ../scripts/validate-gps.ts 2>/dev/null || echo "⚠️  GPS validation issues"
        fi
    fi

    if [ "$RUN_PAYMENT_TESTS" = true ]; then
        echo "💰 Running payment-related tests..."
        npm test -- --grep "payment\|finqle" 2>/dev/null || echo "⚠️  Payment tests need attention"

        if [ -f "../scripts/validate-payments.ts" ]; then
            npx tsx ../scripts/validate-payments.ts 2>/dev/null || echo "⚠️  Payment validation issues"
        fi
    fi

    if [ "$RUN_AUTH_TESTS" = true ]; then
        echo "🔐 Running auth-related tests..."
        npm test -- --grep "auth\|role\|permission" 2>/dev/null || echo "⚠️  Auth tests need attention"
    fi
fi

echo "✅ Post-code-change checks complete!"