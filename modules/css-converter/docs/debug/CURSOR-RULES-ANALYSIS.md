# Cursor Rules Analysis: Context Loss Investigation

## Problem Summary
You're losing context of cursor rules because **6 nested .cursor directories** are competing for attention with overlapping, redundant, and conflicting rules.

## Current Structure (PROBLEMATIC)

```
/Users/janvanvlastuin1981/Local Sites/elementor/
├── app/public/.cursor/ ⚠️ TOO GENERIC
│   ├── rules/ (11 rules)
│   │   ├── avoid-try-catch-blocks.md
│   │   ├── clean-code.mdc
│   │   ├── communication-and-permission-protocol.mdc
│   │   ├── create-md-file.mdc
│   │   ├── elementor-file-naming-convention.md
│   │   ├── general-mindset.mdc ⚠️ alwaysApply:true (debug-first)
│   │   ├── mati-parse-run-tasks.mdc
│   │   ├── no-comments-policy.md
│   │   ├── react.mdc
│   │   ├── self-documenting-code.mdc
│   │   └── typescript.mdc
│   └── system-prompts/
│
├── app/public/wp-content/.cursor/ ⚠️ DUPLICATE/BACKUP ONLY
│   ├── rules/ (mostly .bak files)
│   │   └── rules-index-pointer.mdc (pointer file)
│
├── plugins/elementor/.cursor/
│   ├── rules/ (2 standard rules)
│   │   ├── general-code-style.mdc
│   │   └── tests-code-style.mdc
│   └── system-prompts/
│
├── plugins/elementor-css/.cursor/
│   ├── rules/ (2 duplicate rules)
│   │   ├── general-code-style.mdc ⚠️ DUPLICATE
│   │   └── tests-code-style.mdc ⚠️ DUPLICATE
│   └── system-prompts/
│
├── plugins/hello-plus/.cursor/
│   └── rules/ (7 rules - specific to hello-plus)
│       ├── class-naming-conventions.mdc
│       ├── general-code-style.mdc ⚠️ DUPLICATE #3
│       ├── javascript-frontend.mdc
│       ├── playwright-test-debugging-best-practices.mdc
│       ├── playwright-test-widgets-with-screenshots.mdc
│       ├── refactoring-best-practices.mdc
│       └── tests-code-style.mdc ⚠️ DUPLICATE #3
│
└── themes/hello-biz/.cursor/
    └── rules/ (4 rules - specific to hello-biz)
        ├── class-naming-conventions.mdc
        ├── general-code-style.mdc ⚠️ DUPLICATE #4
        ├── refactoring-best-practices.mdc
        └── tests-code-style.mdc ⚠️ DUPLICATE #4
```

## Issues Identified

### 1. **Rule Multiplication & Conflicts**
- `general-code-style.mdc` exists in 4 places (elementor, elementor-css, hello-plus, hello-biz)
- `tests-code-style.mdc` exists in 4 places
- Each version may have slight differences, causing confusion

### 2. **Overly Broad Glob Patterns**
- `/app/public/.cursor/rules/general-mindset.mdc` has:
  ```yaml
  globs: ["**/*.php", "**/*.js", "**/*.ts", "**/*.yml"]
  alwaysApply: true
  ```
  - This applies "debug-first engineering" to **EVERYTHING** in the workspace
  - Interferes with project-specific rules

### 3. **Too Many Layers**
- Cursor loads rules hierarchically from:
  1. Workspace root
  2. /app/public/.cursor
  3. /app/public/wp-content/.cursor
  4. /plugins/elementor/.cursor
  5. /plugins/elementor-css/.cursor
  6. /plugins/hello-plus/.cursor
  7. /themes/hello-biz/.cursor

Each layer **adds to** the context instead of replacing, causing accumulation.

### 4. **System Prompts Duplication**
- Both `/app/public/.cursor/system-prompts/` and `/plugins/elementor/.cursor/system-prompts/` exist
- Competing guidance on test generation

### 5. **Backup Files Mixed In**
- `/app/public/wp-content/.cursor/rules/` contains mostly `.bak` files, polluting the rule namespace

## Why You're Losing Context

When you open a file, Cursor AI loads **ALL APPLICABLE RULES** from all `.cursor` directories:
1. **Generic rules** from `/app/public/.cursor/` (11 rules, broad glob patterns, alwaysApply)
2. **Project-specific rules** from `/plugins/elementor/.cursor/` (2 rules)
3. **Module-specific rules** from `/plugins/hello-plus/.cursor/` (7 rules)
4. **Theme-specific rules** from `/themes/hello-biz/.cursor/` (4 rules)

**Total: 24+ rules + system-prompts competing for your attention** in a single context window.

