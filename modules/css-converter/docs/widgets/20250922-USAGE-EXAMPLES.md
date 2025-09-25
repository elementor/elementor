# Widget Converter Usage Examples & Tutorials

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic HTML Conversion](#basic-html-conversion)
3. [CSS Integration](#css-integration)
4. [Advanced Scenarios](#advanced-scenarios)
5. [Error Handling](#error-handling)
6. [Performance Optimization](#performance-optimization)
7. [Integration Examples](#integration-examples)

## Getting Started

### Prerequisites

- WordPress 5.0+
- Elementor v4+
- User with `edit_posts` capability
- Valid WordPress nonce for API requests

### Basic Setup

```javascript
// API endpoint
const apiUrl = '/wp-json/elementor/v2/widget-converter';

// Basic fetch function with X-DEV-TOKEN authentication
async function convertContent(data) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-DEV-TOKEN': 'your-secure-dev-token' // Add your dev token here
        },
        body: JSON.stringify(data)
    });
    
    return response.json();
}

// Alternative: WordPress nonce authentication
async function convertContentWithNonce(data) {
    const nonce = document.querySelector('#_wpnonce').value;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
        },
        body: JSON.stringify(data)
    });
    
    return response.json();
}
```

## Basic HTML Conversion

### Example 1: Simple HTML to Widgets

Convert basic HTML structure to Elementor widgets:

```javascript
const htmlContent = `
<div class="hero-section">
    <h1>Welcome to Our Website</h1>
    <p>This is a beautiful hero section with great content.</p>
    <button>Get Started</button>
</div>
`;

const result = await convertContent({
    type: 'html',
    content: htmlContent,
    options: {
        postType: 'page',
        createGlobalClasses: true
    }
});

console.log(`Created post ${result.post_id} with ${result.widgets_created} widgets`);
console.log(`Edit URL: ${result.edit_url}`);
```

**Expected Output:**
- 1 container widget (div → e-flexbox)
- 1 heading widget (h1 → e-heading)  
- 1 text widget (p → e-text)
- 1 button widget (button → e-button)

### Example 2: Nested Structure Conversion

```javascript
const nestedHtml = `
<div class="page-wrapper">
    <header class="site-header">
        <div class="container">
            <h1 class="site-title">My Website</h1>
            <nav class="main-nav">
                <a href="/home">Home</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
            </nav>
        </div>
    </header>
    <main class="main-content">
        <section class="hero">
            <h2>Hero Title</h2>
            <p>Hero description text goes here.</p>
        </section>
    </main>
</div>
`;

const result = await convertContent({
    type: 'html',
    content: nestedHtml,
    options: {
        postType: 'page',
        preserveIds: false,
        createGlobalClasses: true
    }
});
```

**Result Structure:**
```
e-flexbox (page-wrapper)
├── e-flexbox (header)
│   └── e-flexbox (container)
│       ├── e-heading (site-title)
│       └── e-flexbox (nav)
│           ├── e-link (Home)
│           ├── e-link (About)
│           └── e-link (Contact)
└── e-flexbox (main)
    └── e-flexbox (hero)
        ├── e-heading (Hero Title)
        └── e-text (Hero description)
```

## CSS Integration

### Example 3: HTML with Inline CSS

```javascript
const styledHtml = `
<div style="background-color: #f8f9fa; padding: 40px; text-align: center;">
    <h1 style="color: #2c3e50; font-size: 48px; margin-bottom: 20px;">
        Styled Heading
    </h1>
    <p style="color: #7f8c8d; font-size: 18px; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        This paragraph has custom styling that will be converted to Elementor widget properties.
    </p>
    <div style="margin-top: 30px;">
        <a href="/signup" style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Sign Up Now
        </a>
    </div>
</div>
`;

const result = await convertContent({
    type: 'html',
    content: styledHtml
});
```

**CSS Property Mapping:**
- `background-color` → Widget background settings
- `padding` → Widget padding settings
- `color` → Text color settings
- `font-size` → Typography size settings
- `margin` → Widget margin settings
- `border-radius` → Border radius settings

### Example 4: HTML with External CSS

```javascript
const htmlWithClasses = `
<div class="hero-banner">
    <div class="container">
        <h1 class="hero-title">Amazing Product</h1>
        <p class="hero-description">
            Discover the future of web design with our innovative solution.
        </p>
        <div class="hero-actions">
            <a href="/demo" class="btn btn-primary">Try Demo</a>
            <a href="/pricing" class="btn btn-secondary">View Pricing</a>
        </div>
    </div>
</div>
`;

const cssContent = `
.hero-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 80px 0;
    text-align: center;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.hero-title {
    color: white;
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
}

.hero-description {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.25rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: #ff6b6b;
    color: white;
}

.btn-secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;
}
`;

// Method 1: Separate CSS conversion
const cssResult = await convertContent({
    type: 'css',
    content: cssContent,
    options: {
        createGlobalClasses: true,
        globalClassThreshold: 1
    }
});

// Method 2: Combined HTML conversion (CSS would need to be included via cssUrls)
const combinedResult = await convertContent({
    type: 'html',
    content: htmlWithClasses,
    cssUrls: ['https://yoursite.com/path/to/styles.css'],
    followImports: true,
    options: {
        createGlobalClasses: true,
        globalClassThreshold: 1
    }
});
```

### Example 5: CSS Specificity Handling

```javascript
const complexCss = `
/* Element selector - lowest priority */
h1 {
    color: blue;
    font-size: 24px;
}

/* Class selector - medium priority */
.title {
    color: red;
    font-weight: bold;
}

/* ID selector - high priority */
#main-title {
    color: green;
    text-align: center;
}

/* !important - highest priority (HVV requirement) */
.important-title {
    color: purple !important;
    font-size: 36px !important;
}
`;

const htmlWithSpecificity = `
<h1 id="main-title" class="title important-title">
    Complex Title with Multiple CSS Rules
</h1>
`;

const result = await convertContent({
    type: 'html',
    content: htmlWithSpecificity
    // CSS would be processed according to specificity:
    // color: purple !important (wins due to !important)
    // font-size: 36px !important (wins due to !important)
    // text-align: center (from #main-title ID selector)
    // font-weight: bold (from .title class selector)
});
```

## Advanced Scenarios

### Example 6: URL-Based Conversion

```javascript
async function convertFromUrl(url, options = {}) {
    const result = await convertContent({
        type: 'url',
        content: url,
        options: {
            timeout: 60, // 60 seconds for complex pages
            followImports: true,
            createGlobalClasses: true,
            ...options
        }
    });
    
    return result;
}

// Convert a landing page
const landingPageResult = await convertFromUrl('https://example.com/landing-page', {
    postType: 'page',
    preserveIds: true
});

// Convert a blog post
const blogPostResult = await convertFromUrl('https://example.com/blog/post-title', {
    postType: 'post',
    createGlobalClasses: false // Don't create global classes for one-off content
});
```

### Example 7: Batch Conversion

```javascript
async function batchConvert(items) {
    const results = [];
    
    for (const item of items) {
        try {
            const result = await convertContent(item);
            results.push({
                success: true,
                data: result,
                input: item
            });
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            results.push({
                success: false,
                error: error.message,
                input: item
            });
        }
    }
    
    return results;
}

const batchItems = [
    {
        type: 'html',
        content: '<div><h1>Page 1</h1></div>',
        options: { postType: 'page' }
    },
    {
        type: 'html', 
        content: '<div><h1>Page 2</h1></div>',
        options: { postType: 'page' }
    },
    {
        type: 'url',
        content: 'https://example.com/page3',
        options: { postType: 'page' }
    }
];

const batchResults = await batchConvert(batchItems);
console.log(`Converted ${batchResults.filter(r => r.success).length} of ${batchResults.length} items`);
```

### Example 8: Global Classes Management

```javascript
// Create reusable button styles
const buttonCss = `
.btn-base {
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    display: inline-block;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: #007cba;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-large {
    padding: 16px 32px;
    font-size: 18px;
}
`;

// Convert CSS to global classes first
const globalClassResult = await convertContent({
    type: 'css',
    content: buttonCss,
    options: {
        createGlobalClasses: true,
        globalClassThreshold: 1 // Create global class for any usage
    }
});

console.log(`Created ${globalClassResult.global_classes_created} global classes`);

// Now use the classes in HTML
const htmlWithGlobalClasses = `
<div class="button-showcase">
    <a href="/primary" class="btn-base btn-primary">Primary Button</a>
    <a href="/secondary" class="btn-base btn-secondary">Secondary Button</a>
    <a href="/success" class="btn-base btn-success btn-large">Large Success Button</a>
</div>
`;

const widgetResult = await convertContent({
    type: 'html',
    content: htmlWithGlobalClasses,
    options: {
        createGlobalClasses: true // Will reuse existing global classes
    }
});
```

## Error Handling

### Example 9: Comprehensive Error Handling

```javascript
async function robustConvert(data) {
    try {
        const result = await convertContent(data);
        
        if (!result.success) {
            console.error('Conversion failed:', result.error);
            return null;
        }
        
        // Check for warnings
        if (result.warnings && result.warnings.length > 0) {
            console.warn('Conversion completed with warnings:');
            result.warnings.forEach(warning => {
                console.warn(`- ${warning.message}`);
            });
        }
        
        // Check conversion quality
        if (result.error_report && result.error_report.summary.success_rate < 80) {
            console.warn(`Low conversion success rate: ${result.error_report.summary.success_rate}%`);
            
            if (result.error_report.recommendations) {
                console.log('Recommendations:');
                result.error_report.recommendations.forEach(rec => {
                    console.log(`- ${rec}`);
                });
            }
        }
        
        return result;
        
    } catch (error) {
        if (error.response) {
            // API error response
            const errorData = await error.response.json();
            console.error('API Error:', errorData);
            
            switch (errorData.error) {
                case 'content_too_large':
                    console.log('Try reducing content size or splitting into smaller chunks');
                    break;
                case 'security_violation':
                    console.log('Content contains potentially dangerous elements');
                    break;
                case 'nesting_too_deep':
                    console.log('HTML structure is too deeply nested');
                    break;
                default:
                    console.log('Check API documentation for error details');
            }
        } else {
            // Network or other error
            console.error('Network Error:', error.message);
        }
        
        return null;
    }
}

// Usage with error handling
const result = await robustConvert({
    type: 'html',
    content: '<div><h1>Test Content</h1></div>'
});

if (result) {
    console.log('Conversion successful!');
    window.location.href = result.edit_url;
}
```

### Example 10: Fallback Strategies

```javascript
async function convertWithFallbacks(content) {
    // Strategy 1: Try full conversion
    try {
        const result = await convertContent({
            type: 'html',
            content: content,
            options: {
                createGlobalClasses: true,
                globalClassThreshold: 1
            }
        });
        
        if (result.success) {
            return { strategy: 'full', result };
        }
    } catch (error) {
        console.log('Full conversion failed, trying simplified approach');
    }
    
    // Strategy 2: Try without global classes
    try {
        const result = await convertContent({
            type: 'html',
            content: content,
            options: {
                createGlobalClasses: false
            }
        });
        
        if (result.success) {
            return { strategy: 'no-global-classes', result };
        }
    } catch (error) {
        console.log('Simplified conversion failed, trying basic approach');
    }
    
    // Strategy 3: Strip complex CSS and try again
    const simplifiedContent = content
        .replace(/style="[^"]*"/g, '') // Remove inline styles
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>.*?<\/style>/gi, ''); // Remove style blocks
    
    try {
        const result = await convertContent({
            type: 'html',
            content: simplifiedContent,
            options: {
                createGlobalClasses: false
            }
        });
        
        if (result.success) {
            return { strategy: 'simplified', result };
        }
    } catch (error) {
        console.log('All conversion strategies failed');
    }
    
    return { strategy: 'failed', result: null };
}
```

## Performance Optimization

### Example 11: Large Content Handling

```javascript
async function convertLargeContent(content) {
    // Check content size
    const contentSize = new Blob([content]).size;
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    
    if (contentSize > maxSize) {
        console.log('Content too large, splitting into chunks');
        return await convertInChunks(content);
    }
    
    // Use appropriate timeout for large content
    const timeout = Math.min(300, Math.max(30, contentSize / (1024 * 1024) * 10));
    
    const result = await convertContent({
        type: 'html',
        content: content,
        options: {
            timeout: timeout,
            createGlobalClasses: true
        }
    });
    
    return result;
}

async function convertInChunks(content) {
    // Simple chunking strategy - split by major sections
    const sections = content.split(/<\/(?:section|article|div)>/i);
    const results = [];
    
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].trim()) {
            const chunk = sections[i] + (i < sections.length - 1 ? '</div>' : '');
            
            try {
                const result = await convertContent({
                    type: 'html',
                    content: chunk,
                    options: {
                        postType: 'page',
                        createGlobalClasses: i === 0 // Only create global classes for first chunk
                    }
                });
                
                results.push(result);
                
                // Add delay between chunks
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`Chunk ${i} failed:`, error);
            }
        }
    }
    
    return results;
}
```

### Example 12: Concurrent Conversion with Rate Limiting

```javascript
class ConversionQueue {
    constructor(maxConcurrent = 3, delayBetween = 1000) {
        this.maxConcurrent = maxConcurrent;
        this.delayBetween = delayBetween;
        this.queue = [];
        this.running = 0;
    }
    
    async add(conversionData) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                data: conversionData,
                resolve,
                reject
            });
            
            this.process();
        });
    }
    
    async process() {
        if (this.running >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        
        const item = this.queue.shift();
        this.running++;
        
        try {
            const result = await convertContent(item.data);
            item.resolve(result);
        } catch (error) {
            item.reject(error);
        } finally {
            this.running--;
            
            // Add delay before processing next item
            setTimeout(() => {
                this.process();
            }, this.delayBetween);
        }
    }
}

// Usage
const queue = new ConversionQueue(2, 1500); // Max 2 concurrent, 1.5s delay

const conversions = [
    { type: 'html', content: '<div><h1>Page 1</h1></div>' },
    { type: 'html', content: '<div><h1>Page 2</h1></div>' },
    { type: 'html', content: '<div><h1>Page 3</h1></div>' },
    { type: 'html', content: '<div><h1>Page 4</h1></div>' }
];

const results = await Promise.all(
    conversions.map(data => queue.add(data))
);
```

## Integration Examples

### Example 13: WordPress Plugin Integration

```php
<?php
// WordPress plugin integration example

class My_Widget_Converter_Integration {
    
    public function __construct() {
        add_action('wp_ajax_convert_page_content', [$this, 'handle_conversion']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
    }
    
    public function handle_conversion() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'convert_content')) {
            wp_die('Security check failed');
        }
        
        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_die('Insufficient permissions');
        }
        
        $content = sanitize_textarea_field($_POST['content']);
        $post_type = sanitize_text_field($_POST['post_type'] ?? 'page');
        
        // Make internal API call
        $request = new WP_REST_Request('POST', '/elementor/v2/widget-converter');
        $request->set_param('type', 'html');
        $request->set_param('content', $content);
        $request->set_param('options', [
            'postType' => $post_type,
            'createGlobalClasses' => true
        ]);
        
        $response = rest_do_request($request);
        
        if ($response->is_error()) {
            wp_send_json_error($response->as_error());
        } else {
            wp_send_json_success($response->get_data());
        }
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script(
            'widget-converter-integration',
            plugin_dir_url(__FILE__) . 'assets/converter.js',
            ['jquery'],
            '1.0.0',
            true
        );
        
        wp_localize_script('widget-converter-integration', 'converterAjax', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('convert_content')
        ]);
    }
}

new My_Widget_Converter_Integration();
```

### Example 14: React Component Integration

```jsx
import React, { useState, useCallback } from 'react';

const WidgetConverter = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    const convertContent = useCallback(async () => {
        if (!content.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/wp-json/elementor/v2/widget-converter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.wpApiSettings?.nonce
                },
                body: JSON.stringify({
                    type: 'html',
                    content: content,
                    options: {
                        postType: 'page',
                        createGlobalClasses: true
                    }
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Conversion failed');
            }
            
            setResult(data);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [content]);
    
    return (
        <div className="widget-converter">
            <h2>HTML to Elementor Widgets Converter</h2>
            
            <div className="converter-form">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your HTML content here..."
                    rows={10}
                    cols={80}
                />
                
                <button 
                    onClick={convertContent}
                    disabled={loading || !content.trim()}
                >
                    {loading ? 'Converting...' : 'Convert to Widgets'}
                </button>
            </div>
            
            {error && (
                <div className="error">
                    <h3>Conversion Error</h3>
                    <p>{error}</p>
                </div>
            )}
            
            {result && (
                <div className="result">
                    <h3>Conversion Successful!</h3>
                    <p>Created {result.widgets_created} widgets</p>
                    <p>Post ID: {result.post_id}</p>
                    
                    {result.warnings?.length > 0 && (
                        <div className="warnings">
                            <h4>Warnings:</h4>
                            <ul>
                                {result.warnings.map((warning, index) => (
                                    <li key={index}>{warning.message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <a 
                        href={result.edit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="edit-button"
                    >
                        Edit in Elementor
                    </a>
                </div>
            )}
        </div>
    );
};

export default WidgetConverter;
```

### Example 15: CLI Tool Integration

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

class ElementorWidgetConverterCLI {
    constructor(siteUrl, username, password) {
        this.siteUrl = siteUrl;
        this.username = username;
        this.password = password;
        this.nonce = null;
    }
    
    async authenticate() {
        // Get nonce via WordPress REST API authentication
        const authResponse = await fetch(`${this.siteUrl}/wp-json/wp/v2/users/me`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`
            }
        });
        
        if (!authResponse.ok) {
            throw new Error('Authentication failed');
        }
        
        // Extract nonce from response headers or make separate nonce request
        this.nonce = 'your-nonce-here'; // Implement nonce extraction
    }
    
    async convertFile(filePath, options = {}) {
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath).toLowerCase();
        
        let type = 'html';
        if (ext === '.css') type = 'css';
        
        const response = await fetch(`${this.siteUrl}/wp-json/elementor/v2/widget-converter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': this.nonce
            },
            body: JSON.stringify({
                type,
                content,
                options: {
                    postType: options.postType || 'page',
                    createGlobalClasses: options.createGlobalClasses !== false,
                    ...options
                }
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Conversion failed');
        }
        
        return result;
    }
    
    async convertDirectory(dirPath, options = {}) {
        const files = fs.readdirSync(dirPath);
        const results = [];
        
        for (const file of files) {
            if (file.endsWith('.html') || file.endsWith('.css')) {
                const filePath = path.join(dirPath, file);
                
                try {
                    console.log(`Converting ${file}...`);
                    const result = await this.convertFile(filePath, options);
                    
                    results.push({
                        file,
                        success: true,
                        postId: result.post_id,
                        editUrl: result.edit_url,
                        widgets: result.widgets_created
                    });
                    
                    console.log(`✓ ${file} → Post ${result.post_id} (${result.widgets_created} widgets)`);
                    
                } catch (error) {
                    results.push({
                        file,
                        success: false,
                        error: error.message
                    });
                    
                    console.error(`✗ ${file} → ${error.message}`);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        return results;
    }
}

// CLI Usage
async function main() {
    const converter = new ElementorWidgetConverterCLI(
        'https://yoursite.com',
        'username',
        'password'
    );
    
    await converter.authenticate();
    
    // Convert single file
    const result = await converter.convertFile('./landing-page.html', {
        postType: 'page',
        createGlobalClasses: true
    });
    
    console.log(`Conversion complete: ${result.edit_url}`);
    
    // Convert directory
    const dirResults = await converter.convertDirectory('./html-templates', {
        postType: 'page'
    });
    
    console.log(`Converted ${dirResults.filter(r => r.success).length} files successfully`);
}

if (require.main === module) {
    main().catch(console.error);
}
```

## Best Practices

### Content Preparation
1. **Clean HTML**: Remove unnecessary elements and attributes
2. **Standard CSS**: Use widely supported CSS properties
3. **Semantic Structure**: Use proper HTML5 semantic elements
4. **Optimize Images**: Ensure images are accessible and optimized

### Performance Tips
1. **Size Limits**: Keep content under size limits (10MB HTML, 5MB CSS)
2. **Batch Processing**: Use queues for multiple conversions
3. **Rate Limiting**: Respect API rate limits
4. **Timeout Management**: Use appropriate timeouts for content size

### Error Prevention
1. **Input Validation**: Validate content before sending
2. **Security**: Remove potentially dangerous elements
3. **Fallback Strategies**: Implement multiple conversion approaches
4. **User Feedback**: Provide clear error messages and recommendations

### Integration Guidelines
1. **Authentication**: Always verify user permissions
2. **Nonce Security**: Use proper WordPress nonces
3. **Error Handling**: Implement comprehensive error handling
4. **User Experience**: Provide progress feedback and clear results

---

**Last Updated**: Current Session  
**API Version**: 1.0  
**Compatibility**: Elementor v4+, WordPress 5.0+
