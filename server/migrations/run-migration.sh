#!/bin/bash

# ============================================================================
# FanzDash Migration Runner
# ============================================================================
# This script runs database migrations for the FANZ Unified Ecosystem
# 
# Usage:
#   ./run-migration.sh                    # Runs all migrations
#   ./run-migration.sh 001                # Runs specific migration
#   ./run-migration.sh --rollback 001     # Rolls back migration (if supported)
#
# Prerequisites:
#   - PostgreSQL installed and running
#   - DATABASE_URL set in .env file
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ../../.env ]; then
    source ../../.env
elif [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Parse DATABASE_URL or use individual components
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Warning: DATABASE_URL not set, using default localhost${NC}"
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_NAME="fanzdash"
    DB_USER="postgres"
else
    # Parse DATABASE_URL
    # Format: postgresql://username:password@host:port/database
    DB_CONNECTION_STRING="$DATABASE_URL"
fi

# Function to run a migration
run_migration() {
    local migration_file=$1
    echo -e "${YELLOW}Running migration: ${migration_file}${NC}"
    
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -f "$migration_file"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration completed: ${migration_file}${NC}"
    else
        echo -e "${RED}❌ Migration failed: ${migration_file}${NC}"
        exit 1
    fi
}

# Function to verify migration
verify_migration() {
    echo -e "${YELLOW}Verifying database schema...${NC}"
    
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -c "\dt" -c "\di"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" -c "\di"
    fi
    
    echo -e "${GREEN}✅ Schema verification complete${NC}"
}

# Main execution
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}FanzDash Migration Runner${NC}"
echo -e "${GREEN}================================${NC}"

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage:"
    echo "  ./run-migration.sh                    # Runs all migrations"
    echo "  ./run-migration.sh 001                # Runs specific migration"
    echo "  ./run-migration.sh --verify           # Verify schema only"
    exit 0
fi

if [ "$1" = "--verify" ]; then
    verify_migration
    exit 0
fi

# Get migration files
if [ -z "$1" ]; then
    # Run all migrations in order
    echo -e "${YELLOW}Running all migrations...${NC}"
    for migration in $(ls -1 *.sql | sort); do
        run_migration "$migration"
    done
else
    # Run specific migration
    migration_file="${1}_*.sql"
    if [ ! -f $migration_file ]; then
        echo -e "${RED}Error: Migration file not found: ${migration_file}${NC}"
        exit 1
    fi
    run_migration "$migration_file"
fi

# Verify after migration
verify_migration

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All migrations completed successfully!${NC}"
echo -e "${GREEN}================================${NC}"

exit 0
