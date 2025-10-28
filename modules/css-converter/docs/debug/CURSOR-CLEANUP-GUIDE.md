# Cursor Rules Cleanup Guide

## Phase 1: Quick Wins (5 minutes)

### Step 1: Delete Backup Files
```bash
rm -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/.cursor/rules/*.bak
```

**Impact:** Removes 6 backup files that pollute the rule namespace without providing value.

### Step 2: Verify Backup Deletion
```bash
ls /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/.cursor/rules/
```

Should only show:
- `rules-index-pointer.mdc` (the pointer file)

---

## Phase 2: Rule Consolidation (15 minutes)

### Step 3: Identify Duplicate Rules

Current duplicates to consolidate:
- `general-code-style.mdc` (4 copies)
- `tests-code-style.mdc` (4 copies)
- `class-naming-conventions.mdc` (2 copies)
- `refactoring-best-practices.mdc` (2 copies)

### Step 4: Create Master Rules Directory

Create a centralized rules directory at workspace root:
```bash
mkdir -p /Users/janvanvlastuin1981/Local\ Sites/elementor/.cursor/rules
mkdir -p /Users/janvanvlastuin1981/Local\ Sites/elementor/.cursor/system-prompts
```

### Step 5: Compare Duplicate Rule Versions

Before consolidating, compare versions to ensure you're keeping the best one:

```bash
# Compare general-code-style versions
echo "=== elementor version ==="
cat /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/plugins/elementor/.cursor/rules/general-code-style.mdc

echo -e "\n=== hello-plus version ==="
cat /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/plugins/hello-plus/.cursor/rules/general-code-style.mdc
```

**If they're identical:** Keep ONE, delete the others  
**If they differ:** Create a unified version that combines best practices

### Step 6: Update Glob Patterns

For each rule file you keep, update the glob pattern to be specific:

**BAD (current):**
```yaml
---
globs: ["**/*.php"]
---
```

**GOOD (recommended):**
```yaml
---
globs: ["plugins/elementor/**/*.php", "plugins/hello-plus/**/*.php"]
---
```

**For elementor-specific rules only:**
```yaml
---
globs: ["plugins/elementor/**/*.php"]
---
```

---

## Phase 3: Structural Reorganization (30 minutes)

### Option A: Fully Consolidated (Recommended)

**Advantages:**
- Single source of truth
- Clear priority hierarchy
- Easier maintenance
- Minimal context loading

**Steps:**
```bash
# Create master .cursor/rules directory
mkdir -p /Users/janvanvlastuin1981/Local\ Sites/elementor/.cursor/rules

# Copy deduplicated rules there with updated globs
cp elementor/.cursor/rules/general-code-style.mdc \
   .cursor/rules/general-code-style-elementor.mdc

cp hello-plus/.cursor/rules/general-code-style.mdc \
   .cursor/rules/general-code-style-hello-plus.mdc

# Update glob patterns in each to be specific to their plugin
```

**Result:**
```
/cursor/
├── rules/
│   ├── general-code-style-elementor.mdc (glob: plugins/elementor/**)
│   ├── general-code-style-hello-plus.mdc (glob: plugins/hello-plus/**)
│   ├── tests-code-style.mdc (glob: **/*test*)
│   ├── no-comments-policy.mdc (glob: plugins/**/*.{php,js,ts})
│   ├── typescript.mdc (glob: **/*.ts)
│   └── react.mdc (glob: **/*.{jsx,tsx})
└── system-prompts/ (optional - consolidate if needed)
```

### Option B: Minimally Invasive (Safer)

Keep plugin-specific `.cursor/` directories but clean them up:

```bash
# Delete elementor-css (duplicate of elementor)
rm -rf plugins/elementor-css/.cursor/

# Delete hello-biz rules (keep only if unique)
# rm -rf themes/hello-biz/.cursor/

# In remaining .cursor/rules directories:
# - Keep only PLUGIN-SPECIFIC rules
# - Delete general-code-style, tests-code-style, etc.
# - Update glob patterns to be plugin-specific
```

---

## Phase 4: Cleanup Old Rules

### Step 7: Decide on `/app/public/.cursor/`

This directory has overly generic rules. **Options:**

