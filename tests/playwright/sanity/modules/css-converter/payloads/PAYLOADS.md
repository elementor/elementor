Add screenshot tests for these payloads.

## ⚡ **API Simplification (Recommended)**

The `createGlobalClasses: false` option has been **removed** for better performance and consistency. All conversions now use the optimized global classes pipeline, which:

- ✅ **Better Performance**: Single optimized conversion path
- ✅ **More Reliable**: All CSS properties work correctly  
- ✅ **Consistent Output**: Predictable widget structure
- ✅ **Simplified API**: Fewer options to configure

The `createGlobalClasses` option still exists for backward compatibility but now always behaves as `true`.

## Fixed Payload Examples - Dual API Support

### Option 1: Widget Converter API (Recommended)
**Endpoint**: `/wp-json/elementor/v2/widget-converter`
**Method**: POST
**Features**: Creates full Elementor widgets + global classes + WordPress posts

#### Basic CSS Conversion
```json
{
    "type": "css",
    "content": ".first2343 { font-size: 1rem; color: #aaaaaa; }",
    "options": {
        "createGlobalClasses": true,
        "postType": "page"
    }
}
```

#### HTML with Inline CSS
```json
{
    "type": "html",
    "content": "<div style=\"color: #ff6b6b; padding: 20px;\"><h1>Styled Content</h1></div>",
    "options": {
        "createGlobalClasses": false,
        "preserveIds": false
    }
}
```

#### Advanced Options
```json
{
    "type": "css",
    "content": ".complex-class { font-size: 2rem; background: linear-gradient(45deg, #667eea, #764ba2); }",
    "options": {
        "createGlobalClasses": true,
        "postType": "page",
        "globalClassThreshold": 1,
        "timeout": 30
    }
}
```

### Option 2: CSS Classes API (Global Classes Only)
**Endpoint**: `/wp-json/elementor/v2/css-converter/classes`
**Method**: POST
**Features**: Creates only global classes (no widgets or posts)

### Option 3: CSS Variables API (Global Variables Only)
**Endpoint**: `/wp-json/elementor/v2/css-converter/variables`
**Method**: POST
**Features**: Creates only global variables/design tokens (no widgets or posts)

#### Basic CSS Classes
```json
{
    "css": ".first2343 { font-size: 1rem; color: #aaaaaa; }",
    "store": true
}
```

#### Your Exact Payload (✅ FIXED!)
```json
{
    "css": ".various{ font-weight: 900; display: inline-flex; background-color: #aaaaaa; border: 1px solid #aaaaaa; }"
}
```
**Note**: The `store` parameter defaults to `true`, so it's optional.
**Status**: ✅ 500 error fixed - missing `get_max_css_size()` method added to config class.

#### Multiple Classes
```json
{
    "css": ".header { font-size: 2rem; color: #333; } .content { padding: 20px; background: #f8f9fa; }",
    "store": true
}
```

#### CSS from URL
```json
{
    "url": "https://example.com/styles.css",
    "store": true
}
```

#### Basic CSS Variables
```json
{
    "css": "--testabc: #aaaaaa;"
}
```

#### Multiple CSS Variables
```json
{
    "css": ":root { --primary-color: #007cba; --spacing-md: 16px; --font-size-large: 24px; }"
}
```

#### CSS Variables from URL
```json
{
    "url": "https://example.com/variables.css"
}
```

### API Comparison

| Feature | Widget Converter API | CSS Classes API | CSS Variables API |
|---------|---------------------|-----------------|-------------------|
| **Creates Widgets** | ✅ Yes | ❌ No | ❌ No |
| **Creates Posts** | ✅ Yes | ❌ No | ❌ No |
| **Creates Global Classes** | ✅ Yes | ✅ Yes | ❌ No |
| **Creates Global Variables** | ❌ No | ❌ No | ✅ Yes |
| **HTML Support** | ✅ Yes | ❌ No | ❌ No |
| **URL Support** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Editor Integration** | ✅ Full | ❌ Classes only | ❌ Variables only |
| **Use Case** | Complete conversion | Classes only | Variables only |

### Response Examples

#### Widget Converter Response
```json
{
    "success": true,
    "post_id": 123,
    "edit_url": "https://site.com/wp-admin/post.php?post=123&action=elementor",
    "widgets_created": 3,
    "global_classes_created": 2,
    "variables_created": 0,
    "stats": {
        "total_elements": 4,
        "elements_converted": 3,
        "properties_converted": 8
    }
}
```

#### CSS Classes Response
```json
{
    "success": true,
    "global_classes_created": 2,
    "classes": [
        {
            "name": "first2343",
            "id": "gc_123",
            "properties": {
                "font-size": "1rem",
                "color": "#aaaaaa"
            }
        }
    ]
}
```

#### CSS Variables Response
```json
{
    "success": true,
    "data": {
        "variables": [
            {
                "name": "--testabc",
                "value": "#aaaaaa",
                "converted_type": "color-hex"
            }
        ],
        "storage": {
            "created": 1,
            "updated": 0,
            "errors": []
        }
    }
}
```

## Original Test Payloads

