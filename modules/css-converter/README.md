# CSS Class Converter Module

Convert CSS classes to Elementor Global Classes automatically. This MVP supports `color` and `font-size` properties with comprehensive format normalization and CSS variable integration.

## Quick Start

### REST API Usage
```bash
curl -X POST "/wp-json/elementor/v2/css-converter/classes" \
  -H "Content-Type: application/json" \
  -d '{
    "css": ".primary-button { color: #007cba; font-size: 16px; }",
    "store": true
  }'
```

### Programmatic Usage
```php
use Elementor\Modules\CssConverter\Services\Class_Conversion_Service;

$service = new Class_Conversion_Service();
$result = $service->convert_css_to_global_classes($css_string);
```

### WP-CLI Testing
```bash
wp eval-file modules/css-converter/test-class-conversion.php
```

## Features

### ✅ Supported (MVP)
- **Simple class selectors**: `.className`
- **Color properties**: hex, rgb, rgba, named colors
- **Font-size properties**: px, em, rem, %, pt, vh, vw
- **CSS variables**: extraction and resolution
- **Format normalization**: rgb→hex, integer cleanup
- **Duplicate detection**: skip existing Global Classes
- **Error handling**: comprehensive warnings and statistics

### ❌ Not Supported (MVP)
- Complex selectors (`.parent .child`, `.button:hover`)
- Responsive/breakpoint styles
- Properties other than `color` and `font-size`
- Pseudo-selectors and combinators

## Architecture

```
REST API → Conversion Service → Property Mappers → Global Classes
    ↓            ↓                    ↓               ↓
CSS Parser → Variable Service → Schema Mapping → Kit Storage
```

## File Structure

```
css-converter/
├── docs/                           # Documentation
│   ├── CSS-CLASS-CONVERTER-USER-GUIDE.md
│   ├── IMPLEMENTATION-GUIDE.md
│   ├── 20250912-CLASS-CONVERTERS.md
│   └── class/FUTURE.md
├── parsers/                        # CSS parsing
│   ├── css-parser.php
│   └── parsed-css.php
├── class-convertors/               # Property mapping
│   ├── class-property-mapper-interface.php
│   ├── color-property-mapper.php
│   ├── font-size-property-mapper.php
│   └── class-property-mapper-registry.php
├── services/                       # Business logic
│   ├── class-conversion-service.php
│   └── variables-service.php
├── routes/                         # REST API
│   ├── classes-route.php
│   └── variables-route.php
├── exceptions/                     # Error handling
│   ├── css-parse-exception.php
│   └── class-conversion-exception.php
├── tests/                         # Manual testing
│   └── test-class-conversion.php
├── module.php                     # Module initialization
├── variable-conversion-service.php # CSS variables
├── README.md                      # This file
├── CHANGELOG.md                   # Version history
└── DEPLOYMENT.md                  # Deployment guide
```

## Testing

### PHPUnit Tests
```bash
# Located in: tests/phpunit/elementor/modules/css-converter/
phpunit elementor/modules/css-converter/
```

### Manual Testing
```bash
wp eval-file modules/css-converter/test-class-conversion.php
```

### Test Coverage
- **Unit tests**: Property mappers, conversion service
- **Integration tests**: End-to-end conversion flows
- **API tests**: REST endpoint functionality
- **Manual tests**: Interactive testing suite

## Configuration

### Permissions
```php
// Default: Admin capability required
current_user_can('manage_options')

// Override for development
add_filter('elementor_css_converter_allow_public_access', '__return_true');
```

### Supported Properties
```php
// Currently hardcoded in Class_Conversion_Service
private $supported_properties = ['color', 'font-size'];
```

## API Reference

### Endpoint
`POST /wp-json/elementor/v2/css-converter/classes`

### Parameters
- `css` (string, optional): CSS string to convert
- `url` (string, optional): URL to fetch CSS from
- `store` (boolean, optional, default: true): Store in Global Classes

### Response Format
```json
{
  "success": true,
  "data": {
    "converted_classes": [...],
    "skipped_classes": [...],
    "warnings": [...],
    "stats": {
      "total_classes_found": 5,
      "classes_converted": 3,
      "properties_converted": 6
    }
  }
}
```

## Examples

### Input CSS
```css
.primary-button {
    color: #007cba;
    font-size: 16px;
    background-color: #ffffff; /* Skipped */
}

.secondary-text {
    color: rgb(108, 117, 125);
    font-size: 1.2em;
}

.with-variables {
    --brand-color: #007cba;
    color: var(--brand-color);
    font-size: 18px;
}
```

### Output Global Classes
```json
[
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
]
```

## Performance

### Optimizations
- **Caching**: Global Classes lookup caching
- **Lookup maps**: O(1) CSS variable resolution
- **Early exits**: Skip processing for unsupported content
- **Memory management**: Efficient parsing for large CSS files

### Benchmarks
- **Typical CSS file**: < 2 seconds conversion time
- **Large CSS file**: < 5 seconds, < 256MB memory
- **API response**: < 1 second for simple requests

## Error Handling

### Exception Types
- `CssParseException`: CSS parsing errors
- `Class_Conversion_Exception`: Conversion errors

### Warning System
- Unsupported properties logged as warnings
- Invalid values reported with context
- Complex selectors noted in statistics

### Logging
- CSS files saved to `logs/` directory
- PHP errors logged via WordPress debug system
- API errors included in response

## Security

### Input Validation
- CSS syntax validation via Sabberworm parser
- URL validation via WordPress HTTP API
- Parameter sanitization via REST API

### Access Control
- Admin capability required by default
- Filter override for development
- WordPress nonce verification

### Output Sanitization
- Schema validation for Global Classes
- XSS prevention in user-provided content
- SQL injection prevention via parameterized queries

## Future Enhancements

See `docs/class/FUTURE.md` for detailed roadmap:

### Phase 2: Extended Properties
- Background colors and images
- Border properties
- Spacing (margin, padding)

### Phase 3: Responsive Support
- Breakpoint detection
- Media query parsing
- Multi-device variants

### Phase 4: Advanced Features
- Complex selector support
- CSS functions (calc, var)
- Performance optimizations

## Contributing

### Development Setup
1. Ensure Elementor development environment
2. Run existing tests to verify setup
3. Follow WordPress coding standards
4. Add tests for new functionality

### Code Style
- Follow WordPress PHP coding standards
- Use Yoda conditions
- Avoid comments (prefer descriptive names)
- One class per file

### Testing Requirements
- Unit tests for new components
- Integration tests for workflows
- API tests for endpoints
- Manual testing documentation

## Support

### Documentation
- [User Guide](docs/CSS-CLASS-CONVERTER-USER-GUIDE.md)
- [Implementation Guide](docs/IMPLEMENTATION-GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)

### Troubleshooting
1. Check API permissions
2. Verify CSS syntax
3. Review conversion warnings
4. Check Global Classes integration

### Common Issues
- **No classes converted**: Check selector format and supported properties
- **API errors**: Verify permissions and CSS validity
- **Storage failures**: Check Global Classes module availability