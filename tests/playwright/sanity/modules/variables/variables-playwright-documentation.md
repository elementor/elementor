# Variables API Documentation for Playwright Tests

## Overview

This document describes how to create and assign Elementor variables (CSS custom properties) via API calls and UI interactions in Playwright tests. Variables are design tokens that can be reused across elements for colors, fonts, and other style properties.

## MCP Network Requests

### Using Playwright's `request` API

Playwright provides a `request` fixture that allows making HTTP requests outside of the browser context. This is useful for API testing and programmatic variable creation.

```typescript
test( 'Create variable via API', async ( { page, request } ) => {
  // Use 'request' fixture for API calls
  const response = await request.post( '/wp-json/elementor/v1/variables/create', {
    headers: { /* headers */ },
    data: { /* request data */ }
  } );
} );
```

### Key Differences: `page` vs `request`

- **`page`**: Browser context, includes cookies/session, executes JavaScript
- **`request`**: HTTP client, no browser context, faster for API calls

For variables API, we use `request` because:
- We need to send structured JSON data
- We don't need browser rendering
- We want to test the API directly

## Endpoint Structure

### Base Endpoint

```
POST /wp-json/elementor/v1/variables/create
```

### Request Format

```typescript
{
  type: 'global-color-variable',    // Variable type
  label: 'variable-name',            // CSS variable name (without --)
  value: '#ffffff'                   // Variable value
}
```

### Complete Request Example

```typescript
const nonce = await page.evaluate( () => {
  return ( window as any ).wpApiSettings?.nonce;
} );

const response = await request.post( '/wp-json/elementor/v1/variables/create', {
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': nonce,
  },
  data: {
    type: 'global-color-variable',
    label: 'color-variable-created-through-api',
    value: '#000000',
  },
} );

expect( response.ok() ).toBeTruthy();
const responseData = await response.json();
expect( responseData.success ).toBeTruthy();
```

## Variable Types

### Supported Types

- **`global-color-variable`** - Color variables (hex, rgb, rgba, etc.)
- **`global-font-variable`** - Font family variables

### Variable Naming

- Variable labels become CSS custom property names
- Format: `--{label}` (e.g., `label: 'my-color'` → `--my-color`)
- Labels must be valid CSS identifiers (alphanumeric, hyphens, underscores)

## Creating Variables

### Method 1: Via UI (Variables Manager)

```typescript
import VariablesManagerPage from '../../v4-tests/editor-variables/variables-manager-page';

const variablesManagerPage = new VariablesManagerPage( page );

await variablesManagerPage.createVariableFromManager( {
  name: 'color-variable-created-in-ui',
  value: '#ffffff',
  type: 'color',
} );
```

**Process**:
1. Opens Variables Manager from style panel
2. Clicks "Add variable" button
3. Selects variable type (color/font)
4. Enters name and value
5. Saves variables manager

### Method 2: Via REST API

```typescript
const nonce = await page.evaluate( () => {
  return ( window as any ).wpApiSettings?.nonce;
} );

const response = await request.post( '/wp-json/elementor/v1/variables/create', {
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': nonce,
  },
  data: {
    type: 'global-color-variable',
    label: 'color-variable-created-through-api',
    value: '#000000',
  },
} );
```

**Note**: After creating via API, reload the page to ensure variables are available in the editor.

## Assigning Variables to Elements

### Step 1: Select Element

```typescript
const heading = editor.getPreviewFrame().locator( '.e-heading-base' ).first();
await heading.click();
```

### Step 2: Open Style Panel

```typescript
await page.getByRole( 'tab', { name: 'Style' } ).click();
```

### Step 3: Open Variables Popover

```typescript
const textColorControl = page.locator( '#text-color-control' );
const controlBoundingBox = await textColorControl.boundingBox();
await page.mouse.move( 
  controlBoundingBox.x + ( controlBoundingBox.width / 2 ), 
  controlBoundingBox.y + ( controlBoundingBox.height / 2 ) 
);
await page.click( EditorSelectors.floatingElements.v4.floatingActionsBar );
```

### Step 4: Select Variable

```typescript
await page.getByRole( 'button', { name: 'color-variable-created-in-ui' } ).click();
```