inline-css.test.ts
{
    "type": "html",
    "content": "<div style=\"color: #ff6b6b; font-size: 24px; padding: 20px; background-color: #f8f9fa;\"><h1 style=\"color: #2c3e50; font-weight: bold; text-align: center;\">Styled Heading</h1><p style=\"font-size: 16px; line-height: 1.6; margin: 10px 0;\">This paragraph has custom styling.</p></div>",
    "options": {
        "createGlobalClasses": true
    }
}

css-id.test.ts
{
    "type": "html",
    "content": "<style>#container { background: linear-gradient(45deg, #667eea, #764ba2); padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); } #title { background-color: #43b8b8; color: white; font-size: 32px; font-weight: 700; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } #subtitle { color: #e0e6ed; font-size: 18px; margin-top: 10px; }</style><div id=\"container\"><h1 id=\"title\">Premium Design</h1><p id=\"subtitle\">Beautiful gradients and shadows</p></div>",
    "options": {
        "createGlobalClasses": true
    }
}

global-classes.test.ts
{
    "type": "html",
    "content": "<style>.hero-section { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 60px 30px; background: #1a1a2e; } .hero-title { color: #eee; font-size: 48px; font-weight: 800; letter-spacing: -1px; } .hero-subtitle { color: #16213e; font-size: 20px; opacity: 0.8; } .cta-button { background: #0f3460; color: white; padding: 15px 30px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; }</style><div class=\"hero-section\"><h1 class=\"hero-title\">Amazing Product</h1><p class=\"hero-subtitle\">Transform your workflow today</p><a href=\"#\" class=\"cta-button\">Get Started</a></div>",
    "options": {
        "createGlobalClasses": true
    }
}

typography.test.ts
{
    "type": "html",
    "content": "<div style=\"font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px;\"><h1 style=\"font-size: 42px; font-weight: 300; color: #2c3e50; line-height: 1.2; margin-bottom: 20px; text-align: center;\">Typography Test</h1><h2 style=\"font-size: 28px; font-weight: 600; color: #34495e; margin: 30px 0 15px;\">Subheading Style</h2><p style=\"font-size: 18px; line-height: 1.7; color: #555; margin-bottom: 20px; text-align: justify;\">This paragraph tests various typography properties including font size, line height, color, and text alignment. It should render beautifully with proper spacing.</p><blockquote style=\"border-left: 4px solid #3498db; padding-left: 20px; margin: 30px 0; font-style: italic; color: #7f8c8d;\">This is a styled blockquote to test border and italic text styling.</blockquote></div>",
    "options": {
        "createGlobalClasses": true
    }
}

spacing-and-layout.test.ts
{
    "type": "html",
    "content": "<div style=\"padding: 50px 30px; background: #f7f9fc;\"><div style=\"margin: 0 auto 40px; max-width: 500px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);\"><h2 style=\"margin: 0 0 20px; padding-bottom: 15px; border-bottom: 2px solid #e9ecef; color: #495057;\">Spacing Test</h2><p style=\"margin: 15px 0; padding: 10px 15px; background: #e7f3ff; border-left: 3px solid #007bff; color: #004085;\">This tests margin and padding properties.</p><div style=\"display: flex; gap: 15px; margin-top: 25px;\"><div style=\"flex: 1; padding: 20px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px;\">Flex Item 1</div><div style=\"flex: 1; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px;\">Flex Item 2</div></div></div></div>",
    "options": {
        "createGlobalClasses": true
    }
}

border-and-shadow.test.ts
{
    "type": "html",
    "content": "<div style=\"padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\"><div style=\"background: white; border: 2px solid #dee2e6; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);\"><h2 style=\"color: #343a40; border-bottom: 3px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;\">Border Styles</h2><div style=\"border: 1px dashed #6c757d; padding: 15px; margin: 15px 0; border-radius: 8px;\">Dashed border example</div><div style=\"border: 3px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);\">Solid border with inset shadow</div><div style=\"border: 2px dotted #dc3545; padding: 15px; margin: 15px 0; border-radius: 8px;\">Dotted border example</div></div></div>",
    "options": {
        "createGlobalClasses": true
    }
}

background-styling.test.ts
{
    "type": "html",
    "content": "<div style=\"background: linear-gradient(to right, #ff7e5f, #feb47b); padding: 40px;\"><div style=\"background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; margin-bottom: 20px;\"><h2 style=\"color: #2d3748; text-align: center; margin-bottom: 30px;\">Color Variations</h2><div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;\"><div style=\"background: #e53e3e; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Red Background</div><div style=\"background: #38a169; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Green Background</div><div style=\"background: #3182ce; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Blue Background</div><div style=\"background: #805ad5; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Purple Background</div></div></div></div>",
    "options": {
        "createGlobalClasses": true
    }
}

edge-cases.test.ts
{
    "type": "html",
    "content": "<div style=\"color: invalid-color; font-size: ; background: #fff; padding: 20px;\"><h1 style=\"font-weight: 999; color: #333; margin-bottom: 15px;\">Error Handling Test</h1><p style=\"line-height: -1; color: #666; font-size: 16px;\">This tests how the system handles invalid CSS values.</p><div style=\"width: 200%; height: -50px; background: transparent;\">Invalid dimensions</div></div>",
    "options": {
        "createGlobalClasses": true
    }
}




