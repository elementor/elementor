# Mixed Content Handling - PRD & Architecture Plan

## Overview
Handle HTML structures where a single element contains both direct text content and child elements, ensuring proper text wrapping and class application.

## Problem Statement

### Current Issue
The CSS converter fails to properly process HTML structures with mixed content:

```html
<div class="first">Text string
    <div class="second">
        <div>Another string</div>
    </div>
</div>
```

**Symptoms:**
- Text content ("Text string", "Another string") is lost during conversion
- No paragraph widgets are created for the text content
- Only empty div widgets are generated

**Impact:**
- Real-world HTML often contains mixed content patterns
- Content loss creates broken user experiences
- Prevents accurate CSS flattening for mixed content scenarios

## Test Case
**Location:** `tests/playwright/sanity/modules/css-converter/url-imports/nested-multiple-class-chain.test.ts`

**Test:** "should create correct paragraph widgets for mixed content structure"

**Current Result:**
- ✅ Widgets are created
- ✅ 2 paragraph elements exist in DOM
- ❌ Text content is missing from both paragraphs
- ❌ Classes are not applied to text elements

**Expected Result:**
1. "Text string" wrapped in `<p class="first">` with pink color
2. "Another string" wrapped in `<p class="div--first-second">` with blue color

## Root Cause Analysis

### HTML Parsing Phase
**File:** `plugins/elementor-css/modules/css-converter/services/css/parsing/html-parser.php`

**Current Behavior:**
```php
// Method: extract_text_content()
// Only extracts direct text nodes (not recursive)
```

**Issue:** The method correctly extracts only direct text content, but the DOM structure may not preserve text nodes that are interspersed with element nodes.

### Text Wrapping Phase
**File:** `plugins/elementor-css/modules/css-converter/services/css/parsing/html-parser.php`

**Current Behavior:**
```php
// Method: wrap_text_content_in_paragraphs()
// Checks: $has_direct_text && !$has_children
// or: $has_direct_text && $has_children
```

**Issue:** Mixed content where text is between elements may not be properly detected or wrapped.

### Class Transfer Phase
**File:** `plugins/elementor-css/modules/css-converter/services/css/parsing/html-parser.php`

**Current Behavior:**
```php
// Transfers ALL classes from parent to paragraph
$paragraph_element = [
    'tag' => 'p',
    'attributes' => $element['attributes'] ?? [],
    'content' => trim( $element['content'] ),
    // ...
];
```

**Issue:** May not properly handle cases where the parent div should retain some classes while the paragraph gets others.

## Architecture Plan

### Phase 1: Enhanced Text Content Detection

**Goal:** Properly detect and extract text content in mixed content scenarios

**Implementation:**
1. **Update `extract_elements()` method** to preserve text node positions
   - Track text nodes separately from element nodes
   - Maintain order: text-element-text-element
   - Store position metadata for each text node

2. **Create new method: `extract_mixed_content()`**
   ```php
   private function extract_mixed_content( DOMElement $element ) {
       $content_items = [];
       
       foreach ( $element->childNodes as $child ) {
           if ( $child->nodeType === XML_TEXT_NODE ) {
               $text = trim( $child->textContent );
               if ( ! empty( $text ) ) {
                   $content_items[] = [
                       'type' => 'text',
                       'content' => $text,
                   ];
               }
           } elseif ( $child->nodeType === XML_ELEMENT_NODE ) {
               $content_items[] = [
                   'type' => 'element',
                   'element' => $this->extract_elements( $child ),
               ];
           }
       }
       
       return $content_items;
   }
   ```

3. **Update element data structure**
   ```php
   return [
       'tag' => $tag,
       'attributes' => $this->extract_attributes( $element ),
       'content' => '', // Keep for backward compatibility
       'mixed_content' => $content_items, // New field
       'children' => $child_elements,
       'depth' => $this->calculate_depth( $element ),
       'inline_css' => [],
   ];
   ```

### Phase 2: Mixed Content Text Wrapping

**Goal:** Properly wrap text content in mixed content scenarios

**Implementation:**
1. **Update `wrap_text_content_in_paragraphs()` method**
   - Detect mixed content using `mixed_content` field
   - Process each text node separately
   - Create paragraph for each text segment
   - Preserve element order

2. **Create new method: `wrap_mixed_content()`**
   ```php
   private function wrap_mixed_content( $element ) {
       if ( empty( $element['mixed_content'] ) ) {
           return $element;
       }
       
       $wrapped_children = [];
       
       foreach ( $element['mixed_content'] as $item ) {
           if ( 'text' === $item['type'] ) {
               // Create paragraph widget for text
               $paragraph_element = [
                   'tag' => 'p',
                   'attributes' => $element['attributes'] ?? [],
                   'content' => $item['content'],
                   'children' => [],
                   'depth' => $element['depth'] + 1,
               ];
               $wrapped_children[] = $paragraph_element;
           } elseif ( 'element' === $item['type'] ) {
               // Recursively process child element
               $wrapped_children[] = $this->wrap_text_content_in_paragraphs( $item['element'] );
           }
       }
       
       // Update element structure
       $element['children'] = $wrapped_children;
       $element['content'] = ''; // Clear direct content
       unset( $element['mixed_content'] ); // Clean up temporary field
       
       return $element;
   }
   ```

### Phase 3: Intelligent Class Distribution

**Goal:** Apply classes correctly to text elements and container elements

