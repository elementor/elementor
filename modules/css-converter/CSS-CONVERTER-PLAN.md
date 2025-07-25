# CSS to Elementor Global Classes API — PRD & Technical Plan

## 1. High-Level Goal (REVISED)
- Create a PHP API that converts **complete CSS files** into **Elementor v4 Global Classes** as the primary MVP focus.
- **Phased Approach:** Classes → Variables → Widget Styling → Elementor Widgets
- Input: Complete CSS (strings, files, URLs) with full CSS syntax support (selectors, variables, shorthand, etc.)
- Output: Elementor Global Classes + HTML fallback widget for unsupported CSS
- **The API must provide clear, machine-readable documentation and conversion status reporting.**

## 2. MVP Phase 1: CSS Classes → Elementor Global Classes
- **Primary Focus:** Convert CSS class rules to Elementor v4 Global Classes using existing `Global_Classes_Repository`
- **CSS Input Support:**
  - Complete CSS files with selectors (`.my-button { color: red; }`)
  - CSS custom properties/variables (`--primary-color: blue`)
  - CSS shorthand properties (`margin: 10px 20px`)
  - All CSS property types (not limited to specific properties)
- **Output:** Individual Elementor Global Classes for each CSS class rule
- **Fallback:** Single HTML widget containing unsupported CSS (complex selectors, @rules, etc.)

## 3. Future Phases (Post-MVP)
- **Phase 2:** CSS Variables → Elementor Design Tokens
- **Phase 3:** Widget Styling (apply styles to existing widgets)
- **Phase 4:** Elementor Widget Creation (create atomic widgets)

## 4. CSS Parser Requirements
### 4.1. Full CSS Parsing with Sabberworm
- **Library:** `sabberworm/php-css-parser` (156M+ downloads, PHP 7.4+ compatible)
- **Rationale:** Simple string parsing inadequate for complete CSS support
- **Capabilities:**
  - Parse complete CSS documents with selectors
  - Handle CSS custom properties (`--variables`)
  - Support CSS shorthand properties
  - Manipulable PHP object structure

### 4.2. Standalone CSS Parser Design
```php
class CssParser {
    public function parse(string $css): ParsedCss
    public function extractClasses(ParsedCss $parsed): array
    public function extractVariables(ParsedCss $parsed): array  // Future
    public function extractUnsupported(ParsedCss $parsed): string
}
```

## 5. Elementor Global Classes Integration
### 5.1. Existing System Usage
- **Repository:** `Global_Classes_Repository` for storage/retrieval
- **Storage:** Kit metadata (`_elementor_global_classes`)
- **API:** Existing REST API at `elementor/v1/global-classes`
- **Limits:** 50 classes maximum per site

### 5.2. Class Data Structure
```php
[
    'items' => [
        'class-id' => [
            'id' => 'class-id',
            'label' => 'css-class-name',
            'type' => 'class',
            'variants' => [
                // Converted CSS properties as Elementor styling data
            ]
        ]
    ],
    'order' => ['class-id-1', 'class-id-2']
]
```

### 5.3. CSS to Global Class Mapping
- **One CSS class** → **One Elementor Global Class**
- **Class Name:** Use original CSS class name as `label`
- **Conflict Resolution:** Duplicate names get `-clone-{timestamp}` suffix
- **Property Conversion:** CSS properties → Elementor `variants` styling data

## 6. CSS Property Conversion Strategy
### 6.1. Enhanced Converter Registry
- **Existing Pattern:** Extend `CssPropertyConverterRegistry` for full CSS support
- **Converters:** Individual converter classes for each CSS property type
- **Schema Integration:** Use `Style_Schema::get()` for property validation
- **Extensibility:** Add new converters without core changes

### 6.2. Conversion Process
```php
function convertCssClassToGlobalClass($cssClass) {
    $registry = new CssPropertyConverterRegistry();
    $variants = [];
    
    foreach ($cssClass->getProperties() as $property => $value) {
        $converter = $registry->getConverter($property);
        if ($converter) {
            $variants = array_merge($variants, $converter->convert($value));
        }
    }
    
    return [
        'id' => generateClassId($cssClass->getName()),
        'label' => $cssClass->getName(),
        'type' => 'class',
        'variants' => $variants
    ];
}
```

