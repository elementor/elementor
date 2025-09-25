# PRD: HTML/CSS to Elementor v4 Widget Converter

## Product Vision
Convert HTML and CSS to Elementor v4 atomic widgets with intelligent styling conversion and global class management.

### Core Example
```html
<h2 id="my-heading" class="h2-heading" style="background-color: #eeeeee;">My Heading</h2>
```

Should produce:
- v4/atomic heading widget with type h2
- Global class for `.h2-heading` styles
- Direct widget styling for inline styles and ID selectors

## Architecture

### Current Infrastructure Analysis
Based on existing `/css-converter` implementation:

**Existing Components:**
- REST API endpoint (`/elementor/v2/css-converter`)
- CSS property converters with registry pattern
- Widget handlers (HTML, Paragraph, Flexbox)
- OpenAPI specification
- Element creation pipeline

**Questions:**
- Should we extend the existing converter or build a new v4-specific system?
HVV: extend
- How do we handle backwards compatibility with the current implementation?
HVV: not relevant. This is an mvp.
- What's the migration path for existing converter users?
HVV: not existing

### Proposed Architecture

#### 1. Input Processing Layer

**HTML Parser:**
- Parse HTML structure into DOM tree
- Extract element attributes (id, class, style)
- Maintain parent-child relationships

**CSS Parser:**
- Parse inline styles (`style` attribute)
- Parse CSS selectors (class, ID, element)
- Handle CSS specificity and cascade rules
- Support CSS variables and custom properties

**Questions:**
- Do we use the existing Sabberworm CSS parser or switch to a different library?
HVV: Continue with existing setup
- How do we handle malformed HTML/CSS input?
HVV: add to a new file call 'FUTURE.md'
- Should we sanitize input for security concerns?
HVV: Yes.
- What CSS features do we support in MVP vs future phases?
HVV: Exactly the same as Class import. This should be a shared functionality.
**SHARED FUNCTIONALITY ANALYSIS**: Based on existing CSS Class Converter system:
  **Supported CSS Properties** (37 total from FINAL-STATUS-REPORT.md):
  - Typography: color, font-size, font-weight, text-align, line-height, text-decoration, text-transform
  - Layout: display, width, height, min/max dimensions, opacity
  - Spacing: margin, padding (all sides + shorthand)
  - Border: border-width, border-style, border-color, border-radius, border shorthand
  - Background: background-color, background-image, background shorthand
  - Effects: filter, text-shadow, box-shadow
  - Flexbox: flex, flex-grow, flex-shrink, flex-basis
  - Position: position, top/right/bottom/left, z-index, logical properties
  - SVG: stroke, stroke-width
  - Transitions: transition-property, transition-duration, transition-timing-function, transition-delay
  
  **Reusable Components**:
  - **CSS Parser**: Sabberworm parser already implemented
  - **Property Converters**: 37 working converters with V4 schema compliance
  - **Conversion Service**: Registry pattern for property mapping
  - **Global Classes Repository**: Already handles naming conflicts and storage
  
**IMPLEMENTATION**: Widget converter should directly use existing CSS-to-props conversion pipeline.
- How do we handle CSS imports and external stylesheets from URLs?
HVV: same as for class imports. Study how we can import html AND css and stylesheets if we go to e.g. www.example.com.

#### 2. Widget Mapping Layer

**HTML-to-Widget Mapping:**
```
h1-h6 → e-heading
p → e-paragraph  
div → e-container/e-flexbox
img → e-image
a → e-link
button → e-button
```

**Questions:**
- What's the complete mapping for all HTML elements?
HVV: Follow what we have in the existing documents. This is an mvp. Include the Flexbox as well.
- How do we handle semantic HTML5 elements (section, article, aside)?
HVV: Can we use the flexbox for that?
- What happens with unsupported elements (svg, canvas, iframe)?
HVV: Skip for now.
- Should we create an HTML widget fallback for unsupported elements?
HVV: not yet. Add to Future.md.
- How do we detect when a div should be a flexbox vs container?
HVV: Always use flexbox. Container is v3 and is dated.
- Do we analyze CSS properties to determine widget type (flex vs block)?
HVV: Let's only use flexbox. Flexbox can support block styling as well.

#### 3. CSS-to-Props Conversion

**Style Categorization:**
- **Global Classes**: `.class-name` → Elementor Global Classes
- **Direct Styling**: `style` attribute → Widget props
- **ID Selectors**: `#element-id` → Widget props

