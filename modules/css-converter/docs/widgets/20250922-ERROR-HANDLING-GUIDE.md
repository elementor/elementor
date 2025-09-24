# Widget Converter Error Handling Guide

## Table of Contents

1. [Error Response Format](#error-response-format)
2. [HTTP Status Codes](#http-status-codes)
3. [Error Categories](#error-categories)
4. [Common Error Scenarios](#common-error-scenarios)
5. [Recovery Strategies](#recovery-strategies)
6. [Debugging Guide](#debugging-guide)
7. [Prevention Best Practices](#prevention-best-practices)

## Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "error_code",
  "message": "Human-readable error description",
  "details": {
    "parameter": "parameter_name",
    "value": "invalid_value",
    "expected": "expected_format",
    "violations": [
      {
        "type": "violation_type",
        "description": "Violation description"
      }
    ]
  }
}
```

### Error Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | string | Machine-readable error code |
| `message` | string | Human-readable error message |
| `details` | object | Additional error context and debugging information |
| `details.parameter` | string | Parameter that caused the error |
| `details.value` | mixed | Invalid value that was provided |
| `details.expected` | string | Expected format or value |
| `details.violations` | array | List of security or validation violations |

## HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| 200 | OK | Successful conversion |
| 400 | Bad Request | Invalid parameters, malformed content, security violations |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions, domain restrictions |
| 404 | Not Found | Specified post ID not found |
| 413 | Payload Too Large | Content exceeds size limits |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side processing error |
| 503 | Service Unavailable | Temporary service issues |

## Error Categories

### 1. Validation Errors (400)

#### Missing Required Parameters
```json
{
  "error": "missing_required_parameter",
  "message": "Required parameter 'type' is missing or empty",
  "details": {
    "parameter": "type"
  }
}
```

**Cause**: Required API parameters not provided  
**Solution**: Ensure all required parameters are included in the request

#### Invalid Parameter Values
```json
{
  "error": "invalid_parameter_value", 
  "message": "Parameter 'type' must be one of: url, html, css",
  "details": {
    "parameter": "type",
    "value": "invalid_type",
    "expected": "url|html|css"
  }
}
```

**Cause**: Parameter value doesn't match expected format or enum  
**Solution**: Check API documentation for valid parameter values

#### Invalid Parameter Types
```json
{
  "error": "invalid_parameter_type",
  "message": "Parameter 'cssUrls' must be an array",
  "details": {
    "parameter": "cssUrls",
    "expected": "array"
  }
}
```

**Cause**: Parameter provided with wrong data type  
**Solution**: Ensure parameters match expected data types

### 2. Content Size Errors (413)

#### Content Too Large
```json
{
  "error": "content_too_large",
  "message": "Content size (11MB) exceeds maximum allowed for html content (10MB)",
  "details": {
    "content_size": 11534336,
    "max_size": 10485760,
    "type": "html"
  }
}
```

**Cause**: Content exceeds size limits (10MB HTML, 5MB CSS)  
**Solution**: Reduce content size or split into smaller chunks

### 3. Security Violations (400)

#### Malicious Content Detected
```json
{
  "error": "security_violation",
  "message": "HTML content contains potentially dangerous elements",
  "details": {
    "violations": [
      {
        "type": "html_security",
        "pattern": "script_tags",
        "description": "Script tags are not allowed for security reasons"
      },
      {
        "type": "html_security", 
        "pattern": "javascript_urls",
        "description": "JavaScript URLs are not allowed for security reasons"
      }
    ]
  }
}
```

**Cause**: Content contains blocked security patterns  
**Solution**: Remove dangerous elements (scripts, objects, javascript: URLs)

### 4. Structure Validation Errors (400)

#### Nesting Too Deep
```json
{
  "error": "nesting_too_deep",
  "message": "HTML nesting depth (25) exceeds maximum allowed (20)",
  "details": {
    "actual_depth": 25,
    "max_depth": 20
  }
}
```

**Cause**: HTML structure exceeds maximum nesting depth  
**Solution**: Simplify HTML structure or reduce nesting levels

### 5. URL Validation Errors (400)

#### Invalid URL Format
```json
{
  "error": "invalid_url",
  "message": "Invalid URL format in parameter 'content'",
  "details": {
    "parameter": "content",
    "url": "not-a-valid-url"
  }
}
```

**Cause**: Malformed URL provided  
**Solution**: Ensure URLs are properly formatted

#### Invalid URL Scheme
```json
{
  "error": "invalid_url_scheme",
  "message": "URL must use http or https protocol in parameter 'content'",
  "details": {
    "parameter": "content",
    "url": "ftp://example.com/file.html",
    "scheme": "ftp"
  }
}
```

**Cause**: URL uses unsupported protocol  
**Solution**: Use only http or https URLs

#### Domain Not Allowed
```json
{
  "error": "domain_not_allowed",
  "message": "Domain not allowed in parameter 'content'",
  "details": {
    "parameter": "content",
    "url": "https://blocked-domain.com/page",
    "domain": "blocked-domain.com",
    "allowed_domains": ["example.com", "trusted-site.com"]
  }
}
```

**Cause**: URL domain not in allowed list (if configured)  
**Solution**: Use URLs from allowed domains only

### 6. Resource Errors (404)

#### Post Not Found
```json
{
  "error": "post_not_found",
  "message": "Post with ID 999999 not found",
  "details": {
    "option": "postId",
    "post_id": 999999
  }
}
```

**Cause**: Specified post ID doesn't exist  
**Solution**: Verify post ID exists or use null to create new post

#### Invalid Post Type
```json
{
  "error": "invalid_post_type",
  "message": "Post type 'invalid_type' does not exist",
  "details": {
    "option": "postType",
    "post_type": "invalid_type"
  }
}
```

**Cause**: Specified post type not registered  
**Solution**: Use valid WordPress post types (page, post, etc.)

### 7. Permission Errors (403)

#### Insufficient Permissions
```json
{
  "error": "permission_denied",
  "message": "User lacks required permissions to create posts",
  "details": {
    "required_capability": "edit_posts",
    "user_id": 123
  }
}
```

**Cause**: User doesn't have edit_posts capability  
**Solution**: Ensure user has proper WordPress permissions

### 8. Rate Limiting Errors (429)

#### Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please wait before trying again.",
  "details": {
    "limit": 100,
    "window": 3600,
    "retry_after": 1800
  }
}
```

**Cause**: API rate limit exceeded  
**Solution**: Wait before making additional requests

## Common Error Scenarios

### Scenario 1: Large HTML File Conversion

**Problem**: Converting a large HTML file fails with content_too_large error

```javascript
// ❌ This will fail for files > 10MB
const largeHtml = fs.readFileSync('large-page.html', 'utf8'); // 15MB file
const result = await convertContent({
    type: 'html',
    content: largeHtml
});
```

**Solution**: Split content into chunks

```javascript
// ✅ Split large content into manageable chunks
function splitHtmlIntoChunks(html, maxSize = 8 * 1024 * 1024) { // 8MB chunks
    const sections = html.split(/<\/(?:section|article|div)>/i);
    const chunks = [];
    let currentChunk = '';
    
    for (const section of sections) {
        if ((currentChunk + section).length > maxSize) {
            if (currentChunk) {
                chunks.push(currentChunk + '</div>');
                currentChunk = section;
            }
        } else {
            currentChunk += section + '</div>';
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks;
}

const chunks = splitHtmlIntoChunks(largeHtml);
const results = [];

for (const chunk of chunks) {
    const result = await convertContent({
        type: 'html',
        content: chunk
    });
    results.push(result);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
}
```

### Scenario 2: Security Violation with User Content

**Problem**: User-submitted HTML contains script tags

```javascript
// ❌ This will fail with security_violation
const userHtml = `
<div>
    <h1>User Content</h1>
    <script>alert('xss')</script>
    <p>Some text</p>
</div>
`;

const result = await convertContent({
    type: 'html',
    content: userHtml
});
```

**Solution**: Sanitize content before conversion

```javascript
// ✅ Sanitize user content
function sanitizeHtml(html) {
    return html
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remove object tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, ''); // Remove iframes
}

const sanitizedHtml = sanitizeHtml(userHtml);
const result = await convertContent({
    type: 'html',
    content: sanitizedHtml
});
```

### Scenario 3: Deep Nesting Structure

**Problem**: HTML with excessive nesting fails validation

```javascript
// ❌ This creates 25 levels of nesting (exceeds 20 limit)
let deepHtml = '<div>';
for (let i = 0; i < 25; i++) {
    deepHtml += '<div>';
}
deepHtml += 'Content';
for (let i = 0; i < 25; i++) {
    deepHtml += '</div>';
}
deepHtml += '</div>';
```

**Solution**: Flatten structure before conversion

```javascript
// ✅ Flatten deeply nested structures
function flattenHtmlStructure(html) {
    // Simple flattening: remove excessive nested divs
    return html.replace(/<div>\s*<div>/g, '<div>').replace(/<\/div>\s*<\/div>/g, '</div>');
}

const flattenedHtml = flattenHtmlStructure(deepHtml);
const result = await convertContent({
    type: 'html',
    content: flattenedHtml
});
```

### Scenario 4: Invalid CSS Properties

**Problem**: CSS contains unsupported or invalid properties

```javascript
// ❌ Contains invalid CSS that may cause warnings
const cssWithInvalidProps = `
.test {
    color: #invalid-color;
    custom-property: some-value;
    font-size: -10px;
}
`;
```

**Solution**: Validate CSS before conversion

```javascript
// ✅ Validate and clean CSS
function validateCssProperties(css) {
    const validProperties = [
        'color', 'font-size', 'font-weight', 'text-align', 'line-height',
        'margin', 'padding', 'border', 'background', 'display', 'position'
        // ... add all supported properties
    ];
    
    const lines = css.split('\n');
    const cleanedLines = lines.filter(line => {
        const match = line.match(/^\s*([^:]+):/);
        if (match) {
            const property = match[1].trim();
            return validProperties.includes(property);
        }
        return true; // Keep non-property lines (selectors, braces, etc.)
    });
    
    return cleanedLines.join('\n');
}

const cleanedCss = validateCssProperties(cssWithInvalidProps);
const result = await convertContent({
    type: 'css',
    content: cleanedCss
});
```

## Recovery Strategies

### 1. Graceful Degradation

When conversion fails, implement fallback strategies:

```javascript
async function convertWithFallback(content) {
    const strategies = [
        // Strategy 1: Full conversion with all features
        {
            name: 'full',
            options: {
                createGlobalClasses: true,
                globalClassThreshold: 1,
                preserveIds: true
            }
        },
        // Strategy 2: Simplified conversion
        {
            name: 'simplified',
            options: {
                createGlobalClasses: false,
                preserveIds: false
            }
        },
        // Strategy 3: Basic conversion with sanitized content
        {
            name: 'basic',
            options: {
                createGlobalClasses: false,
                preserveIds: false
            },
            preprocess: (content) => sanitizeHtml(content)
        }
    ];
    
    for (const strategy of strategies) {
        try {
            const processedContent = strategy.preprocess ? 
                strategy.preprocess(content) : content;
                
            const result = await convertContent({
                type: 'html',
                content: processedContent,
                options: strategy.options
            });
            
            console.log(`Conversion successful using ${strategy.name} strategy`);
            return result;
            
        } catch (error) {
            console.log(`${strategy.name} strategy failed:`, error.message);
            continue;
        }
    }
    
    throw new Error('All conversion strategies failed');
}
```

### 2. Partial Success Handling

Handle partial conversion results:

```javascript
function handlePartialSuccess(result) {
    if (!result.success) {
        throw new Error('Conversion failed completely');
    }
    
    const successRate = result.error_report?.summary?.success_rate || 100;
    
    if (successRate < 50) {
        console.warn('Low conversion success rate:', successRate + '%');
        
        // Offer user options
        return {
            status: 'poor_quality',
            message: 'Conversion completed but with many issues',
            recommendations: result.error_report?.recommendations || [],
            result: result
        };
    } else if (successRate < 80) {
        console.warn('Moderate conversion success rate:', successRate + '%');
        
        return {
            status: 'acceptable_quality',
            message: 'Conversion completed with some warnings',
            warnings: result.warnings || [],
            result: result
        };
    } else {
        return {
            status: 'high_quality',
            message: 'Conversion completed successfully',
            result: result
        };
    }
}
```

### 3. Error Recovery Workflows

Implement automatic error recovery:

```javascript
class ConversionRecovery {
    static async handleError(error, originalRequest) {
        const errorCode = error.response?.data?.error || error.code;
        
        switch (errorCode) {
            case 'content_too_large':
                return await this.handleLargeContent(originalRequest);
                
            case 'security_violation':
                return await this.handleSecurityViolation(originalRequest);
                
            case 'nesting_too_deep':
                return await this.handleDeepNesting(originalRequest);
                
            case 'rate_limit_exceeded':
                return await this.handleRateLimit(originalRequest, error);
                
            default:
                throw error; // Re-throw unhandled errors
        }
    }
    
    static async handleLargeContent(request) {
        console.log('Attempting to split large content...');
        
        const chunks = splitHtmlIntoChunks(request.content);
        const results = [];
        
        for (const chunk of chunks) {
            const chunkRequest = { ...request, content: chunk };
            const result = await convertContent(chunkRequest);
            results.push(result);
            
            // Add delay between chunks
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return {
            success: true,
            message: 'Content split into multiple posts',
            results: results,
            post_ids: results.map(r => r.post_id)
        };
    }
    
    static async handleSecurityViolation(request) {
        console.log('Attempting to sanitize content...');
        
        const sanitizedContent = sanitizeHtml(request.content);
        const sanitizedRequest = { ...request, content: sanitizedContent };
        
        return await convertContent(sanitizedRequest);
    }
    
    static async handleDeepNesting(request) {
        console.log('Attempting to flatten structure...');
        
        const flattenedContent = flattenHtmlStructure(request.content);
        const flattenedRequest = { ...request, content: flattenedContent };
        
        return await convertContent(flattenedRequest);
    }
    
    static async handleRateLimit(request, error) {
        const retryAfter = error.response?.data?.details?.retry_after || 60;
        
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        return await convertContent(request);
    }
}

// Usage
try {
    const result = await convertContent(request);
} catch (error) {
    const recoveredResult = await ConversionRecovery.handleError(error, request);
    console.log('Recovery successful:', recoveredResult);
}
```

## Debugging Guide

### 1. Enable Debug Logging

```php
// Enable WordPress debug logging
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### 2. Check Error Logs

Monitor WordPress error logs for detailed information:

```bash
# WordPress error log
tail -f /wp-content/debug.log | grep "Elementor Widget Converter"

# Server error logs
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
```

### 3. API Response Debugging

Add detailed logging to API responses:

```javascript
async function debugConversion(request) {
    console.log('Request:', JSON.stringify(request, null, 2));
    
    try {
        const response = await fetch('/wp-json/elementor/v2/widget-converter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': nonce
            },
            body: JSON.stringify(request)
        });
        
        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers));
        
        const data = await response.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));
        
        return data;
        
    } catch (error) {
        console.error('Network Error:', error);
        throw error;
    }
}
```

### 4. Content Analysis

Analyze problematic content:

```javascript
function analyzeContent(content) {
    const analysis = {
        size: new Blob([content]).size,
        lines: content.split('\n').length,
        scriptTags: (content.match(/<script/gi) || []).length,
        objectTags: (content.match(/<object/gi) || []).length,
        nestingDepth: calculateNestingDepth(content),
        cssProperties: extractCssProperties(content)
    };
    
    console.log('Content Analysis:', analysis);
    
    // Check for common issues
    if (analysis.size > 10 * 1024 * 1024) {
        console.warn('Content exceeds 10MB limit');
    }
    
    if (analysis.scriptTags > 0) {
        console.warn('Content contains script tags');
    }
    
    if (analysis.nestingDepth > 20) {
        console.warn('Content nesting exceeds 20 levels');
    }
    
    return analysis;
}

