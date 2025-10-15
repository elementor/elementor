# Elementor Plugin Copilot Instructions

## Core Development Rules

### 1. No Comments Policy
- **New code**: Must be self-documenting through descriptive naming
- **No explanatory comments**: Use clear function and variable names instead
- **Exception**: Required docblocks for public APIs only
- **Examples**:
  - ✅ `validateUserInput()`, `calculateTotalPrice()`, `sendReturnEvent()`
  - ❌ `doStuff()`, `handle()`, `process()`, `run()`

### 2. Magic Numbers → Named Constants
- **No hardcoded numbers**: Use named constants for any number except 0, 1, -1
- **Examples**:
  - ✅ `const STEP_NUMBER = 4; if (step === STEP_NUMBER)`
  - ❌ `if (step === 4)`

### 3. Self-Documenting Code
- **Function names**: Must clearly describe their purpose
- **Variable names**: Use descriptive names that eliminate need for comments
- **Class names**: Use `Pascal_Case_With_Underscores` for WordPress standards

## WordPress & PHP Standards

### Code Style
- **Follow WordPress PHP Coding Standards**
- **Use Yoda conditions**: `if ( 'value' === $variable )`
- **Strict typing**: Use `declare(strict_types=1);` when possible
- **PHP 7.4+ features**: Use typed properties, arrow functions when appropriate

### Class Organization
- **One class per file**: Each PHP file should contain exactly one class
- **Use statements**: Always use `use` statements instead of `require_once`
- **Autoloading**: Trust the plugin's autoloader for class loading
- **File naming**: Use underscore-separated names matching class name

### Method Ordering
Order methods consistently:
1. Abstract methods (if any)
2. Private static methods
3. Private methods
4. Protected static methods
5. Protected methods
6. Public static methods
7. Public methods
8. `__construct` (always last)

### Security & Database
- **Data validation**: Use WordPress's built-in sanitization functions
- **Nonce verification**: Implement proper nonce verification for forms
- **Database queries**: Use `wpdb` with `prepare()` statements
- **Error handling**: Use WordPress debug logging features

## Architecture Principles

### SOLID Principles
- **Single Responsibility**: Each class should have one reason to change
- **Dependency Injection**: Accept dependencies through constructor
- **Composition over inheritance**: Prefer composition when possible
- **Interface contracts**: Use interfaces to define contracts

### Error Handling
- **Specific HTTP status codes**: Use correct codes, not just 200 and 500
- **Defensive programming**: Prefer defensive programming over try-catch blocks
- **WordPress error handling**: Use WordPress's built-in error handling

## Application Rules

### For New Files
- Follow all rules completely
- No exceptions or grandfathering

### For Editing Existing Files
- **Only apply rules to new code you add**
- Don't modify existing code to comply with rules
- Don't add comments to explain existing code

### For Code Reviews
- Check new code against these rules only
- Ignore rule violations in existing code
- Focus on new additions and modifications

## Technology-Specific Guidelines

### JavaScript/TypeScript
- **Modern ES6+ features**: Use arrow functions, destructuring, template literals
- **Type safety**: Use TypeScript strict mode when possible

### React (if applicable)
- **Functional components**: Prefer function components over class components
- **Hooks**: Use React hooks appropriately
- **Performance**: Implement proper memoization when needed

### CSS
- **Logical properties**: Use modern CSS logical properties when possible
