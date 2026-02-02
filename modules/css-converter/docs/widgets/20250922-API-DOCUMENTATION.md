# Widget Converter API Documentation

## Overview

The Elementor Widget Converter API provides endpoints for converting HTML/CSS content into Elementor v4 atomic widgets. This API extends the existing CSS Converter system with comprehensive widget creation capabilities.

## Base URL

```
/wp-json/elementor/v2/
```

## Authentication

The API supports multiple authentication methods:

1. **WordPress Authentication**: Users must be logged in with `edit_posts` capability
2. **X-DEV-TOKEN Header**: For development/API access using a dev token
3. **Public Access Filter**: Can be enabled via `elementor_css_converter_allow_public_access` filter

### X-DEV-TOKEN Authentication

For development and API integration, you can use the X-DEV-TOKEN header:

```bash
# Define the dev token constant in wp-config.php
define('ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'your-secure-dev-token');

# Use in API requests
curl -X POST "/wp-json/elementor/v2/widget-converter" \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: your-secure-dev-token" \
  -d '{"type": "html", "content": "..."}'
```

## Endpoints

### POST /widget-converter

Converts HTML/CSS content into Elementor widgets and creates a WordPress post in draft mode.

#### Request Schema

```json
{
  "type": "url|html|css",
  "content": "string",
  "cssUrls": ["array of CSS file URLs"],
  "followImports": "boolean",
  "options": {
    "postId": "number|null",
    "postType": "string",
    "preserveIds": "boolean", 
    "createGlobalClasses": "boolean",
    "timeout": "number",
    "globalClassThreshold": "number"
  }
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | Yes | - | Input type: `url`, `html`, or `css` |
| `content` | string | Yes | - | HTML content, CSS content, or URL to fetch |
| `cssUrls` | array | No | `[]` | Array of CSS file URLs to include |
| `followImports` | boolean | No | `false` | Whether to follow @import statements |
| `options.postId` | number\|null | No | `null` | Post ID to update, null to create new |
| `options.postType` | string | No | `"page"` | Post type for new posts |
| `options.preserveIds` | boolean | No | `false` | Whether to preserve HTML element IDs |
| `options.createGlobalClasses` | boolean | No | `true` | Whether to create global classes |
| `options.timeout` | number | No | `30` | Timeout in seconds (1-300) |
| `options.globalClassThreshold` | number | No | `1` | Min usage count for global class (1-100) |

#### Response Schema

```json
{
  "success": "boolean",
  "post_id": "number",
  "edit_url": "string",
  "widgets_created": "number",
  "global_classes_created": "number",
  "variables_created": "number",
  "stats": {
    "total_elements": "number",
    "elements_converted": "number",
    "elements_skipped": "number",
    "properties_converted": "number",
    "properties_skipped": "number"
  },
  "warnings": ["array of warning objects"],
  "error_report": {
    "summary": {
      "total_errors": "number",
      "total_warnings": "number",
      "success_rate": "number"
    },
    "recommendations": ["array of strings"]
  }
}
```

#### Example Requests

##### Convert HTML with Inline CSS

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: your-secure-dev-token" \
  -d '{
    "type": "html",
    "content": "<div style=\"background-color: #f0f0f0; padding: 20px;\"><h1 style=\"color: #333;\">Welcome</h1><p>This is a test.</p></div>",
    "options": {
      "postType": "page",
      "createGlobalClasses": true
    }
  }' \
  https://yoursite.com/wp-json/elementor/v2/widget-converter
```

##### Convert HTML with External CSS

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: your-secure-dev-token" \
  -d '{
    "type": "html", 
    "content": "<div class=\"hero\"><h1 class=\"title\">Hero Title</h1></div>",
    "cssUrls": ["https://example.com/styles.css"],
    "followImports": true,
    "options": {
      "timeout": 60,
      "globalClassThreshold": 2
    }
  }' \
  https://yoursite.com/wp-json/elementor/v2/widget-converter
```

##### Convert from URL

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: your-secure-dev-token" \
  -d '{
    "type": "url",
    "content": "https://example.com/page-to-convert",
    "options": {
      "postType": "page",
      "preserveIds": true
    }
  }' \
  https://yoursite.com/wp-json/elementor/v2/widget-converter
```

##### CSS-Only Conversion (Global Classes)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: your-secure-dev-token" \
  -d '{
    "type": "css",
    "content": ".btn-primary { background: #007cba; color: white; padding: 12px 24px; }",
    "options": {
      "createGlobalClasses": true
    }
  }' \
  https://yoursite.com/wp-json/elementor/v2/widget-converter
