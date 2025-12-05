# Interactions API Documentation for Playwright Tests

## Overview

This document describes how to add interactions to Elementor elements via API calls in Playwright tests. Interactions are part of the element data structure and are saved through the standard document save endpoint.

## MCP Network Requests

### Using Playwright's `request` API

Playwright provides a `request` fixture that allows making HTTP requests outside of the browser context. This is useful for API testing and programmatic document manipulation.

```typescript
test( 'Add interaction via API call', async ( { page, request } ) => {
  // Use 'request' fixture for API calls
  const response = await request.post( '/wp-admin/admin-ajax.php', {
    data: { /* request data */ }
  } );
} );
```

### Key Differences: `page` vs `request`

- **`page`**: Browser context, includes cookies/session, executes JavaScript
- **`request`**: HTTP client, no browser context, faster for API calls

For interactions API, we use `request` because:
- We need to send structured JSON data
- We don't need browser rendering
- We want to test the API directly

## Endpoint Structure

### Base Endpoint

```
POST /wp-admin/admin-ajax.php
```

### Request Format

The Elementor AJAX system uses a nested action structure:

```typescript
{
  action: 'elementor_ajax',           // WordPress AJAX action
  actions: JSON.stringify({            // Nested Elementor actions
    save_builder: {                    // Specific action name
      data: {
        status: 'draft',
        elements: JSON.stringify([...]),
        settings: JSON.stringify({...})
      }
    }
  }),
  editor_post_id: 123,                // Post ID
  _nonce: 'nonce-value'                // WordPress security nonce
}
```

### Complete Request Example

```typescript
const response = await request.post( '/wp-admin/admin-ajax.php', {
  data: {
    action: 'elementor_ajax',
    actions: JSON.stringify( {
      save_builder: {
        data: {
          status: 'draft',
          elements: JSON.stringify( doc.elements ),
          settings: JSON.stringify( doc.settings || {} ),
        },
      },
    } ),
    editor_post_id: doc.id,
    _nonce: nonce,
  },
} );
```

## Interactions Data Structure

### Adding Interactions to Elements

Interactions are added directly to the element object before serialization:

```typescript
const element = findElement( doc.elements, headingId );

element.interactions = {
  version: 1,
  items: [ {
    animation: {
      animation_type: 'entrance',
      animation_id: 'fadeIn',
    },
  } ],
};
```

### Interactions Object Format

```typescript
{
  version: 1,                    // Required: API version
  items: [                       // Array of interaction items
    {
      animation: {
        animation_type: 'entrance' | 'hover' | 'scroll',
        animation_id: string     // Animation preset ID
      },
      interaction_id?: string   // Optional: Auto-generated if missing
    }
  ]
}
```

### Valid Animation Types

- `'entrance'` - Animations that trigger on page load or scroll into view
- `'hover'` - Animations that trigger on hover
- `'scroll'` - Animations that trigger on scroll

### Valid Animation IDs

Animation IDs must match presets defined in `plugins/elementor/modules/interactions/presets.php`:

**Entrance Animations:**
- `'fadeIn'`, `'fadeInDown'`, `'fadeInUp'`, `'fadeInLeft'`, `'fadeInRight'`
- `'zoomIn'`, `'zoomInDown'`, `'zoomInUp'`
- `'slideInDown'`, `'slideInUp'`, `'slideInLeft'`, `'slideInRight'`
- `'bounceIn'`, `'bounceInDown'`, `'bounceInUp'`
- And more...

**Hover Animations:**
- `'pulse'`, `'shake'`, `'rubberBand'`, `'swing'`, `'tada'`, `'wobble'`, `'jello'`

## Complete Test Flow

### Step 1: Get Document Configuration

```typescript
const doc = await page.evaluate( () => {
  return ( window as any ).elementor.documents.getCurrent().config;
} );
```

Returns the full document configuration including:
- `doc.id` - Post ID
- `doc.elements` - Array of all elements
- `doc.settings` - Document settings

### Step 2: Get Security Nonce

```typescript
const nonce = await page.evaluate( () => {
  return ( window as any ).elementor.config.ajax.nonce;
} );
```

The nonce is required for all AJAX requests to prevent CSRF attacks.

### Step 3: Find Target Element

```typescript
const findElement = ( elements: any[], targetId: string ) => {
  for ( const el of elements ) {
    if ( el.id === targetId ) {
      return el;
    }
    if ( el.elements ) {
      const found = findElement( el.elements, targetId );
      if ( found ) return found;
    }
  }
  return null;
};

const element = findElement( doc.elements, headingId );
```

Elements can be nested, so we recursively search through the tree.

### Step 4: Add Interactions

```typescript
element.interactions = {
  version: 1,
  items: [ {
    animation: {
      animation_type: 'entrance',
      animation_id: 'fadeIn',
    },
  } ],
};
```

### Step 5: Send API Request

```typescript
const response = await request.post( '/wp-admin/admin-ajax.php', {
  data: {
    action: 'elementor_ajax',
    actions: JSON.stringify( {
      save_builder: {
        data: {
          status: 'draft',
          elements: JSON.stringify( doc.elements ),
          settings: JSON.stringify( doc.settings || {} ),
        },
      },
    } ),
    editor_post_id: doc.id,
    _nonce: nonce,
  },
} );

expect( response.ok() ).toBeTruthy();
```