**Questions:**
- How do we handle CSS selectors with higher specificity?
HVV: The selector with the highest specificity should be applied to the widget styling.
- What's the precedence order when multiple styling sources conflict?
HVV: Please elaborate.
**ELABORATION**: When multiple CSS sources apply to the same element, we need a clear precedence order:
  1. **Inline styles** (`style="color: red"`) - Highest priority
  2. **ID selectors** (`#my-heading { color: blue }`) - High priority
  3. **Class selectors** (`.h2-heading { color: green }`) - Medium priority
  4. **Element selectors** (`h2 { color: black }`) - Low priority
  5. **Inherited styles** from parent elements - Lowest priority
**IMPLEMENTATION**: Calculate CSS specificity score for each rule and apply the highest scoring style to the widget. Lower specificity styles become global classes.
- Should we merge similar global classes automatically?
HVV: That will be handled by the classes converter. Not relevant now. But add as a scenario to future.md, after studying the docs/class.
- How do we generate meaningful names for auto-created global classes?
HVV: For now only create global classes as is. But add as a scenario to future.md, after studying the docs/class.
- Do we preserve CSS custom properties as Elementor variables?
HVV: We already have a CSS variable conversion.

#### 4. Global Class Management

**Auto-Detection:**
- Identify reusable CSS rules
- Create global classes for common patterns
- Avoid duplicates across multiple conversions

**Questions:**
- What's the minimum usage threshold for creating a global class?
HVV: Please explain.
**EXPLANATION**: This refers to how many times a CSS rule must appear before we automatically create a global class instead of applying styles directly to widgets. For example:
  - If the same `.button` class appears on 3+ elements, create a global class
  - If it appears only once, apply styles directly to the widget
  - This prevents cluttering global classes with single-use styles
**RECOMMENDATION**: For MVP, create a global class for every CSS class found (threshold = 1). Add intelligent thresholds to FUTURE.md.
HVV2: For now, threshold = 1. And future.md.
- How do we handle naming conflicts with existing global classes?
HVV: See docs/class.
- Should we update existing global classes or create new variants?
HVV: See docs/class.
- Do we provide a UI for reviewing/editing generated global classes?
HVV: See docs/class. And not yet.
- How do we handle responsive CSS rules in global classes?
HVV: See docs/class. Outstading.

#### 5. Widget Creation Pipeline

**Elementor Integration:**
- Generate atomic widget structure
- Apply converted styling properties
- Maintain proper nesting hierarchy
- Create/update posts with generated widgets

**Questions:**
- How do we handle widget dependencies and loading order?
HVV: Explain.
**EXPLANATION**: Widget dependencies refer to:
  1. **Global Classes**: Widgets depend on global classes being created first
  2. **CSS Variables**: Widgets using variables need them to exist
  3. **Parent-Child Relationships**: Container widgets must be created before their children
  4. **Asset Loading**: Ensure required CSS/JS loads before widget rendering
**IMPLEMENTATION**: Process in order: Variables → Global Classes → Parent Containers → Child Widgets
- What's the rollback strategy if widget creation fails?
HVV: What do you suggest?
**SUGGESTED ROLLBACK STRATEGY**:
  1. **Transaction-like approach**: Track all created widgets/classes in a single operation
  2. **Failure detection**: If any widget creation fails, rollback all changes from that batch
  3. **Partial success handling**: Keep successfully created widgets, report failed ones
  4. **Draft mode**: Create everything in draft status first, then publish if all succeed
  5. **Backup creation**: Store original post content before modification
**RECOMMENDATION**: Use draft mode + partial success for MVP. Add full transactional rollback to FUTURE.md.
- Should we create widgets in draft mode first?
HVV: Yes.
- How do we handle large numbers of widgets (performance)?
HVV: Skip for now. Add to future.md as an improvement.

### Data Flow

```
Input (URL/HTML) → 
HTML Parser → 
CSS Extractor → 
Style Analyzer → 
Widget Mapper → 
CSS-to-Props Converter → 
Global Class Manager → 
Widget Creator → 
Elementor Integration
```

## API Specification

### Endpoints

#### Primary Endpoint: `/wp-json/elementor/v2/widget-converter`

**Input Types:**
- `url`: Web page URL to scrape and convert
- `html`: Raw HTML content with optional CSS

