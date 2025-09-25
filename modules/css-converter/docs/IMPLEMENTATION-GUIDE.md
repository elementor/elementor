# CSS Class Converter - Implementation Guide

## Architecture Overview

The CSS Class Converter follows a modular architecture with clear separation of concerns:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   REST API      │    │   Conversion     │    │   Property      │
│   (Routes)      │───▶│   Service        │───▶│   Mappers       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CSS Parser    │    │   Variable       │    │   Global        │
│   (Sabberworm)  │    │   Conversion     │    │   Classes       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Components

### 1. CSS Parser (`parsers/css-parser.php`)
**Purpose**: Parse CSS and extract class selectors with their properties.

**Key Methods**:
- `parse(string $css): ParsedCss` - Parse CSS string
- `extract_classes(ParsedCss $parsed): array` - Extract simple class selectors
- `is_simple_class_selector(string $selector): bool` - Validate selector format

**Extension Points**:
```php
// Add new extraction methods
private function extract_media_queries($css_node, &$queries) {
    // Future: Extract responsive styles
}
```

### 2. Property Mappers (`class-convertors/`)
**Purpose**: Convert CSS property values to Elementor's schema format.

**Interface**: `Class_Property_Mapper_Interface`
```php
interface Class_Property_Mapper_Interface {
    public function supports(string $property, $value): bool;
    public function map_to_schema(string $property, $value): array;
    public function get_supported_properties(): array;
}
```

**Current Implementations**:
- `Color_Property_Mapper` - Handles color values and format conversion
- `Font_Size_Property_Mapper` - Handles font-size values and unit normalization

**Adding New Mappers**:
```php
class Background_Property_Mapper implements Class_Property_Mapper_Interface {
    public function supports(string $property, $value): bool {
        return 'background-color' === $property && $this->is_valid_color($value);
    }
    
    public function map_to_schema(string $property, $value): array {
        return ['background-color' => $this->normalize_color($value)];
    }
    
    public function get_supported_properties(): array {
        return ['background-color'];
    }
}

// Register in Class_Property_Mapper_Registry
$this->register(new Background_Property_Mapper());
```

### 3. Conversion Service (`services/class-conversion-service.php`)
**Purpose**: Orchestrate the entire conversion process.

**Key Methods**:
- `convert_css_to_global_classes(string $css): array` - Main conversion method
- `process_classes(array $classes): array` - Process extracted classes
- `convert_single_class(array $css_class): array` - Convert individual class

**Extension Points**:
```php
// Add breakpoint support
private function process_responsive_classes(array $classes): array {
    // Future: Handle media queries and responsive styles
}

// Add validation
private function validate_class_schema(array $class): bool {
    // Future: Validate against Atomic Widgets Schema
}
```

### 4. REST API Route (`routes/classes-route.php`)
**Purpose**: Provide HTTP API for CSS class conversion.

**Endpoint**: `POST /elementor/v2/css-converter/classes`

**Parameters**:
- `css` (string): CSS to convert
- `url` (string): URL to fetch CSS from
- `store` (boolean): Whether to store in Global Classes

**Extension Points**:
```php
// Add batch processing
public function handle_batch_import(WP_REST_Request $request) {
    // Future: Process multiple CSS files
}

// Add validation endpoint
public function validate_css(WP_REST_Request $request) {
    // Future: Validate CSS before conversion
}
```

## Data Flow

### 1. Input Processing
```
CSS String → CSS Parser → Parsed CSS → Class Extraction → Raw Classes Array
```

### 2. Property Mapping
```
Raw Classes → Property Mapper Registry → Supported Properties → Schema Format
```

### 3. Variable Resolution
```
CSS Variables → Variable Conversion Service → Editor Variables → Resolved Values
```

### 4. Output Generation
```
Converted Classes → Global Classes Format → Storage (Optional) → API Response
```

## Testing Strategy

### Unit Tests
Located in `tests/unit/`:
- `color-property-mapper-test.php` - Test color conversion logic
- `font-size-property-mapper-test.php` - Test font-size normalization
- `class-conversion-service-test.php` - Test conversion orchestration

### Integration Tests
Located in `tests/integration/`:
- `css-class-conversion-test.php` - End-to-end conversion testing

### API Tests
Located in `tests/api/`:
- `classes-route-test.php` - REST API endpoint testing

### Manual Testing
- `test-class-conversion.php` - Comprehensive manual test suite
- Run via WP-CLI: `wp eval-file test-class-conversion.php`
- Run via browser: `?run_tests=1`

## Configuration

### Supported Properties
Currently hardcoded in `Class_Conversion_Service`:
```php
private $supported_properties = ['color', 'font-size'];
```

**Future**: Move to configuration file or database setting.

