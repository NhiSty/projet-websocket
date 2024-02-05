#!/bin/bash

# -e Exit immediately when a command returns a non-zero status.
# -x Print commands before they are executed
set -ex

# Deploy the database
pnpm prisma migrate deploy

# Seed database
node /app/prisma/seed.js

# Start the server
node /app/src/main.js