## 7. Fallback Strategy
### 7.1. HTML Widget for Unsupported CSS
- **Single HTML Widget:** Contains all unsupported CSS rules
- **Preserved Structure:** Original CSS maintained in `<style>` tags
- **Unsupported Cases:**
  - Complex selectors (`.parent > .child:hover`)
  - CSS @rules (`@media`, `@keyframes`, `@import`)
  - Pseudo-elements/pseudo-classes

### 7.2. Conversion Status Reporting
```php
{
    "converted": {
        "global_classes": ["button-primary", "header-nav"],
        "count": 2
    },
    "fallback": {
        "html_widget_id": "widget_123",
        "unsupported_rules": [
            ".complex:hover { transform: scale(1.1); }",
            "@media (max-width: 768px) { ... }"
        ],
        "count": 2
    },
    "variables": {
        "detected": ["--primary-color", "--spacing-lg"],
        "preserved_in_html": true
    }
}
```

## 8. API Design
### 8.1. Input Formats
- **CSS Strings:** Direct CSS content in JSON payload
- **File Uploads:** CSS files as multipart uploads
- **URLs:** Fetch CSS from external URLs

### 8.2. REST Endpoints
```
POST /wp-json/elementor/v2/css-converter/classes
GET  /wp-json/elementor/v2/css-converter/docs
```

### 8.3. Request Structure
```php
{
    "css": "string|null",           // Direct CSS content
    "url": "string|null",           // CSS file URL
    "options": {
        "merge_duplicates": true,    // Handle duplicate class names
        "preserve_variables": true,  // Keep CSS variables in HTML fallback
        "max_classes": 50           // Limit for this conversion
    }
}
```

## 9. Performance & Scale Considerations
### 9.1. Large CSS File Support
- **No size limits** initially (monitor performance)
- **Caching:** Cache parsed CSS to avoid re-parsing
- **Memory Management:** Stream processing for very large files
- **Progress Reporting:** For long-running conversions

### 9.2. Optimization Strategies
- **Lazy Loading:** Parse only when needed
- **Batch Processing:** Handle multiple CSS blocks efficiently
- **Error Recovery:** Continue processing after individual failures

## 10. Implementation Phases
### 10.1. Phase 1: Standalone CSS Parser
1. **Install sabberworm/php-css-parser** dependency
2. **Create `CssParser` class** with full CSS parsing
3. **Implement class extraction** logic
4. **Add comprehensive testing** with various CSS inputs

### 10.2. Phase 2: Global Classes Integration
1. **Study `Global_Classes_Repository`** integration points
2. **Create CSS-to-GlobalClass converters** for common properties
3. **Implement conflict resolution** for duplicate class names
4. **Add fallback HTML widget creation**

### 10.3. Phase 3: API Implementation
1. **Create REST endpoints** for CSS conversion
2. **Add comprehensive validation** and error handling
3. **Implement status reporting** and progress tracking
4. **Create OpenAPI documentation**

## 11. Security & Authentication
- **MVP:** Hardcoded API key (`X-API-Key` header)
- **Validation:** Sanitize all CSS input to prevent injection
- **Permissions:** Leverage existing global classes capabilities
- **Future:** OAuth/JWT for production use

## 12. References & Integration Points
- **Global Classes:** `plugins/elementor/modules/global-classes/`
- **CSS Parsing:** `sabberworm/php-css-parser` library
- **Style Schema:** `plugins/elementor/modules/atomic-widgets/styles/style-schema.php`
- **REST API:** `plugins/elementor/modules/global-classes/global-classes-rest-api.php`

## 13. Success Metrics
- **Conversion Rate:** Percentage of CSS successfully converted to Global Classes
- **Performance:** Processing time for various CSS file sizes
- **Usage:** Number of Global Classes created per CSS input
- **Fallback Quality:** Accuracy of HTML widget fallback preservation

---

**Next Steps:**
1. **Install and test sabberworm/php-css-parser** in development environment
2. **Create standalone CSS parser** with class extraction
3. **Prototype Global Classes integration** with simple CSS examples
4. **Implement comprehensive error handling** and status reporting
