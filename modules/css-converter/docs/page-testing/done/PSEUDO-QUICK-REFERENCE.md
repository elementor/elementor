# Pseudo-Selectors Quick Reference Guide

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `0-PSEUDO-ELEMENTS.md` | Research findings & current implementation | Developers, Architects |
| `PSEUDO-SELECTORS-HANDLING-PRD.md` | Complete PRD with implementation phases | Project managers, Lead developers |
| `PSEUDO-QUICK-REFERENCE.md` | This file - Quick lookup & decision matrix | All developers |

---

## ⚡ Quick Decision Matrix

### What happens to this selector?

```
DO YOU HAVE A SELECTOR LIKE...?

.button:hover
    ↓
✅ STATE PSEUDO-CLASS → Create variant with meta['state']
   Code: variant['meta']['state'] = 'hover'
   Result: Full support

.text::first-letter
    ↓
⚠️ PSEUDO-ELEMENT → Apply base styles only
   Code: Base properties + meta['pseudo_element'] = '::first-letter'
   Result: Partial support (warning logged)

input:checked
    ↓
❌ UNSUPPORTED → Skip entirely
   Code: Log warning, continue
   Result: No styles applied

.container > .button .text:hover
    ↓
🔄 NESTED WITH PSEUDO → Flatten + preserve pseudo
   Code: Flatten to .text--button-container:hover
   Result: Full support with state
```

---

## 🎯 Implementation Quick Start

### Phase 1: Detection & Classification
**What**: Identify pseudo-selector type  
**File**: `pseudo-selector-classifier.php` (NEW)  
**Method**: `classify_pseudo_selector(string $selector): array`

```
Input:  '.button:hover'
Output: ['level' => 'full', 'strategy' => 'create_state']
```

### Phase 2: State Handling
**What**: Create atomic variants for state pseudo-classes  
**File**: `unified-css-processor.php` (MODIFY)  
**Method**: `apply_pseudo_styles_to_widgets()`

```php
variant['meta']['state'] = 'hover';
variant['props'] = $converted_properties;
```

### Phase 3: Fallback
**What**: Apply base styles for unsupported types  
**File**: `unified-css-processor.php` (MODIFY)

```php
// For pseudo-elements
$widget['styles']['element-id']['variants'][0]['meta']['pseudo_element'] = '::first-letter';

// For unsupported
log_warning("Unsupported pseudo-class :checked");
```

### Phase 4: Flattening
**What**: Preserve pseudo during nested flattening  
**File**: `unified-css-processor.php` (MODIFY)

```
.first > .second .third:hover
→ Extract :hover
→ Flatten .first > .second .third
→ Result: .third--first-second
→ Re-attach: .third--first-second:hover
```

---

## 📋 Support Matrix by Type

### State Pseudo-Classes ✅ FULL SUPPORT

| Pseudo | Support | Strategy | Example |
|--------|---------|----------|---------|
| `:hover` | ✅ Full | create_state | `.btn:hover { color: blue; }` |
| `:focus` | ✅ Full | create_state | `input:focus { border: 2px solid; }` |
| `:active` | ✅ Full | create_state | `.btn:active { transform: scale(.95); }` |
| `:visited` | ✅ Full | create_state | `a:visited { color: purple; }` |

### Pseudo-Elements ⚠️ PARTIAL SUPPORT

| Pseudo | Support | Strategy | Example |
|--------|---------|----------|---------|
| `::before` | ⚠️ Partial | apply_base | `.box::before { content: "+"; }` |
| `::after` | ⚠️ Partial | apply_base | `.box::after { content: "©"; }` |

**Note**: Base styles applied, but pseudo-element content/control not available

### Structural Pseudo-Classes ❌ NO SUPPORT

| Pseudo | Support | Strategy | Example |
|--------|---------|----------|---------|
| `:first-child` | ❌ None | skip | `li:first-child { margin-top: 0; }` |
| `:last-child` | ❌ None | skip | `li:last-child { margin-bottom: 0; }` |
| `:nth-child()` | ❌ None | skip | `li:nth-child(2n) { background: gray; }` |

### Form Pseudo-Classes ❌ NO SUPPORT

| Pseudo | Support | Strategy | Example |
|--------|---------|----------|---------|
| `:checked` | ❌ None | skip | `input:checked { background: green; }` |
| `:disabled` | ❌ None | skip | `button:disabled { opacity: 0.5; }` |
| `:required` | ❌ None | skip | `input:required { border: 2px solid red; }` |
| `:invalid` | ❌ None | skip | `input:invalid { color: red; }` |

