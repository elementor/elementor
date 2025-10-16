# Nested Variables Services

This directory contains services for extracting, normalizing, and managing nested CSS custom properties (variables).

## Quick Start

```php
use Elementor\Modules\CssConverter\Services\Variables\Nested_Variable_Extractor;

$extractor = new Nested_Variable_Extractor();
$result = $extractor->extract_and_rename($raw_variables);

// Access results
$variables = $result['variables'];
$mapping = $result['variable_mapping'];
$references = $result['scope_references'];
$stats = $result['stats'];
```

## Files

### `nested-variable-extractor.php`

Main orchestration service for nested variable extraction.

**Responsibilities:**
- Separates root and nested variables
- Coordinates normalization and renaming
- Generates variable mappings and references
- Returns structured extraction results

**Key Method:**
```php
extract_and_rename(array $raw_variables): array
```

### `css-value-normalizer.php`

Utility for normalizing CSS values to canonical forms.

**Normalization:**
- Removes comments
- Standardizes whitespace
- Converts color formats (hex → RGB)
- Normalizes numeric values
- Standardizes quotes

**Key Method:**
```php
normalize(string $value): string
```

### `nested-variable-renamer.php`

Utility for managing variable suffix generation and collision detection.

**Responsibilities:**
- Generate next available suffix
- Apply suffixes to variable names
- Extract suffix numbers from names
- Detect variant relationships

**Key Methods:**
```php
find_next_suffix(string $base_name, array $existing_variables): int
apply_suffix(string $base_name, int $suffix): string
extract_suffix_number(string $variable_name, string $base_name): ?int
get_all_variants(string $base_name, array $existing_variables): array
```

## Integration with CSS Parser

The `CssParser` class has been enhanced with:

```php
extract_variables_with_nesting(ParsedCss $parsed): array
```

This method extracts variables while preserving scope information, enabling proper handling of:
- Media queries
- @supports rules
- Nested selectors
- Class-specific overrides

## Data Structures

### Input Format

Raw variables from CSS parser:

```php
[
    '--color' => [
        'name' => '--color',
        'value' => '#007bff',
        'scope' => ':root',
        'original_block' => ':root { --color: #007bff; }',
    ],
    // ... more variables
]
```

### Output Format

Results from `extract_and_rename()`:

```php
[
    'variables' => [
        '--color' => ['name' => '--color', 'value' => '#007bff', ...],
        '--color-1' => ['name' => '--color-1', 'value' => '#ffffff', ...],
    ],
    'variable_mapping' => [
        ':root --color' => '--color',
        '.dark-theme --color' => '--color-1',
    ],
    'scope_references' => [
        '--color' => [':root'],
        '--color-1' => ['.dark-theme'],
    ],
    'stats' => [
        'total_variables' => 2,
        'root_variables' => 1,
        'nested_variables' => 1,
    ],
]
```

## Examples

### Example 1: Theme Variables

```php
$raw_vars = [
    '--primary' => [
        'name' => '--primary',
        'value' => '#007bff',
        'scope' => ':root',
        'original_block' => ':root { --primary: #007bff; }',
    ],
    '--primary-light' => [
        'name' => '--primary',
        'value' => '#e7f1ff',
        'scope' => '.light-theme',
        'original_block' => '.light-theme { --primary: #e7f1ff; }',
    ],
];

$extractor = new Nested_Variable_Extractor();
$result = $extractor->extract_and_rename($raw_vars);

// Result includes:
// - '--primary' (root value)
// - '--primary-1' (light theme value)
// - Proper mappings for each scope
```

### Example 2: Media Query Variables

```php
$raw_vars = [
    '--font-size' => [
        'name' => '--font-size',
        'value' => '16px',
        'scope' => ':root',
        'original_block' => ':root { --font-size: 16px; }',
    ],
    '--font-size-mobile' => [
        'name' => '--font-size',
        'value' => '14px',
        'scope' => '@media (max-width: 768px) :root',
        'original_block' => '@media (...) { :root { --font-size: 14px; } }',
    ],
];

$result = $extractor->extract_and_rename($raw_vars);

// Result includes:
// - '--font-size' (desktop)
// - '--font-size-1' (mobile)
// - Scope-specific mappings
```

## Testing

Run tests:

```bash
cd plugins/elementor-css
composer run test -- modules/css-converter/tests/phpunit/services/variables/
```

Test file: `tests/phpunit/services/variables/nested-variable-extractor-test.php`

## Related Documentation

- `../../../docs/page-testing/1-NESTED-VARIABLES.md` - Comprehensive specification
- `../../../docs/implementation/NESTED-VARIABLES-IMPLEMENTATION.md` - Implementation guide