function calculateNestingDepth(html) {
    let maxDepth = 0;
    let currentDepth = 0;
    
    const tags = html.match(/<\/?[^>]+>/g) || [];
    
    for (const tag of tags) {
        if (tag.startsWith('</')) {
            currentDepth--;
        } else if (!tag.endsWith('/>')) {
            currentDepth++;
            maxDepth = Math.max(maxDepth, currentDepth);
        }
    }
    
    return maxDepth;
}
```

## Prevention Best Practices

### 1. Input Validation

Always validate input before sending to API:

```javascript
function validateInput(request) {
    const errors = [];
    
    // Check required fields
    if (!request.type) {
        errors.push('Type is required');
    }
    
    if (!request.content) {
        errors.push('Content is required');
    }
    
    // Check content size
    const contentSize = new Blob([request.content]).size;
    const maxSize = request.type === 'html' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    
    if (contentSize > maxSize) {
        errors.push(`Content size (${formatBytes(contentSize)}) exceeds limit (${formatBytes(maxSize)})`);
    }
    
    // Check for security issues
    if (request.type === 'html') {
        if (/<script/i.test(request.content)) {
            errors.push('HTML contains script tags');
        }
        
        if (/<object/i.test(request.content)) {
            errors.push('HTML contains object tags');
        }
    }
    
    return errors;
}

