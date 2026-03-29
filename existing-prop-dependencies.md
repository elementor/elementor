# Existing Prop Dependencies in Elementor

This document catalogs all prop dependencies currently implemented in the codebase, explaining what depends on what and what happens when values change.

---

## 1. Link Dependencies

### 1.1 Link → Tag (Div Block, Flexbox)

**Location:** `modules/atomic-widgets/elements/div-block/div-block.php`, `modules/atomic-widgets/elements/flexbox/flexbox.php`

**Source Prop:** `link.destination`  
**Dependent Prop:** `tag`

**Dependency Definition:**
```php
$tag_dependencies = Dependency_Manager::make( Dependency_Manager::RELATION_AND )
  ->where([
    'operator' => 'ne',
    'path' => ['link', 'destination'],
    'nestedPath' => ['group'],
    'value' => 'action',
    'newValue' => [
      '$$type' => 'string',
      'value' => 'button',
    ],
  ])->where([
    'operator' => 'not_exist',
    'path' => ['link', 'destination'],
    'newValue' => [
      '$$type' => 'string',
      'value' => 'a',
    ],
  ])->get();
```

**Behavior:**

| Link State | Tag Behavior | Effect Type | Description |
|------------|--------------|-------------|-------------|
| No link (destination not exists) | `tag` → `'a'` | `disable` + `newValue` | Tag is locked to 'a' and disabled |
| Link exists (destination.group !== 'action') | `tag` → `'button'` | `disable` + `newValue` | Tag is locked to 'button' and disabled |
| Link removed | Tag restored to previous value | Value restoration | Original tag value is restored from sessionStorage |

**User Experience:**
- User sets tag to "section"
- User adds a link → tag automatically changes to "a" and becomes disabled
- User removes link → tag returns to "section" and becomes enabled

---

### 1.2 Link → isTargetBlank (Link Prop Type)

**Location:** `modules/atomic-widgets/prop-types/link-prop-type.php`

**Source Prop:** `link.destination`  
**Dependent Prop:** `link.isTargetBlank`

**Dependency Definition:**
```php
$target_blank_dependencies = Dependency_Manager::make()
  ->where([
    'operator' => 'exists',
    'path' => ['link', 'destination'],
  ])
  ->get();
```

**Behavior:**

| Link State | isTargetBlank Behavior | Effect Type | Description |
|------------|------------------------|-------------|-------------|
| No link (destination not exists) | Control disabled | `disable` | Cannot toggle "Open in new tab" |
| Link exists | Control enabled | - | Can toggle "Open in new tab" |

**User Experience:**
- "Open in new tab" switch is disabled when there's no link
- Becomes enabled as soon as a link destination is set

---

### 1.3 Link → Tag (Link Prop Type Internal)

**Location:** `modules/atomic-widgets/prop-types/link-prop-type.php`

**Source Prop:** `link.destination.group`  
**Dependent Prop:** `link.tag`

**Dependency Definition:**
```php
$tag_dependencies = Dependency_Manager::make()
  ->where([
    'operator' => 'ne',
    'path' => ['link', 'destination'],
    'nestedPath' => ['group'],
    'value' => 'action',
    'newValue' => String_Prop_Type::generate('button'),
  ])->get();
```

**Behavior:**

| Link Destination Group | Tag Behavior | Effect Type | Description |
|------------------------|--------------|-------------|-------------|
| `group === 'action'` | `tag` → `'button'` | `disable` + `newValue` | Tag becomes 'button' |
| `group !== 'action'` | Tag unchanged | - | Tag remains as set |

---

## 2. Form Dependencies

### 2.1 Actions After Submit → Email Settings

**Location:** `modules/atomic-widgets/elements/atomic-form/atomic-form.php`

**Source Prop:** `actions-after-submit`  
**Dependent Prop:** `email`

**Dependency Definition:**
```php
$email_dependencies = Dependency_Manager::make()
  ->where([
    'operator' => 'contains',
    'path' => ['actions-after-submit'],
    'value' => 'email',
    'effect' => 'hide',
  ])
  ->get();
```

**Behavior:**

