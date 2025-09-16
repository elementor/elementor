# Migration Guide: From Class Converter to Widget Converter

## Table of Contents

1. [Overview](#overview)
2. [Key Differences](#key-differences)
3. [Migration Planning](#migration-planning)
4. [API Changes](#api-changes)
5. [Feature Mapping](#feature-mapping)
6. [Step-by-Step Migration](#step-by-step-migration)
7. [Backward Compatibility](#backward-compatibility)
8. [Testing & Validation](#testing--validation)
9. [Troubleshooting](#troubleshooting)

## Overview

The Widget Converter extends the existing CSS Class Converter with comprehensive HTML-to-widget conversion capabilities. This guide helps you migrate from the Class Converter to the new Widget Converter system.

### Migration Benefits

- **Complete HTML Conversion**: Convert entire HTML structures, not just CSS classes
- **Widget Creation**: Automatic Elementor widget creation with proper hierarchy
- **Enhanced CSS Support**: All existing CSS properties plus improved specificity handling
- **Draft Mode**: Safe conversion with draft post creation (HVV requirement)
- **Better Error Handling**: Comprehensive error recovery and reporting
- **Global Classes Integration**: Seamless integration with existing Global Classes system

### Migration Scope

| Component | Class Converter | Widget Converter | Migration Required |
|-----------|----------------|------------------|-------------------|
| API Endpoint | `/css-converter/classes` | `/widget-converter` | Yes |
| Input Types | CSS only | HTML, CSS, URLs | Update requests |
| Output | Global classes | Widgets + global classes | Update handling |
| Request Format | Simple CSS | Structured request schema | Update parameters |
| Response Format | Class data | Widget creation results | Update processing |

## Key Differences

### 1. Scope and Functionality

#### Class Converter (Existing)
```javascript
// Class Converter: CSS → Global Classes only
const response = await fetch('/wp-json/elementor/v2/css-converter/classes', {
    method: 'POST',
    body: JSON.stringify({
        css: '.button { background: blue; color: white; }'
    })
});

// Result: Global classes created
const result = await response.json();
console.log(`Created ${result.classes_created} global classes`);
```

#### Widget Converter (New)
```javascript
// Widget Converter: HTML/CSS → Widgets + Global Classes
const response = await fetch('/wp-json/elementor/v2/widget-converter', {
    method: 'POST',
    body: JSON.stringify({
        type: 'html',
        content: '<div class="hero"><h1>Title</h1><button class="btn">Click</button></div>',
        options: {
            createGlobalClasses: true
        }
    })
});

// Result: Complete Elementor post with widgets
const result = await response.json();
console.log(`Created post ${result.post_id} with ${result.widgets_created} widgets`);
console.log(`Edit URL: ${result.edit_url}`);
```

### 2. Input Format Changes

#### Class Converter Request
```json
{
  "css": "string",
  "options": {
    "threshold": "number"
  }
}
```

#### Widget Converter Request
```json
{
  "type": "url|html|css",
  "content": "string",
  "cssUrls": ["array"],
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

### 3. Output Format Changes

#### Class Converter Response
```json
{
  "success": true,
  "classes_created": 3,
  "classes": [
    {
      "name": "button-primary",
      "css": "background: blue; color: white;"
    }
  ]
}
```

#### Widget Converter Response
```json
{
  "success": true,
  "post_id": 123,
  "edit_url": "https://site.com/wp-admin/post.php?post=123&action=elementor",
  "widgets_created": 5,
  "global_classes_created": 2,
  "stats": {
    "total_elements": 6,
    "elements_converted": 5,
    "properties_converted": 15
  },
  "warnings": [],
  "error_report": {}
}
```

## Migration Planning

### 1. Assessment Phase

#### Inventory Current Usage
```javascript
// Audit existing Class Converter implementations
const classConverterUsage = {
    endpoints: [
        '/wp-json/elementor/v2/css-converter/classes',
        '/wp-json/elementor/v2/css-converter/variables'
    ],
    integrations: [
        'theme-customizer.js',
        'admin-panel.php',
        'import-tool.js'
    ],
    dependencies: [
        'global-classes-manager',
        'css-parser-service'
    ]
};

console.log('Current Class Converter usage:', classConverterUsage);
```

#### Identify Migration Candidates
```javascript
// Categorize implementations by migration complexity
const migrationCandidates = {
    simple: [
        // CSS-only conversions that can use new CSS type
        'style-importer',
        'theme-css-converter'
    ],
    moderate: [
        // Implementations that can benefit from HTML conversion
        'page-importer',
        'template-converter'
    ],
    complex: [
        // Custom integrations requiring significant changes
        'custom-builder-integration',
        'third-party-plugin-bridge'
    ]
};
```

### 2. Planning Phase

#### Migration Timeline
```
Phase 1 (Week 1): Preparation
- Update development environment
- Install Widget Converter
- Test basic functionality

Phase 2 (Week 2): Simple Migrations
- Migrate CSS-only implementations
- Update API calls and response handling
- Test converted functionality

Phase 3 (Week 3): Moderate Migrations  
- Migrate HTML-capable implementations
- Enhance with widget creation features
- Update user interfaces

Phase 4 (Week 4): Complex Migrations
- Refactor custom integrations
- Implement new features
- Comprehensive testing

Phase 5 (Week 5): Deployment & Monitoring
- Production deployment
- Monitor performance and errors
- User training and documentation
```

## API Changes

### 1. Endpoint Migration

#### Before (Class Converter)
```javascript
const classConverterEndpoints = {
    classes: '/wp-json/elementor/v2/css-converter/classes',
    variables: '/wp-json/elementor/v2/css-converter/variables'
};
```

#### After (Widget Converter)
```javascript
const widgetConverterEndpoint = '/wp-json/elementor/v2/widget-converter';

// Single endpoint handles all conversion types
const conversionTypes = {
    css: 'css',      // Replaces /classes endpoint
    html: 'html',    // New functionality
    url: 'url'       // New functionality
};
```

### 2. Request Migration

#### Migrate CSS-Only Requests
```javascript
// Before: Class Converter
async function convertCssClasses(css, threshold = 1) {
    const response = await fetch('/wp-json/elementor/v2/css-converter/classes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
            css: css,
            options: {
                threshold: threshold
            }
        })
    });
    
    return response.json();
}

// After: Widget Converter
async function convertCssClasses(css, threshold = 1) {
    const response = await fetch('/wp-json/elementor/v2/widget-converter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
            type: 'css',                    // New: specify type
            content: css,                   // Changed: css → content
            options: {
                createGlobalClasses: true,  // New: explicit flag
                globalClassThreshold: threshold // Changed: threshold → globalClassThreshold
            }
        })
    });
    
    return response.json();
}
```

#### Add HTML Conversion Capability
```javascript
// New: HTML to widgets conversion
async function convertHtmlToWidgets(html, options = {}) {
    const response = await fetch('/wp-json/elementor/v2/widget-converter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
            type: 'html',
            content: html,
            options: {
                postType: options.postType || 'page',
                createGlobalClasses: options.createGlobalClasses !== false,
                globalClassThreshold: options.threshold || 1,
                ...options
            }
        })
    });
    
    return response.json();
}
```

### 3. Response Handling Migration

#### Update Response Processing
```javascript
// Before: Class Converter response handling
function handleClassConverterResponse(response) {
    if (response.success) {
        console.log(`Created ${response.classes_created} global classes`);
        
        response.classes.forEach(cls => {
            console.log(`Class: ${cls.name} - ${cls.css}`);
        });
        
        return {
            success: true,
            classesCreated: response.classes_created,
            classes: response.classes
        };
    } else {
        throw new Error(response.message || 'Class conversion failed');
    }
}