```

#### Success Response Example

```json
{
  "success": true,
  "post_id": 123,
  "edit_url": "https://yoursite.com/wp-admin/post.php?post=123&action=elementor",
  "widgets_created": 5,
  "global_classes_created": 2,
  "variables_created": 0,
  "stats": {
    "total_elements": 6,
    "elements_converted": 5,
    "elements_skipped": 1,
    "properties_converted": 15,
    "properties_skipped": 2
  },
  "warnings": [
    {
      "message": "Skipped unsupported property: custom-property",
      "context": {
        "type": "unsupported_property",
        "property": "custom-property",
        "selector": ".custom-class"
      }
    }
  ],
  "error_report": {
    "summary": {
      "total_errors": 0,
      "total_warnings": 1,
      "success_rate": 83.33
    },
    "recommendations": [
      "Consider using standard CSS properties for better compatibility"
    ]
  }
}
```

## Supported HTML Elements

### Semantic Elements → Elementor Widgets

| HTML Element | Elementor Widget | Notes |
|--------------|------------------|-------|
| `h1`, `h2`, `h3`, `h4`, `h5`, `h6` | `e-heading` | Heading widgets with appropriate sizes |
| `p` | `e-text` | Text editor widgets |
| `div` | `e-flexbox` | Container widgets (HVV decision: flexbox only) |
| `section`, `article`, `aside`, `main`, `header`, `footer`, `nav` | `e-flexbox` | Container widgets |
| `span` | `e-text` | Inline text widgets |
| `a` | `e-link` | Link widgets |
| `button` | `e-button` | Button widgets |
| `img` | `e-image` | Image widgets |

### Fallback Elements → HTML Widgets

Elements not directly supported fall back to HTML widgets:
- `video`, `audio` (media elements)
- `canvas`, `svg` (graphics elements) 
- `table`, `tr`, `td` (table elements)
- `form`, `input`, `textarea`, `select` (form elements)
- Custom elements and web components

## Supported CSS Properties

The converter supports all 25+ CSS properties from the existing class converter:

### Typography
- `color`, `font-size`, `font-weight`, `text-align`, `line-height`
- `text-decoration`, `text-transform`

### Layout  
- `display`, `position`, `width`, `height`, `opacity`

### Spacing
- `margin`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`
- `padding`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`

### Border
- `border`, `border-width`, `border-style`, `border-color`, `border-radius`
- `border-top`, `border-right`, `border-bottom`, `border-left`

### Background
- `background`, `background-color`, `background-image`

### Flexbox
- `flex-direction`, `justify-content`, `align-items`, `flex`

### Effects
- `box-shadow`, `filter`, `transform`, `transition`

## CSS Specificity Handling

The converter handles CSS specificity according to W3C standards with `!important` support:

1. **`!important` declarations** → Highest priority (HVV requirement)
2. **Inline styles** (`style="..."`) → Widget properties
3. **ID selectors** (`#my-id`) → Widget properties  
4. **Class selectors** (`.my-class`) → Global classes
5. **Element selectors** (`h1`) → Lower priority

## Error Handling

### Error Response Format

```json
{
  "error": "error_code",
  "message": "Human readable error message",
  "details": {
    "parameter": "parameter_name",
    "value": "invalid_value"
  }
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `missing_required_parameter` | 400 | Required parameter missing |
| `invalid_parameter_value` | 400 | Parameter value invalid |
| `content_too_large` | 413 | Content exceeds size limits |
| `security_violation` | 400 | Malicious content detected |
| `nesting_too_deep` | 400 | HTML nesting exceeds limits |
| `invalid_url` | 400 | URL format invalid |
| `post_not_found` | 404 | Specified post ID not found |
| `permission_denied` | 403 | User lacks required permissions |

### Security Violations

The API blocks potentially dangerous content:

#### HTML Security
- `<script>` tags
- `<object>` and `<embed>` tags  
- `javascript:` URLs
- `data:` URLs with base64 content

#### CSS Security
- `javascript:` URLs in CSS
- `data:` URLs in CSS
- CSS `expression()` functions
- Malicious `@import` statements

### Size Limits

- **HTML Content**: 10MB maximum
- **CSS Content**: 5MB maximum
- **URL Length**: 2KB maximum
- **Nesting Depth**: 20 levels maximum

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Authenticated Users**: 100 requests per hour
- **Per IP**: 20 requests per hour
- **Concurrent Requests**: 5 per user

## Validation Rules

### Request Validation
- All parameters validated for type and format
- Content sanitized for security
- URLs validated for protocol (http/https only)
- File sizes checked against limits

### Content Validation  
- HTML structure validated
- CSS syntax validated
- Nesting depth calculated and limited
- Security patterns checked

## Global Classes Integration

The converter integrates with Elementor's Global Classes system:

### Threshold Configuration
- **Default Threshold**: 1 (HVV decision)
- **Configurable Range**: 1-100
- **Behavior**: Classes used ≥ threshold times become global classes

### Global Class Creation
- Automatic detection of repeated CSS classes
- Integration with existing Global Classes Repository
- Reuse of existing global classes when possible

## Draft Mode (HVV Requirement)

All widgets and posts are created in draft mode initially:
- **Post Status**: `draft`
- **Widget Status**: Draft until published
- **Edit Access**: Immediate Elementor editing available
- **Publishing**: Manual publish required

## Performance Characteristics

### Processing Times (Typical)
- **Small HTML** (< 1KB): < 0.5 seconds
- **Medium HTML** (1-100KB): < 2 seconds  
- **Large HTML** (100KB-10MB): < 10 seconds
- **CSS Processing**: < 1 second per 5MB

### Memory Usage
- **Typical Conversion**: < 50MB
- **Large Conversion**: < 100MB
- **Concurrent Limit**: Based on server capacity

## WordPress Integration

### Post Creation
- Creates WordPress posts with proper Elementor meta
- Sets `_elementor_edit_mode` to `builder`
- Sets `_elementor_template_type` appropriately
- Uses current `ELEMENTOR_VERSION`

### Permissions
- Requires `edit_posts` capability
- Respects WordPress user roles
- Optional public access via filter

### Hooks and Filters

#### Filters
```php
// Customize validation rules
add_filter('elementor_widget_converter_validation_rules', function($rules) {
    return $rules;
});

