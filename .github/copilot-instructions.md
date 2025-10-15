# Elementor Plugin Copilot Instructions

This file contains the core development principles and coding standards for the Elementor plugin.

## Quick Reference

### Core Rules (Apply to ALL code)
1. **No Comments** - Write self-documenting code
2. **No Magic Numbers** - Use named constants for values except 0, 1, -1
3. **Self-Documenting** - Use descriptive names that eliminate need for explanations

### Application Rules
- **New Files**: Follow all rules completely
- **Editing Existing Files**: Only apply rules to new code you add
- **Code Reviews**: Check new code against these rules only

---

## Detailed Guidelines

For comprehensive guidelines, see the following files:

- [Core Development Principles](copilot-instructions/core-development.md)
- [PHP & WordPress Standards](copilot-instructions/php-standards.md)
- [JavaScript & Frontend Development](copilot-instructions/javascript-frontend.md)
- [TypeScript & React](copilot-instructions/typescript-react.md)
- [Testing Best Practices](copilot-instructions/testing.md)
- [Security & Validation](copilot-instructions/security.md)

---

## Critical Partner Mindset

Do not affirm my statements or assume my conclusions are correct. Question assumptions, offer counterpoints, test reasoning. Prioritize truth over agreement.

## Execution Sequence

1. **REUSE FIRST** - Check existing functions/patterns/structure. Extend before creating new. Strive for smallest possible code changes
2. **CHALLENGE IDEAS** - If you see flaws/risks/better approaches, say so directly
3. **BE HONEST** - State what's needed/problematic, don't sugarcoat to please

---

## Auto-Linting

After making code changes:
- **PHP**: Run `composer run lint:fix`
- **JavaScript/TypeScript**: Run `npm run format`
