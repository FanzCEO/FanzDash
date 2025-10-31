#!/bin/bash

# Sync deployment configurations to all FANZ repositories
# This script copies the latest deployment improvements to all your repos

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   FANZ Repository Sync Tool${NC}"
echo -e "${BLUE}   Syncing deployment configurations to all repositories${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# Save original directory (this is the source repository)
ORIGINAL_DIR=$(pwd)

# Source directory (use current directory - script should be run from FANZDash-V1)
# This makes the script portable and works regardless of where the repo is located
SOURCE_DIR="$ORIGINAL_DIR"

# Target repositories
# Specify repository paths via environment variable FANZ_REPOS (colon-separated), or via repos.txt file (one path per line)
if [ -n "$FANZ_REPOS" ]; then
    IFS=':' read -r -a REPOS <<< "$FANZ_REPOS"
elif [ -f "repos.txt" ]; then
    # Check if repos.txt is gitignored
    if git check-ignore -q "repos.txt"; then
        mapfile -t REPOS < "repos.txt"
    else
        echo -e "${YELLOW}⚠️  Warning: repos.txt is not gitignored. It may expose personal file system structure if committed.${NC}"
        echo -e "${YELLOW}   Please add 'repos.txt' to your .gitignore file.${NC}"
        mapfile -t REPOS < "repos.txt"
    fi
else
    echo -e "${RED}✗ No repository paths specified. Set FANZ_REPOS or create repos.txt.${NC}"
    exit 1
fi

# Files to sync
declare -a FILES=(
    "render.yaml"
    ".do/app.yaml"
    "RENDER_DEPLOYMENT_GUIDE.md"
    "DIGITALOCEAN_DEPLOYMENT_GUIDE.md"
    "DEPLOYMENT_PLATFORM_COMPARISON.md"
    "DEPLOYMENT_CHECKLIST.md"
    "SUPABASE_SETUP_GUIDE.md"
    "QUICK_START.md"
    "CODEBASE_IMPROVEMENTS_SUMMARY.md"
    "FINAL_IMPROVEMENTS_REPORT.md"
    "server/lib/supabase.ts"
    "server/middleware/auth.ts"
    "server/utils/logger.ts"
    "server/db/index.ts"
    "supabase/migrations/20250130000000_initial_schema.sql"
)

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}✗ Source directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Source directory found: $SOURCE_DIR${NC}\n"