## Server-Side Processing Flow

### 1. AJAX Handler Registration

**File**: `plugins/elementor/core/documents-manager.php`

```php
$ajax_manager->register_ajax_action( 'save_builder', [ $this, 'ajax_save' ] );
```

### 2. Request Processing

**Method**: `Documents_Manager::ajax_save()`

1. Validates user permissions
2. Extracts `elements` and `settings` from request
3. Calls `$document->save( $data )`

### 3. Document Save

**Method**: `Document::save()`

1. Applies `elementor/document/save/data` filter (priority 10)
2. Calls `save_elements()` to persist to database

### 4. Interactions Validation & Sanitization

**File**: `plugins/elementor/modules/interactions/module.php`

**Filter**: `elementor/document/save/data` (priority 10)

```php
add_filter( 'elementor/document/save/data', function( $data, $document ) {
  $validation = new Validation( $this->get_presets() );
  $document_after_sanitization = $validation->sanitize( $data );
  $validation->validate();
  return $document_after_sanitization;
}, 10, 2 );
```

**Process**:
- Validates animation IDs against presets
- Sanitizes interaction structure
- Converts to JSON string format
- Validates max interactions per element (default: 5)

### 5. Interaction ID Assignment

**Filter**: `elementor/document/save/data` (priority 11)

```php
add_filter( 'elementor/document/save/data', function( $data, $document ) {
  return ( new Parser( $document->get_main_id() ) )->assign_interaction_ids( $data );
}, 11, 2 );
```

**Process**:
- Generates unique `interaction_id` for each interaction if missing
- Format: `{post_id}-{element_id}-{counter}`
- Stores IDs in lookup table to prevent duplicates

### 6. Database Storage

**Method**: `Document::save_elements()`

```php
$json_value = wp_slash( wp_json_encode( $editor_data ) );
update_metadata( 'post', $this->post->ID, self::ELEMENTOR_DATA_META_KEY, $json_value );
```

Interactions are stored as part of the element data in post meta `_elementor_data`.

## Response Format

### Success Response

```json
{
  "status": "draft",
  "config": {
    "document": {
      "last_edited": "2025-01-15 10:30:00",
      "urls": {
        "wp_preview": "http://example.com/?p=123&preview=true"
      },
      "status": {
        "value": "draft",
        "label": "Draft"
      }
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "data": {
    "message": "Error message here"
  }
}
```

## Frontend Rendering

### Data Attribute Format

After saving, interactions are rendered on the frontend as:

```html
<h2 
  data-interaction-id="a9fc80f" 
  class="e-heading-base" 
  data-interactions='["load-slide-in-right-300-300"]'
>
  This is a title
</h2>
```

### Parsing Frontend Data

```typescript
const interactionsData = await headingElement.getAttribute( 'data-interactions' );
// Returns: '["load-slide-in-right-300-300"]'

const interactionsArray = JSON.parse( interactionsData );
// Parses to: ["load-slide-in-right-300-300"]

expect( interactionsArray[ 0 ] ).toMatch( /load.*fade/i );
```

The `data-interactions` attribute contains an array of animation ID strings, not the full interaction objects.

## Common Patterns

### Pattern 1: Add Single Interaction

```typescript
element.interactions = {
  version: 1,
  items: [ {
    animation: {
      animation_type: 'entrance',
      animation_id: 'fadeIn',
    },
  } ],
};
```

### Pattern 2: Add Multiple Interactions

```typescript
element.interactions = {
  version: 1,
  items: [
    {
      animation: {
        animation_type: 'entrance',
        animation_id: 'fadeIn',
      },
    },
    {
      animation: {
        animation_type: 'hover',
        animation_id: 'pulse',
      },
    },
  ],
};
```

### Pattern 3: With Interaction ID

```typescript
element.interactions = {
  version: 1,
  items: [ {
    interaction_id: 'custom-id-123',
    animation: {
      animation_type: 'entrance',
      animation_id: 'fadeIn',
    },
  } ],
};
```

## Troubleshooting

### Issue: Interactions Not Saving

**Check**:
1. Nonce is valid and current
2. User has edit permissions
3. Document is built with Elementor
4. Animation ID exists in presets

### Issue: Validation Errors

**Common Causes**:
- Invalid animation ID (not in presets)
- Too many interactions (>5 per element)
- Malformed interaction structure

### Issue: Frontend Not Rendering

**Check**:
1. Page is published (not draft)
2. Interactions module is active
3. Frontend scripts are enqueued
4. Element has correct classes

## References

- **Server Handler**: `plugins/elementor/core/documents-manager.php::ajax_save()`
- **Validation**: `plugins/elementor/modules/interactions/validation.php`
- **Parser**: `plugins/elementor/modules/interactions/parser.php`
- **Presets**: `plugins/elementor/modules/interactions/presets.php`
- **Test Example**: `plugins/elementor/tests/playwright/sanity/modules/interactions/interactions.test.ts`