| Actions After Submit | Email Settings Behavior | Effect Type | Description |
|----------------------|-------------------------|-------------|-------------|
| Does NOT contain 'email' | Email settings hidden | `hide` | Entire email configuration section disappears |
| Contains 'email' | Email settings visible | - | Email configuration section is shown |

**User Experience:**
- Email configuration (to, from, subject, etc.) only appears when "Email" is selected in actions
- Removing "Email" from actions immediately hides all email-related controls

---

### 2.2 Actions After Submit → Submissions Metadata

**Location:** `modules/atomic-widgets/elements/atomic-form/atomic-form.php`

**Source Prop:** `actions-after-submit`  
**Dependent Prop:** `submissions_metadata`

**Dependency Definition:**
```php
$submissions_metadata_dependencies = Dependency_Manager::make()
  ->where([
    'operator' => 'contains',
    'path' => ['actions-after-submit'],
    'value' => self::ACTION_COLLECT_SUBMISSIONS, // 'collect-submissions'
    'effect' => 'hide',
  ])
  ->get();
```

**Behavior:**

| Actions After Submit | Metadata Behavior | Effect Type | Description |
|----------------------|-------------------|-------------|-------------|
| Does NOT contain 'collect-submissions' | Metadata options hidden | `hide` | "Include metadata" section disappears |
| Contains 'collect-submissions' | Metadata options visible | - | Can choose to include IP, User Agent, etc. |

**User Experience:**
- Metadata options (User IP, User Agent) only appear when "Collect submissions" is selected
- Removing "Collect submissions" hides these options

---

## 3. Video Dependencies

### 3.1 Autoplay → Play on Mobile (playsinline)

**Location:** `modules/atomic-widgets/elements/atomic-self-hosted-video/atomic-self-hosted-video.php`

**Source Prop:** `autoplay`  
**Dependent Prop:** `playsinline`

**Dependency Definition:**
```php
$playsinline_dependencies = Dependency_Manager::make()
  ->where([
    'operator' => 'eq',
    'path' => ['autoplay'],
    'value' => true,
    'effect' => 'hide',
  ])
  ->get();
```

**Behavior:**

| Autoplay State | Play on Mobile Behavior | Effect Type | Description |
|----------------|-------------------------|-------------|-------------|
| Autoplay OFF | "Play on mobile" visible | - | User can toggle playsinline |
| Autoplay ON | "Play on mobile" hidden | `hide` | Control disappears (autoplay implies playsinline) |

**User Experience:**
- "Play on mobile" switch is hidden when autoplay is enabled
- Shows when autoplay is disabled

---

### 3.2 Poster Enabled → Poster Image

**Location:** `modules/atomic-widgets/elements/atomic-self-hosted-video/atomic-self-hosted-video.php`

**Source Prop:** `poster_enabled`  
**Dependent Prop:** `poster`

**Dependency Definition:**
```php
$poster_dependencies = Dependency_Manager::make()
  ->where([
    'operator' => 'eq',
    'path' => ['poster_enabled'],
    'value' => true,
    'effect' => 'hide',
  ])
  ->get();
```

**Note:** Currently commented out in code:
```php
// TODO: restore the dependency when dependencies works in overridables
// ->set_dependencies( $poster_dependencies ),
```

**Expected Behavior (when enabled):**

| Poster Enabled State | Poster Image Behavior | Effect Type | Description |
|----------------------|----------------------|-------------|-------------|
| Poster Enabled OFF | Poster image control hidden | `hide` | Cannot select poster image |
| Poster Enabled ON | Poster image control visible | - | Can select/upload poster image |

---

### 3.3 Controls → Allow Download

**Location:** `modules/atomic-widgets/elements/atomic-self-hosted-video/atomic-self-hosted-video.php`

**Source Prop:** `controls`  
**Dependent Prop:** `download`

**Dependency Definition:**
```php
$allow_download_dependencies = Dependency_Manager::make()
  ->where([
    'operator' => 'eq',
    'path' => ['controls'],
    'value' => true,
    'effect' => 'hide',
  ])
  ->get();
```

**Behavior:**

| Player Controls State | Allow Download Behavior | Effect Type | Description |
|-----------------------|------------------------|-------------|-------------|
| Controls OFF | "Allow Download" hidden | `hide` | Download option not available |
| Controls ON | "Allow Download" visible | - | User can enable/disable download |

