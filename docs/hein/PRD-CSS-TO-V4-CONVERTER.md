# PRD: CSS-to-V4 Converter Tool for Angie SDK

**Document Type**: Product Requirements Document  
**Version**: 0.1  
**Date**: January 2025  
**Status**: **DRAFT**  
**Related**: Angie SDK MCP Tools, Elementor Editor v4 Atomic Widgets

---

## **Executive Summary**

### **Problem Statement**

Angie SDK currently relies heavily on schema resources to understand Elementor's v4 styling format. Every tool interaction requires fetching style schema resources (`elementor://styles/schema/{category}`) and widget schema resources (`elementor://widgets/schema/{widgetType}`), resulting in:

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

- 80%+ reduction in token costs per CSS styling interaction
- 50%+ reduction in tool call latency
- 100% conversion accuracy for supported CSS properties
- Zero schema resource fetches required for CSS conversion

---

## **Goals and Objectives**

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

- Replacing schema resources entirely (still needed for discovery and validation)
- Building a full CSS parser from scratch (leverage existing PHP infrastructure)
- Supporting legacy Elementor formats (v4 atomic widgets only)
- Handling CSS selectors, media queries, or advanced features (can expand later)

---

## **Current Implementation Analysis**

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

## **Proposed Solution**

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

## **Technical Design**

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
            const { cssString } = params;
            
            const result = await apiFetch( {
                path: '/elementor/v1/css-to-v4',
                method: 'POST',
                data: {
                    cssString,
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
    cssString: z.string()
        .describe( 'CSS string to parse (e.g., "color: red; font-size: 16px;")' ),
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
Convert CSS string to Elementor v4 atomic widget styling format (PropValue).

# When to use this tool
Use this tool when you need to convert CSS properties to Elementor v4 format for styling elements.
This tool eliminates the need to fetch and interpret style schema resources.

# Input Format
CSS string: { "cssString": "color: red; font-size: 16px;" }

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
        $css_string = $params['cssString'] ?? '';

        $properties = $this->parse_css_string( $css_string );
        
        return $this->convert_properties_to_v4( $properties );
    }

    private function parse_css_string( string $css_string ): array {
        $properties = [];
        $pattern = '/([a-zA-Z0-9-]+)\s*:\s*([^;]+);?/';
        
        if ( preg_match_all( $pattern, $css_string, $matches, PREG_SET_ORDER ) ) {
            foreach ( $matches as $match ) {
                $property = trim( $match[1] );
                $value = trim( $match[2] );
                $properties[ $property ] = $value;
            }
        }
        
        return $properties;
    }

    private function convert_properties_to_v4( array $properties ): array {
        $props = [];
        $unsupported = [];
        $custom_css = [];

        foreach ( $properties as $property => $value ) {
            $expanded = $this->shorthand_expander->expand( $property, $value );
            
            foreach ( $expanded as $exp_prop => $exp_value ) {
                $converted = $this->conversion_service->convert_property_to_v4_atomic(
                    $exp_prop,
                    $exp_value
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
            'cssString' => [
                'type' => 'string',
                'required' => true,
            ],
        ],
    ] );
} );
```

---

## **Success Metrics**

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
