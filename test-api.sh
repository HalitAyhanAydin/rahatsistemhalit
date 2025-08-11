#!/bin/bash

# Script to test the API endpoints

echo "Testing API endpoints..."

echo "1. Testing health check:"
curl -s http://localhost:3001/health | jq .

echo -e "\n2. Testing manual sync:"
curl -s -X POST http://localhost:3001/api/sync | jq .

echo -e "\n3. Testing accounts endpoint:"
curl -s http://localhost:3001/api/accounts | jq '.data | length'

echo -e "\n4. Testing logs endpoint:"
curl -s http://localhost:3001/api/logs | jq '.data | length'

echo -e "\nAll tests completed!"