// Usage
const validationErrors = validateInput(request);
if (validationErrors.length > 0) {
    console.error('Validation errors:', validationErrors);
    return;
}
```

### 2. Content Sanitization

Sanitize content proactively:

```javascript
function sanitizeForConversion(content, type) {
    if (type === 'html') {
        return content
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
            .replace(/<object[^>]*>.*?<\/object>/gis, '') // Remove objects
            .replace(/javascript:/gi, '') // Remove javascript: URLs
            .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
            .replace(/<iframe[^>]*>.*?<\/iframe>/gis, ''); // Remove iframes
    }
    
    if (type === 'css') {
        return content
            .replace(/javascript:/gi, '') // Remove javascript: URLs
            .replace(/expression\s*\(/gi, '') // Remove CSS expressions
            .replace(/@import.*javascript:/gi, ''); // Remove malicious imports
    }
    
    return content;
}
```

### 3. Rate Limiting Management

Implement client-side rate limiting:

```javascript
class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }
    
    canMakeRequest() {
        const now = Date.now();
        
        // Remove old requests outside the window
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        return this.requests.length < this.maxRequests;
    }
    
    recordRequest() {
        this.requests.push(Date.now());
    }
    
    getTimeUntilNextRequest() {
        if (this.canMakeRequest()) {
            return 0;
        }
        
        const oldestRequest = Math.min(...this.requests);
        return this.windowMs - (Date.now() - oldestRequest);
    }
}

