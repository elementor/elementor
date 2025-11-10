# PRD: Intelligent Content Extraction for Widget Converter API

## Overview

The CSS Converter Widget API currently processes entire page HTML when no selector is provided, resulting in complex page structures (6+ elements) instead of meaningful, focused content. This PRD outlines improvements to intelligently extract and convert relevant content sections.

## Problem Statement

### Current Behavior
- **With Selector**: Converts specific element (1 focused element) ✅
- **Without Selector**: Converts entire page DOM (6+ unfocused elements) ❌

### User Impact
- Users receive complex page structures instead of clean, usable widgets
- Content lacks focus and semantic meaning
- Poor user experience when importing full pages
- Difficult to identify and use meaningful content sections

### Evidence from Testing
```javascript
// Current Results (After CSS Fix)
{
  "with_selector": {
    "elements": 1,        // Focused content
    "global_classes": 5
  },
  "without_selector": {
    "elements": 6,        // Unfocused page structure
    "global_classes": 5
  }
}
```

## Success Criteria

### Primary Goals
1. **Intelligent Content Detection**: Automatically identify meaningful content sections
2. **Semantic Extraction**: Extract content with semantic meaning (articles, sections, main content)
3. **User Choice**: Provide options for different extraction strategies
4. **Backward Compatibility**: Maintain existing selector-based functionality

### Key Metrics
- Reduce average elements from 6+ to 2-3 meaningful sections
- Increase content relevance score by 80%
- Maintain 100% backward compatibility
- Zero performance degradation for selector-based requests

## Proposed Solutions

### Solution 1: Semantic Content Detection (Recommended)

#### Implementation Strategy
```php
// New method in atomic-widgets-route.php
private function extract_semantic_content_sections( string $html ): array {
    $semantic_selectors = [
        'main',
        'article', 
        '[role="main"]',
        '.main-content',
        '.content',
        '.post-content',
        '.entry-content',
        '.page-content'
    ];
    
    foreach ( $semantic_selectors as $selector ) {
        $sections = $this->extract_elements_by_selector( $html, $selector );
        if ( !empty( $sections ) ) {
            return $this->filter_meaningful_sections( $sections );
        }
    }
    
    // Fallback to heuristic detection
    return $this->detect_content_by_heuristics( $html );
}
```

#### Content Prioritization Logic
1. **Primary**: `<main>`, `<article>`, `[role="main"]`
2. **Secondary**: `.main-content`, `.content`, `.post-content`
3. **Heuristic**: Largest text blocks, highest element density
4. **Fallback**: Skip navigation, header, footer elements

### Solution 2: Multi-Strategy Extraction Options

#### API Enhancement
```json
{
  "type": "url",
  "content": "https://example.com/",
  "extraction_strategy": "semantic|heuristic|full|sections",
  "options": {
    "max_sections": 3,
    "min_content_length": 100,
    "exclude_navigation": true,
    "focus_on_text_content": true
  }
}
```

#### Extraction Strategies
- **semantic**: Use semantic HTML elements (default)
- **heuristic**: Content-based analysis (text density, element count)
- **full**: Current behavior (entire page)
- **sections**: Multiple meaningful sections

### Solution 3: Content Quality Scoring

#### Scoring Algorithm
```php
private function calculate_content_score( DOMElement $element ): float {
    $score = 0;
    
    // Text content weight (40%)
    $text_length = strlen( trim( $element->textContent ) );
    $score += min( $text_length / 500, 1.0 ) * 0.4;
    
    // Semantic element bonus (30%)
    $semantic_tags = ['article', 'section', 'main', 'aside'];
    if ( in_array( $element->tagName, $semantic_tags ) ) {
        $score += 0.3;
    }
    
    // Class/ID relevance (20%)
    $content_classes = ['content', 'main', 'article', 'post'];
    foreach ( $content_classes as $class ) {
        if ( strpos( $element->getAttribute('class'), $class ) !== false ) {
            $score += 0.2;
            break;
        }
    }
    
    // Element diversity (10%)
    $child_types = [];
    foreach ( $element->childNodes as $child ) {
        if ( $child->nodeType === XML_ELEMENT_NODE ) {
            $child_types[] = $child->tagName;
        }
    }
    $score += min( count( array_unique( $child_types ) ) / 10, 1.0 ) * 0.1;
    
    return $score;
}
```

## Technical Implementation

### Phase 1: Core Semantic Detection (Week 1-2)

#### Files to Modify
1. **atomic-widgets-route.php**
   - Add `extract_semantic_content_sections()` method
   - Modify `resolve_html_content()` to use semantic extraction
   - Add content quality scoring

2. **New Service Class**
   ```php
   // services/content/intelligent-content-extractor.php
   class Intelligent_Content_Extractor {
       public function extract_meaningful_sections( string $html, array $options = [] ): array;
       private function detect_semantic_elements( DOMDocument $dom ): array;
       private function apply_heuristic_analysis( DOMDocument $dom ): array;
       private function score_content_quality( DOMElement $element ): float;
   }
   ```

#### API Changes
```php
// Add new parameter to existing endpoint
'extraction_strategy' => [
    'required' => false,
    'type' => 'string',
    'enum' => ['semantic', 'heuristic', 'full', 'sections'],
    'default' => 'semantic',
    'description' => 'Content extraction strategy'
],
'content_options' => [
    'required' => false,
    'type' => 'object',
    'properties' => [
        'max_sections' => ['type' => 'integer', 'default' => 3],
        'min_content_length' => ['type' => 'integer', 'default' => 100],
        'exclude_navigation' => ['type' => 'boolean', 'default' => true]
    ]
]
```

