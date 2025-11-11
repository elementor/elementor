# Legacy Code in unified-css-processor.php

**Status**: INACTIVE - Unclear if still needed  
**Date Marked**: October 27, 2025  
**Reason**: Replaced by processor registry pattern, but not verified as completely unused

---

## Legacy Methods List

### 1. Style Collection Methods (Lines 98-146)

#### `collect_all_styles_from_sources()` - Line 98
- **Purpose**: Collects CSS, inline, and reset styles
- **Status**: ❌ NOT CALLED - Replaced by `Style_Collection_Processor`
- **Action**: Can be deleted after verification

#### `collect_all_styles_from_sources_with_flattened_rules()` - Line 104
- **Purpose**: Collects styles using pre-flattened CSS rules
- **Status**: ❌ NOT CALLED - Replaced by `Style_Collection_Processor`
- **Action**: Can be deleted after verification

#### `collect_css_styles_from_flattened_rules()` - Line 114
- **Purpose**: Processes flattened CSS rules
- **Status**: ❌ NOT CALLED
- **Action**: Can be deleted after verification

#### `collect_css_styles()` - Line 125
- **Purpose**: Parses CSS and processes rules
- **Status**: ❌ NOT CALLED
- **Action**: Can be deleted after verification

#### `log_css_parsing_start_from_rules()` - Line 122
- **Purpose**: Debug logging (empty)
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `log_css_parsing_start()` - Line 147
- **Purpose**: Debug logging (empty)
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `parse_css_and_extract_rules()` - Line 152
- **Purpose**: Parses CSS into rules array
- **Status**: ⚠️ DEPRECATED - Has @deprecated tag
- **Replacement**: `Css_Parsing_Processor`
- **Action**: Delete after verification

#### `log_extracted_rules()` - Line 162
- **Purpose**: Debug logging (empty)
- **Status**: ❌ NOT CALLED
- **Action**: Delete

---

### 2. Element Selector Processing (Lines 165-252)

#### `is_simple_element_selector()` - Line 165
- **Purpose**: Checks if selector is a simple element (p, h1, div)
- **Status**: ⚠️ UNCLEAR - Used by `analyze_and_apply_direct_element_styles()`
- **Action**: Verify if element reset styles are handled by processors

#### `infer_html_tag_from_widget_type()` - Line 169
- **Purpose**: Maps widget types to HTML tags
- **Status**: ⚠️ UNCLEAR
- **Action**: Check if processors need this

#### `infer_heading_tag_from_widget()` - Line 179
- **Purpose**: Determines heading tag (h1-h6) from widget settings
- **Status**: ⚠️ UNCLEAR
- **Action**: Check if processors need this

#### `prepare_properties_for_collection()` - Line 185
- **Purpose**: Converts properties to collection format
- **Status**: ⚠️ UNCLEAR - Similar to `convert_rule_properties_to_atomic()`
- **Action**: Consolidate with other conversion methods

#### `analyze_and_apply_direct_element_styles()` - Line 203
- **Purpose**: Applies element reset styles (e.g., `p { color: red }`)
- **Status**: ⚠️ CRITICAL - Element reset styles functionality
- **Action**: **MUST VERIFY** - This is core functionality for element selectors
- **Question**: Is this handled by `Style_Collection_Processor` or does it need migration?

---

### 3. Widget Matching Methods (Lines 253-334)

#### `convert_rules_to_analyzer_format()` - Line 253
- **Purpose**: Converts rules to analyzer format
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `apply_direct_element_styles_to_widgets()` - Line 270
- **Purpose**: Applies element styles to matching widgets
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `find_widgets_by_element_type()` - Line 295
- **Purpose**: Finds widgets matching an element selector
- **Status**: ⚠️ DUPLICATED - Similar logic in `Nested_Element_Selector_Processor`
- **Action**: Extract to shared `Widget_Matcher_Service`
- **Note**: Multiple processors need this functionality

---

### 4. Nested Compound Selector Processing (Lines 335-469)

#### `process_css_rules_for_widgets()` - Line 335
- **Purpose**: Main processing loop for CSS rules
- **Status**: ✅ REPLACED by processor registry pattern
- **Action**: Delete after verification

#### `is_nested_selector_with_compound_classes()` - Line 380
- **Purpose**: Detects nested selectors with compound classes
- **Status**: ✅ REPLACED by `Nested_Element_Selector_Processor`
- **Action**: Delete

#### `has_element_tag_in_last_selector_part()` - Line 398
- **Purpose**: Checks if selector ends with HTML tag
- **Status**: ✅ REPLACED by `Nested_Element_Selector_Processor`
- **Action**: Delete

#### `apply_widget_specific_styling_for_nested_compound()` - Line 415
- **Purpose**: Applies styles for nested compound selectors
- **Status**: ✅ REPLACED by `Nested_Element_Selector_Processor`
- **Action**: Delete

#### `extract_target_selector()` - Line 457
- **Purpose**: Extracts last part of selector
- **Status**: ✅ REPLACED - Logic duplicated in processors
- **Action**: Delete or extract to utility

#### `log_rule_processing()` - Line 470
- **Purpose**: Debug logging (empty)
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `log_matched_elements()` - Line 473
- **Purpose**: Debug logging (empty)
- **Status**: ❌ NOT CALLED
- **Action**: Delete

---

### 5. Property Conversion Methods (Lines 476-512)

