# PRD: CSS-to-V4 Converter Tool for Angie SDK

**Document Type**: Product Requirements Document  
**Version**: 0.1  
**Date**: January 2025  
**Status**: 📋 **DRAFT**  
**Related**: Angie SDK MCP Tools, Elementor Editor v4 Atomic Widgets

---

## 📋 **Executive Summary**

### **Problem Statement**

Angie SDK (Elementor's AI agent) currently relies heavily on schema resources to understand Elementor's v4 styling format. Every tool interaction requires fetching style schema resources (`elementor://styles/schema/{category}`) and widget schema resources (`elementor://widgets/schema/{widgetType}`), resulting in:

- **High token costs**: ~5,000-9,000 tokens per interaction just for schema fetching
- **Slow performance**: Multiple resource fetches add latency to each tool call
- **Schema interpretation errors**: AI must interpret complex PropType schemas correctly
- **Repetitive work**: Same schema data fetched repeatedly across interactions

### **Proposed Solution**

Create a dedicated **CSS-to-V4 Converter Tool** that transforms CSS properties directly into Elementor v4 atomic widget PropValue format. This tool will:

- **Eliminate schema fetching**: Direct conversion without schema lookups
- **Reduce token costs**: ~85% reduction (from ~7,000 to ~800 tokens per interaction)
- **Improve accuracy**: Deterministic conversion logic eliminates interpretation errors
- **Increase speed**: Single tool call instead of multiple resource fetches

### **Success Metrics**

- ✅ 80%+ reduction in token costs per CSS styling interaction
- ✅ 50%+ reduction in tool call latency
- ✅ 100% conversion accuracy for supported CSS properties
- ✅ Support for all CSS input formats (property objects, CSS strings, full CSS)
- ✅ Zero schema resource fetches required for CSS conversion

---

## 🎯 **Goals and Objectives**

### **Primary Goals**

1. **Token Cost Reduction**: Eliminate constant schema references in Angie SDK interactions
2. **Performance Improvement**: Faster CSS-to-v4 conversion through direct transformation
3. **Accuracy Enhancement**: Deterministic conversion logic eliminates AI interpretation errors
4. **Developer Experience**: Simple, intuitive tool API for AI agents

### **Secondary Goals**

1. **Reusability**: Tool can be used by other AI agents or automation systems
2. **Extensibility**: Easy to add support for new CSS properties
3. **Maintainability**: Code-based transformation is easier to test and debug

### **Non-Goals**

- ❌ Replacing schema resources entirely (still needed for discovery and validation)
- ❌ Building a full CSS parser from scratch (leverage existing PHP infrastructure)
- ❌ Supporting legacy Elementor formats (v4 atomic widgets only)
- ❌ Handling CSS selectors and specificity (out of scope for MVP)

---

## 🔍 **Current Implementation Analysis**

### **Current Flow (Schema-Based)**

```
Angie SDK Request
    ↓
Tool Prompt (references schema URIs)
    ↓
AI fetches style schema resource (elementor://styles/schema/typography)
    ↓
AI fetches widget schema resource (elementor://widgets/schema/e-heading)
    ↓
AI interprets schemas and generates PropValue
    ↓
Tool execution with PropValue
    ↓
Result
```

**Token Cost Breakdown**:
- Tool prompt: ~500 tokens
- Style schema fetch: ~1,200 tokens × 2-4 categories = 2,400-4,800 tokens
- Widget schema fetch: ~800 tokens × 3-5 widgets = 2,400-4,000 tokens
- **Total**: ~5,300-9,300 tokens per interaction

### **Current Code References**

**Schema Resource Registration**:
- File: `plugins/elementor/packages/packages/core/editor-canvas/src/mcp/resources/widgets-schema-resource.ts`
- Lines: 36-79 (style schema), 81-128 (widget schema)

**Tool Prompts with Schema References**:
- File: `plugins/elementor/packages/packages/core/editor-canvas/src/mcp/tools/build-composition/prompt.ts`
- Lines: 15-21 (schema URI references)

**Existing CSS Conversion Infrastructure** (in elementor-css plugin):
- File: `plugins/elementor-css/modules/css-converter/services/css/processing/css-property-conversion-service.php`
- File: `plugins/elementor-css/modules/css-converter/services/atomic-widgets/css-to-atomic-props-converter.php`

---

## 💡 **Proposed Solution**

### **Architecture: Hybrid Approach (TypeScript Tool + PHP Backend)**

**Recommended Implementation**: TypeScript MCP tool that calls PHP backend service via REST API.

**Why Hybrid**:
1. **Leverages existing PHP infrastructure**: Reuses `Css_Property_Conversion_Service` from elementor-css
2. **Type-safe frontend**: TypeScript tool with Zod validation for Angie integration
3. **Proven backend**: PHP conversion logic already tested and production-ready
4. **Consistent patterns**: Matches Elementor's existing `apiFetch` patterns

### **New Flow (Converter Tool)**

```
Angie SDK Request
    ↓
CSS-to-V4 Converter Tool (TypeScript)
    ↓
REST API Call → PHP Backend Service
    ↓
CSS Parser → Property Mappers → PropValue Converter
    ↓
Return PropValue JSON
    ↓
Tool Result
```

**Token Cost Breakdown**:
- Tool prompt: ~300 tokens (no schema references)
- Tool call: ~200 tokens (input)
- Conversion result: ~300 tokens (output)
- **Total**: ~800 tokens per interaction

**Savings**: ~85% reduction (from ~7,000 to ~800 tokens)

---

## 🏗️ **Technical Design**

### **1. TypeScript MCP Tool**

**Location**: `plugins/elementor/packages/packages/core/editor-canvas/src/mcp/tools/convert-css-to-v4/`

**File Structure**:
```
convert-css-to-v4/
├── tool.ts          # Tool handler
├── schema.ts        # Zod input/output schemas
└── prompt.ts        # Tool description and instructions
```

**Tool Registration**:
```typescript
// tool.ts
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import apiFetch from '@wordpress/api-fetch';
import { generatePrompt } from './prompt';
import { inputSchema, outputSchema } from './schema';

export const initConvertCssToV4Tool = ( reg: MCPRegistryEntry ) => {
    const { addTool } = reg;

    addTool( {
        name: 'convert-css-to-v4',
        description: generatePrompt(),
        schema: inputSchema,
        outputSchema: outputSchema,
        handler: async ( params ) => {
            const { css, cssString, cssWithSelectors, elementId } = params;
            
            // Call PHP backend via REST API
            const result = await apiFetch( {
                path: '/elementor/v1/css-to-v4',
                method: 'POST',
                data: {
                    css,
                    cssString,
                    cssWithSelectors,
                    elementId,
                },
            } );

            return result;
        },
    } );
};
```

**Input Schema** (Zod):
```typescript
// schema.ts
import { z } from '@elementor/schema';

export const inputSchema = {
    css: z.record( z.string(), z.string() )
        .optional()
        .describe( 'CSS properties as key-value object (e.g., { "color": "red", "font-size": "16px" })' ),
    
    cssString: z.string()
        .optional()
        .describe( 'CSS string to parse (e.g., "color: red; font-size: 16px;")' ),
    
    cssWithSelectors: z.string()
        .optional()
        .describe( 'Full CSS with selectors (e.g., ".button { color: red; }")' ),
    
    elementId: z.string()
        .optional()
        .describe( 'Element ID for selector matching (required if cssWithSelectors is provided)' ),
};

export const outputSchema = {
    props: z.record( z.string(), z.any() )
        .describe( 'Converted CSS properties in PropValue format' ),
    
    unsupported: z.array( z.string() )
        .optional()
        .describe( 'List of CSS properties that could not be converted' ),
    
    customCss: z.string()
        .optional()
        .describe( 'CSS string for properties that fell back to custom_css' ),
};
```

**Tool Prompt**:
```typescript
// prompt.ts
export const generatePrompt = () => {
    return `
Convert CSS properties to Elementor v4 atomic widget styling format (PropValue).

# When to use this tool
Use this tool when you need to convert CSS properties to Elementor v4 format for styling elements.
This tool eliminates the need to fetch and interpret style schema resources.

# Input Formats
1. Property Object: { "css": { "color": "red", "font-size": "16px" } }
2. CSS String: { "cssString": "color: red; font-size: 16px;" }
3. Full CSS: { "cssWithSelectors": ".button { color: red; }", "elementId": "element-123" }

# Output Format
Returns PropValue objects ready to use in _styles configuration:
{
    "props": {
        "color": { "$$type": "color", "value": "#ff0000" },
        "font-size": { "$$type": "size", "value": { "size": 16, "unit": "px" } }
    }
}

# Benefits
- No schema fetching required
- Faster conversion
- Deterministic results
- Supports all Elementor v4 atomic properties
`;
};
```

### **2. PHP Backend Service**

**Location**: `plugins/elementor/modules/css-converter/services/mcp/css-to-v4-service.php`

**Service Class**:
```php
<?php
namespace Elementor\Modules\CssConverter\Services\MCP;

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Css_To_V4_Service {
    private $conversion_service;
    private $shorthand_expander;

    public function __construct() {
        $this->conversion_service = new Css_Property_Conversion_Service();
        $this->shorthand_expander = new CSS_Shorthand_Expander();
    }

    public function convert( array $params ): array {
        $css = $params['css'] ?? null;
        $css_string = $params['cssString'] ?? null;
        $css_with_selectors = $params['cssWithSelectors'] ?? null;
        $element_id = $params['elementId'] ?? null;

        $properties = $this->extract_properties( $css, $css_string, $css_with_selectors, $element_id );
        
        return $this->convert_properties_to_v4( $properties, $element_id );
    }

    private function extract_properties( ... ): array {
        // Extract CSS properties from various input formats
        // 1. Handle property object (direct)
        // 2. Parse CSS string
        // 3. Parse CSS with selectors and match to element
    }

    private function convert_properties_to_v4( array $properties, ?string $element_id ): array {
        $props = [];
        $unsupported = [];
        $custom_css = [];

        foreach ( $properties as $property => $value ) {
            $expanded = $this->shorthand_expander->expand( $property, $value );
            
            foreach ( $expanded as $exp_prop => $exp_value ) {
                $converted = $this->conversion_service->convert_property_to_v4_atomic(
                    $exp_prop,
                    $exp_value,
                    $element_id
                );

                if ( $converted ) {
                    $props[ $exp_prop ] = $converted;
                } else {
                    $unsupported[] = $exp_prop;
                    $custom_css[ $exp_prop ] = $exp_value;
                }
            }
        }

        return [
            'props' => $props,
            'unsupported' => $unsupported,
            'customCss' => $this->format_custom_css( $custom_css ),
        ];
    }
}
```

### **3. REST API Endpoint**

**Location**: `plugins/elementor/modules/css-converter/api/rest-api.php`

**Endpoint Registration**:
```php
add_action( 'rest_api_init', function() {
    register_rest_route( 'elementor/v1', '/css-to-v4', [
        'methods' => 'POST',
        'callback' => [ $this, 'handle_css_to_v4_request' ],
        'permission_callback' => function() {
            return current_user_can( 'edit_posts' );
        },
        'args' => [
            'css' => [
                'type' => 'object',
                'required' => false,
            ],
            'cssString' => [
                'type' => 'string',
                'required' => false,
            ],
            'cssWithSelectors' => [
                'type' => 'string',
                'required' => false,
            ],
            'elementId' => [
                'type' => 'string',
                'required' => false,
            ],
        ],
    ] );
} );
```

---

## 📊 **Implementation Plan**

### **Phase 1: MVP (Minimum Viable Product)**

**Scope**: Support property objects and CSS strings only

**Tasks**:
1. ✅ Create PHP backend service (`Css_To_V4_Service`)
2. ✅ Create REST API endpoint
3. ✅ Create TypeScript MCP tool
4. ✅ Add tool registration to MCP registry
5. ✅ Write unit tests for PHP service
6. ✅ Write integration tests for REST API
7. ✅ Write TypeScript tests for tool

**Deliverables**:
- Working converter tool for `css` and `cssString` inputs
- Complete test coverage
- Documentation

**Timeline**: 2-3 weeks

### **Phase 2: Enhanced Support**

**Scope**: Add CSS with selectors support

**Tasks**:
1. Add CSS selector parsing
2. Add element matching logic
3. Add specificity handling
4. Update tool prompt with selector examples

**Deliverables**:
- Full CSS support with selector matching
- Enhanced documentation

**Timeline**: 1-2 weeks

### **Phase 3: Advanced Features**

**Scope**: Media queries, CSS variables, batch conversion

**Tasks**:
1. Add media query support
2. Add CSS variable resolution
3. Add batch conversion endpoint
4. Performance optimization

**Deliverables**:
- Advanced CSS features support
- Performance benchmarks

**Timeline**: 2-3 weeks

---

## 🧪 **Testing Strategy**

### **Unit Tests**

**PHP Service Tests**:
- File: `plugins/elementor/tests/phpunit/modules/css-converter/services/mcp/css-to-v4-service-test.php`
- Coverage: All conversion methods, error handling, edge cases

**TypeScript Tool Tests**:
- File: `plugins/elementor/packages/packages/core/editor-canvas/src/mcp/tools/convert-css-to-v4/__tests__/tool.test.ts`
- Coverage: Tool registration, input validation, error handling

### **Integration Tests**

**REST API Tests**:
- File: `plugins/elementor/tests/phpunit/modules/css-converter/api/rest-api-test.php`
- Coverage: Endpoint registration, request handling, response format

**End-to-End Tests**:
- File: `plugins/elementor/tests/playwright/sanity/modules/ai/css-to-v4-converter.test.ts`
- Coverage: Full tool workflow from Angie SDK to conversion result

### **Test Cases**

**Property Object Conversion**:
```typescript
Input: { css: { "color": "red", "font-size": "16px" } }
Expected: {
    props: {
        color: { $$type: "color", value: "#ff0000" },
        "font-size": { $$type: "size", value: { size: 16, unit: "px" } }
    }
}
```

**CSS String Conversion**:
```typescript
Input: { cssString: "color: red; font-size: 16px;" }
Expected: Same as above
```

**Unsupported Properties**:
```typescript
Input: { css: { "unknown-property": "value" } }
Expected: {
    props: {},
    unsupported: ["unknown-property"],
    customCss: "unknown-property: value;"
}
```

---

## 📈 **Success Metrics**

### **Token Cost Reduction**

**Baseline** (Current Schema-Based Approach):
- Average tokens per CSS styling interaction: ~7,000 tokens

**Target** (Converter Tool):
- Average tokens per CSS styling interaction: ~800 tokens
- **Reduction**: 85%+

### **Performance Improvement**

**Baseline**:
- Average tool call latency: ~2-3 seconds (multiple resource fetches)

**Target**:
- Average tool call latency: ~500ms-1s (single REST API call)
- **Improvement**: 50%+

### **Accuracy**

**Baseline**:
- Conversion accuracy: ~90% (schema interpretation errors)

**Target**:
- Conversion accuracy: 100% (deterministic conversion logic)

### **Adoption**

**Target**:
- 80%+ of CSS styling interactions use converter tool
- Zero schema resource fetches for CSS conversion

---

## 🔒 **Security Considerations**

1. **Input Validation**: Validate all CSS input to prevent injection attacks
2. **Rate Limiting**: Implement rate limiting on REST API endpoint
3. **Permission Checks**: Ensure user has `edit_posts` capability
4. **Sanitization**: Sanitize all CSS properties and values
5. **Error Handling**: Don't expose internal errors to clients

---

## 📚 **Documentation Requirements**

1. **Tool Documentation**: Complete tool description in prompt.ts
2. **API Documentation**: REST API endpoint documentation
3. **Usage Examples**: Examples for each input format
4. **Integration Guide**: How to use tool in Angie SDK
5. **Troubleshooting**: Common issues and solutions

---

## 🚀 **Rollout Plan**

### **Phase 1: Internal Testing**
- Deploy to staging environment
- Test with internal team
- Gather feedback

### **Phase 2: Beta Release**
- Deploy to beta users
- Monitor token usage and performance
- Collect metrics

### **Phase 3: General Availability**
- Deploy to production
- Update Angie SDK documentation
- Monitor adoption and performance

---

## 🔗 **Related Documents**

- [Angie SDK Documentation](https://github.com/elementor/angie-sdk)
- [Elementor v4 Atomic Widgets Architecture](plugins/elementor/modules/atomic-widgets/)
- [CSS Converter Module](plugins/elementor-css/modules/css-converter/)
- [MCP Tools Documentation](plugins/elementor/packages/packages/core/editor-canvas/src/mcp/)

---

## 📝 **Appendices**

### **Appendix A: Supported CSS Properties**

**Phase 1 MVP**:
- Typography: `color`, `font-size`, `font-weight`, `font-family`, `line-height`, `text-align`
- Spacing: `margin`, `padding`
- Border: `border-width`, `border-color`, `border-style`, `border-radius`
- Background: `background-color`
- Layout: `display`, `width`, `height`

**Future Phases**:
- All properties supported by Elementor v4 atomic widgets
- CSS variables
- Media queries
- Pseudo-selectors

### **Appendix B: PropValue Format Reference**

```typescript
// Color
{ $$type: "color", value: "#ff0000" }

// Size
{ $$type: "size", value: { size: 16, unit: "px" } }

// Dimensions (margin, padding)
{ $$type: "dimensions", value: {
    "block-start": { $$type: "size", value: { size: 20, unit: "px" } },
    "inline-end": { $$type: "size", value: { size: 20, unit: "px" } },
    "block-end": { $$type: "size", value: { size: 20, unit: "px" } },
    "inline-start": { $$type: "size", value: { size: 20, unit: "px" } }
} }
```

---

**Document Status**: 📋 **DRAFT**  
**Last Updated**: January 2025  
**Next Review**: After Phase 1 MVP completion

