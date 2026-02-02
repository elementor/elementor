# HTML/CSS to Widget Converter - Implementation Roadmap

Based on comprehensive PRD feedback from HVV, this roadmap outlines the step-by-step implementation for the MVP.

## Phase 1: Foundation & Architecture (Weeks 1-2)

### 1.1 Extend Existing System
**Decision**: Extend existing `/modules/css-converter` rather than build new system
- [ ] Create new route: `routes/widgets-route.php`
- [ ] Extend existing API to `/wp-json/elementor/v2/widget-converter`
- [ ] Reuse existing CSS parser (Sabberworm) and property converters
- [ ] Leverage existing 37 CSS property support from class converter

### 1.2 Core Architecture Setup
- [ ] Create HTML parser using DOMDocument
- [ ] Implement HTML-to-widget mapping registry
- [ ] Create widget creation pipeline
- [ ] Set up error handling and logging system

**Key Components to Build**:
```
routes/widgets-route.php
services/html-parser.php
services/widget-mapper.php  
services/widget-creator.php
handlers/html-widget-handler.php
handlers/heading-widget-handler.php
handlers/paragraph-widget-handler.php
handlers/button-widget-handler.php
handlers/image-widget-handler.php
handlers/flexbox-widget-handler.php
```

## Phase 2: HTML Processing (Weeks 3-4)

### 2.1 HTML Parser Implementation
- [ ] Build DOMDocument-based HTML parser
- [ ] Extract element attributes (id, class, style)
- [ ] Maintain parent-child relationships
- [ ] Handle malformed HTML with error recovery

### 2.2 Widget Mapping System
**HVV Decisions**:
- Use flexbox widgets only (containers are v3/deprecated)
- Follow existing widget mapping patterns

**Mapping Rules**:
```php
h1-h6 → e-heading
p → e-paragraph  
div → e-flexbox (always flexbox, never container)
section,article,aside → e-flexbox
img → e-image
a → e-link
button → e-button
unsupported → skip for MVP
```

- [ ] Implement widget mapping registry
- [ ] Create handlers for each widget type
- [ ] Add fallback strategy for unsupported elements

### 2.3 Input Processing
**HVV Requirements**:
- Support both URL and HTML input types
- Extend existing CSS URL handling
- Implement CSS extraction from HTML `<link>` tags

- [ ] Extend existing URL processing from `routes/classes-route.php`
- [ ] Add CSS file URL support (`type: "css"`)
- [ ] Extract linked stylesheets from HTML
- [ ] Handle multiple CSS sources (inline + linked)

## Phase 3: CSS Integration (Weeks 5-6)

### 3.1 Leverage Existing CSS System  
**HVV Decision**: "Exactly the same as Class import. This should be a shared functionality."

- [ ] Integrate existing 37 CSS property converters
- [ ] Reuse CSS parser and conversion service
- [ ] Apply existing V4 schema compliance
- [ ] Use same property mapping as class converter

### 3.2 Style Categorization
**Processing Order** (HVV feedback + !important requirement):
1. **!important declarations** → Override everything (highest priority)
2. **Inline styles** (`style="color: red"`) → Widget props (highest priority without !important)
3. **ID selectors** (`#my-heading`) → Widget props
4. **Class selectors** (`.h2-heading`) → Global classes 
5. **Element selectors** (`h2`) → Lower priority

- [ ] Implement CSS specificity calculator with !important support
- [ ] Handle !important declarations as highest priority overrides
- [ ] Create style categorization logic
- [ ] Apply highest specificity styles to widgets
- [ ] Route class styles to global classes system

### 3.3 Global Class Management
**HVV Decisions**:
- Threshold = 1 (create global class for every CSS class)
- Follow existing `docs/class` patterns for naming conflicts
- Use existing Global Classes Repository

- [ ] Integrate with existing Global Classes system
- [ ] Implement threshold=1 logic (every class becomes global)
- [ ] Reuse existing conflict resolution from class converter
- [ ] Preserve original class names

## Phase 4: Widget Creation (Weeks 7-8)

### 4.1 Widget Generation Pipeline
**HVV Requirements**:
- Create widgets in draft mode first
- Process dependencies in order: Variables → Global Classes → Parent → Children
- Graceful degradation for failures

- [ ] Implement dependency-ordered processing
- [ ] Create draft-mode widget creation
- [ ] Build parent-child relationship handling
- [ ] Add graceful failure handling

### 4.2 Error Handling & Reporting
**HVV Feedback**: "Please advise us" + "just report it" for unsupported CSS

**Strategy Implemented**:
- [ ] Graceful degradation (continue on widget failure)
- [ ] Detailed error logging for debugging
- [ ] HTML widget fallback for unconvertible elements
- [ ] User notification of failed elements
- [ ] Partial success reporting with error summary

### 4.3 Elementor Integration
- [ ] Integrate with Elementor document system
- [ ] Handle post creation/updating
- [ ] Ensure proper widget nesting
- [ ] Add CSS generation validation

## Phase 5: API & Validation (Weeks 9-10)

