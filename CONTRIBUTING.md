# Contributing

A guide on how to get started contributing code to the Elementor plugin.

Before diving into this repository, make sure you have a basic understanding of Elementor and its architecture.

## Architecture
If you are interested in learning more about the architecture of Elementor, please refer to the documentation in the `docs/` directory.

## Repository structure

The repository is structured as follows:

```
@/elementor
├── app/                       
│   ├── admin-menu-items/
│   ├── assets/
│   │   ├── js/
│   │   └── styles/
│   ├── modules/
│   │   ├── import-export/
│   │   ├── kit-library/
│   │   ├── onboarding/
│   │   └── site-editor/
│   ├── app.php
│   └── view.php
├── core/                       
│   ├── admin/
│   ├── base/
│   ├── editor/
│   ├── frontend/
│   ├── settings/
│   ├── utils/
│   └── ...
├── includes/                  
│   ├── controls/
│   ├── widgets/
│   ├── managers/
│   └── ...
├── modules/                    (Feature modules)
│   ├── ai/
│   ├── atomic-widgets/
│   ├── floating-buttons/
│   ├── global-classes/
│   ├── nested-elements/
│   └── ...
├── assets/                     (Static assets)
│   ├── css/
│   ├── js/
│   ├── images/
│   └── lib/
├── packages/                   (V4 packages)
│   ├── packages/
│   ├── tests/
│   └── package.json
├── tests/                      (Test suites)
│   ├── playwright/
│   ├── phpunit/
│   ├── jest/
│   └── qunit/
├── docs/                       (Documentation)
├── elementor.php               (Main plugin file)
├── package.json
└── composer.json
```

## Development Setup

To get started with development:

1. Clone the repository
2. Install dependencies:
```bash
npm run instal
```

3. Start development:
```bash
npm run watch
```

This will start the development environment with file watching enabled.

## Test, Lint & Build

### Testing

To run PHP tests:
```bash
npm run test:php
```

To run JavaScript tests:
```bash
npm run test:jest
```

To run Playwright end-to-end tests:
```bash
npm run start-local-server
npm run test:playwright
or
npm run test:playwright:*
```

### Linting

You can run the linter by executing:
```bash
npm run lint
```

This command uses ESLint for JavaScript/TypeScript files and includes package linting.

### Building

To build the project for production:
```bash
npm run build
```

For development builds:
```bash
npm run start
```

To build packages:
```bash
npm run build:packages
```

## Development Commands

- `npm run start` - Full build and setup (dev mode)
- `npm run watch` - Start development with file watching
- `npm run scripts` - Build JavaScript assets
- `npm run scripts:watch` - Watch JavaScript files
- `npm run styles` - Build CSS assets
- `npm run styles:watch` - Watch CSS files
- `npm run build:packages` - Build frontend packages
- `npm run build:tools` - Build development tools

## Testing Environment Setup

To set up the testing environment:
```bash
npm run setup:testing
```

To restart the testing environment:
```bash
npm run restart:testing
```

## Commit message conventions

This repository uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), so please make sure to follow this convention to keep consistency in the repository.

## Pull requests

Maintainers merge pull requests by squashing all commits and editing the commit message if necessary using the GitHub user interface.

Ensure you choose an appropriate commit message, and exercise caution when dealing with changes that may disrupt existing functionality.

Additionally, remember to include tests for your modifications to ensure comprehensive coverage and maintain code quality.

## Working with Packages

The `packages/` directory contains frontend packages that can be developed separately:

1. Navigate to the packages directory:
```bash
cd packages
```

2. Install dependencies:
```bash
npm ci
```

3. Start development:
```bash
npm run dev
```

When working on the main plugin with packages, use:
```bash
npm run watch
```

This will automatically handle package building and watching.

## Code Quality

- Follow WordPress coding standards
- Use meaningful commit messages
- Write tests for new features
- Update documentation when needed
- Ensure backward compatibility when possible

## Getting Help

- Check the `docs/` directory for detailed documentation
- Review existing code for patterns and conventions
- Ask questions in pull requests for clarification
