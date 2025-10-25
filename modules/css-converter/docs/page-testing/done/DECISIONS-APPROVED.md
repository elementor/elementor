# Approved Decisions for Duplicate Detection Feature

**Date**: 2025-10-16  
**Status**: ✅ Approved for Implementation  
**Implementation Phase**: Phase 1 (Conservative MVP)

---

## 🎯 Critical Decisions Made

### Question 1: Comparison Level ✅
**Decision**: **B) Atomic property comparison**

**Reasoning**: Compare at the atomic property level (what gets stored and rendered) for maximum accuracy.

**Implementation**: Use deep comparison of `variants[0]['props']` structure.

---

### Question 2: Property Order ✅
**Decision**: **B) Order doesn't matter**

**Reasoning**: CSS doesn't care about property order, normalize by sorting keys before comparison.

**Implementation**: `ksort()` on both property arrays before comparison.

---

### Question 3: Variables Behavior ✅
**Decision**: **C) Make it optional via API parameter, use incremental naming by default**

**User Input (HVV)**: "C, and use incremental naming by default"

**Implementation**:
- Add `update_mode` parameter to variables API endpoint
- Default: `update_mode=create_new` (incremental naming like classes)
- Optional: `update_mode=update` (legacy update-in-place behavior)
- Document breaking change and migration path

**API Examples**:
```php
// Default: Incremental naming (new behavior)
POST /variables
{ "css": "--primary: #ff0000" }
→ If exists with different value, creates --primary-1

// Legacy: Update-in-place (old behavior)
POST /variables?update_mode=update
{ "css": "--primary: #ff0000" }
→ If exists, updates existing value
```

---

### Question 4: Spec Clarification ✅
**Decision**: **A) Rule is correct, example has typo**

**Clarification**: 
- Rule: "identical styling → reuse" ✅ Correct
- Example: "identical styling → create -1" ❌ Typo (should say "DIFFERENT styling")

**Implementation**: Follow the rule, ignore the example typo.

---

### Question 5: Suffix Matching ✅
**Decision**: **A) Check ALL variants**

**Reasoning**: Maximizes reuse, provides better user experience.

**Implementation**: 
- Get all variants: `.button`, `.button-1`, `.button-2`, etc.
- Compare new class against each variant
- Reuse if match found
- Create next suffix only if no match

---

## ✅ Phase 1 Scope (Approved)

### Include:
- ✅ Atomic property comparison (deep object comparison)
- ✅ Property order normalization (sort keys before compare)
- ✅ Suffix generation with ALL variant checking
- ✅ Reused classes return value (new API response field)
- ✅ Single desktop breakpoint only (simplify)
- ✅ **Variables with optional update mode** (incremental by default)
- ✅ Performance monitoring built-in (log import times)

### Timeline: 6 days
- Day 1: Comparison service + unit tests
- Day 2: Duplicate detection service + suffix logic
- Day 3: Integration with class conversion service
- Day 4: Variables implementation with API parameter
- Day 5: End-to-end tests + refinement
- Day 6: Buffer for issues + documentation

---

## 🔄 Phase 2+ Items (Deferred)

See [FUTURE.md](./FUTURE.md) for complete list.

**Key Deferrals**:
- Hash-based optimization
- Multi-breakpoint comparison
- State variants (:hover, :active, :focus)
- Semantic CSS equivalence (#f00 = #ff0000)
- Unit conversion (px = rem)
- Race condition prevention
- Database locking strategies

---

## 📊 Expected Outcomes

### Functional:
- ✅ Identical classes detected and reused (no duplicates)
- ✅ Different classes get incremental suffixes (.button-1, .button-2)
- ✅ Variables follow same logic (with opt-out via API parameter)
- ✅ API returns both created and reused class references

### Technical:
- ✅ Comparison accurate at atomic property level
- ✅ Performance acceptable for typical imports (< 1000 classes)
- ✅ Backward compatible API (new fields added, existing unchanged)
- ✅ Performance monitoring for future optimization decisions

### User Experience:
- ✅ Smart deduplication reduces Kit meta bloat
- ✅ Clear API response showing what was reused vs created
- ✅ Variables can opt-in to legacy behavior if needed
- ✅ Documented migration path for breaking change

---

## 🚀 Implementation Ready

All blocking questions answered. Implementation can proceed with:
- Clear architectural direction
- Approved MVP scope
- Defined API contracts
- Test scenarios identified
- Success criteria established

**Next**: Begin Phase 1 implementation (Day 1)

