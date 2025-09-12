# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Elementor Packages** monorepo, containing the Editor V2 - a modular, composable, and extensible application built with React & TypeScript for the Elementor page builder. It follows a micro-frontend architecture where packages are loaded dynamically at runtime.

## Architecture

### Micro-Frontend Structure
- **Dynamic Extensions**: Extensions are loaded at runtime, not build time
- **Webpack Externals**: Uses webpack externals and library output for dynamic loading
- **Runtime Connections**: All connections between applications and extensions happen at runtime using "pluggable" patterns
- **Type Safety**: Full TypeScript support across all packages with strict API contracts

### Package Categories
- **core/**: Main application packages (apps and their extensions)
  - `editor/`: The main editor application
  - `editor-*`: Extensions that enhance editor functionality
- **libs/**: Reusable libraries that can be used across packages
- **tools/**: Development and build tools (webpack plugins, etc.)

### Key Architectural Concepts
- **Location-based injection**: Components can be injected into predefined locations using a pluggable system
- **API-based communication**: Packages communicate through concrete APIs rather than strings/events
- **Legacy adapter support**: Adapters exist to communicate with the legacy Elementor editor during transition
- **Runtime versioning**: Full backward compatibility maintained for stable package APIs

## Development Commands

### Build Commands
```bash
npm run build                    # Build all packages
npm run build:tools             # Build only tools packages
npm run dev                     # Start development with watch mode
```

### Testing
```bash
npm test                        # Run all tests
npm run test:coverage          # Run tests with coverage report
```

### Code Quality
```bash
npm run lint                   # Run ESLint and TypeScript checks
npm run format                 # Auto-fix ESLint issues
npm run spell-check           # Run spell check
npm run check-unused          # Check for unused dependencies
```

### Package Management
```bash
npm run version                # Set package versions
npm run version:list          # List all packages and versions
npm run version:validate      # Validate version consistency
npm run version:bump          # Bump versions using semver
npm run release               # Build and publish packages
```

## Package Structure

Each package follows this structure:
```
package-name/
├── package.json
├── README.md
├── CHANGELOG.md
├── src/
│   ├── index.ts              # Main export
│   ├── init.ts               # Initialization code
│   └── ...
├── dist/                     # Build output
└── __tests__/               # Unit tests
```

## Key Files and Locations

### Build Configuration
- `turbo.json`: Turborepo task configuration
- `jest.config.js`: Jest testing configuration  
- `tsconfig.json`: TypeScript configuration
- Individual packages have their own `tsup.config.ts` for building

### Documentation
- `docs/architecture.md`: Detailed architecture explanation
- `docs/creating-a-new-package.md`: Guide for creating new packages
- `scripts/README.md`: Version manager documentation

## Development Guidelines

### Creating New Packages
Before creating a new package, consider:
1. Can this fit in an existing package?
2. Is this a new domain not covered by existing packages?
3. Does this belong to a different team?
4. Do we need this as a standalone consumable package?

### Package Dependencies
- Packages expose typed APIs for inter-package communication
- Avoid string-based communication (events/commands) in favor of concrete APIs
- Use the pluggable location system for runtime component injection

### Testing Strategy
- Use Jest for unit testing with React Testing Library
- Mock external dependencies manually (no automatic testing framework for 3rd parties yet)
- Test packages in isolation and integration contexts

### TypeScript Usage
- All packages are written in TypeScript
- Maintain strict type safety, especially for package boundaries
- Export type definitions for external consumers

## Monorepo Management

### Workspaces
The repository uses npm workspaces with packages organized under:
- `packages/core/*`
- `packages/libs/*` 
- `packages/tools/*`

### Publishing
- Only packages with `"private": false` are published to NPM
- Uses semantic versioning with the version manager script
- Packages are published with TypeScript declarations for extension developers

### Turborepo Integration
- Uses Turborepo for task management and caching
- Cache directory: `../.turbo`
- Parallel execution for development tasks

## Important Notes

- **Node.js**: Requires Node.js >=20.19.0 and npm >=10.0.0
- **Legacy Support**: Contains adapters for legacy Elementor editor (internal use only)
- **Extension Development**: Packages are designed to work as both internal extensions and 3rd-party extensions
- **Runtime Loading**: All package connections happen at runtime, not build time