// After: Widget Converter response handling
function handleWidgetConverterResponse(response) {
    if (response.success) {
        console.log(`Created post ${response.post_id} with ${response.widgets_created} widgets`);
        console.log(`Global classes created: ${response.global_classes_created || 0}`);
        
        // Handle warnings
        if (response.warnings && response.warnings.length > 0) {
            console.warn('Conversion warnings:', response.warnings);
        }
        
        // Handle error report
        if (response.error_report) {
            const successRate = response.error_report.summary.success_rate;
            console.log(`Conversion success rate: ${successRate}%`);
        }
        
        return {
            success: true,
            postId: response.post_id,
            editUrl: response.edit_url,
            widgetsCreated: response.widgets_created,
            globalClassesCreated: response.global_classes_created || 0,
            stats: response.stats,
            warnings: response.warnings || [],
            errorReport: response.error_report
        };
    } else {
        throw new Error(response.message || 'Widget conversion failed');
    }
}
```

## Feature Mapping

### 1. CSS Property Support

Both systems support the same CSS properties, but Widget Converter adds enhanced handling:

```javascript
// Supported properties (same in both systems)
const supportedProperties = [
    'color', 'font-size', 'font-weight', 'text-align', 'line-height',
    'text-decoration', 'text-transform', 'display', 'position', 'width',
    'height', 'opacity', 'margin', 'padding', 'border', 'background',
    'flex-direction', 'justify-content', 'align-items', 'box-shadow',
    'filter', 'transform', 'transition'
];

