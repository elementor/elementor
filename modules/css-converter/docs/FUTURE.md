# Future Improvements

## Text Content Handling in Widget Conversion

### Current Implementation
- **Issue**: `span` and `div` elements with direct text content cause rendering issues in the Elementor editor
- **Root Cause**: The widget conversion pipeline expects structured content, but direct text in container elements doesn't render properly
- **Current Solution**: Preprocessing HTML to wrap text content in `<p>` tags before widget conversion

### Implementation Details
- **Location**: `plugins/elementor-css/modules/css-converter/services/css/parsing/html-parser.php`
- **Method**: `preprocess_elements_for_text_wrapping()` and `wrap_text_content_in_paragraphs()`
- **Behavior**: 
  - `<div>My text</div>` becomes `<div><p>My text</p></div>`
  - `<span>My text</span>` becomes `<span><p>My text</p></span>`
  - Only affects container elements: `div`, `span`, `section`, `article`, `aside`, `header`, `footer`, `main`, `nav`

### Future Improvements
1. **Widget Conversion Pipeline Enhancement**: 
   - Improve the widget conversion pipeline to handle direct text content in container elements
   - This would eliminate the need for HTML preprocessing
   
2. **Semantic Preservation**: 
   - Consider preserving the semantic meaning of direct text vs paragraph text
   - Investigate if direct text should be converted to different widget types
   
3. **Performance Optimization**: 
   - The current preprocessing adds overhead to HTML parsing
   - Future versions could handle this more efficiently during widget creation

### Related Files
- `plugins/elementor-css/modules/css-converter/services/widgets/widget-mapper.php` (widget conversion)
- `plugins/elementor-css/modules/css-converter/services/css/parsing/html-parser.php` (HTML preprocessing)
- `plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/pattern-3-multiple-class-chain.test.ts` (affected tests)
- `plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/pattern-5-element-selectors.test.ts` (affected tests)

### Current Limitations
- **Flattened Class Application**: Flattened CSS classes are applied to the original container elements (e.g., `<span>`, `<div>`), but not to the inner `<p>` elements created by text wrapping
- **Test Impact**: Pattern 3 and Pattern 5 tests that expect flattened classes on `<span>` elements will fail because the classes are not transferred to the inner `<p>` elements
- **Workaround**: Tests need to be updated to look for flattened classes on the container elements rather than the text elements

### Testing Notes
- Pattern 3 and Pattern 5 tests use `span` elements which are affected by this issue
- Current preprocessing solution fixes content rendering but doesn't transfer flattened classes to inner paragraph elements
- Tests may need to be updated to account for the new DOM structure: `<span class="flattened-class"><p>text</p></span>`
- Future improvements should maintain backward compatibility with existing tests