**A. Delete (Recommended)**
```bash
rm -rf /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/.cursor/
```

**B. Keep but Restrict (If rules are valuable)**
- Move to workspace root: `/cursor/global-rules/`
- Change `alwaysApply: true` to `alwaysApply: false`
- Update glob patterns to be specific (e.g., `plugins/**/*.php`)
- Rename to indicate they're global (e.g., `global-best-practices.mdc`)

### Step 8: Archive Before Deleting

If you want to be safe, archive before deleting:
```bash
# Create archive
tar -czf /Users/janvanvlastuin1981/Local\ Sites/elementor/.cursor-archive-backup.tar.gz \
    /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/.cursor/

echo "Archive created: .cursor-archive-backup.tar.gz"
echo "Safe to delete original now if needed"
```

---

## Phase 5: Validation

### Step 9: Verify the Cleanup

```bash
# Count remaining .cursor directories
find /Users/janvanvlastuin1981/Local\ Sites/elementor -type d -name ".cursor" | wc -l

# Expected: 1-2 (workspace root + optional plugin-specific)
# Currently: 6 (too many!)
```

### Step 10: Test Rule Loading

Open a file in each major area and verify rules load correctly:

**For elementor plugin:**
```bash
# Open: plugins/elementor/modules/onboarding/module.php
# Should load: elementor-specific rules only (not hello-plus or hello-biz)
```

**For hello-plus plugin:**
```bash
# Open: plugins/hello-plus/src/main.php
# Should load: hello-plus-specific rules only
```

**For general files:**
```bash
# Open: plugins/platform-kit-publisher/classes/...
# Should load: only general rules (no plugin-specific overrides)
```

---

## Phase 6: Update Documentation

### Step 11: Create `.cursor/README.md`

```markdown
# Cursor AI Rules

This directory contains Cursor AI assistant rules for the Elementor monorepo.

## Rule Structure

- **general-code-style.mdc**: Core coding standards
- **tests-code-style.mdc**: Testing conventions
- **no-comments-policy.mdc**: Self-documenting code
- **typescript.mdc**: TypeScript-specific rules
- **react.mdc**: React-specific rules

## Plugin-Specific Rules

Each plugin has its own `.cursor/` directory for plugin-specific guidance:
- `plugins/elementor/.cursor/` - Elementor plugin rules
- `plugins/hello-plus/.cursor/` - Hello Plus theme rules

## Rule Loading

Rules are loaded hierarchically:
1. Workspace root: `/.cursor/rules/` (always loaded for matching globs)
2. Plugin-specific: `plugins/*/cursor/rules/` (only for files in that plugin)

## Adding New Rules

1. Keep glob patterns SPECIFIC (e.g., `plugins/elementor/**/*.php`)
2. Never use broad patterns like `**/*.php`
3. Use `alwaysApply: false` unless the rule is truly universal
4. Check for duplicates before creating new rules
```

---

## Summary of Changes

| Metric | Before | After |
|--------|--------|-------|
| .cursor directories | 6 | 1-2 |
| Duplicate rules | 12 instances | 0 |
| Backup files | 6 | 0 |
| Rules loaded per file | 10-15 | 3-5 |
| Context clarity | Poor | Excellent |

---

## Rollback Plan

If something breaks:

```bash
# Restore from archive
tar -xzf /Users/janvanvlastuin1981/Local\ Sites/elementor/.cursor-archive-backup.tar.gz -C /
```

---

## FAQ

**Q: Will this affect linting?**  
A: No. Linting is handled by `.eslintrc.js`, `composer.json`, etc. Cursor rules only affect AI behavior.

**Q: Do I need to restart Cursor?**  
A: Yes, restart Cursor after deleting/moving `.cursor/` directories so it reloads the rules.

**Q: What if I need plugin-specific rules?**  
A: Keep them in `plugins/*/cursor/rules/` with specific glob patterns like `plugins/hello-plus/**/*.php`

**Q: Should I version control `.cursor/` changes?**  
A: Yes, commit the cleanup. This helps teammates understand the new rule structure.

---

## Estimated Impact

**Time to implement:** 30-45 minutes  
**Expected improvement:** 30-40% faster AI responses  
**Risk level:** LOW (rules only affect AI, not code execution)