// Customize security config  
add_filter('elementor_widget_converter_security_config', function($config) {
    return $config;
});

// Allow public access
add_filter('elementor_css_converter_allow_public_access', '__return_true');
```

#### Actions
```php
// Before conversion starts
do_action('elementor_widget_converter_before_conversion', $request);

// After conversion completes
do_action('elementor_widget_converter_after_conversion', $result);

// On conversion error
do_action('elementor_widget_converter_conversion_error', $error);
```

## JavaScript SDK (Optional)

```javascript
// Basic usage
const converter = new ElementorWidgetConverter({
    apiUrl: '/wp-json/elementor/v2/widget-converter',
    nonce: wpApiSettings.nonce
});

// Convert HTML
const result = await converter.convertHTML(
    '<div><h1>Title</h1><p>Content</p></div>',
    {
        postType: 'page',
        createGlobalClasses: true
    }
);

// Convert from URL
const result = await converter.convertURL(
    'https://example.com/page',
    {
        timeout: 60,
        followImports: true
    }
);
```

## Migration from Class Converter

### Key Differences
- **Scope**: Class converter → CSS classes only, Widget converter → Full HTML/CSS to widgets
- **Output**: Class converter → Global classes, Widget converter → Widgets + global classes  
- **Input**: Class converter → CSS only, Widget converter → HTML, CSS, URLs
- **Integration**: Widget converter includes full Elementor document creation

### Migration Steps
1. **Assess Current Usage**: Identify existing class converter implementations
2. **Update API Calls**: Change endpoint from `/css-converter/classes` to `/widget-converter`
3. **Update Request Format**: Use new request schema with `type` parameter
4. **Handle New Response**: Process widget creation results and post IDs
5. **Test Thoroughly**: Validate conversion results match expectations

### Backward Compatibility
- Existing class converter endpoints remain functional
- No breaking changes to existing Global Classes system
- Widget converter can be used alongside class converter

## Troubleshooting

### Common Issues

#### Conversion Fails
- Check content size limits (10MB HTML, 5MB CSS)
- Verify user permissions (`edit_posts` capability)
- Review security violations in error response

#### Poor Conversion Quality
- Simplify HTML structure
- Use standard CSS properties
- Reduce nesting depth
- Check browser compatibility of CSS

#### Performance Issues  
- Reduce content size
- Optimize CSS complexity
- Use appropriate timeout values
- Consider chunking large conversions

### Debug Mode
Enable WordPress debug mode for detailed error logging:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Logs appear in `/wp-content/debug.log` with prefix `[Elementor Widget Converter]`.

## Support and Resources

### Documentation
- [Error Handling Guide](ERROR-HANDLING-GUIDE.md)
- [Usage Examples](USAGE-EXAMPLES.md)  
- [Migration Guide](MIGRATION-GUIDE.md)

### Community
- GitHub Issues: Report bugs and feature requests
- WordPress Forums: Community support
- Developer Documentation: Technical implementation details

---

**API Version**: 1.0  
**Last Updated**: Current Session  
**Compatibility**: Elementor v4+, WordPress 5.0+
