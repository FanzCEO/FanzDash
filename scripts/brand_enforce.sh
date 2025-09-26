#!/usr/bin/env bash
set -euo pipefail

# FANZ Branding Enforcement Script
# Enforces consistent branding across all FANZ repositories
# - Migrates FUN* modules to Fanz* equivalents
# - Renames FanzSocial to FanzSocial
# - Replaces TabooFanz.com with TabooFanz.com

echo "🏷️  Starting FANZ branding enforcement..."

# Check if ripgrep is available
if ! command -v rg &> /dev/null; then
    echo "⚠️  ripgrep (rg) not found. Install with: brew install ripgrep"
    echo "🔄 Falling back to grep for basic replacements..."
    USE_GREP=true
else
    USE_GREP=false
fi

# FUN to Fanz module mappings (only target known FUN modules to avoid generic 'fun' words)
declare -a FUN_TO_FANZ=(
    "FanzStream:FanzStream"
    "FanzClips:FanzClips"
    "FanzRequest:FanzRequest"
    "FanzShop:FanzShop"
    "FanzNFT:FanzNFT"
    "FanzCard:FanzCard"
    "FanzStage:FanzStage"
    "FanzForum:FanzForum"
    "FanzRank:FanzRank"
    "FanzReach:FanzReach"
    "FanzGames:FanzGames"
)

# Function to perform safe replacements
safe_replace() {
    local from="$1"
    local to="$2"
    local count=0
    
    if [ "$USE_GREP" = false ]; then
        # Use ripgrep for more precise matching
        if rg -l --hidden --no-ignore -g '!node_modules' -g '!*lock*' -g '!.git' "$from" . >/dev/null 2>&1; then
            local files=$(rg -l --hidden --no-ignore -g '!node_modules' -g '!*lock*' -g '!.git' "$from" .)
            echo "  🔄 Replacing '$from' → '$to' in $(echo "$files" | wc -l) files"
            
            # Use sed for actual replacement
            echo "$files" | xargs sed -i '' -e "s/$from/$to/g"
            count=$(echo "$files" | wc -l)
        fi
    else
        # Fallback to grep
        if grep -r -l "$from" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*lock*" 2>/dev/null; then
            local files=$(grep -r -l "$from" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*lock*" 2>/dev/null)
            echo "  🔄 Replacing '$from' → '$to' in $(echo "$files" | wc -l) files"
            
            echo "$files" | xargs sed -i '' -e "s/$from/$to/g"
            count=$(echo "$files" | wc -l)
        fi
    fi
    
    return $count
}

# 1. FUN Module Replacements
echo "📦 Processing FUN → Fanz module migrations..."
total_fun_changes=0

for pair in "${FUN_TO_FANZ[@]}"; do
    FROM="${pair%%:*}"
    TO="${pair##*:}"
    
    echo "  🏷️  Checking for: $FROM"
    safe_replace "$FROM" "$TO"
    total_fun_changes=$((total_fun_changes + $?))
done

if [ $total_fun_changes -gt 0 ]; then
    echo "✅ Completed $total_fun_changes FUN → Fanz module updates"
else
    echo "✅ No FUN modules found to update"
fi

# 2. FanzSocial → FanzSocial
echo "📱 Processing FanzSocial → FanzSocial rename..."
safe_replace "FanzSocial" "FanzSocial"
fusion_changes=$?

if [ $fusion_changes -gt 0 ]; then
    echo "✅ Updated $fusion_changes FanzSocial references to FanzSocial"
else
    echo "✅ No FanzSocial references found"
fi

# 3. Domain Updates: TabooFanz.com → TabooFanz.com
echo "🌐 Processing domain updates..."
safe_replace "ebonyfanz\.com" "TabooFanz.com"
domain_changes=$?

if [ $domain_changes -gt 0 ]; then
    echo "✅ Updated $domain_changes domain references"
else
    echo "✅ No legacy domain references found"
fi

# 4. Additional cleanup: ensure Fanz Unlimited Network consistency
echo "🔧 Ensuring Fanz Unlimited Network (FANZ) consistency..."

# Replace any remaining "FUN Network" or "Fun Network" with "FANZ"
safe_replace "FUN Network" "FANZ"
safe_replace "Fun Network" "FANZ"

# Update any package.json names that might still reference old branding
if [ -f "package.json" ]; then
    if grep -q "fun-" package.json 2>/dev/null; then
        echo "  🔧 Updating package.json references..."
        sed -i '' 's/"fun-/"fanz-/g' package.json
        sed -i '' 's/"Fun /"Fanz /g' package.json
    fi
fi

# 5. Validate changes
echo "🔍 Validating branding consistency..."

validation_errors=0

# Check for any remaining FUN modules that might have been missed
if [ "$USE_GREP" = false ]; then
    if rg -i "FUN(Stream|Clips|Request|Shop|NFT|Card|Stage|Forum|Rank|Reach|Games)" . -g '!node_modules' -g '!*lock*' -g '!.git' >/dev/null 2>&1; then
        echo "⚠️  Warning: Found remaining FUN module references:"
        rg -i "FUN(Stream|Clips|Request|Shop|NFT|Card|Stage|Forum|Rank|Reach|Games)" . -g '!node_modules' -g '!*lock*' -g '!.git' || true
        validation_errors=$((validation_errors + 1))
    fi
    
    # Check for remaining FanzSocial references
    if rg -i "FanzSocial" . -g '!node_modules' -g '!*lock*' -g '!.git' >/dev/null 2>&1; then
        echo "⚠️  Warning: Found remaining FanzSocial references:"
        rg -i "FanzSocial" . -g '!node_modules' -g '!*lock*' -g '!.git' || true
        validation_errors=$((validation_errors + 1))
    fi
    
    # Check for old domain references
    if rg -i "ebonyfanz\.com" . -g '!node_modules' -g '!*lock*' -g '!.git' >/dev/null 2>&1; then
        echo "⚠️  Warning: Found remaining legacy domain references:"
        rg -i "ebonyfanz\.com" . -g '!node_modules' -g '!*lock*' -g '!.git' || true
        validation_errors=$((validation_errors + 1))
    fi
fi

# Summary
total_changes=$((total_fun_changes + fusion_changes + domain_changes))

echo ""
echo "🏆 FANZ Branding Enforcement Complete!"
echo "📊 Summary:"
echo "  • FUN → Fanz modules: $total_fun_changes changes"
echo "  • FanzSocial → FanzSocial: $fusion_changes changes"
echo "  • Domain updates: $domain_changes changes"
echo "  • Total changes: $total_changes"

if [ $validation_errors -eq 0 ]; then
    echo "✅ All branding appears consistent!"
    exit 0
else
    echo "⚠️  $validation_errors validation warnings found - manual review recommended"
    exit 1
fi