# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Setup
```bash
# First-time setup (install all dependencies)
npm run prepare-environment

# Install dependencies (main repo)
npm ci && composer install

# Install dependencies (packages monorepo)
cd packages && npm ci
```

### Build
```bash
# Build everything (packages + main repo)
npm run build

# Build packages only
npm run build:packages

# Build for CI (production webpack)
npm run build:ci

# Build development tools
npm run build:tools
```

### Development
```bash
# Start development with watch mode
npm run watch

# Watch packages only
npm run watch:packages

# Watch scripts
npm run scripts:watch

# Watch styles
npm run styles:watch
```

### Testing

#### JavaScript/TypeScript Tests
```bash
# Run Jest tests (main repo)
npm run test:jest

# Run package tests
npm run test:packages
# or
cd packages && npm test

# Run with coverage
cd packages && npm run test:coverage
```

#### PHP Tests
```bash
# Run PHPUnit tests
npm run test:php

# Run with multisite
npm run test:php_multisite

# Run specific test file
docker-compose run --rm wordpress_phpunit phpunit tests/phpunit/test-file.php
```

#### End-to-End Tests
```bash
# Setup local test servers
npm run start-local-server

# Setup Playwright environment
npm run test:setup:playwright

# Run Playwright tests
npm run test:playwright

# Debug Playwright tests
npm run test:playwright:debug

# Run elements regression tests
npm run test:playwright:elements-regression
```

### Linting & Formatting
```bash
# Lint all code
npm run lint

# Format/fix JS/TS code
npm run format

# Lint PHP
composer run lint

# Format PHP
composer run format

# Lint packages
cd packages && npm run lint
```

### Working with Packages Monorepo
```bash
# All commands in packages/ directory
cd packages

# Build all packages (with Turbo)
npm run build

# Development mode with watch
npm run dev

# Run tests
npm test

# Check for unused dependencies
npm run check-unused

# Spell check
npm run spell-check
```

## Architecture Overview

### Hybrid Architecture: Legacy PHP + Modern TypeScript

Elementor uses a **micro-frontend architecture** with two distinct layers that must work together:

#### 1. Legacy PHP Layer (WordPress Plugin)
- **Location**: `includes/`, `core/`, `modules/`
- **Purpose**: WordPress integration, backend APIs, legacy widgets
- **Language**: PHP following WordPress coding standards
- **Key Concepts**:
  - Plugin initialization in `elementor.php`
  - Autoloading via `includes/autoloader.php`
  - Module system in `modules/` (legacy widgets and features)
  - Core infrastructure in `core/` and `includes/`

#### 2. Modern TypeScript Layer (Packages Monorepo)
- **Location**: `packages/packages/`
- **Purpose**: New editor UI, components, and modern features
- **Language**: TypeScript + React
- **Build System**: Turbo + tsup
- **Key Concepts**:
  - **Micro-frontend**: Independent packages that load dynamically at runtime
  - **Pluggable architecture**: Components register via the `locations` system
  - **Type-safe APIs**: All inter-package communication uses typed interfaces

### Package Categories

Located in `packages/packages/`:

#### Core Packages (`core/`)
Standalone applications and major editor features:
- `editor` - Main editor application
- `editor-app-bar` - Top navigation bar
- `editor-canvas` - Page canvas/viewport
- `editor-panels` - Side panels system
- `editor-elements-panel` - Elements/widgets panel
- `editor-editing-panel` - Properties/settings panel
- `editor-interactions` - Element interactions
- `editor-documents` - Document management
- `editor-variables` - CSS/theme variables
- `frontend-handlers` - Frontend runtime handlers

#### Lib Packages (`libs/`)
Reusable libraries shared across packages:
- `editor-controls` - Form controls and inputs
- `editor-elements` - Element/widget definitions
- `editor-styles` - Styling utilities
- `editor-ui` - UI component library
- `editor-v1-adapters` - Legacy compatibility adapters
- `locations` - Pluggable component registration system
- `store` - State management
- `query` - Data fetching (React Query)
- `utils` - Shared utilities
- `http-client` - HTTP client abstraction
- `wp-media` - WordPress media library integration

#### Tool Packages (`tools/`)
Development and build utilities

### Critical Integration Patterns

#### PHP-to-TypeScript Communication
- PHP backend exposes REST APIs
- TypeScript packages consume via `http-client`
- Legacy widgets bridge via `editor-v1-adapters`

#### Pluggable Components (Locations System)
The `locations` package enables runtime component registration:

```typescript
// Register a component
locations.register('editor.app-bar.menu', MyMenuComponent);

// Use registered components
const menuComponents = locations.get('editor.app-bar.menu');
```

Common location keys:
- `editor.app-bar.*` - App bar extensions
- `editor.panel.*` - Panel items
- `editor.*.settings` - Settings sections

#### Legacy Integration
When working with legacy PHP code:
1. Check `modules/` for existing implementations
2. Use `editor-v1-adapters` to bridge old/new systems
3. Maintain backward compatibility for stable APIs
4. Never modify legacy code without understanding full impact

### Key Development Workflow Rules

1. **Search First**: Always check if functionality exists before implementing
   - Search both `includes/`+`core/`+`modules/` (PHP) and `packages/` (TypeScript)
   - Use grep/glob to find similar patterns

2. **Reuse Over Create**: Extend existing code rather than duplicating

3. **Minimal Changes**: Make smallest possible code changes

4. **No Comments**: Write self-documenting code with descriptive names

5. **No Magic Numbers**: Use named constants (except 0, 1, -1)

6. **Single Responsibility**: Each function does one thing

7. **Type Safety**: Use strict TypeScript for all new code

8. **Test Critical Paths**: Write tests using AAA pattern (Arrange-Act-Assert) with explicit comments

9. **Run Linting**: Always lint after changes
   - PHP: `composer run lint:fix`
   - JS/TS: `npm run format`
   - Packages: `cd packages && npm run lint`

### Working with Packages

#### Before Making Changes
1. Check if functionality exists in other packages
2. Understand the package's role in micro-frontend architecture
3. Identify dependencies and consumers
4. Design typed APIs for external usage

#### Development Steps
1. Write TypeScript interfaces first
2. Implement with error handling
3. Add tests for critical paths
4. Export public APIs in `index.ts`
5. Run package tests: `cd packages && npm test`
6. Check for circular dependencies

#### Common Package Commands
```bash
# In packages/ directory
turbo build                    # Build all packages
turbo dev --parallel          # Watch mode for all packages
jest packages/core/editor     # Test specific package
```

### File Size Guidelines
- Keep files under 300 lines when possible
- Split when it improves clarity
- Extract related functionality into separate modules

### Security Requirements
- Sanitize all user inputs (PHP: use WordPress functions)
- Escape all outputs
- Validate user capabilities
- Use nonces for forms
- Never expose sensitive information in errors

### Performance Considerations
- Use React.memo for expensive components
- Use useMemo/useCallback appropriately
- Minimize database queries in PHP
- Cache expensive operations
- Lazy load components when appropriate

### WordPress Integration
- Follow WordPress Coding Standards for PHP
- Use WordPress functions over PHP equivalents
- Hook into WordPress actions/filters properly
- Check user capabilities before operations
- Use WordPress database abstraction layer

### Version Requirements
- Node: >=20.19.0
- npm: >=10.0.0
- PHP: >=7.4
- WordPress: >=6.6

## Coding Standards Summary

### Core Principles
1. **No Comments** - Code must be self-explanatory through naming
2. **No Magic Numbers** - Use named constants for all numbers (except 0, 1, -1)
3. **Self-Documenting** - Functions and variables reveal their purpose
4. **Single Responsibility** - Each function does one thing
5. **SOLID but Simple** - Separation of concerns without over-engineering

### TypeScript/React
- Use functional components with hooks
- Define interfaces for all props and APIs
- Avoid `any` type
- Use proper error boundaries
- Keep components small and focused
- Use Context for shared state, avoid prop drilling

### PHP
- Follow WordPress coding standards
- Maintain backward compatibility
- Use WordPress security functions
- Document public APIs with docblocks
- Use proper namespacing

### Testing
- Test critical paths thoroughly (80/20 rule)
- Use AAA pattern with comments: Arrange, Act, Assert
- Write deterministic tests
- Mock only external dependencies
- Run all relevant test suites before committing

### Import Organization
- Keep imports alphabetically sorted
- Group by type (external, internal, relative)

## Common Pitfalls to Avoid

1. **Don't run `npm start`** - Assume dev servers are always running
2. **Don't modify legacy code** without understanding impact
3. **Don't break API contracts** without explicit approval
4. **Don't create new files** when editing existing ones works
5. **Don't use `any` in TypeScript** - find the proper type
6. **Don't skip linting** - always run after changes
7. **Don't add comments** - improve naming instead
8. **Don't hardcode numbers** - use named constants