// Widget Converter enhancements
const enhancements = {
    cssSpecificity: 'W3C-compliant specificity calculation',
    importantSupport: '!important declarations as highest priority (HVV requirement)',
    inlineStyles: 'Inline style processing and conversion',
    selectorTypes: 'Element, class, ID, and inline selector handling'
};
```

### 2. Global Classes Integration

Widget Converter maintains full compatibility with existing Global Classes:

```javascript
// Migration: Global Classes threshold
const thresholdMapping = {
    classConverter: {
        parameter: 'threshold',
        default: 2,
        description: 'Minimum usage count for global class creation'
    },
    widgetConverter: {
        parameter: 'globalClassThreshold',
        default: 1, // HVV decision: threshold = 1
        description: 'Minimum usage count for global class creation'
    }
};

// Update threshold usage
function migrateThresholdParameter(oldOptions) {
    return {
        ...oldOptions,
        globalClassThreshold: oldOptions.threshold || 1,
        createGlobalClasses: true
    };
}
```

### 3. Error Handling Enhancement

Widget Converter provides enhanced error handling:

```javascript
// Before: Basic error handling
function handleClassConverterError(error) {
    console.error('Class conversion failed:', error.message);
    return { success: false, error: error.message };
}

// After: Enhanced error handling
function handleWidgetConverterError(error) {
    const errorData = error.response?.data || {};
    
    console.error('Widget conversion failed:', errorData);
    
    // Handle specific error types
    switch (errorData.error) {
        case 'content_too_large':
            return {
                success: false,
                error: 'Content too large',
                suggestion: 'Try splitting content into smaller chunks',
                recovery: 'chunk_splitting'
            };
            
        case 'security_violation':
            return {
                success: false,
                error: 'Security violation detected',
                suggestion: 'Remove script tags and dangerous elements',
                recovery: 'content_sanitization'
            };
            
        default:
            return {
                success: false,
                error: errorData.message || 'Unknown error',
                details: errorData.details
            };
    }
}
```

## Step-by-Step Migration

### Step 1: Environment Setup

```bash
# 1. Backup current system
wp db export backup-before-widget-converter.sql

# 2. Update Elementor CSS Converter plugin
# (Widget Converter is included in the CSS Converter module)

# 3. Verify installation
wp elementor css-converter status
```

### Step 2: Simple CSS Migration

```javascript
// 1. Create migration wrapper
class ClassConverterMigration {
    constructor() {
        this.newEndpoint = '/wp-json/elementor/v2/widget-converter';
        this.oldEndpoint = '/wp-json/elementor/v2/css-converter/classes';
    }
    
    // Migrate simple CSS conversion
    async convertCss(css, options = {}) {
        try {
            // Try new Widget Converter
            return await this.convertWithWidgetConverter(css, options);
        } catch (error) {
            console.warn('Widget Converter failed, falling back to Class Converter');
            // Fallback to old Class Converter
            return await this.convertWithClassConverter(css, options);
        }
    }
    
    async convertWithWidgetConverter(css, options) {
        const response = await fetch(this.newEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': wpApiSettings.nonce
            },
            body: JSON.stringify({
                type: 'css',
                content: css,
                options: {
                    createGlobalClasses: true,
                    globalClassThreshold: options.threshold || 1
                }
            })
        });
        
        const result = await response.json();
        
        // Transform response to match old format
        return {
            success: result.success,
            classes_created: result.global_classes_created || 0,
            message: result.success ? 'Conversion successful' : result.message
        };
    }
    
    async convertWithClassConverter(css, options) {
        const response = await fetch(this.oldEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': wpApiSettings.nonce
            },
            body: JSON.stringify({
                css: css,
                options: options
            })
        });
        
        return response.json();
    }
}

