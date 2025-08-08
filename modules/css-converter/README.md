# Elementor CSS Converter - CSS Parser Integration

This implementation adds comprehensive CSS parsing capabilities to the Elementor CSS Converter module using the `sabberworm/php-css-parser` library.

## 🚀 Installation

### 1. Install Dependencies

Navigate to the css-converter module directory and install the required dependencies:

```bash
cd plugins/elementor/modules/css-converter
composer install
```

### 2. Verify Installation

Check that the sabberworm library is properly loaded:

```bash
# Should show vendor directory with sabberworm
ls -la vendor/sabberworm/
```

## 📖 Usage

### Basic CSS Parsing

```php
use Elementor\Modules\CssConverter\Parsers\CssParser;

// Initialize parser
$parser = new CssParser();

// Parse CSS string
$css = "
.button {
    background-color: red;
    color: white;
    padding: 10px;
}
.header {
    font-size: 24px;
}
";

try {
    $parsed = $parser->parse($css);
    
    // Extract classes
    $classes = $parser->extract_classes($parsed);
    
    // Extract CSS variables
    $variables = $parser->extract_variables($parsed);
    
    // Get unsupported CSS for fallback
    $unsupported = $parser->extract_unsupported($parsed);
    
    // Get conversion summary
    $summary = $parser->get_conversion_summary($parsed);
    
} catch (CssParseException $e) {
    // Handle parsing errors
    echo "CSS parsing failed: " . $e->getMessage();
}
```

### Parse from File or URL

```php
// Parse from file
$parsed = $parser->parse_from_file('/path/to/styles.css');

// Parse from URL
$parsed = $parser->parse_from_url('https://example.com/styles.css');
```

### Working with Results

```php
// Classes structure
foreach ($classes as $className => $classData) {
    echo "Class: .{$classData['name']}\n";
    echo "Selector: {$classData['selector']}\n";
    
    foreach ($classData['rules'] as $property => $rule) {
        $important = $rule['important'] ? ' !important' : '';
        echo "  {$property}: {$rule['value']}{$important}\n";
    }
}

// Variables structure
foreach ($variables as $varName => $varData) {
    echo "Variable: {$varData['name']}\n";
    echo "Value: {$varData['value']}\n";
    echo "Scope: {$varData['scope']}\n";
}

// Conversion summary
echo "Classes found: {$summary['classes']['count']}\n";
echo "Variables found: {$summary['variables']['count']}\n";
echo "Has unsupported CSS: " . ($summary['unsupported']['has_content'] ? 'Yes' : 'No') . "\n";
```

## 🧪 Testing

### Run Unit Tests

```bash
# Using WP-CLI (recommended)
wp elementor css-parser-test

# Direct execution (if WordPress is loaded)
php tests/css-parser-test.php
```

### Run Manual Tests

```bash
# Execute manual test scenarios
php tests/manual-test.php
```

### Test Output Example

```
==================================================
TEST: Bootstrap Button Classes
==================================================

CONVERSION SUMMARY:
  Classes found: 2
  Variables found: 0
  Has unsupported CSS: Yes
  Original size: 425 bytes

EXTRACTED CLASSES:
  .btn:
    display: inline-block
    padding: 0.375rem 0.75rem
    margin-bottom: 0
    font-size: 1rem
    font-weight: 400
    line-height: 1.5
    text-align: center
    text-decoration: none
    vertical-align: middle
    cursor: pointer
    border: 1px solid transparent
    border-radius: 0.25rem

  .btn-primary:
    color: #fff
    background-color: #007bff
    border-color: #007bff

UNSUPPORTED CSS (fallback to HTML widget):
.btn:hover {text-decoration: none;}

✓ Test completed successfully
```

## 🎯 What Gets Extracted

### ✅ Supported (Converted to Global Classes)

- **Simple class selectors**: `.button`, `.header`, `.card`
- **CSS custom properties**: `:root { --primary-color: blue; }`
- **All CSS properties**: background, color, padding, margin, flex, grid, etc.
- **Shorthand properties**: `margin: 10px 20px`, `border: 1px solid black`
- **CSS functions**: `var()`, `calc()`, `rgba()`, `linear-gradient()`
- **Important declarations**: `color: red !important`

### ❌ Unsupported (Fallback to HTML Widget)

