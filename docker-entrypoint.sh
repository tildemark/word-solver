#!/bin/sh

# Create admin.json from environment variable if it doesn't exist
if [ ! -f /app/data/admin.json ]; then
  mkdir -p /app/data
  echo "{\"token\": \"$ADMIN_TOKEN\"}" > /app/data/admin.json
  echo "Created /app/data/admin.json from ADMIN_TOKEN environment variable"
fi

# Start the app
exec npm start