// Usage
const migration = new ClassConverterMigration();
const result = await migration.convertCss('.button { background: blue; }');
```

### Step 3: HTML Conversion Integration

```javascript
// 2. Add HTML conversion capability
class EnhancedConverter extends ClassConverterMigration {
    
    // New: Convert HTML to widgets
    async convertHtml(html, options = {}) {
        const response = await fetch(this.newEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': wpApiSettings.nonce
            },
            body: JSON.stringify({
                type: 'html',
                content: html,
                options: {
                    postType: options.postType || 'page',
                    createGlobalClasses: options.createGlobalClasses !== false,
                    globalClassThreshold: options.threshold || 1,
                    preserveIds: options.preserveIds || false
                }
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'HTML conversion failed');
        }
        
        return {
            success: true,
            postId: result.post_id,
            editUrl: result.edit_url,
            widgetsCreated: result.widgets_created,
            globalClassesCreated: result.global_classes_created || 0,
            warnings: result.warnings || []
        };
    }
    
    // New: Convert from URL
    async convertUrl(url, options = {}) {
        const response = await fetch(this.newEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': wpApiSettings.nonce
            },
            body: JSON.stringify({
                type: 'url',
                content: url,
                options: {
                    timeout: options.timeout || 30,
                    followImports: options.followImports || false,
                    ...options
                }
            })
        });
        
        return response.json();
    }
}
```

### Step 4: UI Migration

```javascript
// 3. Update user interface components
class ConverterUI {
    constructor() {
        this.converter = new EnhancedConverter();
        this.initializeUI();
    }
    
    initializeUI() {
        // Update existing CSS converter UI
        this.updateCssConverterUI();
        
        // Add new HTML converter UI
        this.addHtmlConverterUI();
        
        // Add URL converter UI
        this.addUrlConverterUI();
    }
    
