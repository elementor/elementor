# Version Manager Script

A comprehensive tool for managing versions and publishing packages in the Elementor monorepo.

## Architecture

The version manager is organized into a modular structure for better maintainability:

```
scripts/version-manager/
├── index.js              # Main entry point
├── cli.js                # CLI interface and argument parsing
├── constants.js          # Constants and configuration
├── logger.js             # Logging utilities
├── package-discovery.js  # Package discovery and filtering
├── version-utils.js      # Version manipulation utilities
├── version-operations.js # Version setting and bumping operations
├── validation.js         # Package validation logic
├── publishing.js         # Publishing functionality
└── listing.js           # Package listing and display
```

## Features

- **Version Management**: Set, bump, and validate package versions across the workspace
- **Publishing**: Publish packages to npm with validation and safety checks
- **Workspace Support**: Handles monorepo structure with multiple packages
- **Validation**: Comprehensive validation before publishing
- **Dry Run**: Preview changes without making them

## Commands

### Version Management

#### Set Version
Set an exact version for all packages:

```bash
node scripts/version-manager/index.js set <version> [options]
```

Examples:
```bash
# Set all packages to version 3.31.0
node scripts/version-manager/index.js set 3.31.0

# Set with pre-release tag
node scripts/version-manager/index.js set 3.31.0 --tag beta.1

# Dry run to see what would change
node scripts/version-manager/index.js set 3.31.0 --dry-run

# Set only specific packages
node scripts/version-manager/index.js set 3.31.0 --packages "packages/core/*"
```
```

#### Bump Version
Increment version using semantic versioning:

```bash
node scripts/version-manager/index.js bump <type> [options]
```

Types: `patch`, `minor`, `major`

Examples:
```bash
# Bump patch version
node scripts/version-manager/index.js bump patch

# Bump minor version with release candidate tag
node scripts/version-manager/index.js bump minor --tag rc.1

# Bump from specific base version
node scripts/version-manager/index.js bump patch --base-version 3.30.0
```

#### List Packages
List all packages and their versions:

```bash
node scripts/version-manager/index.js list [options]
```

Examples:
```bash
# List all packages
node scripts/version-manager/index.js list

# List only publishable packages
node scripts/version-manager/index.js list --publishable

# List specific packages
node scripts/version-manager/index.js list --packages "packages/libs/*"
```

#### Validate Versions
Check that all packages have consistent versioning:

```bash
node scripts/version-manager/index.js validate [options]
```

### Publishing

#### Publish Packages
Publish packages to npm (only non-private packages):

```bash
node scripts/version-manager/index.js publish [options]
```

**Important**: Only packages with `"private": false` in their `package.json` will be published.

Examples:
```bash
# Publish all packages (with confirmation)
node scripts/version-manager/index.js publish

# Publish without confirmation
node scripts/version-manager/index.js publish --yes

# Dry run to see what would be published
node scripts/version-manager/index.js publish --dry-run

# Publish specific packages
node scripts/version-manager/index.js publish --packages "packages/libs/*"

# Publish with specific access level
node scripts/version-manager/index.js publish --access public

# Publish with two-factor authentication
node scripts/version-manager/index.js publish --otp <token>
```

## Publishing Validation

Before publishing, the script performs comprehensive validation:

### Required Checks (Errors)
- Package name and version are present
- `dist` directory exists and contains files
- Package.json is valid and readable

### Recommended Checks (Warnings)
- README.md file exists
- CHANGELOG.md file exists
- Entry point specified (main, module, or exports)
- License field is present
- Repository field is present
- Scoped packages have publishConfig.access specified

### Safety Checks
- Checks if package is already published at current version
- Validates package structure before attempting to publish
- Provides detailed error messages for failed validations

## Options

### Global Options
- `--dry-run`: Show what would be changed without making changes
- `--packages <pattern>`: Glob pattern for packages to process (default: all)
- `--tag <suffix>`: Add version suffix (e.g., beta, rc, alpha)

### Publishing Options
- `--yes`: Assume "yes" to prompts and confirmations
- `--access <public|restricted>`: Access level for published packages
- `--otp <token>`: Two-factor authentication token for npm

### Version Options
- `--base-version <version>`: Base version to bump from (for bump command)

## Package Configuration

### Making a Package Publishable

To make a package publishable, ensure its `package.json` has:

```json
{
  "name": "@elementor/your-package",
  "version": "1.0.0",
  "private": false,
  "publishConfig": {
    "access": "public"
  },
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "README.md",
    "CHANGELOG.md",
    "/dist",
    "/src",
    "!**/__tests__"
  ]
}
```

### Private Packages

To keep a package private, set:

```json
{
  "private": true
}
```

## Workflow Examples

### Release Process

1. **Build packages**:
   ```bash
   npm run build
   ```

2. **Bump versions**:
   ```bash
   node scripts/version-manager/index.js bump patch
   ```

3. **Validate**:
   ```bash
   node scripts/version-manager/index.js validate
   ```

4. **Preview publishing**:
   ```bash
   node scripts/version-manager/index.js publish --dry-run
   ```

5. **Publish**:
   ```bash
   node scripts/version-manager/index.js publish --yes
   ```

### Pre-release Process

1. **Set pre-release version**:
   ```bash
   node scripts/version-manager/index.js set 3.31.0 --tag beta.1
   ```

2. **Publish pre-release**:
   ```bash
   node scripts/version-manager/index.js publish --tag beta --yes
   ```

## Integration with npm Scripts

The version manager integrates with existing npm scripts:

```json
{
  "scripts": {
    "version": "node scripts/version-manager/index.js set",
    "version:list": "node scripts/version-manager/index.js list",
    "version:validate": "node scripts/version-manager/index.js validate",
    "version:bump": "node scripts/version-manager/index.js bump",
    "version:set": "node scripts/version-manager/index.js set",
    "release": "npm run build && node scripts/version-manager/index.js publish"
  }
}
```

## Error Handling

The script provides clear error messages and exits with appropriate codes:

- **Exit 0**: Success
- **Exit 1**: Error (validation failures, publishing errors, etc.)

## Best Practices

1. **Always use dry-run first** to preview changes
2. **Build packages** before publishing
3. **Validate versions** before publishing
4. **Use semantic versioning** for version bumps
5. **Include README and CHANGELOG** files
6. **Test publishing** with a single package first

## Troubleshooting

### Common Issues

1. **"Missing dist directory"**: Run `npm run build` first
2. **"Package already published"**: Bump version or use different tag
3. **"Authentication failed"**: Check npm login and 2FA settings
4. **"Permission denied"**: Check npm registry permissions

### Debug Mode

For detailed debugging, you can add console.log statements or use Node.js debugger:

```bash
node --inspect scripts/version-manager/index.js publish --dry-run
``` 