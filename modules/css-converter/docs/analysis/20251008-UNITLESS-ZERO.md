# Unitless Zero Support - PRD

**Date**: October 8, 2025  
**Status**: Proposed  
**Priority**: Medium  
**Goal**: Centralize unitless zero handling to eliminate code duplication across property mappers

---

## **Executive Summary**

CSS allows numeric zero to be written without units (`width: 0;` instead of `width: 0px;`). Currently, each property mapper handles this independently, leading to code duplication and inconsistent behavior. This PRD proposes centralizing unitless zero support in one class.

---

## **Problem Statement**

### **Current Issues**

1. **Code Duplication**: Multiple property mappers have identical unitless zero handling logic
2. **Inconsistent Implementation**: Some mappers handle unitless zero correctly, others have unreachable dead code
3. **Maintenance Burden**: Changes to unitless zero logic require updating 10+ files
4. **Testing Complexity**: Each mapper needs separate tests for the same behavior

### **Example of Current Duplication**

Found in multiple files:
- `margin-property-mapper.php` (lines 344-349)
- `padding-property-mapper.php` (lines 205-210)
- `positioning-property-mapper.php` (lines 207-213)
- `border-width-property-mapper.php` (lines 180-186)
- `flex-properties-mapper.php` (lines 341-347)
- And more...

```php
// ❌ DUPLICATED in 10+ files
if ( '0' === $value ) {
    return [
        'size' => 0.0,
        'unit' => 'px'
    ];
}
```

---

## **Requirements**

### **Must Have (P0)**

✅ **Support basic unitless zero**: `property: 0;`

This is the **only critical requirement**. All other edge cases are nice-to-haves.

### **Nice to Have (P1)**

- Decimal zero: `0.0`, `.0`, `0.`
- Negative zero: `-0` (mathematically equivalent to `0`)
- Zero with whitespace: `0 `, ` 0`, `  0  `

### **Not Required (P2)**

- Scientific notation: `0e0`, `0E0`
- Hex/octal: `0x0`, `00`
- Complex edge cases that don't appear in real CSS

---

## **Proposed Solution**

### **Approach: Centralized Size Parser Class**

Create a single `Size_Value_Parser` class that handles all size parsing logic, including unitless zero.

### **Design Principles**

1. **Single Responsibility**: One class for all size parsing
2. **DRY**: No duplicated unitless zero logic
3. **Simple**: Focus on the 99% use case (basic `0`)
4. **Extensible**: Easy to add edge cases later if needed

---

## **Technical Specification**

### **Class Structure**

```php
<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers;

class Size_Value_Parser {
    
    /**
     * Parse CSS size value into standardized format
     * 
     * @param string $value CSS size value (e.g., "0", "16px", "1.5em")
     * @return array|null Parsed size ['size' => float, 'unit' => string] or null
     */
    public static function parse( string $value ): ?array {
        $value = trim( $value );
        
        if ( '' === $value ) {
            return null;
        }

        // Handle CSS keywords (auto, inherit, initial, etc.)
        if ( self::is_css_keyword( $value ) ) {
            return [
                'size' => $value,
                'unit' => 'custom'
            ];
        }

        // Parse numeric values (handles unitless zero automatically)
        // Regex captures: -123.45 or 123 or .5 or 0
        // Unit is optional (?) - defaults to 'px' if missing
        if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
            $size = (float) $matches[1];
            $unit = $matches[2] ?? 'px';  // ✅ Unitless values default to 'px'
            
            return [
                'size' => $size,
                'unit' => strtolower( $unit )
            ];
        }

        return null;
    }

    /**
     * Check if value is a CSS keyword
     */
    private static function is_css_keyword( string $value ): bool {
        $keywords = [ 'auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer' ];
        return in_array( strtolower( $value ), $keywords, true );
    }

    /**
     * Create zero size value
     */
    public static function create_zero(): array {
        return [
            'size' => 0.0,
            'unit' => 'px'
        ];
    }
}
```

### **Usage in Property Mappers**

**Before (Duplicated)**:
```php
class Margin_Property_Mapper {
    protected function parse_size_value( string $value ): ?array {
        // ... 30 lines of duplicated parsing logic
        if ( '0' === $value ) {
            return ['size' => 0.0, 'unit' => 'px'];
        }
        // ... more duplication
    }
}
```

**After (Centralized)**:
```php
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;

class Margin_Property_Mapper {
    protected function parse_size_value( string $value ): ?array {
        return Size_Value_Parser::parse( $value );
    }
}
```

---

## **Implementation Plan**

### **Phase 1: Create Parser Class**

1. Create `Size_Value_Parser` class in new `parsers/` directory
2. Implement `parse()` method with unitless zero support
3. Add unit tests for parser class