    updateCssConverterUI() {
        const cssForm = document.getElementById('css-converter-form');
        if (!cssForm) return;
        
        // Update form submission
        cssForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const css = document.getElementById('css-input').value;
            const threshold = parseInt(document.getElementById('threshold-input').value) || 1;
            
            try {
                const result = await this.converter.convertCss(css, { threshold });
                this.displayCssResult(result);
            } catch (error) {
                this.displayError(error.message);
            }
        });
    }
    
    addHtmlConverterUI() {
        const container = document.getElementById('converter-container');
        
        const htmlSection = document.createElement('div');
        htmlSection.innerHTML = `
            <h3>HTML to Widgets Converter</h3>
            <form id="html-converter-form">
                <textarea id="html-input" placeholder="Paste HTML content here..." rows="10"></textarea>
                <select id="post-type-select">
                    <option value="page">Page</option>
                    <option value="post">Post</option>
                </select>
                <label>
                    <input type="checkbox" id="create-global-classes" checked>
                    Create Global Classes
                </label>
                <button type="submit">Convert to Widgets</button>
            </form>
            <div id="html-result"></div>
        `;
        
        container.appendChild(htmlSection);
        
        // Add form handler
        document.getElementById('html-converter-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const html = document.getElementById('html-input').value;
            const postType = document.getElementById('post-type-select').value;
            const createGlobalClasses = document.getElementById('create-global-classes').checked;
            
            try {
                const result = await this.converter.convertHtml(html, {
                    postType,
                    createGlobalClasses
                });
                
                this.displayHtmlResult(result);
            } catch (error) {
                this.displayError(error.message);
            }
        });
    }
    
    displayHtmlResult(result) {
        const resultDiv = document.getElementById('html-result');
        resultDiv.innerHTML = `
            <div class="conversion-success">
                <h4>Conversion Successful!</h4>
                <p>Created ${result.widgetsCreated} widgets in post ${result.postId}</p>
                ${result.globalClassesCreated > 0 ? `<p>Created ${result.globalClassesCreated} global classes</p>` : ''}
                <a href="${result.editUrl}" target="_blank" class="button button-primary">
                    Edit in Elementor
                </a>
                ${result.warnings.length > 0 ? `
                    <div class="warnings">
                        <h5>Warnings:</h5>
                        <ul>
                            ${result.warnings.map(w => `<li>${w.message}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Initialize enhanced UI
document.addEventListener('DOMContentLoaded', () => {
    new ConverterUI();
});
```

### Step 5: Testing Migration

```javascript
// 4. Create comprehensive migration tests
class MigrationTests {
    constructor() {
        this.converter = new EnhancedConverter();
        this.testResults = [];
    }
    
    async runAllTests() {
        console.log('Starting migration tests...');
        
        await this.testCssCompatibility();
        await this.testHtmlConversion();
        await this.testErrorHandling();
        await this.testPerformance();
        
        this.generateTestReport();
    }
    
    async testCssCompatibility() {
        const testCases = [
            {
                name: 'Simple CSS',
                css: '.button { background: blue; color: white; }',
                expectedClasses: 1
            },
            {
                name: 'Multiple Classes',
                css: '.btn { padding: 10px; } .btn-primary { background: blue; }',
                expectedClasses: 2
            },
            {
                name: 'Complex CSS',
                css: `
                    .card {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        padding: 20px;
                    }
                `,
                expectedClasses: 1
            }
        ];
        
        for (const testCase of testCases) {
            try {
                const result = await this.converter.convertCss(testCase.css);
                
                this.testResults.push({
                    test: `CSS: ${testCase.name}`,
                    passed: result.success && result.classes_created >= testCase.expectedClasses,
                    details: result
                });
                
            } catch (error) {
                this.testResults.push({
                    test: `CSS: ${testCase.name}`,
                    passed: false,
                    error: error.message
                });
            }
        }
    }
    
    async testHtmlConversion() {
        const testCases = [
            {
                name: 'Simple HTML',
                html: '<div><h1>Title</h1><p>Content</p></div>',
                expectedWidgets: 3
            },
            {
                name: 'Styled HTML',
                html: '<div style="background: red;"><h1 style="color: white;">Styled Title</h1></div>',
                expectedWidgets: 2
            }
        ];
        
        for (const testCase of testCases) {
            try {
                const result = await this.converter.convertHtml(testCase.html);
                
                this.testResults.push({
                    test: `HTML: ${testCase.name}`,
                    passed: result.success && result.widgetsCreated >= testCase.expectedWidgets,
                    details: result
                });
                
            } catch (error) {
                this.testResults.push({
                    test: `HTML: ${testCase.name}`,
                    passed: false,
                    error: error.message
                });
            }
        }
    }
    
    generateTestReport() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log(`Migration Tests Complete: ${passed}/${total} passed`);
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.test}`);
            
            if (!result.passed && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
    }
}

// Run migration tests
const tests = new MigrationTests();
tests.runAllTests();
```

## Backward Compatibility

### 1. Maintaining Existing Endpoints

The Class Converter endpoints remain functional during migration:

```php
// Existing endpoints still work
$class_converter_endpoints = [
    '/wp-json/elementor/v2/css-converter/classes',
    '/wp-json/elementor/v2/css-converter/variables'
];

// New endpoint available
$widget_converter_endpoint = '/wp-json/elementor/v2/widget-converter';
```

### 2. Gradual Migration Strategy

```javascript
// Implement feature flags for gradual rollout
class FeatureFlags {
    static isWidgetConverterEnabled() {
        return window.elementorWidgetConverter?.enabled || false;
    }
    
    static getConverterVersion() {
        return window.elementorWidgetConverter?.version || 'class-converter';
    }
}

// Use feature flags in conversion logic
async function convertContent(content, type = 'css') {
    if (FeatureFlags.isWidgetConverterEnabled() && type !== 'css') {
        // Use new Widget Converter for HTML/URL
        return await widgetConverter.convert(content, type);
    } else {
        // Use existing Class Converter for CSS
        return await classConverter.convert(content);
    }
}
```

### 3. Data Migration

```javascript
// Migrate existing global classes data if needed
class DataMigration {
    async migrateGlobalClasses() {
        // Get existing global classes
        const existingClasses = await this.getExistingGlobalClasses();
        
        // Validate compatibility with Widget Converter
        const compatibilityReport = await this.validateCompatibility(existingClasses);
        
        console.log('Global Classes Migration Report:', compatibilityReport);
        
        return compatibilityReport;
    }
    
    async getExistingGlobalClasses() {
        const response = await fetch('/wp-json/elementor/v2/global-classes');
        return response.json();
    }
    
    async validateCompatibility(classes) {
        const report = {
            total: classes.length,
            compatible: 0,
            incompatible: 0,
            issues: []
        };
        
        for (const cls of classes) {
            const isCompatible = await this.checkClassCompatibility(cls);
            
            if (isCompatible) {
                report.compatible++;
            } else {
                report.incompatible++;
                report.issues.push({
                    class: cls.name,
                    issue: 'Contains unsupported CSS properties'
                });
            }
        }
        
        return report;
    }
}
```

## Testing & Validation

### 1. Pre-Migration Testing

```javascript
// Test current system before migration
class PreMigrationTests {
    async validateCurrentSystem() {
        const tests = [
            this.testClassConverterEndpoint(),
            this.testGlobalClassesIntegration(),
            this.testExistingWorkflows()
        ];
        
        const results = await Promise.all(tests);
        
        return {
            allPassed: results.every(r => r.passed),
            results: results
        };
    }
    
    async testClassConverterEndpoint() {
        try {
            const response = await fetch('/wp-json/elementor/v2/css-converter/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    css: '.test { color: red; }'
                })
            });
            
            const result = await response.json();
            
            return {
                test: 'Class Converter Endpoint',
                passed: result.success,
                details: result
            };
            
        } catch (error) {
            return {
                test: 'Class Converter Endpoint',
                passed: false,
                error: error.message
            };
        }
    }
}
```

### 2. Post-Migration Validation

```javascript
// Validate system after migration
class PostMigrationTests {
    async validateMigratedSystem() {
        const tests = [
            this.testWidgetConverterEndpoint(),
            this.testBackwardCompatibility(),
            this.testNewFeatures(),
            this.testPerformance()
        ];
        
        const results = await Promise.all(tests);
        
        return {
            allPassed: results.every(r => r.passed),
            results: results
        };
    }
    