**Questions:**
- Should we support multiple URLs in a single request?
HVV: No.
- What's the timeout for URL scraping?
HVV: What do you suggest.
**SUGGESTED TIMEOUT STRATEGY**:
  - **Default timeout**: 30 seconds (WordPress default for wp_remote_get)
  - **Large sites**: 60 seconds for sites with complex CSS/many resources
  - **Configurable**: Allow admin to set custom timeout via constant or filter
  - **Progressive timeout**: Start with 15s, retry with 30s, final attempt with 60s
  - **User feedback**: Show progress indicator for timeouts > 10 seconds
**RECOMMENDATION**: Use 30s default with configurable option for MVP.
- Do we need authentication for protected URLs?
HVV: Add to future.md
- Should we support CSS file URLs separately from HTML?
HVV: That would be great. Please research.
**CSS FILE URL RESEARCH** (Based on existing `/css-converter` system):
  **Current Implementation**: The existing system already supports URL-based CSS import:
  - **Variables Route**: `routes/variables-route.php` handles both `url` and `css` parameters
  - **Classes Route**: `routes/classes-route.php` supports fetching from URLs
  - **URL Processing**: Uses `wp_remote_get()` with proper error handling
  - **CSS Extraction**: Can fetch stylesheets from `<link>` tags in HTML
  
  **For Widget Converter**:
  - **Direct CSS URLs**: Support `.css` file URLs for pure CSS import
  - **HTML + CSS**: Extract linked stylesheets from `<link rel="stylesheet">` tags
  - **Multiple CSS Files**: Combine multiple CSS sources (inline + linked)
  - **CSS Import Handling**: Follow `@import` statements in CSS files
  
  **Enhanced Request Schema**:
  ```json
  {
    "type": "url|html|css",
    "content": "string",
    "cssUrls": ["array of CSS file URLs"],
    "followImports": "boolean"
  }
  ```
**RECOMMENDATION**: Extend existing URL handling to support CSS-only imports and CSS extraction from HTML.
- How do we handle large HTML documents (size limits)?
HVV: Add to future.md for future performance improvement.

**Request Schema:**
```json
{
  "type": "url|html",
  "content": "string",
  "options": {
    "postId": "number|null",
    "postType": "string",
    "globalClassPrefix": "string",
    "preserveIds": "boolean",
    "createGlobalClasses": "boolean"
  }
}
```

**Questions:**
- What additional options should we support?
HVV: No.
- Should we allow custom widget mapping rules?
HVV: No, but add to future.md.
- Do we need validation rules for input content?
HVV: Please advise us.
**RECOMMENDED VALIDATION RULES**:
  **HTML Validation**:
  - **File size limits**: Max 10MB for HTML content
  - **Nesting depth**: Max 20 levels deep to prevent performance issues
  - **Allowed tags**: Whitelist safe HTML tags, block `<script>`, `<object>`, etc.
  - **Malformed HTML**: Use DOMDocument with error handling for recovery
  
  **CSS Validation**:
  - **File size limits**: Max 5MB for CSS content
  - **Selector limits**: Max 1000 selectors per CSS file
  - **Property validation**: Check against known CSS properties
  - **Security**: Block CSS with `javascript:`, `data:` URLs in values
  
  **URL Validation**:
  - **Domain whitelist**: Optional allow/block lists for domains
  - **Protocol restriction**: Only allow http/https
  - **Response validation**: Check Content-Type headers
  - **Size limits**: Stop download if response exceeds size limits
**RECOMMENDATION**: Implement basic size and security validation for MVP.

## Scenarios & Use Cases

### Scenario 1: Simple Landing Page
```html
<div class="hero-section">
  <h1>Welcome</h1>
  <p class="subtitle">Your journey starts here</p>
  <button class="cta-button">Get Started</button>
</div>
```

**Expected Output:**
- Container widget with hero-section global class
- Heading widget (h1)
- Paragraph widget with subtitle global class
- Button widget with cta-button global class

**Questions:**
- How do we detect the optimal container type?
HVV: Only use the flexbox.
- Should we preserve the original class names in global classes?
HVV: Yes.

### Scenario 2: Complex Layout with Flexbox
```html
<div style="display: flex; justify-content: space-between;">
  <div class="sidebar">Navigation</div>
  <div class="content">Main content</div>
</div>
```

**Questions:**
- How do we map CSS flexbox properties to Elementor flexbox controls?
HVV: use the converters that we now have for the classes already.
- What about CSS Grid layouts?
HVV: add future.md. Currently not supported in v4.
- Should we create nested containers for complex layouts?
HVV: Yes.

### Scenario 3: Responsive Design
```css
.responsive-text {
  font-size: 16px;
}
@media (max-width: 768px) {
  .responsive-text {
    font-size: 14px;
  }
}
```