### Phase 2: Advanced Heuristics (Week 3-4)

#### Content Analysis Features
1. **Text Density Analysis**: Identify content-rich sections
2. **Visual Hierarchy Detection**: Recognize headings, paragraphs, lists
3. **Navigation Exclusion**: Skip menus, sidebars, footers
4. **Duplicate Content Filtering**: Remove repeated elements

#### Machine Learning Integration (Future)
- Train model on successful extractions
- Learn from user feedback and corrections
- Improve extraction accuracy over time

### Phase 3: User Experience Enhancements (Week 5-6)

#### Preview and Selection API
```json
// New endpoint: /wp-json/elementor/v2/widget-converter/preview
{
  "type": "url",
  "content": "https://example.com/",
  "action": "preview_sections"
}

// Response: Multiple section options
{
  "success": true,
  "sections": [
    {
      "id": "section_1",
      "title": "Main Article Content",
      "preview": "Lorem ipsum dolor sit amet...",
      "score": 0.95,
      "element_count": 3,
      "selector": "article.main-content"
    },
    {
      "id": "section_2", 
      "title": "Sidebar Content",
      "preview": "Related articles and...",
      "score": 0.7,
      "element_count": 2,
      "selector": "aside.sidebar"
    }
  ]
}
```

## Testing Strategy

### Automated Testing
```typescript
// tests/playwright/intelligent-extraction.test.ts
describe('Intelligent Content Extraction', () => {
  test('extracts semantic content without selector', async () => {
    const response = await apiHelper.convertUrl({
      url: 'https://oboxthemes.com/',
      extraction_strategy: 'semantic'
    });
    
    expect(response.widgets[0].elements.length).toBeLessThan(4);
    expect(response.content_quality_score).toBeGreaterThan(0.8);
  });
  
  test('maintains backward compatibility with selectors', async () => {
    const response = await apiHelper.convertUrl({
      url: 'https://oboxthemes.com/',
      selector: '.elementor-element-58a82af'
    });
    
    expect(response.widgets[0].elements.length).toBe(1);
  });
});
```

### Manual Testing Scenarios
1. **Blog Posts**: Extract main article content
2. **Landing Pages**: Identify hero sections and key content
3. **E-commerce**: Product descriptions and features
4. **Documentation**: Main content areas
5. **News Sites**: Article content vs navigation

### Test Sites for Validation
- https://oboxthemes.com/ (Current test case)
- WordPress.org blog posts
- Medium articles
- GitHub documentation pages
- E-commerce product pages

## Performance Considerations

### Optimization Strategies
1. **Caching**: Cache semantic analysis results
2. **Lazy Loading**: Process sections on-demand
3. **Parallel Processing**: Analyze multiple sections simultaneously
4. **Early Termination**: Stop when high-quality content found

### Performance Targets
- **Processing Time**: < 2 seconds for semantic extraction
- **Memory Usage**: < 50MB additional overhead
- **Cache Hit Rate**: > 80% for repeated URLs

## Risk Assessment

### Technical Risks
- **Complexity**: Semantic detection may be unreliable on some sites
- **Performance**: Additional processing overhead
- **Compatibility**: Different HTML structures across sites

### Mitigation Strategies
- **Fallback Chain**: semantic → heuristic → full extraction
- **Configurable Timeouts**: Prevent hanging on complex pages
- **Extensive Testing**: Cover diverse website structures

### Rollback Plan
- Feature flag for intelligent extraction
- Instant rollback to current behavior
- Gradual rollout with monitoring

## Success Metrics

### Quantitative Metrics
- **Element Reduction**: 6+ elements → 2-3 meaningful sections
- **Content Quality Score**: > 0.8 average
- **User Satisfaction**: > 90% positive feedback
- **Performance**: < 2s processing time

### Qualitative Metrics
- **Content Relevance**: Extracted content matches user intent
- **Usability**: Easier to work with in Elementor editor
- **Semantic Accuracy**: Correct identification of content types

## Timeline

### Week 1-2: Foundation
- [ ] Implement semantic content detection
- [ ] Add content quality scoring
- [ ] Basic API parameter support

### Week 3-4: Enhancement
- [ ] Heuristic analysis algorithms
- [ ] Advanced filtering and exclusion
- [ ] Performance optimization

### Week 5-6: Polish
- [ ] Preview and selection API
- [ ] Comprehensive testing
- [ ] Documentation and examples

### Week 7: Launch
- [ ] Feature flag rollout
- [ ] Monitoring and metrics
- [ ] User feedback collection

## Future Enhancements

### Advanced Features
1. **AI-Powered Extraction**: Use LLM to understand content context
2. **Visual Analysis**: Analyze page screenshots for layout understanding
3. **User Learning**: Adapt to user preferences over time
4. **Multi-Language Support**: Handle international content better

### Integration Opportunities
1. **Elementor AI**: Leverage existing AI capabilities
2. **Template Library**: Suggest templates based on extracted content
3. **Design Suggestions**: Recommend layouts for content types

## Conclusion

This PRD addresses the core issue of unfocused content extraction while maintaining backward compatibility and setting the foundation for advanced content intelligence features. The phased approach ensures incremental value delivery while managing technical complexity and risk.

The success of this implementation will significantly improve the user experience when converting full pages to Elementor widgets, making the tool more practical and valuable for real-world usage scenarios.