## Server-Side Processing Flow

### 1. REST API Handler

**File**: `plugins/elementor/modules/variables/classes/rest-api.php`

**Endpoint**: `POST /wp-json/elementor/v1/variables/create`

**Method**: `create_variable()`

1. Validates request parameters (type, label, value)
2. Checks user permissions (`manage_options` capability)
3. Calls `Variables_Service::create()`
4. Clears CSS cache
5. Returns variable data with watermark

### 2. Variable Storage

**File**: `plugins/elementor/modules/variables/storage/repository.php`

Variables are stored in Kit post meta:
- Meta key: `_elementor_variables`
- Format: JSON array of variable objects
- Each variable has: `id`, `type`, `label`, `value`, `order`

### 3. CSS Rendering

**File**: `plugins/elementor/modules/variables/classes/css-renderer.php`

**Method**: `raw_css()`

Generates CSS custom properties in `:root`:

```css
:root {
  --color-variable-created-in-ui: #ffffff;
  --color-variable-created-through-api: #000000;
}
```

### 4. Style Transformation

**File**: `plugins/elementor/modules/variables/transformers/global-variable-transformer.php`

When a variable is assigned to an element property:
- Variable ID is stored in element settings
- Transformer converts ID to `var(--variable-name)`
- CSS is generated with variable reference

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "variable": {
      "id": "abc123",
      "type": "global-color-variable",
      "label": "color-variable-created-through-api",
      "value": "#000000",
      "order": 1
    },
    "watermark": 1
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

### CSS Custom Properties

Variables are rendered as CSS custom properties in `:root`:

```css
:root {
  --color-variable-created-in-ui: #ffffff;
  --color-variable-created-through-api: #000000;
}
```

### Element Styles

When assigned to elements, variables are used as:

```css
.e-heading-base {
  color: var(--color-variable-created-in-ui);
}
```

### Verifying Frontend Usage

```typescript
// Verify computed color (resolved from variable)
const computedColor = await heading.evaluate( ( el ) => {
  return window.getComputedStyle( el ).color;
} );
expect( computedColor ).toBe( 'rgb(255, 255, 255)' );

// Verify CSS variable exists in :root
const rootVariable = await page.evaluate( () => {
  return window.getComputedStyle( document.documentElement )
    .getPropertyValue( '--color-variable-created-in-ui' );
} );
expect( rootVariable.trim() ).toBe( '#ffffff' );

// Verify variable reference in inline style
const inlineStyle = await heading.evaluate( ( el ) => {
  return el.getAttribute( 'style' ) || '';
} );
expect( inlineStyle ).toContain( 'var(--color-variable-created-in-ui)' );
```

## Complete Test Flow

### Step 1: Create Variable via UI

```typescript
await variablesManagerPage.createVariableFromManager( {
  name: 'color-variable-created-in-ui',
  value: '#ffffff',
  type: 'color',
} );
```

### Step 2: Create Variable via API

```typescript
const nonce = await page.evaluate( () => {
  return ( window as any ).wpApiSettings?.nonce;
} );

const response = await request.post( '/wp-json/elementor/v1/variables/create', {
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': nonce,
  },
  data: {
    type: 'global-color-variable',
    label: 'color-variable-created-through-api',
    value: '#000000',
  },
} );

expect( response.ok() ).toBeTruthy();
await page.reload(); // Reload to make variable available in editor
```

### Step 3: Add Elements

```typescript
await editor.addElement( { elType: 'e-heading' }, 'document' );
await editor.addElement( { elType: 'e-heading' }, 'document' );
```

### Step 4: Assign Variables to Elements

```typescript
// Assign to first heading
const firstHeading = editor.getPreviewFrame().locator( '.e-heading-base' ).first();
await firstHeading.click();
await page.getByRole( 'tab', { name: 'Style' } ).click();
const textColorControl = page.locator( '#text-color-control' );
const controlBoundingBox = await textColorControl.boundingBox();
await page.mouse.move( 
  controlBoundingBox.x + ( controlBoundingBox.width / 2 ), 
  controlBoundingBox.y + ( controlBoundingBox.height / 2 ) 
);
await page.click( EditorSelectors.floatingElements.v4.floatingActionsBar );
await page.getByRole( 'button', { name: 'color-variable-created-in-ui' } ).click();
```