### Other Pseudo-Classes ❌ NO SUPPORT

| Pseudo | Support | Strategy | Example |
|--------|---------|----------|---------|
| `:not()` | ❌ None | skip | `li:not(.active) { opacity: 0.5; }` |
| `:-webkit-*` | ❌ None | skip | `:-webkit-scrollbar { width: 10px; }` |

---

## 🔍 Testing Checklist

### Before Implementation
- [ ] Read `0-PSEUDO-ELEMENTS.md` - understand current state
- [ ] Review `PSEUDO-SELECTORS-HANDLING-PRD.md` - understand full scope
- [ ] Check support matrix above - know limitations

### During Implementation
- [ ] Unit test each support level (full, partial, none)
- [ ] Test state pseudo-classes: `.btn:hover`, `.input:focus`
- [ ] Test pseudo-elements: `.text::first-letter`, `.box::after`
- [ ] Test unsupported: `input:checked`, `li:nth-child()`
- [ ] Test nested: `.container > .button .text:hover`

### Before Deployment
- [ ] 85%+ unit test coverage
- [ ] All integration tests pass
- [ ] Performance test: <100ms overhead on 1000-rule CSS
- [ ] User warnings clear and actionable
- [ ] Documentation updated

---

## 📝 Code Templates

### Creating State Variant

```php
// Extract state from :hover → 'hover'
$state = $this->extract_state_from_pseudo(':hover');

// Create variant
$variant = [
    'meta' => [
        'state' => $state,           // 'hover'
        'breakpoint' => 'desktop',
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'blue'],
        'background' => ['$$type' => 'color', 'value' => 'red'],
    ],
];

// Add to widget
$widget['styles']['element-id']['variants'][] = $variant;
```

### Handling Pseudo-Element Fallback

```php
// Extract pseudo-element: ::first-letter → 'first-letter'
$pseudo_element = $this->extract_pseudo_element('::first-letter');

// Create variant with base styles only
$variant = [
    'meta' => [
        'state' => null,
        'pseudo_element' => $pseudo_element,
        'source' => 'pseudo_fallback',
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'red'],
    ],
];

// Log warning
error_log("⚠️ Pseudo-element ::{$pseudo_element} fallback to base styles");
```

### Skipping Unsupported Selector

```php
// Check support level
$support = $this->classify_pseudo_selector('input:checked');

if ( 'none' === $support['level'] ) {
    // Log warning
    error_log("⚠️ Unsupported pseudo-class :checked - form state not supported");
    
    // Skip selector
    return;
}
```

---

## 🚀 Performance Considerations

| Operation | Impact | Mitigation |
|-----------|--------|-----------|
| Pseudo extraction from 1000 selectors | ~5ms | Regex compiled once |
| Widget matching per selector | ~2ms | Index by element type |
| State variant creation | ~1ms per widget | Batch processing |
| Overall CSS processing | <2% overhead | Acceptable |

---

## 🎓 Learning Path

### Beginner
1. Read this file (PSEUDO-QUICK-REFERENCE.md)
2. Study support matrix above
3. Look at test cases in PRD

### Intermediate
1. Read `0-PSEUDO-ELEMENTS.md` - understand research
2. Review atomic widgets architecture
3. Study state variant system

### Advanced
1. Read complete `PSEUDO-SELECTORS-HANDLING-PRD.md`
2. Review implementation phases
3. Begin Phase 1 implementation

---

## ❓ FAQ

**Q: Why isn't `::first-letter` fully supported?**  
A: Atomic widgets cannot control pseudo-element content. Only base styles apply.

**Q: Can I use `:nth-child()` for styling?**  
A: Not in atomic widgets. Use class-based styling instead.

**Q: What about vendor-prefixed pseudo-elements like `:-webkit-scrollbar`?**  
A: Not supported. Recommend using standard pseudo-elements.

**Q: If a selector is unsupported, are all styles lost?**  
A: Yes, but warning is logged so user is informed.

**Q: Can I have both `::before:hover` in one selector?**  
A: Yes! State applied, pseudo-element tracked (partial support).

---

## 📞 Questions or Issues?

See the full PRD: `PSEUDO-SELECTORS-HANDLING-PRD.md`  
See research: `0-PSEUDO-ELEMENTS.md`
