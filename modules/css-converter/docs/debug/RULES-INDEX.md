# Cursor Rules Index

A comprehensive index of all Cursor AI rules across the workspace, organized by scope, category, and purpose.

## 📋 Quick Navigation

- [Workspace-Wide Rules](#workspace-wide-rules) - Apply to all files
- [Project-Specific Rules](#project-specific-rules) - Apply to specific projects
- [Module-Specific Rules](#module-specific-rules) - Apply to specific modules
- [Rule Categories](#rule-categories) - Organized by purpose
- [Search Guide](#search-guide) - How to find the right rule

---

## 🌍 Workspace-Wide Rules

These rules apply across the entire workspace and are always active.

### Core Development Rules
| Rule | Location | Description | Applies To |
|------|----------|-------------|------------|
| **Automatic Linting Protocol** | `automatic-linting.mdc` | MANDATORY auto-fix linting after every JS/TS edit | JS/TS files |
| **Debug-First Engineering** | `.cursor/rules/general-mindset.mdc` | Verification over assumption, runtime visibility | All files |
| **Self-Documenting Code** | `.cursor/rules/self-documenting-code.mdc` | Eliminate comments through descriptive naming | All files |
| **No Comments Policy** | `.cursor/rules/no-comments-policy.md` | Prefer self-documenting code over explanatory comments | All files |
| **Communication Protocol** | `.cursor/rules/communication-and-permission-protocol.mdc` | How AI should communicate with users | All interactions |
| **Definition of Done** | `definition-of-done.mdc` | Mandatory verification steps and testing requirements | All development |

### Code Quality Standards
| Rule | Location | Description | Applies To |
|------|----------|-------------|------------|
| **Avoid Try-Catch Blocks** | `.cursor/rules/avoid-try-catch-blocks.md` | Use defensive programming over exception handling | All code |
| **Elementor File Naming** | `.cursor/rules/elementor-file-naming-convention.md` | Consistent file and class naming conventions | All files |

---

## 🏗️ Project-Specific Rules

Rules that apply to specific projects or plugins.

### Elementor Core Plugin
**Location**: `plugins/elementor/.cursor/rules/`

| Rule | File | Description | Scope |
|------|------|-------------|-------|
| **General Code Style** | `general-code-style.mdc` | Magic numbers, error codes, developer experience | All files |
| **Tests Code Style** | `tests-code-style.mdc` | Testing standards and code quality | Test files only |

### Elementor CSS Plugin
**Location**: `plugins/elementor-css/.cursor/rules/`

| Rule | File | Description | Scope |
|------|------|-------------|-------|
| **General Code Style** | `general-code-style.mdc` | Magic numbers, error codes, developer experience | All files |
| **Tests Code Style** | `tests-code-style.mdc` | Testing standards and code quality | Test files only |

### Hello Plus Theme
**Location**: `plugins/hello-plus/.cursor/rules/`

| Rule | File | Description | Scope |
|------|------|-------------|-------|
| **Class Naming Conventions** | `class-naming-conventions.mdc` | File and class naming standards | All classes |
| **General Code Style** | `general-code-style.mdc` | Code quality and style guidelines | All files |
| **JavaScript Frontend** | `javascript-frontend.mdc` | Frontend JavaScript best practices | JS files |
| **Playwright Test Debugging** | `playwright-test-debugging-best-practices.mdc` | Test debugging strategies | Test files |
| **Playwright Widgets Screenshots** | `playwright-test-widgets-with-screenshots.mdc` | Widget testing with visual validation | Test files |
| **Refactoring Best Practices** | `refactoring-best-practices.mdc` | Safe refactoring guidelines | All files |
| **Tests Code Style** | `tests-code-style.mdc` | Testing standards | Test files |

### Hello Biz Theme
**Location**: `themes/hello-biz/.cursor/rules/`

| Rule | File | Description | Scope |
|------|------|-------------|-------|
| **Class Naming Conventions** | `class-naming-conventions.mdc` | File and class naming standards | All classes |
| **General Code Style** | `general-code-style.mdc` | Code quality and style guidelines | All files |
| **Refactoring Best Practices** | `refactoring-best-practices.mdc` | Safe refactoring guidelines | All files |
| **Tests Code Style** | `tests-code-style.mdc` | Testing standards | Test files |

---

## 🔧 Module-Specific Rules

Highly specialized rules for specific modules or components.

### CSS Converter Module
**Location**: `plugins/elementor-css/modules/css-converter/.cursor/rules/`

This module has the most comprehensive rule set due to its complexity and critical nature.

#### 🚨 Critical Thinking & Assumption Prevention
| Rule | File | Description | Priority |
|------|------|-------------|----------|
| **Critical Thinking Protocol** | `critical-thinking-protocol.mdc` | Mandatory AI behavior to prevent assumption-based failures | HIGHEST |
| **Request Verification Protocol** | `request-verification-protocol.mdc` | Protocol for verifying user requests before implementation | HIGHEST |
| **Assumption Challenge Protocol** | `assumption-challenge-protocol.mdc` | Forces constant challenging of assumptions and biases | HIGHEST |

#### 🏗️ Architecture & Code Quality
| Rule | File | Description | Priority |
|------|------|-------------|----------|
| **Atomic Widgets Mapping** | `atomic-widgets-mapping.mdc` | Rules for integrating with Elementor's atomic widget system | HIGH |
| **Atomic-Only Contract** | `atomic-only-contract.mdc` | Mandatory atomic widget sources for all JSON generation | HIGH |
| **Clean Code Standards** | `clean-code.mdc` | Clean code standards and defensive programming practices | HIGH |
| **Property Mapper Validation** | `property-mapper-validation.mdc` | Validation rules for CSS property mappers | HIGH |

#### 🧪 Development & Testing
| Rule | File | Description | Priority |
|------|------|-------------|----------|
| **Debugging & Validation** | `debugging-validation.mdc` | Debugging and validation protocols for PHP development | STANDARD |
| **Documentation Naming** | `20251010-documentation-naming.mdc` | Date prefix requirement for all markdown files | STANDARD |
| **Folder Structure** | `folder-structure.mdc` | Module folder structure and organization rules | STANDARD |

#### 📖 Documentation & Overview
| Rule | File | Description | Purpose |
|------|------|-------------|---------|
| **README** | `README.md` | Overview of all CSS Converter rules and their priorities | Documentation |

---

## 📂 External Review & Development Tools

Rules for external tools and review processes.

### GitHub Review Script
**Location**: `github-review-script/rules/`

Comprehensive set of rules for automated code review and quality assurance.

#### Core Development
| Rule | File | Description |
|------|------|-------------|
| **Avoid TODO** | `avoid-todo.md` | Guidelines for avoiding TODO comments |
| **Clean Code** | `clean-code.md` | Clean code principles and practices |
| **Core Development** | `core-development.md` | Core development standards |
| **Dependency Injection** | `dependency-injection.md` | DI patterns and best practices |
| **Descriptive Naming** | `descriptive-naming.md` | Naming conventions and clarity |
| **General Code Style** | `general-code-style.md` | Overall code style guidelines |
| **General Quality** | `general-quality.md` | Quality assurance standards |
| **Single Responsibility** | `single-responsibility.md` | SRP implementation guidelines |

#### Technology-Specific
| Rule | File | Description |
|------|------|-------------|
| **CSS Logical Properties** | `css-logical-properties.md` | Modern CSS property usage |
| **JavaScript Frontend** | `javascript-frontend.md` | Frontend JavaScript standards |
| **React** | `react.md` | React component best practices |
| **React Performance** | `react-performance.md` | React optimization guidelines |
| **TypeScript** | `typescript.md` | TypeScript usage standards |
| **TypeScript Safety** | `typescript-safety.md` | Type safety best practices |
| **WordPress PHP** | `wordpress-php.md` | WordPress-specific PHP guidelines |
| **WordPress Security** | `wordpress-security-checklist.md` | Security best practices |

#### Testing & Operations
| Rule | File | Description |
|------|------|-------------|
| **File Operations** | `file-operations.md` | File handling best practices |
| **HTTP Operations** | `http-operations.md` | HTTP request/response guidelines |
| **Playwright Best Practices** | `playwright-best-practices.md` | E2E testing standards |
| **Playwright Test Debugging** | `playwright-test-debugging.md` | Test debugging strategies |
| **Refactoring Best Practices** | `refactoring-best-practices.md` | Safe refactoring guidelines |
| **Testability** | `testability.md` | Code testability principles |
| **Tests Code Style** | `tests-code-style.md` | Testing code standards |

#### Process & Workflow
| Rule | File | Description |
|------|------|-------------|
| **Class Naming Conventions** | `class-naming-conventions.md` | Class and file naming standards |
| **General PR Suggestions** | `general-pr-suggestions.md` | Pull request guidelines |
| **Git Commits and PR Guidelines** | `git-commits-and-pr-guidelines.md` | Version control best practices |

### Elementor Cursor Review MCP
**Location**: `elementor-cursor-review-mcp/rules/`

Similar comprehensive rule set for MCP-based review processes (22 files total).

---

## 🏷️ Rule Categories

### By Purpose

#### 🚨 Critical System Rules
- **Automatic Linting Protocol** - MANDATORY auto-fix linting after every JS/TS edit
- **Critical Thinking Protocol** - Prevents assumption-based failures
- **Request Verification Protocol** - Ensures user request understanding
- **Atomic-Only Contract** - Enforces atomic widget compliance
- **Debug-First Engineering** - Verification over assumption
- **Definition of Done** - Mandatory verification steps and testing requirements

#### 🏗️ Architecture & Design
- **Clean Code Standards** - Code quality and maintainability
- **Atomic Widgets Mapping** - Integration with Elementor's atomic system
- **Dependency Injection** - DI patterns and practices
- **Single Responsibility** - SRP implementation

#### 🎨 Code Style & Conventions
- **General Code Style** - Style guidelines and developer experience
- **Class Naming Conventions** - Consistent naming standards
- **Descriptive Naming** - Clear, meaningful names
- **Self-Documenting Code** - Code that explains itself

#### 🧪 Testing & Quality
- **Tests Code Style** - Testing standards and practices
- **Playwright Best Practices** - E2E testing guidelines
- **Property Mapper Validation** - CSS converter validation
- **Debugging & Validation** - Development debugging protocols

#### 🔧 Technology-Specific
- **JavaScript Frontend** - Frontend JS best practices
- **React** & **React Performance** - React development guidelines
- **TypeScript** & **TypeScript Safety** - TypeScript standards
- **WordPress PHP** & **WordPress Security** - WordPress development
- **CSS Logical Properties** - Modern CSS practices

#### 📁 Organization & Structure
- **Folder Structure** - Module organization rules
- **File Operations** - File handling best practices
- **Elementor File Naming** - Elementor-specific naming conventions

### By Scope

#### 🌍 Global (Workspace-Wide)
- Apply to all files across the entire workspace
- Always active regardless of context
- Examples: Debug-First Engineering, Self-Documenting Code

#### 🏗️ Project-Level
- Apply to specific projects or plugins
- Context-aware based on file location
- Examples: Elementor plugin rules, Hello Plus theme rules

#### 🔧 Module-Level
- Apply to specific modules or components
- Highly specialized and context-specific
- Examples: CSS Converter module rules

#### 🧪 Test-Specific
- Apply only to test files
- Focused on testing standards and practices
- Examples: Tests Code Style, Playwright guidelines

---

## 🔍 Search Guide

### Finding Rules by Need

#### "I need to understand code quality standards"
- **Primary**: `general-code-style.mdc` (multiple locations)
- **Advanced**: `clean-code.md` (github-review-script)
- **Specific**: `clean-code.mdc` (css-converter module)

#### "I'm working with CSS conversion"
- **Start here**: `css-converter/.cursor/rules/README.md`
- **Critical**: `critical-thinking-protocol.mdc`
- **Architecture**: `atomic-widgets-mapping.mdc`
- **Validation**: `property-mapper-validation.mdc`

#### "I'm writing tests"
- **General**: `tests-code-style.mdc` (multiple locations)
- **E2E**: `playwright-best-practices.md`
- **Debugging**: `playwright-test-debugging.md`
- **Widgets**: `playwright-test-widgets-with-screenshots.mdc`
- **Verification**: `definition-of-done.mdc` (mandatory testing requirements)

#### "I'm working with React/TypeScript"
- **React**: `react.md` and `react-performance.md`
- **TypeScript**: `typescript.md` and `typescript-safety.md`
- **Frontend**: `javascript-frontend.md`

#### "I need naming conventions"
- **Classes**: `class-naming-conventions.mdc`
- **Files**: `elementor-file-naming-convention.md`
- **General**: `descriptive-naming.md`

#### "I'm refactoring code"
- **Primary**: `refactoring-best-practices.mdc`
- **Support**: `single-responsibility.md`
- **Quality**: `clean-code.mdc`

### Finding Rules by File Type

#### PHP Files
- `general-code-style.mdc`
- `wordpress-php.md`
- `clean-code.mdc`
- `debugging-validation.mdc`

#### JavaScript/TypeScript Files
- `automatic-linting.mdc` (MANDATORY - auto-fix after every edit)
- `javascript-frontend.mdc`
- `typescript.md`
- `typescript-safety.md`
- `react.md`

#### Test Files
- `tests-code-style.mdc`
- `playwright-best-practices.md`
- `playwright-test-debugging.md`
- `testability.md`

#### CSS Files
- `css-logical-properties.md`
- `general-code-style.mdc`

---

## 📊 Rule Statistics

### By Location
- **Workspace Root**: 8 rules (global scope, including automatic linting)
- **CSS Converter Module**: 10 rules (highly specialized, including documentation naming)
- **GitHub Review Script**: 26 rules (comprehensive review)
- **Elementor Cursor Review MCP**: 22 rules (MCP-based review)
- **Project-Specific**: 2-7 rules per project

### By Priority Level
- **HIGHEST Priority**: 5 rules (automatic linting + critical thinking protocols + definition of done)
- **HIGH Priority**: 4 rules (architecture & quality)
- **STANDARD Priority**: 3 rules (development support + documentation naming)
- **Context-Specific**: Remaining rules

### By Category
- **Code Style & Quality**: ~30% of all rules
- **Testing & Validation**: ~25% of all rules
- **Architecture & Design**: ~20% of all rules
- **Technology-Specific**: ~15% of all rules
- **Process & Workflow**: ~10% of all rules

---

## 🚀 Quick Start Guide

### For New Developers
1. **Start with**: `.cursor/rules/general-mindset.mdc` (Debug-First Engineering)
2. **CRITICAL**: `automatic-linting.mdc` (MANDATORY for JS/TS work)
3. **Then read**: `general-code-style.mdc` (in your project folder)
4. **MUST READ**: `definition-of-done.mdc` (mandatory verification requirements)
5. **If testing**: `tests-code-style.mdc`
6. **If CSS work**: `css-converter/.cursor/rules/README.md`

### For Code Reviews
1. **Use**: `github-review-script/rules/` (comprehensive set)
2. **Focus on**: `general-quality.md` and `clean-code.md`
3. **Check**: Technology-specific rules for the code being reviewed

### For CSS Converter Work
1. **MUST READ**: `css-converter/.cursor/rules/README.md`
2. **Critical**: All three critical thinking protocols
3. **Architecture**: `atomic-widgets-mapping.mdc`
4. **Implementation**: `property-mapper-validation.mdc`
5. **Documentation**: All `.md` files MUST start with `YYYYMMDD-` date prefix

---

## 🔄 Maintenance

This index is automatically discoverable by Cursor AI and should be updated when:
- New rules are added to any location
- Existing rules are modified or reorganized
- New projects or modules are added with their own rules
- Rule priorities or categories change

**Last Updated**: October 10, 2025
**Total Rules Indexed**: 72+ rules across 8+ locations (added documentation naming requirement)
**Coverage**: Complete workspace rule discovery