- **Complex selectors**: `.parent .child`, `.button:hover`, `#header`
- **Pseudo-classes**: `:hover`, `:focus`, `:active`, `:nth-child()`
- **Pseudo-elements**: `::before`, `::after`, `::first-letter`
- **At-rules**: `@media`, `@keyframes`, `@import`, `@font-face`
- **Attribute selectors**: `[type="submit"]`, `[data-value]`

## 🔧 Configuration Options

### Parser Settings

```php
$parser = new CssParser([
    'charset' => 'utf-8',          // Character encoding
    'strict' => false,             // Strict parsing mode
    'multibyte' => true            // Enable multibyte support
]);
```

### Error Handling

```php
// Validate CSS before parsing
$errors = $parser->validate_css($css);
if (!empty($errors)) {
    foreach ($errors as $error) {
        echo "Validation error: $error\n";
    }
}

// Graceful error handling
try {
    $parsed = $parser->parse($css);
} catch (CssParseException $e) {
    // Log error and provide fallback
    error_log("CSS parsing failed: " . $e->getMessage());
    
    // Create HTML widget with original CSS
    $fallback_html = "<style>{$css}</style>";
}
```

## 📊 Performance Considerations

### Memory Usage

- **Small CSS** (< 10KB): ~1MB memory usage
- **Medium CSS** (10-100KB): ~2-5MB memory usage  
- **Large CSS** (> 100KB): ~5-20MB memory usage

### Processing Time

- **Simple classes** (< 50 rules): < 100ms
- **Complex CSS** (100-500 rules): 100-500ms
- **Large frameworks** (1000+ rules): 500ms-2s

### Optimization Tips

1. **Cache parsed results** for repeated CSS
2. **Parse in chunks** for very large CSS files
3. **Use validation** to catch errors early
4. **Monitor memory usage** with large inputs

## 🐛 Troubleshooting

### Common Issues

**"CSS parser dependencies not loaded"**
```bash
# Solution: Install composer dependencies
cd plugins/elementor/modules/css-converter
composer install
```

**"Failed to parse CSS: Unexpected token"**
```bash
# Solution: Check CSS syntax or enable lenient parsing
$parser = new CssParser(['strict' => false]);
```

**"Memory limit exceeded"**
```bash
# Solution: Increase PHP memory limit or process CSS in smaller chunks
ini_set('memory_limit', '512M');
```

### Debug Mode

```php
// Enable debug output
$summary = $parser->get_conversion_summary($parsed);
var_dump($summary);

// Check parsing stats
$stats = $parsed->get_stats();
echo "Original size: {$stats['original_size']} bytes\n";
echo "Rendered size: {$stats['rendered_size']} bytes\n";
echo "Parsed at: " . date('Y-m-d H:i:s', $stats['parsed_at']) . "\n";
```

## 🔗 Integration Points

This CSS parser integrates with:

- **Global Classes Repository**: For storing converted classes
- **Style Schema**: For property validation
- **CSS Property Converters**: For mapping to Elementor format
- **REST API**: For external access
- **HTML Widget**: For unsupported CSS fallback

## 📚 API Reference

### CssParser Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `parse(string $css)` | Parse CSS string | `ParsedCss` |
| `parse_from_file(string $path)` | Parse CSS file | `ParsedCss` |
| `parse_from_url(string $url)` | Parse CSS from URL | `ParsedCss` |
| `extract_classes(ParsedCss $parsed)` | Get CSS classes | `array` |
| `extract_variables(ParsedCss $parsed)` | Get CSS variables | `array` |
| `extract_unsupported(ParsedCss $parsed)` | Get unsupported CSS | `string` |
| `get_conversion_summary(ParsedCss $parsed)` | Get conversion stats | `array` |
| `validate_css(string $css)` | Validate CSS syntax | `array` |

### ParsedCss Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `get_document()` | Get sabberworm document | `Document` |
| `get_original_css()` | Get original CSS string | `string` |
| `render(array $options)` | Render CSS with formatting | `string` |
| `is_empty()` | Check if CSS is empty | `bool` |
| `get_stats()` | Get parsing statistics | `array` |

## 🚧 Next Steps

After this CSS parser implementation:

1. **Phase 2**: Integrate with Global Classes Repository
2. **Phase 3**: Create property converters for Elementor schema
3. **Phase 4**: Add REST API endpoints
4. **Phase 5**: Implement comprehensive error handling

---

For questions or issues, please refer to the test files or the main CSS-CONVERTER-PLAN.md document. 