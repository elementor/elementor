# Nested Variables - Visual Guide & Diagrams

---

## 📊 Current Implementation Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CSS INPUT STRING                      │
│  :root { --color: #ff0000; } .dark { --color: #000; }  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Sabberworm CSS Parser      │ ✅ WORKING
        │   (parse CSS to AST)         │
        └──────────────┬───────────────┘
                       │
                       ▼
      ┌────────────────────────────────────┐
      │  extract_variables_with_nesting()  │ ⚠️ ISSUE #1
      │  (extract with scope info)         │  Media queries
      └──────────────┬─────────────────────┘
                     │
                     ▼
    ┌──────────────────────────────────────────┐
    │ extract_and_rename_nested_variables()    │ ⚠️ ISSUE #2
    │ (group, normalize, assign suffixes)      │  3+ variants
    └──────────────┬─────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────┐
    │  Variable_Conversion_Service             │ ✅ WORKING
    │  (convert to editor variable types)      │
    └──────────────┬─────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────┐
    │  save_editor_variables()                 │ ✅ WORKING
    │  (store in database)                     │
    └──────────────┬─────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   API RESPONSE                           │
│  { variables: [ --color, --color-1 ],... }             │
│  ⚠️ Missing --color-2 for 3+ variants                  │
└──────────────────────────────────────────────────────────┘
```

---

## 🔴 Issue #1: Media Query Scope Handling

### Current Behavior (BROKEN ❌)

```
CSS Input:
┌─────────────────────────────────┐
│ :root { --font: 14px; }         │
│ @media (max-width: 768px) {     │
│   :root { --font: 12px; }       │  ← Should create --font-1
│ }                               │
└─────────────────────────────────┘

Data Flow:
┌──────────────────────────────────────┐
│  Scope Detection (is_root_scope)     │
│                                      │
│  :root                 → true       │
│  @media (...) :root    → true   ❌  │ (Incorrectly treated same)
└──────────────────────────────────────┘

Result:
Both are treated as "root scope" → only ONE variable created
Should be TWO variables (different scopes)
```

### Expected Behavior (FIXED ✅)

```
CSS Input:
┌─────────────────────────────────┐
│ :root { --font: 14px; }         │
│ @media (max-width: 768px) {     │
│   :root { --font: 12px; }       │
│ }                               │
└─────────────────────────────────┘

Data Flow with Solution 1A:
┌──────────────────────────────────────────────┐
│  Enhanced Scope Detection                    │
│                                              │
│  :root              → pure root              │
│  @media (...) :root → media-with-root    ✅ │ (Distinguished!)
└──────────────────────────────────────────────┘

Result:
Two different scopes → TWO variables created
--font (14px from :root)
--font-1 (12px from @media)
```

### Scope Classification Logic

```
                        Scope String
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        Contains      Contains        Contains
        @media?       :root?          Class?
          │             │               │
        ┌─┴─┐         ┌─┴─┐           ┌─┴─┐
        │   │         │   │           │   │
        Y   N         Y   N           Y   N
        │   │         │   │           │   │
        ▼   ▼         ▼   ▼           ▼   ▼
     MEDIA  CLASS    ROOT  OTHER      ✓   ✓
       ↓      ↓       ↓     ↓
      NESTED NESTED  ROOT  NESTED
```

---

## 🔴 Issue #2: Suffix Generation with 3+ Variants

### Current Behavior (BROKEN ❌)

```
Input Variables:
┌────────────────────────────────────┐
│ :root       { --color: #ff0000 }   │ (red)
│ .theme-1    { --color: #ff0000 }   │ (red - same)
│ .theme-2    { --color: #00ff00 }   │ (green - different)
│ .theme-3    { --color: #0000ff }   │ (blue - different)
└────────────────────────────────────┘

Processing:
┌─────────────────────────────────────────────────┐
│ Value → Suffix Mapping                          │
│                                                 │
│ #ff0000 (red)     → suffix 0  (no suffix)       │
│ #00ff00 (green)   → suffix 1  (--color-1)       │
│ #0000ff (blue)    → suffix 2  (--color-2)   ❌ │ Missing!
└─────────────────────────────────────────────────┘

Output (Broken):
--color (red)
--color-1 (green)
[Missing --color-2]  ❌
```

### Expected Behavior (FIXED ✅)

```
Input Variables:
┌────────────────────────────────────┐
│ :root       { --color: #ff0000 }   │
│ .theme-1    { --color: #ff0000 }   │
│ .theme-2    { --color: #00ff00 }   │
│ .theme-3    { --color: #0000ff }   │
└────────────────────────────────────┘

Processing with Solution 2A:
┌─────────────────────────────────────────────────┐
│ Detailed Suffix Tracking                        │
│                                                 │
│ Instance 0: #ff0000 → NEW    → suffix_counter: │
│             ↓              0  ↓ = 0             │
│ Instance 1: #ff0000 → EXISTS → skip increment  │
│ Instance 2: #00ff00 → NEW    → suffix_counter: │
│             ↓              1  ↓ = 1             │
│ Instance 3: #0000ff → NEW    → suffix_counter: │
│             ↓              2  ↓ = 2             │
└─────────────────────────────────────────────────┘

Output (Fixed):
--color (red)
--color-1 (green)
--color-2 (blue)  ✅ All variants!
```

### Counter Increment Logic

```
Phase 1: Map Building
┌──────────────────────────────────────┐
│ For each instance:                   │
│                                      │
│ ┌─ Normalize value                  │
│ │                                    │
│ └─ Check if new normalized value    │
│    │                                 │
│    YES → Add to map, increment ✅   │
│    NO  → Reuse existing mapping     │
│                                      │
│ Result: value_to_suffix map         │
│ {                                    │
│   "rgb(255,0,0)": 0,               │
│   "rgb(0,255,0)": 1,               │
│   "rgb(0,0,255)": 2,               │
│ }                                    │
└──────────────────────────────────────┘

Phase 2: Final Name Generation
┌──────────────────────────────────────┐
│ For each value in map:               │
│                                      │
│ suffix = 0? NO suffix: Add "-{n}"   │
│   ↓                                  │
│ "--color"     ← suffix 0             │
│ "--color-1"   ← suffix 1             │
│ "--color-2"   ← suffix 2             │
└──────────────────────────────────────┘
```

---

## 📈 Data Flow Comparison

### Scenario: 2 Scopes (WORKING ✅)

```
Input:
  :root { --primary: blue; }
  .dark { --primary: black; }

✓ WORKING
  ↓
Extracted:
  { name: '--primary', value: 'blue', scope: ':root' }
  { name: '--primary', value: 'black', scope: '.dark' }

✓ Grouped by name:
  --primary: [
    { value: 'blue', scope: ':root' },
    { value: 'black', scope: '.dark' }
  ]

✓ Normalized & Suffixed:
  blue → suffix 0 → --primary
  black → suffix 1 → --primary-1

✓ Output:
  --primary (blue)
  --primary-1 (black)
```

### Scenario: Media Query (BROKEN ❌)

```
Input:
  :root { --font: 14px; }
  @media (768px) { :root { --font: 12px; } }

❌ ISSUE #1
  ↓
Extracted:
  { name: '--font', value: '14px', scope: ':root' }
  { name: '--font', value: '12px', scope: '@media (768px) :root' }

Grouped by name:
  --font: [
    { value: '14px', scope: ':root' },
    { value: '12px', scope: '@media (768px) :root' }
  ]

❌ Problem: Both scopes treated as "root"
  14px → suffix 0 → --font
  12px → suffix 0 → --font (overwritten!)

❌ Output:
  --font (12px only - lost the 14px!)
```

### Scenario: 3+ Values (BROKEN ❌)

```
Input:
  :root { --color: red; }
  .t1   { --color: red; }
  .t2   { --color: green; }
  .t3   { --color: blue; }

✓ Extracted (all 4)
  ↓
✓ Grouped by name
  --color: [4 instances]

❌ ISSUE #2: Suffix generation
  red (1st) → suffix 0 → --color ✓
  red (2nd) → reuse 0 → --color ✓
  green → suffix 1 → --color-1 ✓
  blue → suffix 2 → --color-2 ❌ Not created!

❌ Output:
  --color (red)
  --color-1 (green)
  [Missing --color-2]
```

---

## 🔧 Solution Architecture

### Solution 1A: Scope Classification

```
┌────────────────────────────────────┐
│  Input: Scope String               │
│  "@media (768px) :root"            │
└──────────────┬─────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Check: Contains @media?  │
    │ YES                      │
    └──────────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │ Check: Contains :root?   │
        │ YES                      │
        └──────────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Classification:      │
            │ MEDIA_WITH_ROOT      │
            │ (Different from:root)│
            └──────────────────────┘
```

### Solution 2A: Detailed Logging

```
Processing Variable: --color
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instance 0:
  - Value: #ff0000
  - Normalized: rgb(255,0,0)
  - Status: NEW
  - Assigned suffix: 0

Instance 1:
  - Value: #ff0000
  - Normalized: rgb(255,0,0)
  - Status: DUPLICATE
  - Reused suffix: 0

Instance 2:
  - Value: #00ff00
  - Normalized: rgb(0,255,0)
  - Status: NEW
  - Assigned suffix: 1

Instance 3:
  - Value: #0000ff
  - Normalized: rgb(0,0,255)
  - Status: NEW
  - Assigned suffix: 2

Final mapping: {
  "rgb(255,0,0)": 0,
  "rgb(0,255,0)": 1,
  "rgb(0,0,255)": 2
}
```

---

## 📋 Decision Matrix

| Aspect | Solution 1A | Solution 1B | Solution 1C |
|--------|-----------|-----------|-----------|
| **Complexity** | Low | Medium | Medium |
| **Invasiveness** | Minimal | Medium | High |
| **Performance** | Fast | Fast | Moderate |
| **Maintainability** | High | Medium | Low |
| **Test Coverage** | Easy | Medium | Hard |
| **Recommendation** | ⭐⭐⭐ | ⭐⭐ | ⭐ |

---

## 📝 Summary

**Issue #1 (Media Queries)**:
- Root cause: Scope strings not properly distinguished
- Solution: Enhanced classification logic (1A recommended)
- Complexity: Low to implement

**Issue #2 (3+ Suffixes)**:
- Root cause: Suffix generation not handling all variants
- Solution: Detailed logging to identify exact failure (2A recommended)
- Complexity: Low to diagnose, medium to fix

**Combined Impact**: 
- Getting to 100% (12/12 tests) requires both fixes
- Estimated effort: 3-5 hours
- Risk level: Low (changes isolated to extraction services)