# Function to sync files to a repository
sync_repo() {
    local repo_path="$1"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Syncing to: $repo_path${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    # Check if repository exists
    if [ ! -d "$repo_path" ]; then
        echo -e "${YELLOW}⚠ Repository not found, skipping: $repo_path${NC}\n"
        return 1
    fi

    # Check if it's a git repository
    if [ ! -d "$repo_path/.git" ]; then
        echo -e "${YELLOW}⚠ Not a git repository, skipping: $repo_path${NC}\n"
        return 1
    fi

    echo -e "${GREEN}✓ Repository found and validated${NC}\n"

    # Track copied files
    local copied=0
    local skipped=0
    local created_dirs=0

    # Copy each file
    for file in "${FILES[@]}"; do
        local source_file="$SOURCE_DIR/$file"
        local target_file="$repo_path/$file"
        local target_dir="$(dirname "$target_file")"

        # Check if source file exists
        if [ ! -f "$source_file" ]; then
            echo -e "${YELLOW}  ⚠ Source file not found, skipping: $file${NC}"
            ((skipped++))
            continue
        fi

        # Create target directory if it doesn't exist
        if [ ! -d "$target_dir" ]; then
            echo -e "  ${BLUE}→ Creating directory: $(basename \"$target_dir\")/${NC}"
            mkdir -p "$target_dir"
            ((created_dirs++))
        fi

        # Copy file
        echo -e "  ${GREEN}✓ Copying: $file${NC}"
        cp "$source_file" "$target_file"
        ((copied++))
    done

    # Remove vercel.json if it exists
    if [ -f "$repo_path/vercel.json" ]; then
        echo -e "\n  ${RED}✗ vercel.json found (not suitable for full-stack)${NC}"
        echo -ne "  ${YELLOW}⚠ Do you want to back up and remove vercel.json? [y/N]: ${NC}"
        read -r confirm_vercel
        if [[ "$confirm_vercel" =~ ^[Yy]$ ]]; then
            cp "$repo_path/vercel.json" "$repo_path/vercel.json.bak"
            rm "$repo_path/vercel.json"
            echo -e "  ${GREEN}✓ vercel.json backed up as vercel.json.bak and removed.${NC}"
        else
            echo -e "  ${YELLOW}⚠ Skipped removing vercel.json.${NC}"
        fi
    fi

    # Summary
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Sync Summary for $(basename "$repo_path"):${NC}"
    echo -e "  ${GREEN}✓ Files copied: $copied${NC}"
    echo -e "  ${BLUE}→ Directories created: $created_dirs${NC}"
    if [ $skipped -gt 0 ]; then
        echo -e "  ${YELLOW}⚠ Files skipped: $skipped${NC}"
    fi
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    # Ask about git commit
    echo -e "${YELLOW}Do you want to commit these changes? (y/n)${NC}"
    read -t 30 -n 1 -r commit_answer || commit_answer="n"
    echo

    if [[ $commit_answer =~ ^[Yy]$ ]]; then
        # Use subshell to avoid changing the working directory of the parent script
        # Capture exit status to propagate failures properly
        local git_status=0
        # Temporarily disable set -e for status capture to work correctly
        set +e
        (
            cd "$repo_path" || exit 1
            git add -A || exit 1
            git commit -m "Sync deployment configurations from FANZDash-V1

✅ Added/Updated:
- Render deployment configuration (render.yaml)
- DigitalOcean configuration (.do/app.yaml)
- Complete deployment guides (Render + DigitalOcean)
- Platform comparison guide
- Enhanced authentication middleware
- Production-ready logging system
- Supabase integration

❌ Removed:
- vercel.json (not suitable for full-stack Express apps)

🚀 Ready for deployment to Render or DigitalOcean with Supabase

🤖 Synced from FANZDash-V1" --no-gpg-sign || exit 1

            echo -e "${GREEN}✓ Changes committed!${NC}\n"

            echo -e "${YELLOW}Do you want to push to remote? (y/n)${NC}"
            read -t 10 -n 1 -r push_answer || push_answer="n"
            echo

            if [[ $push_answer =~ ^[Yy]$ ]]; then
                if ! git push origin main 2>/dev/null && ! git push origin master 2>/dev/null; then
                    echo -e "${RED}✗ Failed to push to remote${NC}\n"
                    exit 1
                fi
                echo -e "${GREEN}✓ Pushed to remote!${NC}\n"
            else
                echo -e "${YELLOW}⚠ Skipped push (you can push manually later)${NC}\n"
            fi
        )
        git_status=$?
        set -e

        if [ $git_status -ne 0 ]; then
            echo -e "${RED}✗ Git operations failed for $(basename "$repo_path")${NC}\n"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ Skipped commit (you can commit manually later)${NC}\n"
    fi

    return 0
}

# Sync to all repositories
total_repos=${#REPOS[@]}
synced=0
failed=0

for repo in "${REPOS[@]}"; do
    if sync_repo "$repo"; then
        ((synced++))
    else
        ((failed++))
    fi
done

# Final summary
echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Final Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Repositories synced: $synced / $total_repos${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${YELLOW}⚠ Repositories skipped: $failed${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}🎉 Sync complete!${NC}"
echo -e "\nAll repositories now have:"
echo -e "  ✅ Render + DigitalOcean deployment configurations"
echo -e "  ✅ Complete deployment guides"
echo -e "  ✅ Enhanced authentication and logging"
echo -e "  ✅ Supabase integration"
echo -e "  ❌ Vercel configuration removed\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Review changes in each repository"
echo -e "  2. Test deployments"
echo -e "  3. Follow guides: RENDER_DEPLOYMENT_GUIDE.md or DIGITALOCEAN_DEPLOYMENT_GUIDE.md\n"

# Restore original directory (safety measure)
cd "$ORIGINAL_DIR" || true
