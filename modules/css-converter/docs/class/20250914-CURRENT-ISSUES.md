# CSS Converter – Current Endpoint Validation Issues (as of 2025-09-14)

## 🚦 Summary Table

| Property         | Current Output         | Expected by V4 Schema         | Fix Needed? |
|------------------|-----------------------|------------------------------|-------------|
| box-shadow       | string                | object                       | YES         |
| filter           | string                | array/object                 | YES         |
| stroke           | string                | object                       | YES         |
| height: auto     | string "auto"         | size with unit (no "auto")   | YES         |
| border-radius-*  | skipped               | size with unit               | YES         |
| top/left: -10px  | skipped               | size with unit (allow -)     | YES         |
| calc(), outline  | skipped               | not supported                | NO          |

---

## 1. box-shadow, filter, stroke – **invalid_value**
- **Current:** Output as a CSS string (e.g., `box-shadow: 0 4px 8px rgba(0,0,0,.3)`)
- **Expected:** Elementor V4 expects an object/array structure:
  - **box-shadow:** `{ color, offsetX, offsetY, blur, spread, inset }`
  - **filter:** Array of filter objects (e.g., `{ type: 'blur', value: 3, unit: 'px' }`)
  - **stroke:** `{ color, width, dasharray, linecap, linejoin }`
- **Fix:** Implement a parser for each property to convert CSS strings into the required object structure. For now, skip or warn if not supported.
- HVV: Fix with a parser.

## 2. height: auto – **invalid_value**
- **Current:** Output as string `"auto"`
- **Expected:** Only numeric sizes with units are allowed (e.g., `150px`, `10em`).
- **Fix:** Skip or default height/width if value is `"auto"`.
- HVV: Skip for now.

## 3. Individual border radius properties – **skipped**
- **Current:** Properties like `border-top-left-radius` are skipped.
- **Expected:** Should be mapped as `size` with unit (e.g., `{ size: 8, unit: 'px' }`).
- **Fix:** Add these to the supported properties list and ensure correct mapping.
- HVV: Fix

## 4. Negative values for top/left – **skipped**
- **Current:** Negative values (e.g., `top: -10px`) are skipped.
- **Expected:** Should be allowed as valid size values.
- **Fix:** Update regex/validation in position property mapper to allow negative numbers.
- HVV: The problem might be different. In my editor this is supported: inset-block-start: -10px;. Probably we need to map 'top' to 'inside-block-start'. Study.

## 5. calc() and outline-color – **skipped**
- **Current:** Skipped as unsupported.
- **Expected:** Not supported by Elementor V4 schema.
- **Fix:** Continue skipping and output a warning if encountered.
- HVV: Skip

---

## 📝 Next Steps

1. **box-shadow, filter, stroke:**
   - Implement object/array parsing for these properties (complex, but required for full V4 compatibility).
   - Interim: Skip or warn if not supported.
2. **height: auto:**
   - Skip or default to a numeric value if `auto` is encountered.
3. **Individual border radius:**
   - Add all `border-*-radius` properties to supported list and map as `{ size, unit }`.
4. **Negative position values:**
   - Update position property mapper to allow negative numbers.
5. **calc(), outline-color:**
   - Continue skipping (not supported by schema).

---

**This document should be updated as each issue is resolved or as new schema requirements are discovered.**