**Implementation:**
1. **Distinguish between container classes and content classes**
   - Container classes: Layout-related, positioning
   - Content classes: Styling that should apply to text

2. **Update class transfer logic**
   ```php
   private function transfer_classes_for_mixed_content( $parent_element, $paragraph_element ) {
       $parent_classes = $this->extract_classes( $parent_element['attributes'] ?? [] );
       $paragraph_classes = [];
       $retained_parent_classes = [];
       
       foreach ( $parent_classes as $class ) {
           if ( $this->should_transfer_to_text( $class ) ) {
               $paragraph_classes[] = $class;
           } else {
               $retained_parent_classes[] = $class;
           }
       }
       
       return [
           'paragraph_classes' => $paragraph_classes,
           'parent_classes' => $retained_parent_classes,
       ];
   }
   
   private function should_transfer_to_text( $class ) {
       // Transfer classes that affect text styling
       // Keep classes that affect layout on the parent
       
       // For now: transfer all classes (existing behavior)
       // Future: analyze CSS properties to determine
       return true;
   }
   ```

### Phase 4: Widget Mapping Updates

**Goal:** Ensure widget mapper correctly processes mixed content structures

**Implementation:**
1. **Update `handle_div_block()` in widget-mapper.php**
   - Handle multiple paragraph children from mixed content
   - Preserve order of paragraphs and other elements
   - Apply correct classes to each widget

2. **Testing scenarios:**
   - Text before child element
   - Text after child element
   - Text between multiple child elements
   - Multiple text segments in same parent

## Success Criteria

### Functional Requirements
1. ✅ Text content in mixed structures is preserved
2. ✅ Each text segment creates a separate paragraph widget
3. ✅ Classes are correctly applied to paragraph widgets
4. ✅ Element order is maintained (text, element, text)
5. ✅ CSS flattening works for mixed content scenarios

### Test Cases
1. **Basic mixed content:**
   ```html
   <div class="first">Text before
       <div class="second">Child</div>
   </div>
   ```
   - Expected: 2 paragraphs (Text before, Child)

2. **Mixed content with element selector:**
   ```html
   <div class="first">Text string
       <div class="second">
           <div>Another string</div>
       </div>
   </div>
   ```
   - Expected: "Text string" with `.first`, "Another string" with `.div--first-second`

3. **Multiple text segments:**
   ```html
   <div class="container">
       Text 1
       <div class="item">Item</div>
       Text 2
   </div>
   ```
   - Expected: 3 paragraphs in correct order

### Performance Requirements
- Processing time increase: < 10% for typical HTML
- Memory usage increase: < 20% for typical HTML
- No impact on simple content structures (current behavior)

## Implementation Plan

### Phase 1: Investigation (1-2 hours)
- [ ] Debug current HTML parsing for mixed content
- [ ] Identify exact point where text content is lost
- [ ] Document current data structures at each stage

### Phase 2: Core Implementation (3-4 hours)
- [ ] Implement `extract_mixed_content()` method
- [ ] Update element data structure
- [ ] Implement `wrap_mixed_content()` method
- [ ] Update text wrapping logic

### Phase 3: Integration (2-3 hours)
- [ ] Update widget mapper for mixed content
- [ ] Ensure backward compatibility
- [ ] Update class transfer logic

### Phase 4: Testing (2-3 hours)
- [ ] Create comprehensive test suite
- [ ] Test edge cases
- [ ] Verify no regressions in existing tests
- [ ] Update test in nested-multiple-class-chain.test.ts

### Phase 5: Documentation (1 hour)
- [ ] Update FUTURE.md with mixed content approach
- [ ] Document known limitations
- [ ] Add code comments

**Total Estimated Time:** 9-13 hours

## Alternative Approaches

### Alternative 1: Pre-normalize HTML
**Approach:** Convert mixed content to pure nested structure before processing

**Pros:**
- Simpler implementation
- No changes to core parsing logic

**Cons:**
- May alter semantic HTML structure
- Could break some edge cases
- Doesn't preserve original intent

### Alternative 2: Post-process Widget Structure
**Approach:** Fix widget structure after conversion

**Pros:**
- No changes to HTML parsing
- Isolated fix

**Cons:**
- Harder to debug
- May miss some cases
- Doesn't address root cause

### Recommended Approach
**Enhanced Text Content Detection (Phase 1-4)** because:
- Addresses root cause
- Maintains semantic structure
- More maintainable long-term
- Better handles edge cases

## Known Limitations

### After Implementation
1. **Very complex mixed content** (e.g., text-element-text-element-text) may create many paragraph widgets
2. **CSS inheritance** in mixed content may behave differently than original HTML
3. **Whitespace handling** around elements may need refinement
4. **Performance impact** on very large HTML documents with extensive mixed content

## Dependencies
- No external dependencies
- Requires backward compatibility with current text wrapping behavior
- Must not break existing 13 passing tests

## Priority
**Medium-High**

**Reasoning:**
- Core CSS flattening is complete (13/15 tests pass)
- Mixed content is a real-world scenario
- Not blocking basic functionality
- Improves user experience significantly
- Relatively isolated change

## References
- Test case: `nested-multiple-class-chain.test.ts` (line 353)
- HTML parser: `services/css/parsing/html-parser.php`
- Widget mapper: `services/widgets/widget-mapper.php`
- Related docs: `FUTURE.md`, `0-FLAT-CLASSES.md`