**User Experience:**
- "Allow Download" option only appears when player controls are enabled
- Disabling controls hides the download option

---

## 4. Style Dependencies

### 4.1 Object Fit → Object Position

**Location:** `modules/atomic-widgets/styles/style-schema.php`

**Source Prop:** `object-fit`  
**Dependent Prop:** `object-position`

**Dependency Definition:**
```php
Dependency_Manager::make( Dependency_Manager::RELATION_AND )
  ->where([
    'operator' => 'ne',
    'path' => ['object-fit'],
    'value' => 'fill',
  ])
```

**Behavior:**

| Object Fit Value | Object Position Behavior | Effect Type | Description |
|------------------|--------------------------|-------------|-------------|
| `fill` | Object position disabled | `disable` | Position doesn't apply when fill is used |
| Other values | Object position enabled | - | Can adjust position |

**User Experience:**
- When object-fit is "fill", object-position control is disabled
- For other values (cover, contain, etc.), position can be adjusted

---

### 4.2 Column Count → Column Gap

**Location:** `modules/atomic-widgets/styles/style-schema.php`

**Source Prop:** `column-count`  
**Dependent Prop:** `column-gap`

**Dependency Definition:**
```php
Dependency_Manager::make()
  ->where([
    'operator' => 'gte',
    'path' => ['column-count'],
    'value' => 1,
  ])
```

**Behavior:**

| Column Count | Column Gap Behavior | Effect Type | Description |
|--------------|---------------------|-------------|-------------|
| < 1 (or 0) | Column gap disabled | `disable` | Gap doesn't apply without columns |
| >= 1 | Column gap enabled | - | Can set gap between columns |

**User Experience:**
- Column gap control is disabled when there are no columns
- Becomes enabled when column count is 1 or more

---

## Summary Table

| Source Prop | Dependent Prop | Element/Context | Effect | Trigger |
|-------------|----------------|-----------------|--------|---------|
| `link.destination` | `tag` | Div Block, Flexbox | `disable` + `newValue` | Link exists → tag = 'a' |
| `link.destination` | `isTargetBlank` | Link Prop Type | `disable` | No link → disabled |
| `link.destination.group` | `link.tag` | Link Prop Type | `newValue` | group !== 'action' → tag = 'button' |
| `actions-after-submit` | `email` | Form | `hide` | 'email' not in actions → hidden |
| `actions-after-submit` | `submissions_metadata` | Form | `hide` | 'collect-submissions' not in actions → hidden |
| `autoplay` | `playsinline` | Video | `hide` | autoplay ON → hidden |
| `poster_enabled` | `poster` | Video | `hide` | poster_enabled OFF → hidden (disabled in code) |
| `controls` | `download` | Video | `hide` | controls OFF → hidden |
| `object-fit` | `object-position` | Styles | `disable` | object-fit = 'fill' → disabled |
| `column-count` | `column-gap` | Styles | `disable` | column-count < 1 → disabled |

---

## Common Patterns

### Pattern 1: Hide Conditional Settings
When a feature is not enabled, hide all related settings.
- **Example:** Email settings hidden when email action is not selected
- **Effect:** `hide`

### Pattern 2: Lock Related Controls
When a value is automatically set, lock the control to prevent conflicts.
- **Example:** Tag locked to 'a' when link exists
- **Effect:** `disable` + `newValue`

### Pattern 3: Contextual Availability
Show controls only when they make sense in the current context.
- **Example:** Download option only when player controls are visible
- **Effect:** `hide`

### Pattern 4: Value Restoration
When unlocking a control, restore its previous value.
- **Example:** Tag returns to original value when link is removed
- **Mechanism:** sessionStorage

---

## Testing

All dependencies have corresponding tests:
- **Unit tests:** `packages/libs/editor-props/src/utils/__tests__/prop-dependency-utils.test.ts`
- **Integration tests:** `packages/core/editor-editing-panel/src/controls-registry/__tests__/settings-field.test.tsx`
- **E2E tests:** `tests/playwright/sanity/modules/atomic-widgets/prop-dependencies/link-dependencies.test.ts`