    async testBackwardCompatibility() {
        // Test that old Class Converter still works
        try {
            const oldResult = await fetch('/wp-json/elementor/v2/css-converter/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    css: '.test { color: blue; }'
                })
            });
            
            const newResult = await fetch('/wp-json/elementor/v2/widget-converter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'css',
                    content: '.test { color: blue; }'
                })
            });
            
            const oldData = await oldResult.json();
            const newData = await newResult.json();
            
            return {
                test: 'Backward Compatibility',
                passed: oldData.success && newData.success,
                details: {
                    oldConverter: oldData,
                    newConverter: newData
                }
            };
            
        } catch (error) {
            return {
                test: 'Backward Compatibility',
                passed: false,
                error: error.message
            };
        }
    }
}
```

## Troubleshooting

### Common Migration Issues

#### 1. API Response Format Mismatch

**Problem**: Code expects old response format
```javascript
// Old code expecting specific format
if (response.classes_created > 0) {
    // Handle classes
}
```

**Solution**: Update response handling
```javascript
// Updated code for new format
if (response.global_classes_created > 0) {
    // Handle global classes
} else if (response.widgets_created > 0) {
    // Handle widgets
}
```

#### 2. Parameter Name Changes

**Problem**: Using old parameter names
```javascript
// Old parameter name
{ threshold: 2 }
```

**Solution**: Update to new parameter names
```javascript
// New parameter name
{ globalClassThreshold: 2 }
```

#### 3. Missing Content Type

**Problem**: Not specifying content type
```javascript
// Missing type parameter
{
    content: '.button { color: blue; }'
}
```

**Solution**: Always specify type
```javascript
// Include type parameter
{
    type: 'css',
    content: '.button { color: blue; }'
}
```

### Migration Rollback

If migration issues occur, rollback procedure:

```javascript
// Emergency rollback to Class Converter
class EmergencyRollback {
    async rollbackToClassConverter() {
        console.log('Initiating emergency rollback...');
        
        // 1. Disable Widget Converter
        await this.disableWidgetConverter();
        
        // 2. Restore Class Converter endpoints
        await this.restoreClassConverterEndpoints();
        
        // 3. Update client-side code
        await this.updateClientCode();
        
        // 4. Validate rollback
        const validation = await this.validateRollback();
        
        console.log('Rollback complete:', validation);
        
        return validation;
    }
    
    async disableWidgetConverter() {
        // Disable via WordPress admin or configuration
        const response = await fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: new FormData([
                ['action', 'disable_widget_converter'],
                ['nonce', wpApiSettings.nonce]
            ])
        });
        
        return response.json();
    }
}
```

---

**Last Updated**: Current Session  
**Migration Version**: 1.0  
**Compatibility**: Class Converter → Widget Converter