**Questions:**
- How do we handle media queries and responsive breakpoints?
HVV: Add to future.md.
- Should we map to Elementor's responsive controls?
HVV: Yes.
- What about CSS variables for responsive design?
HVV: Future.md.

### Scenario 4: Typography and Brand Colors
```css
:root {
  --primary-color: #007cba;
  --font-family: 'Inter', sans-serif;
}
.brand-heading {
  color: var(--primary-color);
  font-family: var(--font-family);
}
```

**Questions:**
- How do we convert CSS variables to Elementor global variables?
- Should we auto-detect brand colors and typography?
- Do we integrate with Elementor's color palette system?
HVV: No that is v3. We only support v4.

## Edge Cases

### HTML Edge Cases

1. **Malformed HTML**
   - Missing closing tags
   - Invalid nesting
   - Special characters and entities

2. **Unsupported Elements**
   - SVG graphics
   - Canvas elements
   - Embedded media (video, audio)
   - Form elements with complex interactions

3. **Complex Structures**
   - Deeply nested elements (15+ levels)
   - Tables with complex layouts
   - Custom web components

**Questions:**
- How do we gracefully handle parsing errors?
- What's our fallback strategy for unsupported elements?
- Should we provide warnings for complex structures that might not convert well?

### CSS Edge Cases

1. **Advanced Selectors**
   - Pseudo-classes (`:hover`, `:focus`)
   - Pseudo-elements (`::before`, `::after`)
   - Attribute selectors (`[data-attr="value"]`)
   - Complex combinators (`>`, `+`, `~`)

2. **CSS Features**
   - CSS animations and transitions
   - Transform properties
   - CSS filters and blend modes
   - Custom CSS properties with fallbacks

3. **Browser Compatibility**
   - Vendor prefixes (`-webkit-`, `-moz-`)
   - Experimental properties
   - Legacy CSS hacks

**Questions:**
- Which CSS features should we support in MVP vs later phases?
HVV: Follow docs/class
- How do we handle CSS that doesn't have Elementor equivalents?
HVV: Future.md. For now just report it.
- Should we preserve unsupported CSS in custom CSS fields?
HVV: Add to future.md.
- Do we provide warnings for unsupported properties?
HVV: Study the reporting from the class import. For now just a warning.

### Elementor Integration Edge Cases

1. **Widget Limitations**
   - Maximum number of widgets per page
   - Widget property constraints
   - Performance with large numbers of widgets

2. **Styling Conflicts**
   - Theme CSS overriding widget styles
   - Global classes conflicting with theme styles
   - CSS specificity issues

3. **Content Preservation**
   - Dynamic content placeholders
   - Shortcodes within content
   - WordPress-specific markup

**Questions:**
- How do we handle widget creation failures?
HVV: Please advise us.
**WIDGET CREATION FAILURE STRATEGY**:
  1. **Graceful Degradation**: Continue creating other widgets if one fails
  2. **Error Logging**: Log detailed error information for debugging
  3. **Fallback Options**: Use HTML widget for elements that can't be converted
  4. **User Notification**: Report which elements failed and why
  5. **Partial Success**: Return successfully created widgets with error summary
**RECOMMENDATION**: Implement graceful degradation with detailed error reporting.
- What's our strategy for handling styling conflicts?
HVV: Please elaborate.
**STYLING CONFLICT RESOLUTION STRATEGY**:
  1. **CSS Specificity Priority**: Inline > ID > Class > Element > Inherited
  2. **Source Order**: Later rules override earlier ones of same specificity
  3. **Widget vs Global**: Direct widget styling overrides global classes
  4. **Theme Conflicts**: Widget styles use higher specificity to override theme
  5. **Important Declarations**: Handle !important flags appropriately
**IMPLEMENTATION**: Calculate specificity scores and apply highest priority styles.
- Should we provide a preview mode before applying changes?
HVV: No.

## Testing Infrastructure

### Unit Testing

**CSS Parser Tests:**
- Valid CSS parsing
- Malformed CSS handling
- Specificity calculations
- Property value validation

**Widget Mapper Tests:**
- HTML-to-widget mapping accuracy
- Edge case element handling
- Nesting preservation
- Attribute conversion

