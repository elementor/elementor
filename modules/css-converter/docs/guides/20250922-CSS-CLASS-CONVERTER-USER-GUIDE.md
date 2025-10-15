# CSS Class Converter - User Guide

## Overview

The CSS Class Converter is a powerful tool that automatically converts CSS classes into Elementor Global Classes. This MVP version supports `color` and `font-size` properties, making it easy to migrate existing CSS styles into Elementor's design system.

## Features

### ✅ Supported Features (MVP)
- **Simple class selectors** (`.className`)
- **Color properties** with multiple format support:
  - Hex colors: `#ff0000`, `#f00`, `#ff0000ff`
  - RGB/RGBA: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
  - Named colors: `red`, `blue`, `white`, etc.
- **Font-size properties** with unit support:
  - Pixels: `16px`, `12.5px`
  - Em/Rem: `1em`, `1.2rem`
  - Percentages: `120%`, `80.5%`
  - Points: `12pt`, `14.5pt`
  - Viewport units: `4vh`, `2vw`
- **CSS variable integration** - Extracts and converts CSS variables
- **Duplicate detection** - Skips classes that already exist
- **Comprehensive reporting** - Detailed statistics and warnings

### ❌ Not Supported (MVP)
- Complex selectors (`.parent .child`, `.button:hover`)
- Responsive/breakpoint styles
- Properties other than `color` and `font-size`
- Pseudo-selectors and combinators

## Usage

### REST API Endpoint

**Endpoint:** `POST /wp-json/elementor/v2/css-converter/classes`

**Parameters:**
- `css` (string, optional): CSS string to convert
- `url` (string, optional): URL to fetch CSS from
- `store` (boolean, optional, default: true): Whether to store converted classes

**Example Request:**
```bash
curl -X POST "https://yoursite.com/wp-json/elementor/v2/css-converter/classes" \
  -H "Content-Type: application/json" \
  -d '{
    "css": ".primary-button { color: #007cba; font-size: 16px; }",
    "store": true
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "converted_classes": [
      {
        "id": "primary-button",
        "type": "class",
        "label": "Primary Button",
        "variants": {
          "desktop": {
            "color": "#007cba",
            "font-size": "16px"
          }
        }
      }
    ],
    "skipped_classes": [],
    "warnings": [],
    "stats": {
      "total_classes_found": 1,
      "classes_converted": 1,
      "classes_skipped": 0,
      "properties_converted": 2,
      "properties_skipped": 0,
      "variables_converted": 0
    },
    "storage": {
      "stored": 1,
      "errors": []
    }
  }
}
```

### Via WP-CLI

```bash
# Test the conversion functionality
wp eval-file wp-content/plugins/elementor/modules/css-converter/test-class-conversion.php

# Or run specific tests
wp eval '
$service = new \Elementor\Modules\CssConverter\Services\Class_Conversion_Service();
$result = $service->convert_css_to_global_classes(".test { color: red; font-size: 16px; }");
print_r($result);
'
```

### Programmatic Usage

```php
use Elementor\Modules\CssConverter\Services\Class_Conversion_Service;

$service = new Class_Conversion_Service();
$result = $service->convert_css_to_global_classes($css_string);

// Access results
$converted_classes = $result['converted_classes'];
$statistics = $result['stats'];
$warnings = $result['warnings'];
```

## Input Examples

### Basic Classes
```css
.primary-text {
    color: #007cba;
    font-size: 18px;
}

.secondary-button {
    color: rgb(108, 117, 125);
    font-size: 14px;
}
```

### With CSS Variables
```css
.branded-element {
    --brand-color: #007cba;
    --brand-size: 16px;
    color: var(--brand-color);
    font-size: var(--brand-size);
}
```

### Mixed Properties (Partial Conversion)
```css
.complex-class {
    color: #333333;           /* ✅ Converted */
    font-size: 16px;          /* ✅ Converted */
    background-color: #f8f9fa; /* ❌ Skipped */
    margin: 20px;             /* ❌ Skipped */
    padding: 10px;            /* ❌ Skipped */
}
```

## Output Format

### Global Class Structure
```json
{
  "id": "class-name",
  "type": "class",
  "label": "Class Name",
  "variants": {
    "desktop": {
      "color": "#007cba",
      "font-size": "16px"
    }
  }
}
```

### Statistics Object
```json
{
  "total_classes_found": 5,
  "classes_converted": 3,
  "classes_skipped": 2,
  "properties_converted": 6,
  "properties_skipped": 4,
  "variables_converted": 2
}
```

## Color Format Conversion

The converter automatically normalizes color formats:

| Input Format | Output Format | Example |
|--------------|---------------|---------|
| 3-digit hex | 6-digit hex | `#f00` → `#ff0000` |
| 8-digit hex | 8-digit hex | `#ff0000ff` → `#ff0000ff` |
| RGB | 6-digit hex | `rgb(255, 0, 0)` → `#ff0000` |
| RGBA (opaque) | 6-digit hex | `rgba(255, 0, 0, 1)` → `#ff0000` |
| RGBA (transparent) | 8-digit hex | `rgba(255, 0, 0, 0.5)` → `#ff000080` |
| Named colors | Lowercase | `RED` → `red` |

## Font-Size Normalization

Font-size values are normalized:

| Input | Output | Note |
|-------|--------|------|
| `16.0px` | `16px` | Integer values lose decimal |
| `16.5px` | `16.5px` | Decimal values preserved |
| `1.0em` | `1em` | Integer values lose decimal |
| `1.2em` | `1.2em` | Decimal values preserved |

## Error Handling

### Common Warnings
- **Unsupported properties**: Properties other than `color` and `font-size`
- **Invalid values**: Colors or sizes that don't match expected patterns
- **Complex selectors**: Selectors that aren't simple class names
- **Duplicate classes**: Classes that already exist in Global Classes

### Error Responses
- **400**: Missing required parameters
- **422**: Invalid CSS or empty input
- **500**: Unexpected server error

## Best Practices

### 1. Prepare Your CSS
- Use simple class selectors (`.className`)
- Focus on `color` and `font-size` properties
- Remove or comment out unsupported properties for cleaner results

### 2. Review Before Storing
- Set `store: false` to preview results
- Check warnings for potential issues
- Verify color and font-size conversions

### 3. Handle Duplicates
- The converter skips existing Global Classes
- Review your existing classes before conversion
- Consider renaming conflicting classes

### 4. Batch Processing
- Process CSS files in logical groups
- Review statistics to understand conversion success rate
- Use warnings to identify areas needing manual attention

## Troubleshooting

### No Classes Converted
- **Check selectors**: Only `.className` format is supported
- **Verify properties**: Only `color` and `font-size` are converted
- **Review CSS syntax**: Ensure valid CSS structure

### Unexpected Color Values
- **RGB conversion**: RGB values are converted to hex format
- **Alpha channels**: RGBA with transparency becomes 8-digit hex
- **Named colors**: Converted to lowercase

### Missing Properties
- **Unsupported properties**: Check warnings for skipped properties
- **Invalid values**: Verify color and font-size value formats
- **CSS variables**: Ensure variables are defined in the same class

## Future Enhancements

See `FUTURE.md` for planned features:
- Additional CSS properties (background, border, spacing)
- Responsive/breakpoint support
- Complex selector handling
- Advanced CSS features (gradients, shadows)
- Performance optimizations
- UI integration

## Support

For issues or questions:
1. Check the warnings in the conversion response
2. Review this documentation
3. Test with the provided test file
4. Consult the implementation documentation for technical details
