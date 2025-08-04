#!/bin/bash

# Enhanced test script for webhook functionality
BASE_URL="http://localhost:2000/api/v1/embedding-tasks"
WEBHOOK_TOKEN="thinkscribe-webhook-2025-secure-token-xyz789"
PDF_URL="https://ym58rk9cpdeglu7z.public.blob.vercel-storage.com/papers/arxiv/2025/Towards_Reliable_Detection_of_Empty_Space_Conditio_1751217994898.pdf"

echo "🔍 Testing Enhanced Webhook Integration..."
echo ""

# First, check debug endpoint to see what tasks exist
echo "1. Checking existing tasks..."
curl -s -X GET "$BASE_URL/debug/tasks" \
  -H "Content-Type: application/json" \
  | jq '.data[] | {id, taskId, status, totalPapers, papersCount, papers: (.papers[] | {blobUrl, status})}'

echo ""
echo "2. Testing webhook with sample PDF URL (success)..."

# Test webhook with success status
curl -s -X POST "$BASE_URL/webhook/status-update" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: $WEBHOOK_TOKEN" \
  -d "{
    \"pdfUrl\": \"$PDF_URL\",
    \"status\": \"success\",
    \"message\": \"PDF processed successfully\"
  }" \
  | jq '.'

echo ""
echo "3. Testing webhook with another PDF URL (failed)..."

# Test webhook with failed status (if there are multiple PDFs)
curl -s -X POST "$BASE_URL/webhook/status-update" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: $WEBHOOK_TOKEN" \
  -d '{
    "pdfUrl": "https://example.com/another-paper.pdf",
    "status": "failed",
    "errorMessage": "Failed to process PDF",
    "message": "PDF processing failed"
  }' \
  | jq '.'

echo ""
echo "4. Checking tasks after webhook updates..."
curl -s -X GET "$BASE_URL/debug/tasks" \
  -H "Content-Type: application/json" \
  | jq '.data[] | {id, taskId, status, papers: (.papers[] | {blobUrl, status, errorMessage})}'

echo ""
echo "✅ Enhanced webhook test completed!"
echo ""
echo "🎯 Key improvements:"
echo "   - Webhook now works with ALL task statuses (pending, processing, completed)"
echo "   - Intelligent status transitions based on PDF completion"
echo "   - Supports updating already completed tasks"
echo "   - Better error handling and debugging"