The model has to juggle:
- General coding mindset
- Debug-first engineering
- WordPress conventions
- React patterns
- TypeScript patterns
- Test-specific patterns
- Hello Plus patterns
- Hello Biz patterns
- ESLint configurations (20+ `.eslintrc.js` files!)

= **CONTEXT COLLAPSE**

## Root Cause: The `@elementor/` Repository Structure

You mentioned: *"Could the problem be that the @elementor/ repo is loading too many rules?"*

**YES.** The issue is:
1. **Workspace rooted at `/Users/janvanvlastuin1981/Local Sites/elementor/`** (entire WordPress install + plugins)
2. This is too broad for a single rule set
3. Multiple plugins + themes each define their own `.cursor/` directories
4. Each directory adds rules that **stay in context** even when editing unrelated code

## Solution: Restructure Rule Hierarchy

### Recommended Changes

#### 1. **Clean Up Backup Files** ✓
```bash
# Delete backup files in wp-content/.cursor/
rm /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/.cursor/rules/*.bak
```

#### 2. **Consolidate Duplicate Rules**
- Keep ONLY ONE copy of `general-code-style.mdc` and `tests-code-style.mdc`
- Place them at workspace root in a unified `.cursor/` directory
- Update glob patterns to be specific:
  - `plugins/elementor/**/*.{php,js,ts}`
  - `plugins/hello-plus/**/*.{php,js,ts}`
  - `themes/hello-biz/**/*.{php,js,ts}`

#### 3. **Remove Overly Broad Rules**
- Move `/app/public/.cursor/rules/general-mindset.mdc` to a named plugin directory
- Change `alwaysApply: true` to `alwaysApply: false`
- Use specific glob patterns, not `**/*`

#### 4. **Create Plugin-Specific .cursor Configurations**
```
plugins/elementor/.cursor/
├── rules/
│   ├── elementor-specific.mdc  (NEW - only for elementor)
│   └── tests-code-style.mdc
├── system-prompts/ (KEEP if useful)

plugins/hello-plus/.cursor/
├── rules/
│   └── hello-plus-specific.mdc

themes/hello-biz/.cursor/
├── rules/
│   └── hello-biz-specific.mdc
```

#### 5. **Use Glob Patterns Effectively**
```yaml
# GOOD - specific
files: ['plugins/elementor/**/*.php', 'plugins/elementor/**/*.js']

# BAD - too broad
files: ['**/*.php', '**/*.js']
```

#### 6. **Consolidate System Prompts**
- Keep ONLY ONE set of system-prompts in the main workspace
- Remove duplicates from plugins

## Recommended File Structure

```
/Users/janvanvlastuin1981/Local Sites/elementor/
│
├── .cursor/ (UNIFIED WORKSPACE RULES)
│   ├── rules/
│   │   ├── general-code-style.mdc
│   │   ├── tests-code-style.mdc
│   │   ├── no-comments-policy.mdc
│   │   ├── class-naming-conventions.mdc
│   │   └── typescript.mdc
│   └── README.md
│
├── app/public/.cursor/ (REMOVED or MINIMAL)
│   └── (DELETE most files)
│
└── plugins/
    ├── elementor/.cursor/
    │   ├── rules/
    │   │   └── elementor-specific.mdc
    │   │       (glob: plugins/elementor/**)
    │   └── system-prompts/
    │       (OPTIONAL - keep only if unique)
    │
    ├── hello-plus/.cursor/
    │   ├── rules/
    │   │   └── hello-plus-specific.mdc
    │   │       (glob: plugins/hello-plus/**)
    │   └── system-prompts/ (DELETE)
    │
    └── elementor-css/.cursor/ (DELETE - duplicate of elementor)
```

## Quick Cleanup Actions

1. **Delete backup files:**
   ```bash
   rm /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/.cursor/rules/*.bak
   ```

2. **Identify which rules are actually being used:**
   - Check your habits: which file paths do you edit most?
   - Elementor plugin? Hello Plus? Hello Biz? Themes?

3. **Remove conflicting `.cursor/` directories:**
   ```bash
   # Delete if elementor-css is redundant
   rm -rf /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/plugins/elementor-css/.cursor/
   
   # Clean up overly generic rules from public
   # (or move to a specific location with narrower glob patterns)
   ```

4. **Update `alwaysApply` and glob patterns:**
   - Never use `alwaysApply: true` with broad `**/*` patterns
   - Be explicit: `plugins/hello-plus/**/*.{php,js,ts}`

## Expected Improvement

**Before:** 24+ rules loaded for every file → Context loss, AI confusion, slow responses
**After:** 3-5 relevant rules loaded based on file path → Clear context, consistent guidance, faster responses

## Next Steps

1. **Identify your primary focus:** Which repo is your main project?
2. **Count the rules:** How many are actually useful vs. noise?
3. **Archive old rules:** Keep but don't apply overly generic ones
4. **Test:** Open a file and check what rules are being applied