**Files to Create**:
- `modules/css-converter/convertors/css-properties/parsers/size-value-parser.php`
- `tests/phpunit/modules/css-converter/parsers/test-size-value-parser.php`

### **Phase 2: Migrate Property Mappers**

Update existing property mappers to use centralized parser:

**Files to Update**:
1. `margin-property-mapper.php`
2. `padding-property-mapper.php`
3. `positioning-property-mapper.php`
4. `border-width-property-mapper.php`
5. `flex-properties-mapper.php`
6. `font-size-property-mapper.php`
7. `width-property-mapper.php`
8. `height-property-mapper.php`
9. `max-width-property-mapper.php`
10. `transform-property-mapper.php`
11. `border-radius-property-mapper.php`

**Migration Pattern**:
```php
// Replace this:
protected function parse_size_value( string $value ): ?array {
    // 30+ lines of duplicated code
}

// With this:
protected function parse_size_value( string $value ): ?array {
    return Size_Value_Parser::parse( $value );
}
```

### **Phase 3: Update Base Classes**

Update base classes to use centralized parser:
- `atomic-property-mapper-base.php`
- `property-mapper-base.php`

### **Phase 4: Testing**

1. Run existing Playwright tests to ensure no regressions
2. Verify `unitless-zero-support.test.ts` passes
3. Verify `size-prop-type.test.ts` passes

---

## **Test Coverage**

### **Unit Tests** (PHPUnit)

```php
class Test_Size_Value_Parser extends \WP_UnitTestCase {
    
    public function test_unitless_zero() {
        $result = Size_Value_Parser::parse( '0' );
        $this->assertEquals( 0.0, $result['size'] );
        $this->assertEquals( 'px', $result['unit'] );
    }

    public function test_zero_with_unit() {
        $result = Size_Value_Parser::parse( '0px' );
        $this->assertEquals( 0.0, $result['size'] );
        $this->assertEquals( 'px', $result['unit'] );
    }

    public function test_decimal_zero() {
        $result = Size_Value_Parser::parse( '0.0' );
        $this->assertEquals( 0.0, $result['size'] );
        $this->assertEquals( 'px', $result['unit'] );
    }

    public function test_negative_zero() {
        $result = Size_Value_Parser::parse( '-0' );
        $this->assertEquals( 0.0, $result['size'] );
        $this->assertEquals( 'px', $result['unit'] );
    }

    public function test_whitespace_handling() {
        $result = Size_Value_Parser::parse( '  0  ' );
        $this->assertEquals( 0.0, $result['size'] );
        $this->assertEquals( 'px', $result['unit'] );
    }

    public function test_non_zero_values() {
        $result = Size_Value_Parser::parse( '16px' );
        $this->assertEquals( 16.0, $result['size'] );
        $this->assertEquals( 'px', $result['unit'] );
    }

    public function test_css_keywords() {
        $result = Size_Value_Parser::parse( 'auto' );
        $this->assertEquals( 'auto', $result['size'] );
        $this->assertEquals( 'custom', $result['unit'] );
    }

    public function test_empty_value() {
        $result = Size_Value_Parser::parse( '' );
        $this->assertNull( $result );
    }
}
```

### **Integration Tests** (Playwright)

Existing tests that should pass:
- ✅ `unitless-zero-support.test.ts`
- ✅ `size-prop-type.test.ts`

---

## **Benefits**

### **Code Quality**
- ✅ **-300 lines of duplicated code** removed
- ✅ **Single source of truth** for size parsing
- ✅ **Easier to maintain** - fix once, apply everywhere
- ✅ **Consistent behavior** across all property mappers

### **Developer Experience**
- ✅ **Simpler property mappers** - delegate to parser
- ✅ **Clear separation of concerns** - parsing vs mapping
- ✅ **Easier to test** - test parser once vs 10+ mappers

### **Performance**
- ⚠️ **Minimal impact** - single method call overhead (negligible)
- ✅ **No regex compilation duplication** - compiled once per request

---

## **Risks & Mitigation**

### **Risk 1: Breaking Changes**
**Impact**: Medium  
**Probability**: Low  
**Mitigation**: 
- Run full test suite before/after migration
- Test with real-world CSS examples
- Gradual rollout (migrate one mapper at a time)

### **Risk 2: Performance Regression**
**Impact**: Low  
**Probability**: Very Low  
**Mitigation**:
- Parser uses same regex logic as before
- Static method call has minimal overhead
- Benchmark before/after if concerned

### **Risk 3: Edge Case Incompatibility**
**Impact**: Low  
**Probability**: Low  
**Mitigation**:
- Focus on P0 requirement (basic `0`)
- Add edge cases incrementally if needed
- Extensive test coverage

---

## **Success Metrics**

### **Code Metrics**
- ✅ Reduce duplicated code by **300+ lines**
- ✅ Reduce `parse_size_value` implementations from **12 to 1**
- ✅ Increase test coverage to **95%+** for size parsing