### Step 5: Publish and Verify

```typescript
await editor.publishAndViewPage();

// Verify computed styles and CSS variables
const heading = page.locator( '.e-heading-base' ).first();
const computedColor = await heading.evaluate( ( el ) => {
  return window.getComputedStyle( el ).color;
} );
expect( computedColor ).toBe( 'rgb(255, 255, 255)' );
```

## Common Patterns

### Pattern 1: Create and Assign Variable

```typescript
// Create variable
await variablesManagerPage.createVariableFromManager( {
  name: 'primary-color',
  value: '#007bff',
  type: 'color',
} );

// Assign to element
const element = editor.getPreviewFrame().locator( '.e-heading-base' ).first();
await element.click();
await page.getByRole( 'tab', { name: 'Style' } ).click();
// ... open variables popover and select variable
```

### Pattern 2: Create Multiple Variables via API

```typescript
const variables = [
  { label: 'primary-color', value: '#007bff' },
  { label: 'secondary-color', value: '#6c757d' },
];

for ( const variable of variables ) {
  await request.post( '/wp-json/elementor/v1/variables/create', {
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    data: {
      type: 'global-color-variable',
      label: variable.label,
      value: variable.value,
    },
  } );
}
```

### Pattern 3: Verify Variable Usage

```typescript
// Check :root CSS variable
const rootVariable = await page.evaluate( ( varName ) => {
  return window.getComputedStyle( document.documentElement )
    .getPropertyValue( `--${ varName }` );
}, 'color-variable-name' );

expect( rootVariable.trim() ).toBe( '#ffffff' );

// Check element uses variable
const elementStyle = await element.evaluate( ( el ) => {
  return el.getAttribute( 'style' ) || '';
} );
expect( elementStyle ).toContain( 'var(--color-variable-name)' );
```

## Troubleshooting

### Issue: Variable Not Available After API Creation

**Solution**: Reload the page after creating via API to refresh editor state.

```typescript
await request.post( '/wp-json/elementor/v1/variables/create', { /* ... */ } );
await page.reload();
```

### Issue: Variable Not Appearing in Popover

**Check**:
1. Variable was created successfully (check API response)
2. Page was reloaded after API creation
3. Variable name matches exactly (case-sensitive)
4. Variable is not deleted

### Issue: CSS Variable Not Rendering

**Check**:
1. Page is published (not draft)
2. CSS cache is cleared
3. Variable is assigned to element
4. Variable value is valid CSS

### Issue: Computed Color Doesn't Match

**Note**: CSS variables resolve to computed values. If the variable value is `#ffffff`, the computed color will be `rgb(255, 255, 255)`.

## API Endpoints Reference

### Create Variable

```
POST /wp-json/elementor/v1/variables/create
```

**Parameters**:
- `type` (string, required): `'global-color-variable'` or `'global-font-variable'`
- `label` (string, required): Variable name (without `--`)
- `value` (string, required): Variable value

**Headers**:
- `Content-Type: application/json`
- `X-WP-Nonce: {nonce}`

### List Variables

```
GET /wp-json/elementor/v1/variables/list
```

### Update Variable

```
PUT /wp-json/elementor/v1/variables/update
```

**Parameters**:
- `id` (string, required): Variable ID
- `label` (string, optional): New label
- `value` (string, optional): New value
- `order` (number, optional): Display order

### Delete Variable

```
POST /wp-json/elementor/v1/variables/delete
```

**Parameters**:
- `id` (string, required): Variable ID

## References

- **REST API**: `plugins/elementor/modules/variables/classes/rest-api.php`
- **CSS Renderer**: `plugins/elementor/modules/variables/classes/css-renderer.php`
- **Transformer**: `plugins/elementor/modules/variables/transformers/global-variable-transformer.php`
- **Variable Types**: `plugins/elementor/modules/variables/prop-types/color-variable-prop-type.php`
- **Test Example**: `plugins/elementor/tests/playwright/sanity/modules/variables/variables.test.ts`
- **Variables Manager**: `plugins/elementor/tests/playwright/sanity/modules/v4-tests/editor-variables/variables-manager-page.ts`

