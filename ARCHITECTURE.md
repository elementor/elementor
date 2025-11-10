# Elementor Architecture

This document provides an overview of Elementor's multi-generational architecture, serving as a navigation hub for developers and contributors seeking to understand the codebase structure.

Elementor has evolved through multiple architectural generations, each building upon the previous while introducing new paradigms. This document outlines the major systems and provides links to detailed documentation.

---

## Table of Contents

- [Modern Architecture (V4 / Editor V2)](#modern-architecture-v4--editor-v2)
- [Atomic Widgets System](#atomic-widgets-system)
- [Container Element](#container-element)
- [Legacy Architecture (V1)](#legacy-architecture-v1)
- [Module System](#module-system)
- [Build System](#build-system)
- [Contributing](#contributing)

---

## Modern Architecture (V4 / Editor V2)

**Editor V2** is a React + TypeScript micro-frontend architecture that replaces the legacy Backbone.js/Marionette.js editor. It represents a fundamental shift toward modularity, type safety, and independent team development.

### Key Characteristics

- **Micro-Frontend Architecture**: Modular packages that can be developed independently
- **React + TypeScript**: Modern UI library with full type safety
- **Webpack Externals**: Dynamic code loading at runtime for extensibility
- **Monorepo Structure**: 40+ packages organized by domain (core, libs, tools)
- **NPM Publishing**: Packages published for third-party extension developers
- **Type-Safe APIs**: Inter-package communication via concrete APIs, not strings

### Documentation

**For complete package architecture details, see:**
- **[Complete V4 Architecture Guide](packages/docs/architecture.md)** - Comprehensive overview of the micro-frontend system, package structure, development workflow, and package categories (app/extension/library/tool)
- **[Creating New Packages](packages/docs/creating-a-new-package.md)** - Step-by-step guide for adding packages to the monorepo
- **[Package Scripts](packages/scripts/README.md)** - Version management and publishing tools
- **[Development Guide](CONTRIBUTING.md)** - Setup, testing, and contribution guidelines

### Package Structure

Packages are organized under `packages/packages/` by domain:

- **`packages/packages/core/`** - Core editor applications (editor, editor-canvas, editor-editing-panel, etc.)
- **`packages/packages/libs/`** - Reusable libraries (editor-controls, editor-props, editor-styles, etc.)
- **`packages/packages/tools/`** - Development tools (webpack plugins, ESLint plugins, etc.)

Individual packages include their own `README.md` files with usage examples and API documentation. See [packages/docs/architecture.md](packages/docs/architecture.md) for the complete package catalog and detailed architecture information.

### Package Integration

Packages integrate with the Elementor plugin via:

- **Editor Loader**: `core/editor/loader/v2/editor-v2-loader.php` loads packages dynamically
- **Filter Hook**: `elementor/editor/v2/packages` filter allows conditional package loading
- **NPM Publishing**: Packages published to NPM with `@elementor/` scope for third-party developers

### Key Concepts

- **Dynamic Extensibility**: Third-party scripts can inject code at runtime
- **Pluggable Components**: React components that can be extended via location-based injection
- **V1 Adapters**: Bridge between legacy and modern APIs during transition
- **Runtime Versioning**: Backward compatibility for stable package APIs

---

## Atomic Widgets System

**Atomic Widgets** are a next-generation widget architecture that introduces type-safe prop schemas, dynamic styling, and a builder pattern for programmatic widget creation.

### Overview

Atomic Widgets represent a fundamental shift from traditional Elementor widgets:

- **Prop-Based Schemas**: Type-safe property definitions with validation
- **Dynamic Styling**: Styles managed through transformers and schemas
- **Builder Pattern**: Programmatic widget creation via `Widget_Builder` and `Element_Builder`
- **Atomic Elements**: New element types like `e-div-block`, `e-heading`, `e-paragraph`, `e-button`

### Documentation

- **[Atomic Widgets Module README](modules/atomic-widgets/README.md)** - Complete guide to atomic widgets architecture, prop types, and usage

### Key Components

- **Prop Types**: 40+ prop type definitions (`PropTypes/`)
- **Transformers**: Settings, styles, and import/export transformers (`PropsResolver/`)
- **Widget/Element Builders**: `Widget_Builder`, `Element_Builder` for programmatic creation
- **Style System**: `Atomic_Styles_Manager`, `Style_Schema`, variant-based styling
- **Dynamic Tags**: Integration with Elementor's dynamic content system

### Location

All atomic widgets code is located in: `modules/atomic-widgets/`

---

## Container Element

**Containers** are the modern replacement for Sections & Columns, using CSS Flexbox and Grid for layout.

### Overview

Containers provide:

- **Flexbox/Grid Layout**: Modern CSS layout capabilities
- **Nested Support**: Containers can contain other containers
- **Drag & Drop**: Enhanced DnD system for flexible layouts
- **CSS Variables**: Style management via CSS custom properties

### Documentation

- **[Container Architecture](docs/includes/elements/container.md)** - Design decisions, known issues, implementation details, and extension guide

### Key Features

- Replaces Section/Column structure
- Supports nested containers
- CSS variable-based styling system
- Enhanced drag-and-drop with flex direction awareness

---

## Legacy Architecture (V1)

The original Elementor editor is built on **Backbone.js** and **Marionette.js**, using a monolithic architecture.

### Characteristics

- **Backbone.js/Marionette.js**: MVC framework for editor application
- **jQuery UI**: Drag-and-drop and sortable behaviors
- **Section/Column/Widget**: Traditional three-tier structure
- **PHP Widget Classes**: Widget definitions in PHP extending `Widget_Base`

### Documentation

- **[Elementor Developers](https://developers.elementor.com/docs/editor/)** - Official external documentation
- **[Internal Documentation](docs/)** - Internal technical documentation
- **[Legacy Editor Code](assets/dev/js/editor/)** - JavaScript source code

### Transition

The V1 editor is being gradually replaced by Editor V2. During the transition:

- **V1 Adapters**: Bridge legacy APIs to modern React components
- **Coexistence**: Both systems run simultaneously
- **Migration Path**: Tools and guides for migrating to V2

---

## Module System

Elementor uses a **module registry pattern** to load 60+ optional feature modules conditionally.

### Module Architecture

- **Base Module Class**: `Core\Base\Module` - All modules extend this
- **Module Manager**: `Core\Modules_Manager` - Scans and loads modules
- **Experiments System**: Feature flags for experimental modules
- **Conditional Loading**: Modules check `is_active()` before loading

### Module Categories

- **Feature Modules**: AI, Floating Buttons, Global Classes, Nested Elements
- **Integration Modules**: Import/Export, Kit Library, Site Editor
- **Utility Modules**: Compatibility, Maintenance Mode, Tracker

### Location

Modules are located in: `modules/` and `core/modules/`

---

## Build System

Elementor uses a sophisticated build pipeline to transform source code into production assets.

### Build Tools

- **Grunt**: Task orchestration and file watching
- **Webpack**: JavaScript bundling (multiple configurations)
- **Sass**: CSS compilation
- **TypeScript**: Type checking and transpilation (packages)

### Build Commands

- `npm run build` - Full production build
- `npm run watch` - Development build with file watching
- `npm run scripts` - JavaScript compilation only
- `npm run styles` - CSS compilation only
- `npm run build:packages` - Build frontend packages

### Webpack Configurations

- **Base/Editor**: Admin editor application with WordPress dependencies
- **Frontend**: Browser-targeted with polyfills for older browsers
- **Packages**: WordPress-compatible packages with `.asset.php` files

### Documentation

- **[Gruntfile.js](Gruntfile.js)** - Build orchestration
- **[.grunt-config/](.grunt-config/)** - Webpack and Sass configurations
- **[package.json](package.json)** - NPM scripts and dependencies

---

## Data Storage and Documents

### Document Lifecycle

1. User edits page in editor
2. JavaScript saves via AJAX to `_elementor_data` meta field as JSON
3. On frontend request, `Documents_Manager->get()` retrieves document
4. Document renders elements and generates CSS
5. CSS cached to file for subsequent requests

### Data Structure

Elementor content is stored as JSON in the `_elementor_data` post meta field. The structure varies by architecture:

- **V1**: Section → Column → Widget hierarchy
- **V2**: Container-based with atomic widgets
- **Atomic**: Prop-based schemas with transformers

---

## Core Systems

### Plugin Singleton

The `Plugin` class (`includes/plugin.php`) is the central orchestrator:

- **Managers**: Controls, Documents, Elements, Widgets, Modules
- **Editor/Frontend**: Separate applications for admin and public contexts
- **Settings**: Plugin configuration and options
- **Files Manager**: CSS file generation and caching

### WordPress Integration

- **Hooks**: WordPress action and filter hooks throughout
- **Post Types**: Adds `elementor` support to post types
- **Admin Menu**: Registers "Elementor" top-level menu
- **Content Filter**: Injects builder content via `the_content` filter

---

## Contributing

For developers interested in contributing:

1. **Read [CONTRIBUTING.md](CONTRIBUTING.md)** - Development setup and guidelines
2. **Understand Architecture** - Review relevant sections above
3. **Check Documentation** - See linked documentation for specific systems
4. **Follow Patterns** - Match existing code patterns and conventions

### Quick Links

- **[Development Setup](CONTRIBUTING.md#development-setup)** - Getting started
- **[Repository Structure](CONTRIBUTING.md#repository-structure)** - Directory organization
- **[Testing](CONTRIBUTING.md#test-lint--build)** - Test suites and commands
- **[Working with Packages](CONTRIBUTING.md#working-with-packages)** - Package development

---

## Additional Resources

### External Documentation

- **[Elementor Developers](https://developers.elementor.com/)** - Official developer documentation
- **[Elementor Developers Blog](https://developers.elementor.com/blog/)** - Latest engineering updates
- **[Elementor Roadmap](https://elementor.com/roadmap/)** - Upcoming features and status

### Internal Documentation

- **[docs/](docs/)** - Internal technical documentation
- **[packages/docs/](packages/docs/)** - Package architecture and guides
- **[docs/includes/elements/](docs/includes/elements/)** - Element-specific documentation

---

## Architecture Evolution

Elementor's architecture has evolved through multiple generations:

1. **V1 (Legacy)**: Backbone.js/Marionette.js monolithic editor
2. **V2 (Containers)**: Introduction of Container element replacing Sections/Columns
3. **V4 (Editor V2)**: React + TypeScript micro-frontend architecture
4. **Atomic Widgets**: Next-generation prop-based widget system

Each generation maintains backward compatibility while introducing new capabilities.

---

*Last updated: 2025*

