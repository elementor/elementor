#!/bin/bash

# CSS Converter Test Runner
# Usage: ./run-tests.sh [test-type]
# test-type: quick, full, individual, validation

ENDPOINT="http://elementor.local/wp-json/elementor/v2/css-converter/classes"
TOKEN="my-dev-token"
CSS_FILE="test-plan.css"

echo "🧪 CSS Converter Test Runner"
echo "=============================="

# Check if CSS file exists
if [ ! -f "$CSS_FILE" ]; then
    echo "❌ Error: $CSS_FILE not found!"
    exit 1
fi

case "${1:-quick}" in
    "quick")
        echo "🚀 Running Quick Test (Typography + Border)..."
        curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d '{
                "css": ".typography-basic { color: #ff6600; font-size: 18px; font-weight: bold; text-align: center; } .border-shorthand { border: 2px solid #333; }",
                "store": false
            }' -s | jq '.data.stats'
        ;;
        
    "full")
        echo "🔥 Running Full Test Suite..."
        CSS_CONTENT=$(cat "$CSS_FILE" | tr '\n' ' ' | sed 's/"/\\"/g')
        curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d "{\"css\": \"$CSS_CONTENT\", \"store\": true}" -s | jq '.data.stats'
        ;;
        
    "individual")
        echo "🎯 Testing Individual Property Groups..."
        
        echo "📝 Typography Properties:"
        curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d '{"css": ".typography-test { color: #ff6600; font-size: 18px; font-weight: bold; text-align: center; line-height: 1.5; text-decoration: underline; text-transform: uppercase; }", "store": false}' -s | jq '.data.stats'
            
        echo "📐 Layout Properties:"
        curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d '{"css": ".layout-test { display: flex; width: 300px; height: 200px; opacity: 0.75; min-width: 100px; max-width: 500px; }", "store": false}' -s | jq '.data.stats'
            
        echo "📏 Spacing Properties:"
        curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d '{"css": ".spacing-test { margin: 10px 20px 15px 5px; padding: 8px 16px; }", "store": false}' -s | jq '.data.stats'
            
        echo "🔲 Border Properties:"
        curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d '{"css": ".border-test { border: 2px solid #333; border-radius: 8px; }", "store": false}' -s | jq '.data.stats'
        ;;
        
    "validation")
        echo "✅ Running Validation Test (Check for Warnings)..."
        CSS_CONTENT=$(cat "$CSS_FILE" | tr '\n' ' ' | sed 's/"/\\"/g')
        RESULT=$(curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d "{\"css\": \"$CSS_CONTENT\", \"store\": false}" -s)
        
        echo "📊 Stats:"
        echo "$RESULT" | jq '.data.stats'
        
        echo "⚠️  Warnings:"
        WARNINGS=$(echo "$RESULT" | jq '.data.warnings')
        if [ "$WARNINGS" = "[]" ]; then
            echo "✅ No warnings!"
        else
            echo "$WARNINGS"
        fi
        ;;
        
    "performance")
        echo "⚡ Running Performance Test..."
        CSS_CONTENT=$(cat "$CSS_FILE" | tr '\n' ' ' | sed 's/"/\\"/g')
        
        echo "Starting performance test..."
        START_TIME=$(date +%s.%N)
        
        curl -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "X-DEV-TOKEN: $TOKEN" \
            -d "{\"css\": \"$CSS_CONTENT\", \"store\": false}" -s > /dev/null
            
        END_TIME=$(date +%s.%N)
        DURATION=$(echo "$END_TIME - $START_TIME" | bc)
        
        echo "⏱️  Duration: ${DURATION}s"
        ;;
        
    *)
        echo "Usage: $0 [test-type]"
        echo ""
        echo "Available test types:"
        echo "  quick      - Quick test (typography + border)"
        echo "  full       - Full test suite (stores in DB)"
        echo "  individual - Test property groups separately"
        echo "  validation - Check for warnings and errors"
        echo "  performance - Measure conversion speed"
        echo ""
        echo "Examples:"
        echo "  $0 quick"
        echo "  $0 full"
        echo "  $0 validation"
        ;;
esac

echo ""
echo "✨ Test completed!"