### 5.1 REST API Enhancement
**Enhanced Request Schema** (based on research):
```json
{
  "type": "url|html|css",
  "content": "string",
  "cssUrls": ["array of CSS file URLs"],
  "followImports": "boolean",
  "options": {
    "postId": "number|null",
    "postType": "string",
    "preserveIds": "boolean",
    "createGlobalClasses": "boolean"
  }
}
```

- [ ] Extend existing endpoint structure
- [ ] Add CSS file URL support
- [ ] Implement request validation
- [ ] Add timeout handling (30s default, configurable)

### 5.2 Input Validation
**Recommended Security** (HVV: "Default security"):
- [ ] File size limits (10MB HTML, 5MB CSS)
- [ ] HTML sanitization (block `<script>`, `<object>`)
- [ ] CSS security (block `javascript:`, `data:` URLs)
- [ ] URL validation (http/https only)
- [ ] Nesting depth limits (20 levels max)

### 5.3 Reporting System
**HVV**: "Study the reporting from the class import. For now just a warning."
- [ ] Study existing class import reporting system
- [ ] Implement similar warning system for unsupported properties
- [ ] Add conversion summary reporting
- [ ] Include error details in response

## Phase 6: Testing & Quality (Weeks 11-12)

### 6.1 Comprehensive Test Suite
**HVV Requirements**:
- Maximum test coverage (90%+ target)
- Property-based testing for CSS parsing
- Test all HTML elements with scenarios

**Test Implementation**:
- [ ] Unit tests for HTML parser (90%+ coverage)
- [ ] Property-based CSS parsing tests
- [ ] Widget mapping accuracy tests
- [ ] Integration tests for full conversion flow
- [ ] HTML element test scenarios:
  - Semantic elements (h1-h6, p, div, span, section, article, aside)
  - Interactive elements (button, a, input, form)
  - Media elements (img, video, audio - fallback scenarios)
  - Complex structures (nested elements, mixed content)
  - Edge cases (empty elements, malformed HTML)

### 6.2 Error Handling Tests
- [ ] Widget creation failure scenarios
- [ ] CSS parsing error recovery
- [ ] HTML malformation handling
- [ ] Partial success validation

### 6.3 Integration Testing  
**HVV Decisions**:
- Test only against latest Elementor version
- Elementor only (no other page builders)

- [ ] Latest Elementor version compatibility
- [ ] Post creation in draft mode
- [ ] Global class integration
- [ ] CSS generation verification

## Phase 7: Documentation & Deployment (Week 13)

### 7.1 Documentation
- [ ] API documentation (extend existing OpenAPI spec)
- [ ] Usage examples and tutorials
- [ ] Error handling guide
- [ ] Migration notes from existing system

### 7.2 Production Readiness
- [ ] Performance validation
- [ ] Security review
- [ ] Error monitoring setup
- [ ] Rollback procedures

## Success Criteria for MVP

### Technical Requirements
- [ ] **100% property support**: All 37 CSS properties from existing class converter
- [ ] **Widget creation**: Support h1-h6, p, div, img, a, button → corresponding v4 widgets
- [ ] **CSS specificity handling**: Support !important declarations as highest priority overrides
- [ ] **Global classes**: Threshold=1, reuse existing system
- [ ] **Error handling**: Graceful degradation with detailed reporting
- [ ] **Draft mode**: All widgets created in draft first
- [ ] **CSS URL support**: Extend existing URL handling

### Quality Gates
- [ ] **90%+ test coverage** on critical paths
- [ ] **Zero security vulnerabilities** in input processing
- [ ] **Property-based testing** for CSS parser edge cases
- [ ] **Comprehensive HTML element test scenarios**

### API Compliance
- [ ] **30-second timeout** with configurable options
- [ ] **Validation rules** for security and performance
- [ ] **Error reporting** similar to class import system
- [ ] **Multiple input types**: url, html, css with CSS extraction

## Future Enhancements (Post-MVP)
*All items marked "Future.md" by HVV moved to `/docs/widgets/FUTURE.md`*

## Dependencies & Assumptions

### Existing System Dependencies
- Sabberworm CSS Parser (already implemented)
- 37 CSS Property Converters (working in class system)
- Global Classes Repository (existing)
- Elementor V4 Atomic Widgets (target platform)

### Development Assumptions
- Elementor latest version compatibility only
- WordPress environment with standard security
- Existing autoloader and service registry patterns
- Current Global Classes API stability

## Risk Mitigation

### Technical Risks
- **CSS Parsing Failures**: Use existing proven Sabberworm parser + fallback regex
- **Widget Creation Failures**: Implement graceful degradation + HTML fallback
- **Performance Issues**: MVP scope limits (large file handling in Future.md)
- **Integration Conflicts**: Use existing patterns, test thoroughly

### Business Risks  
- **Scope Creep**: Clear Future.md separation
- **User Expectations**: Focus on core HTML→Widget conversion
- **Maintenance Burden**: Leverage existing systems, maximize code reuse

---

**Estimated Timeline**: 13 weeks for complete MVP implementation
**Team Size**: 2-3 developers (1 senior, 1-2 intermediate)
**Key Milestone Reviews**: End of Phases 2, 4, and 6
