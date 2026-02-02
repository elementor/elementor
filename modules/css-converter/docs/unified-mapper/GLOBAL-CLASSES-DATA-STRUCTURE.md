# Global Classes Data Structure Research

## 🎯 **COMPLETE ELEMENTOR GLOBAL CLASSES DATA STRUCTURE**

Based on comprehensive analysis of Elementor's source code, here is the **exact** data structure required for global classes.

## 📋 **Root Structure**

Global classes are stored in Kit meta with this structure:

```json
{
  "items": {
    "class-id-1": { /* Global Class Item */ },
    "class-id-2": { /* Global Class Item */ }
  },
  "order": ["class-id-1", "class-id-2"]
}
```

## 🏗️ **Global Class Item Structure**

Each global class item **MUST** have this exact structure:

```json
{
  "id": "string",           // REQUIRED: Unique identifier
  "type": "class",          // REQUIRED: Must be "class" (only valid type)
  "label": "string",        // REQUIRED: Display name (2-50 chars, valid CSS class rules)
  "variants": [             // REQUIRED: Array of style variants
    {
      "meta": {             // REQUIRED: Variant metadata
        "breakpoint": "desktop",  // REQUIRED: string (desktop, tablet, mobile, etc.)
        "state": null             // REQUIRED: null, "hover", "active", or "focus"
      },
      "props": {            // REQUIRED: Style properties in atomic format
        "background": {
          "$$type": "background",
          "value": { /* atomic background structure */ }
        },
        "color": {
          "$$type": "color", 
          "value": "#ff0000"
        }
        // ... other atomic props
      },
      "custom_css": null    // OPTIONAL: Custom CSS object or null
    }
  ]
}
```

## ✅ **Validation Rules (from Style_Parser)**

### Required Fields:
- **`id`**: Must be string, unique identifier
- **`type`**: Must be exactly `"class"` (only valid type)
- **`label`**: Must be string, 2-50 characters, valid CSS class name rules
- **`variants`**: Must be array with at least one variant

### Label Validation Rules:
- Length: 2-50 characters
- Cannot start with digit
- Cannot contain spaces
- Only alphanumeric, underscore, hyphen allowed
- Cannot start with `--`
- Cannot start with `-` followed by digit
- Cannot be reserved names like `"container"`

### Variant Structure:
- **`meta`**: Required object with `breakpoint` (string) and `state` (null|"hover"|"active"|"focus")
- **`props`**: Required object with atomic-formatted CSS properties
- **`custom_css`**: Optional, can be null or custom CSS object

## 🔧 **Atomic Props Format**

CSS properties in `props` must use atomic format:

```json
{
  "background": {
    "$$type": "background",
    "value": {
      "color": {
        "$$type": "color",
        "value": "#ff0000"
      }
    }
  },
  "color": {
    "$$type": "color",
    "value": "#ffffff"
  },
  "font-size": {
    "$$type": "size", 
    "value": {
      "size": 16,
      "unit": "px"
    }
  },
  "margin": {
    "$$type": "dimensions",
    "value": {
      "block-start": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
      "inline-end": {"$$type": "size", "value": {"size": 15, "unit": "px"}},
      "block-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
      "inline-start": {"$$type": "size", "value": {"size": 15, "unit": "px"}}
    }
  }
}
```

## 🚨 **Critical Issues in Our Implementation**

### ❌ **What We Were Doing Wrong:**

1. **Missing `type` field** - Caused "Unknown style type" error
2. **Incorrect atomic format** - Using strings instead of proper atomic objects
3. **Missing validation** - Not validating against Style_Parser rules
4. **Wrong custom_css format** - Should be null or proper object, not string

### ✅ **What We Fixed:**

1. **Added `type: "class"`** - Resolves UnknownStyleTypeError
2. **Proper atomic format conversion** - CSS properties now use correct `$$type` structures
3. **Validation compliance** - Structure matches Style_Parser expectations

## 📡 **How Global Classes Are Loaded**

### Storage:
- **Kit Meta Keys**: `_elementor_global_classes` (frontend), `_elementor_global_classes_preview` (preview)
- **Repository**: `Global_Classes_Repository::put($items, $order)`

### Loading:
- **REST API**: `GET /wp-json/elementor/v1/global-classes?context=preview`
- **Editor**: Loaded via `PopulateStore` React component
- **JavaScript**: Available in `elementor.config.kit_config.global_classes`

## 🧪 **Testing Our Implementation**

### Validation Script:
```php
// Test if our global class structure is valid
$test_class = [
    'id' => 'test-class-1',
    'type' => 'class',
    'label' => 'test-class',
    'variants' => [
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => null
            ],
            'props' => [
                'color' => [
                    '$$type' => 'color',
                    'value' => '#ff0000'
                ]
            ],
            'custom_css' => null
        ]
    ]
];

$parser = \Elementor\Modules\GlobalClasses\Global_Classes_Parser::make();
$result = $parser->parse_items(['test-class-1' => $test_class]);

if ($result->is_valid()) {
    echo "✅ Valid structure";
} else {
    echo "❌ Invalid: " . json_encode($result->errors()->all());
}
```

## 📚 **Source Files Analyzed**

1. **`global-classes-parser.php`** - Validation rules and structure requirements
2. **`style-parser.php`** - Individual class item validation (VALID_TYPES, required fields)
3. **`props-parser.php`** - Atomic props validation against schema
4. **`global-classes-repository.php`** - Storage and retrieval methods
5. **`global-classes-rest-api.php`** - API endpoints and data flow
6. **`global-classes.php`** - Data container class

## 🎯 **Key Takeaways**

1. **Structure is strictly validated** - Must match Style_Parser expectations exactly
2. **Type field is mandatory** - Must be `"class"`, causes errors if missing/wrong
3. **Atomic format is required** - CSS properties must use `$$type` structures
4. **Label validation is strict** - CSS class name rules enforced
5. **API loads into editor config** - Available at `elementor.config.kit_config.global_classes`

This research eliminates the trial-and-error approach and provides the exact specification for global classes integration.