### **Test Metrics**
- ✅ `unitless-zero-support.test.ts` passes (7/7 tests)
- ✅ `size-prop-type.test.ts` passes (3/3 tests)
- ✅ All existing property tests remain passing

### **Developer Metrics**
- ✅ New property mappers use centralized parser (100%)
- ✅ Reduce time to add new size-based property by **50%**

---

## **Implementation Timeline**

| Phase | Tasks | Effort | Status |
|-------|-------|--------|--------|
| **Phase 1** | Create `Size_Value_Parser` class | 2 hours | 🔵 Proposed |
| **Phase 2** | Migrate 12 property mappers | 4 hours | 🔵 Proposed |
| **Phase 3** | Update base classes | 2 hours | 🔵 Proposed |
| **Phase 4** | Testing & validation | 2 hours | 🔵 Proposed |
| **Total** | | **10 hours** | |

---

## **Alternatives Considered**

### **Alternative 1: Keep Current Approach**
**Pros**: No code changes needed  
**Cons**: Continued code duplication, inconsistent behavior  
**Decision**: ❌ Rejected - Technical debt accumulates

### **Alternative 2: Add to Base Class Only**
**Pros**: Simpler implementation  
**Cons**: Forces all mappers to inherit from base, less flexible  
**Decision**: ❌ Rejected - Less modular

### **Alternative 3: Centralized Parser (Selected)**
**Pros**: DRY, flexible, testable, no inheritance required  
**Cons**: Requires migration effort  
**Decision**: ✅ **Selected** - Best long-term solution

---

## **Regex Explanation**

The regex pattern handles unitless zero automatically:

```regex
^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$
```

**Breakdown**:
- `^` - Start of string
- `(-?\d*\.?\d+)` - **Capture Group 1**: Number
  - `-?` - Optional minus sign
  - `\d*` - Zero or more digits
  - `\.?` - Optional decimal point
  - `\d+` - One or more digits
- `(px|em|rem|%|...)?` - **Capture Group 2**: Unit (OPTIONAL)
  - `?` makes the entire unit part optional
- `$` - End of string

**Examples**:
- `"0"` → Group 1: `"0"`, Group 2: `null` → Default to `"px"`
- `"0px"` → Group 1: `"0"`, Group 2: `"px"` → Use `"px"`
- `"16"` → Group 1: `"16"`, Group 2: `null` → Default to `"px"`
- `"1.5em"` → Group 1: `"1.5"`, Group 2: `"em"` → Use `"em"`

**Why This Works**:
The regex inherently handles unitless zero by making the unit part optional (`?`). When no unit is provided, the fallback logic `$matches[2] ?? 'px'` assigns `'px'` as the default unit.

**No Special Case Needed**:
We don't need a separate `if ( '0' === $value )` check because the regex already handles it correctly.

---

## **File Structure**

```
modules/css-converter/
├── convertors/
│   └── css-properties/
│       ├── parsers/                          # ✨ NEW
│       │   └── size-value-parser.php         # ✨ NEW
│       ├── properties/
│       │   ├── margin-property-mapper.php    # 📝 UPDATE
│       │   ├── padding-property-mapper.php   # 📝 UPDATE
│       │   └── ... (10 more files)           # 📝 UPDATE
│       └── implementations/
│           ├── atomic-property-mapper-base.php  # 📝 UPDATE
│           └── property-mapper-base.php         # 📝 UPDATE
└── docs/
    └── 20251008-UNITLESS-ZERO.md            # 📄 THIS FILE
```

---

## **Next Steps**

1. **Review & Approve** this PRD
2. **Create** `Size_Value_Parser` class
3. **Migrate** property mappers one by one
4. **Test** with Playwright and PHPUnit
5. **Deploy** to staging environment
6. **Monitor** for regressions
7. **Document** in main architecture guide

---

## **Questions & Answers**

### **Q: Why not use inheritance?**
A: Static utility class is simpler and doesn't require mappers to inherit from a specific base class. More flexible.

### **Q: What about performance?**
A: Negligible impact. Single static method call. Same regex logic as before.

### **Q: Do we need to support scientific notation?**
A: No, not required. CSS doesn't use `0e0` in practice.

### **Q: What if a property needs custom parsing?**
A: Mapper can override `parse_size_value()` method with custom logic while still using the parser for standard cases.

---

## **References**

- CSS Specification: [CSS Values and Units Module Level 3](https://www.w3.org/TR/css-values-3/)
- Test Files: `tests/playwright/sanity/modules/css-converter/prop-types/unitless-zero-support.test.ts`
- Related: `20251007-UNIFIED-ARCHITECTURE.md`

---

**Status**: 🔵 Proposed  
**Approval Required**: Technical Lead  
**Next Review**: After Phase 1 implementation


