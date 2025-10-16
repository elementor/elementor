# Compound vs Nested Selectors: Key Differences

**Quick Reference**  
**Date**: October 16, 2025

---

## 📊 Selector Type Comparison

| Property | Compound (`.first.second`) | Nested (`.first .second`) |
|---|---|---|
| **Syntax** | No spaces between classes | Spaces or `>` combinator |
| **Regex Match** | `/^\.([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)$/` | `/\s/` or `/>/` |
| **Specificity** | 20 (two classes) | 20 (one class + one class) |
| **Meaning** | Element has BOTH classes | Second class is descendant of first |
| **HTML Match** | `<div class="first second">` | `<div class="first"><p class="second">` |
| **Current Status** | ❌ Not handled | ✅ Handled (flattened) |
| **Handling** | Needs new detection logic | Uses nested flattening |

---

## 🎯 Real-World Examples

### Compound Selectors (Currently Missing)

```css
/* Applies ONLY to elements with BOTH classes */
.btn.primary { background: blue; }
.btn.secondary { background: gray; }
.card.featured { border: 2px solid gold; }
```

```html
<!-- Matches .btn.primary -->
<button class="btn primary">Click me</button>

<!-- Does NOT match .btn.primary (missing "primary") -->
<button class="btn">Click me</button>

<!-- Does NOT match .btn.primary (missing "btn") -->
<button class="primary">Click me</button>
```

### Nested Selectors (Already Handled)

```css
/* Applies to .second inside .first */
.card .title { font-size: 20px; }
.navbar > .menu { display: flex; }
```

```html
<!-- Matches .card .title -->
<div class="card">
  <h2 class="title">Title</h2>
</div>

<!-- Does NOT match (title not inside card) -->
<h2 class="title">Title</h2>
```

---

## 🔄 Implementation Path

### Nested Selectors (Done ✅)

```
Detect → Parse → Flatten → Create Global Class → Apply to HTML
  ↓        ↓       ↓          ↓                    ↓
.first    Parts  .second    second--first    Add class to p
.second         context     global class      with class="second"
```

### Compound Selectors (TODO)

```
Detect → Extract → Create Global Class → Apply to HTML
  ↓        ↓            ↓                   ↓
.first.   Both    first-and-second    Add class to element
.second   classes global class        with class="first second"
```

---

## 💻 Code Changes Needed

### New Detection Method

```php
// In Css_Selector_Utils
public static function is_compound_class_selector( string $selector ): bool {
    $trimmed = trim( $selector );
    // Check for pattern like .first.second (no spaces or combinators)
    return preg_match( '/^\.([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)$/', $trimmed ) === 1;
}
```

### Example Usage

```php
is_compound_class_selector( '.first.second' )        // ✅ true
is_compound_class_selector( '.first' )               // ❌ false
is_compound_class_selector( '.first .second' )       // ❌ false (nested)
is_compound_class_selector( '.btn.primary.large' )   // ✅ true
```

---

## 🎨 Specificity Impact

Both have **20 specificity** but apply differently:

```css
/* Compound: 20 specificity */
.btn.primary { color: blue; }    /* ✨ Wins for elements with both classes */

/* Simple classes: 10 specificity each */
.btn { color: black; }           /* Applies to all .btn elements */
.primary { color: red; }         /* Applies to all .primary elements */
```

Result on `<button class="btn primary">`:
- `.btn` = 10 specificity → color: black
- `.primary` = 10 specificity → color: red  
- `.btn.primary` = **20 specificity** → **color: blue (WINS)** ✅

---

## 📋 Recommendation

**Implement compound selector support as Phase 2 after nested selectors are fully stable.**

Why Phase 2?
1. ✅ Nested selectors working well
2. ✅ Global class structure proven
3. ✅ Similar complexity to nested handling
4. ✅ Clear specification and requirements
5. ✅ Low risk of breaking existing functionality