### Property Mapper Registry
Auto-initialized in `Class_Property_Mapper_Registry::init_default_mappers()`:
```php
private function init_default_mappers(): void {
    $this->register(new Color_Property_Mapper());
    $this->register(new Font_Size_Property_Mapper());
}
```

## Performance Considerations

### Current Optimizations
- **Duplicate detection**: Early exit for existing classes
- **Property filtering**: Only process supported properties
- **Lazy loading**: Services instantiated on demand

### Future Optimizations
- **Caching**: Cache parsed CSS and conversion results
- **Batch processing**: Process multiple classes efficiently
- **Memory management**: Stream large CSS files

## Error Handling

### Exception Hierarchy
```
Exception
├── CssParseException (CSS parsing errors)
└── Class_Conversion_Exception (Conversion errors)
```

### Error Recovery
- **Graceful degradation**: Continue processing on individual failures
- **Warning system**: Collect non-fatal issues
- **Logging**: File-based logging for debugging

### Validation
- **Input validation**: CSS syntax and parameter validation
- **Output validation**: Schema compliance checking
- **Permission checks**: User capability verification

## Integration Points

### Global Classes System
- **Repository**: `Global_Classes_Repository` for CRUD operations
- **Storage**: Kit metadata (`_elementor_global_classes`)
- **Validation**: `Global_Classes_Parser` for schema validation

### Variable System
- **Service**: `Variable_Conversion_Service` for CSS variable processing
- **Repository**: `Variables_Repository` for storage
- **Convertors**: Pluggable variable conversion system

### Elementor Core
- **Module system**: Extends `BaseModule`
- **REST API**: Uses WordPress REST API infrastructure
- **Permissions**: WordPress capability system

## Extending the System

### Adding New Properties

1. **Create Property Mapper**:
```php
class Margin_Property_Mapper implements Class_Property_Mapper_Interface {
    // Implementation
}
```

2. **Register Mapper**:
```php
// In Class_Property_Mapper_Registry
$this->register(new Margin_Property_Mapper());
```

3. **Update Supported Properties**:
```php
// In Class_Conversion_Service
private $supported_properties = ['color', 'font-size', 'margin'];
```

### Adding Responsive Support

1. **Extend CSS Parser**:
```php
public function extract_media_queries(ParsedCss $parsed): array {
    // Extract @media rules
}
```

2. **Update Conversion Service**:
```php
private function process_responsive_variants(array $classes): array {
    // Process breakpoint-specific styles
}
```

3. **Modify Output Format**:
```php
'variants' => [
    'desktop' => [...],
    'tablet' => [...],
    'mobile' => [...]
]
```

### Adding Complex Selectors

1. **Extend Selector Validation**:
```php
private function is_supported_selector(string $selector): bool {
    // Support more selector types
}
```

2. **Add Selector Parsing**:
```php
private function parse_complex_selector(string $selector): array {
    // Parse nested, pseudo, and combinator selectors
}
```

## Security Considerations

### Input Sanitization
- **CSS validation**: Sabberworm parser provides basic validation
- **URL validation**: WordPress HTTP API handles URL security
- **Parameter sanitization**: REST API parameter validation

### Permission Checks
- **Admin capability**: `manage_options` required by default
- **Filter override**: `elementor_css_converter_allow_public_access`
- **Nonce verification**: WordPress REST API handles nonces

### Output Sanitization
- **Schema validation**: Ensure output matches expected format
- **XSS prevention**: Sanitize user-provided labels and values
- **SQL injection**: Use parameterized queries for database operations

## Debugging

### Logging
- **File logging**: CSS and conversion results saved to `logs/` directory
- **Error logging**: PHP error_log integration
- **Debug mode**: Enhanced logging when `WP_DEBUG` is enabled

### Testing Tools
- **Manual test suite**: Comprehensive test scenarios
- **Unit tests**: Isolated component testing
- **API testing**: REST endpoint validation

### Common Issues
- **Parse errors**: Invalid CSS syntax
- **Permission errors**: Insufficient user capabilities
- **Storage errors**: Global Classes repository failures
- **Memory errors**: Large CSS file processing

## Deployment

### Requirements
- **PHP**: 7.4+ (WordPress requirement)
- **WordPress**: 5.0+ (REST API requirement)
- **Elementor**: Latest version (Global Classes support)

### Installation
1. Files are part of Elementor plugin
2. Module auto-initializes on plugin load
3. REST routes register on `rest_api_init`

### Configuration
- No additional configuration required for MVP
- Future: Admin settings page for advanced options

### Monitoring
- **Error logs**: Monitor PHP error logs
- **API logs**: Check REST API request logs
- **Performance**: Monitor memory usage and execution time