**Questions:**
- What test coverage percentage should we target?
HVV: Maximum.
**TARGET**: 90%+ code coverage with focus on critical conversion paths
- Should we use property-based testing for CSS parsing?
HVV: Yes.
**IMPLEMENTATION**: Use property-based testing for CSS parser edge cases and validation
- How do we test against the full range of HTML elements?
HVV: Please advise us, and create test scenarios.
**HTML ELEMENT TEST STRATEGY**:
  - **Semantic Elements**: Test h1-h6, p, div, span, section, article, aside
  - **Interactive Elements**: button, a, input, form elements
  - **Media Elements**: img, video, audio (fallback scenarios)
  - **Complex Structures**: Nested elements, mixed content
  - **Edge Cases**: Empty elements, malformed HTML
**TEST SCENARIOS TO CREATE**: Comprehensive HTML test suite covering all supported elements 

### Integration Testing

**API Endpoint Tests:**
- Request validation
- Authentication handling
- Error response formats
- Large payload handling

**Elementor Integration Tests:**
- Widget creation in various post types
- Global class creation and management
- Style application verification
- Multi-widget page creation

**Questions:**
- How do we test against different Elementor versions?
HVV: Only against teh last version.
- Should we test with various WordPress themes?
HVV: Future.md.
- Do we need performance benchmarks?
HVV: Future.md.

### End-to-End Testing

**Real-World Scenarios:**
- Converting popular website templates
- Handling major CSS frameworks (Bootstrap, Tailwind)
- Complex responsive layouts
- Brand website conversions

**Manual Testing Framework:**
- Browser compatibility testing
- Visual regression testing
- User acceptance scenarios
- Performance testing with large sites

**Questions:**
- What browser versions should we support?
HVV: Future.md.
- How do we automate visual testing?
Hvv: future.md.
- Should we test with popular page builders besides Elementor?
HVV: No, Elementor only.

### Test Data

**HTML Test Cases:**
- Semantic HTML5 examples
- Legacy HTML structures
- Complex nested layouts
- Real-world website samples

**CSS Test Cases:**
- Framework CSS (Bootstrap, Foundation)
- Custom brand stylesheets
- Responsive design examples
- Advanced CSS features

**Questions:**
- Should we create a comprehensive test suite of real websites?
HVV: Future.md.
- How do we maintain test data currency as web standards evolve?
HVV: Future.md.
- Do we need performance baselines for different input sizes?
HVV: Future.md.

## Performance Considerations

### Processing Performance

**Questions:**
- What's the maximum HTML document size we should support?
HVV: Future.md.
- How do we handle CSS files with thousands of rules?
HVV: Future.md.
- Should we implement streaming processing for large inputs?
HVV: Future.md.
- What's our target response time for typical conversions?
HVV: Future.md.

### Memory Usage

**Questions:**
- How do we manage memory with large DOM trees?
HVV: Future.md.
- Should we implement chunked processing for complex pages?
HVV: Future.md.
- What's our strategy for handling very large CSS files?
HVV: Future.md.

### Scalability

**Questions:**
- How many concurrent conversions can we support?
HVV: Future.md.
- Should we implement queuing for large conversion tasks?
HVV: Future.md.
- Do we need caching for frequently converted patterns?
HVV: Future.md.

## Security Considerations

### Input Validation

**Questions:**
- How do we sanitize HTML input to prevent XSS?
HVV: Future.md.
- What URL validation do we implement for scraping?
HVV: Future.md.
- Should we implement rate limiting per user/API key?
HVV: Future.md.

### Output Security

**Questions:**
- How do we ensure generated widgets don't contain malicious code?
HVV: Default security, and future.md.
- Should we validate CSS properties for security issues?
HVV: Default security, and future.md.
- What's our strategy for handling user-generated content in widgets?
HVV: Default security, and future.md.

## Future Enhancements

### Phase 2: Advanced Features
- AI-powered widget suggestions
- Batch conversion for multiple pages
- Custom widget mapping rules
- Integration with design systems

### Phase 3: Visual Editor
- Preview mode before conversion
- Interactive widget mapping editor
- Style override management
- Conversion history and rollback

**Questions:**
- What features are most important for user adoption?
HVV: future.md.
- Should we integrate with popular design tools (Figma, Sketch)?
HVV: future.md.
- How do we prioritize feature development based on user feedback?
HVV: future.md.

## Success Metrics

**Technical Metrics:**
- Conversion accuracy rate
- Processing time per page
- Error rate percentage
- Widget creation success rate

**User Experience Metrics:**
- Time saved vs manual widget creation
- User satisfaction scores
- Feature adoption rates
- Support ticket volume

**Questions:**
- How do we measure conversion quality objectively?
HVV: future.md.
- What user feedback mechanisms should we implement?
HVV: future.md.
- How do we track long-term user engagement with converted content?
HVV: future.md.