const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

async function rateLimitedConvert(request) {
    if (!rateLimiter.canMakeRequest()) {
        const waitTime = rateLimiter.getTimeUntilNextRequest();
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    rateLimiter.recordRequest();
    return await convertContent(request);
}
```

### 4. Error Monitoring

Set up comprehensive error monitoring:

```javascript
class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
    }
    
    logError(error, context = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            code: error.code || 'unknown',
            context: context,
            stack: error.stack
        };
        
        this.errors.unshift(errorLog);
        
        if (this.errors.length > this.maxErrors) {
            this.errors.pop();
        }
        
        // Send to monitoring service
        this.sendToMonitoring(errorLog);
        
        console.error('Conversion Error:', errorLog);
    }
    
    sendToMonitoring(errorLog) {
        // Send to your monitoring service (e.g., Sentry, LogRocket)
        if (window.Sentry) {
            window.Sentry.captureException(new Error(errorLog.error), {
                extra: errorLog.context
            });
        }
    }
    
    getErrorStats() {
        const errorCounts = {};
        
        this.errors.forEach(error => {
            errorCounts[error.code] = (errorCounts[error.code] || 0) + 1;
        });
        
        return {
            totalErrors: this.errors.length,
            errorCounts: errorCounts,
            recentErrors: this.errors.slice(0, 10)
        };
    }
}

const errorMonitor = new ErrorMonitor();

// Usage in conversion function
try {
    const result = await convertContent(request);
} catch (error) {
    errorMonitor.logError(error, { request: request });
    throw error;
}
```

---

**Last Updated**: Current Session  
**API Version**: 1.0  
**Compatibility**: Elementor v4+, WordPress 5.0+