#### `process_matched_rule()` - Line 476
- **Purpose**: Processes a matched CSS rule
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `convert_rule_properties_to_atomic()` - Line 486
- **Purpose**: Converts CSS properties to atomic format
- **Status**: ⚠️ MIGHT BE USED by processors
- **Action**: Check if processors use this, if yes extract to service
- **Note**: Similar logic exists in `Nested_Element_Selector_Processor`

#### `expand_border_shorthand_before_property_mapper_processing()` - Line 505
- **Purpose**: Expands border shorthand (border: 1px solid red)
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Check if processors need this
- **Note**: Border expansion is critical functionality

---

### 6. Inline Style Collection (Lines 513-597)

#### `collect_inline_styles_from_widgets()` - Line 513
- **Purpose**: Entry point for inline style collection
- **Status**: ⚠️ CRITICAL - Inline styles must be preserved
- **Action**: **MUST VERIFY** - Check if `Style_Collection_Processor` handles this

#### `log_inline_style_collection_start()` - Line 518
- **Purpose**: Debug logging (empty)
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `log_inline_style_collection_complete()` - Line 521
- **Purpose**: Debug logging (empty)
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `collect_inline_styles_recursively()` - Line 524
- **Purpose**: Recursively collects inline styles from widget tree
- **Status**: ⚠️ CRITICAL
- **Action**: Verify if handled by `Style_Collection_Processor`

#### `log_widget_inline_processing()` - Line 535
- **Purpose**: Debug logging
- **Status**: ❌ NOT CALLED
- **Action**: Delete

#### `process_widget_inline_styles()` - Line 541
- **Purpose**: Processes inline styles for a single widget
- **Status**: ⚠️ CRITICAL
- **Action**: Verify if handled by processor

#### `extract_inline_properties()` - Line 546
- **Purpose**: Extracts properties from inline CSS
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Verify

#### `store_converted_inline_styles()` - Line 554
- **Purpose**: Stores converted inline styles in style manager
- **Status**: ⚠️ CRITICAL
- **Action**: Verify

#### `find_converted_property_in_batch()` - Line 573
- **Purpose**: Finds converted property in batch conversion result
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Verify

#### `process_child_widgets_recursively()` - Line 581
- **Purpose**: Processes child widgets
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Verify

#### `convert_properties_batch()` - Line 586
- **Purpose**: Batch converts properties
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Verify

---

### 7. Property Mapping Utilities (Lines 592-650+)

#### `is_property_source_unified()` - Line 592
- **Purpose**: Checks if CSS property maps to atomic property
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Verify

#### `is_margin_property_mapping()` - Line 593+
- **Purpose**: Checks margin property mapping
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Verify

#### `is_padding_property_mapping()` - Line 596+
- **Purpose**: Checks padding property mapping
- **Status**: ⚠️ MIGHT BE USED
- **Action**: Verify

... (Additional utility methods continue)

---

## Summary Statistics

- **Total Legacy Methods**: ~40+
- **Definitely Unused**: ~15 (mostly logging and wrapper methods)
- **Replaced by Processors**: ~8 (nested compound selector processing)
- **Critical - Need Verification**: ~5 (element reset, inline styles)
- **Utilities - Might Be Shared**: ~12 (property conversion, widget matching)

---

## Priority Actions

### HIGH PRIORITY (Do First)
1. ✅ Mark all methods with `// LEGACY:` comments
2. ⬜ Verify if `Style_Collection_Processor` handles:
   - Element reset styles (`analyze_and_apply_direct_element_styles`)
   - Inline style collection (`collect_inline_styles_from_widgets`)
3. ⬜ Run full test suite to check for breakage

### MEDIUM PRIORITY
1. ⬜ Extract shared utilities to services:
   - Widget matching → `Widget_Matcher_Service`
   - Property conversion → `Property_Conversion_Service`
2. ⬜ Consolidate duplicate logic across processors

### LOW PRIORITY
1. ⬜ Delete obviously unused methods (logging, wrappers)
2. ⬜ Clean up debug logging

---

## Verification Checklist

- [ ] Run Playwright tests - all pass?
- [ ] Check inline styles are preserved
- [ ] Check element reset styles work (e.g., `p { margin: 0 }`)
- [ ] Check nested selectors work
- [ ] Check compound selectors work
- [ ] Check flattened classes work
- [ ] Performance is acceptable

---

## Related Processors

1. **Style_Collection_Processor** (Priority 85)
   - Might handle: inline styles, element reset styles
   - Location: `processors/style-collection-processor.php`

2. **Nested_Element_Selector_Processor** (Priority 14)
   - Handles: nested selectors with element tags
   - Location: `processors/nested-element-selector-processor.php`

3. **Compound_Class_Selector_Processor** (Priority 20)
   - Handles: compound class selectors
   - Location: `processors/compound-class-selector-processor.php`

4. **Style_Resolution_Processor** (Priority 100)
   - Handles: final style resolution
   - Location: `processors/style-resolution-processor.php`

---

## Next Steps

1. Add `// LEGACY: INACTIVE - Status unclear` comments to all methods
2. Run test suite
3. If tests pass: Methods are truly unused, can delete
4. If tests fail: Identify which methods are needed, migrate to processors

---

## Notes

- **DO NOT DELETE** until verification complete
- Some methods might be called indirectly through inheritance
- Property conversion utilities are likely shared across multiple processors
- Widget matching logic should be extracted to a shared service

