# Git Branch Naming Conventions

## Branch Naming Format

Branch names should follow this structure:

```
ED-{ticket-number}-{short-description}
```

### Rules

1. **Ticket Number**: Always start with the ED ticket number (e.g., `ED-21821`)
2. **Short Description**: Use lowercase with hyphens, keep it concise (git has path length limitations)
3. **Character Limit**: Keep total branch name under 50 characters when possible
4. **Description Guidelines**:
   - Use imperative mood (e.g., `add-feature` not `adds-feature`)
   - Be specific but brief
   - Use hyphens to separate words
   - Avoid special characters

### Examples

✅ **Good**:
- `ED-21821-variable-validation`
- `ED-21821-design-system-analysis`
- `ED-22100-fix-auth-bug`
- `ED-22200-add-button-component`

❌ **Bad**:
- `feature/design-system` (missing ticket number)
- `ED-21821_variable_validation` (use hyphens, not underscores)
- `ED-21821-this-is-a-very-long-description-that-explains-everything` (too long)
- `ed-21821-Variable-Validation` (inconsistent casing)

## Commit Message Format

Follow the Elementor commit message convention:

```
{Type}: {Description} [ED-{ticket-number}]
```

### Commit Types

- **Internal**: Internal changes, refactoring, or improvements
- **New**: New features
- **Tweak**: Minor adjustments or improvements
- **Fix**: Bug fixes
- **Deprecated**: Deprecated features
- **Revert**: Reverts previous changes

### Examples

✅ **Good**:
- `Internal: Add variable reuse validation for design system [ED-21821]`
- `Fix: Prevent duplicate global class creation [ED-21821]`
- `New: Add design system analysis tool [ED-21821]`

## Pull Request Guidelines

1. **Base Branch**: PRs should target `main` unless part of a dependent chain
2. **Title Format**: Same as commit message format
3. **Description**: Include:
   - Summary of changes
   - Testing steps
   - Screenshots/videos if applicable
   - Dependencies on other PRs (if any)
4. **Labels**: Add appropriate labels (enhancement, bug, internal, etc.)

## Branch Lifecycle

1. **Create**: Branch from `main` (or dependent branch)
2. **Develop**: Make changes and commits
3. **Push**: Push to origin with same branch name
4. **PR**: Create pull request to `main`
5. **Review**: Address review comments
6. **Merge**: Merge to `main` (squash or merge commit based on team preference)
7. **Delete**: Delete branch after merge

## Multi-Phase Development

For large features split into multiple phases:

1. Each phase gets its own branch
2. Branch names should indicate the phase:
   - `ED-21821-phase-1-validation`
   - `ED-21821-phase-2-analysis`
   - `ED-21821-phase-3-templates`
3. PRs can be opened in parallel for review
4. Merge sequentially or use dependent PR chains
