# Elementor V4 Transformers & CSS Converter Coverage Scan

This document tracks all transformers (from control settings to CSS) in Elementor V4 and maps them to the reverse logic (CSS to control settings) implemented in our CSS Class Converter. The table below shows which transformers and variants are covered by our class converters.

## 1. Transformers in Elementor V4

### A. PHP Transformers (atomic-widgets/props-resolver/transformers)
- array-transformer.php
- combine-array-transformer.php
- image-src-transformer.php
- image-transformer.php
- plain-transformer.php
- settings/
  - attributes-transformer.php
  - classes-transformer.php
  - link-transformer.php
  - query-transformer.php
- styles/
  - background-color-overlay-transformer.php
  - background-gradient-overlay-transformer.php
  - background-image-overlay-size-scale-transformer.php
  - background-image-overlay-transformer.php
  - background-overlay-transformer.php
  - background-transformer.php
  - color-stop-transformer.php
  - filter-transformer.php
  - flex-transformer.php
  - multi-props-transformer.php
  - perspective-origin-transformer.php
  - position-transformer.php
  - shadow-transformer.php
  - size-transformer.php
  - stroke-transformer.php
  - transform-functions-transformer.php
  - transform-move-transformer.php
  - transform-origin-transformer.php
  - transform-rotate-transformer.php
  - transform-scale-transformer.php
  - transform-skew-transformer.php
  - transition-transformer.php

### B. JS/TS Transformers (core/editor-canvas/src/transformers)
- settings/
  - attributes-transformer.ts
  - classes-transformer.ts
  - link-transformer.ts
  - query-transformer.ts
- shared/
  - image-src-transformer.ts
  - image-transformer.ts
  - plain-transformer.ts
- styles/
  - background-color-overlay-transformer.ts
  - background-gradient-overlay-transformer.ts
  - background-image-overlay-transformer.ts
  - background-image-size-scale-transformer.ts
  - background-overlay-transformer.ts
  - background-transformer.ts
  - color-stop-transformer.ts
  - filter-transformer.ts
  - flex-transformer.ts
  - perspective-origin-transformer.ts
  - position-transformer.ts
  - shadow-transformer.ts
  - size-transformer.ts
  - stroke-transformer.ts
  - transform-functions-transformer.ts
  - transform-move-transformer.ts
  - transform-origin-transformer.ts
  - transform-rotate-transformer.ts
  - transform-scale-transformer.ts
  - transform-skew-transformer.ts
  - transition-transformer.ts

---

## 2. CSS Converter “Converters” (class-convertors)
- color-property-mapper.php
- dimension-property-mapper.php
- display-property-mapper.php
- font-size-property-mapper.php
- font-weight-property-mapper.php
- line-height-property-mapper.php
- margin-property-mapper.php
- opacity-property-mapper.php
- padding-property-mapper.php
- text-align-property-mapper.php
- text-decoration-property-mapper.php
- text-transform-property-mapper.php

---

## 3. Coverage Table

| Transformer (V4)                | CSS Converter Mapper         | Covered? |
|----------------------------------|-----------------------------|----------|
| size-transformer                 | font-size, dimension, margin, padding | ✅ Yes |
| color-stop-transformer           | color-property-mapper       | ✅ Yes (basic color) |
| background-transformer           | (not yet)                   | ❌ No    |
| background-color-overlay-transformer | (not yet)               | ❌ No    |
| background-gradient-overlay-transformer | (not yet)           | ❌ No    |
| background-image-overlay-transformer | (not yet)               | ❌ No    |
| background-overlay-transformer   | (not yet)                   | ❌ No    |
| filter-transformer               | (not yet)                   | ❌ No    |
| flex-transformer                 | (not yet)                   | ❌ No    |
| position-transformer             | (not yet)                   | ❌ No    |
| shadow-transformer               | (not yet)                   | ❌ No    |
| stroke-transformer               | (not yet)                   | ❌ No    |
| transition-transformer           | (not yet)                   | ❌ No    |
| text-align-transformer           | text-align-property-mapper  | ✅ Yes   |
| font-weight-transformer          | font-weight-property-mapper | ✅ Yes   |
| line-height-transformer          | line-height-property-mapper | ✅ Yes   |
| text-decoration-transformer      | text-decoration-property-mapper | ✅ Yes |
| text-transform-transformer       | text-transform-property-mapper | ✅ Yes |
| display-transformer              | display-property-mapper     | ✅ Yes   |
| opacity-transformer              | opacity-property-mapper     | ✅ Yes   |
| margin-transformer               | margin-property-mapper      | ✅ Yes   |
| padding-transformer              | padding-property-mapper     | ✅ Yes   |

**Legend:**  
✅ Yes = Implemented in CSS converter  
❌ No = Not yet implemented

---

**Next Steps:**
- Continue mapping and implementing missing transformers (background, filter, flex, etc.) in the CSS converter.
- Update this table as new mappers are added.
