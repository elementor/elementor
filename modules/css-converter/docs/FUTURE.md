# CSS Converter - Future Enhancements

**Document Version**: 1.0  
**Last Updated**: October 10, 2025  
**Status**: Planning Document

---

## 🔮 **Future Enhancements**

### **CSS Pseudo-Classes and Pseudo-Elements**
- **Status**: Not implemented in direct widget styling
- **Scope**: `:hover`, `:focus`, `:active`, `:visited`, `:first-child`, `:last-child`, `:nth-child()`, `:before`, `:after`, `:not()`, `:is()`, `:where()`
- **Impact**: Medium - affects interactive and dynamic styling
- **Reason**: Atomic widgets don't support pseudo-class styling in direct widget properties
- **Approach**: Fall back to CSS files or global classes for proper cascade behavior
- **Note**: For reset styles implementation (Approach 6), pseudo-classes will use standard CSS processing rather than direct widget styling

### **Property Type Improvements**

#### **Border-Width Keywords Support**
- **Status**: Partially implemented - numeric values work
- **Missing**: CSS keyword values (`thin`, `medium`, `thick`)
- **Impact**: Low - most users use numeric values
- **Effort**: Low - simple keyword-to-numeric mapping
- **Test Status**: Skipped in `border-width-prop-type.test.ts` - keyword values not yet supported
- **Implementation**:
  ```php
  private const BORDER_WIDTH_KEYWORDS = [
      'thin' => ['size' => 1, 'unit' => 'px'],
      'medium' => ['size' => 3, 'unit' => 'px'], 
      'thick' => ['size' => 5, 'unit' => 'px'],
  ];
  ```

#### **Margin Auto Support**
- **Status**: Not implemented
- **Missing**: `margin: auto` for centering elements
- **Impact**: Medium - commonly used for horizontal centering
- **Effort**: High - complex layout context dependency
- **Challenge**: Auto margins depend on container width and layout context which varies
- **Implementation**: Requires sophisticated layout analysis or alternative centering approaches
- **Test Status**: Skipped in `margin-prop-type.test.ts` due to testing complexity

#### **Size Property Edge Cases**
- **Status**: Core functionality complete
- **Missing**: Advanced edge cases and validation
- **Impact**: Low - edge cases rarely used
- **Effort**: Medium - requires comprehensive testing

#### **Flex Shorthand Property**
- **Status**: Not implemented
- **Missing**: `flex` shorthand property support (e.g., `flex: 0 0 auto`)
- **Impact**: Medium - commonly used in flexbox layouts
- **Effort**: Medium - requires parsing flex shorthand into flex-grow, flex-shrink, flex-basis
- **Test Status**: Skipped in `flex-properties-prop-type.test.ts` - shorthand parsing not implemented
- **Implementation**:
  ```php
  // Parse: flex: 0 0 auto
  // Into: flex-grow: 0, flex-shrink: 0, flex-basis: auto
  private function parse_flex_shorthand( string $value ): array {
      $parts = preg_split( '/\s+/', trim( $value ) );
      return [
          'flex-grow' => $parts[0] ?? '0',
          'flex-shrink' => $parts[1] ?? '1',
          'flex-basis' => $parts[2] ?? 'auto',
      ];
  }
  ```

#### **Font Family Custom Mapping**
- **Status**: Low priority - acceptable behavior
- **Issue**: System fonts override custom font specifications (Arial, Helvetica, Georgia)
- **Impact**: Low - system fonts provide excellent fallback and consistent experience
- **Current Behavior**: Elementor applies system font stack: `-apple-system, system-ui, "Segoe UI", Roboto...`
- **Expected Behavior**: Preserve custom font-family declarations from CSS
- **Effort**: Medium - requires font-family property mapper integration
- **Decision**: ACCEPTABLE - System fonts are a reasonable default. Custom fonts can be added later if user demand warrants it.

---

## 🚀 **Advanced Features**

### **CSS Grid Support**
- **Status**: Not implemented
- **Reason**: Atomic widgets don't support grid properties yet
- **Properties**: `grid-template-columns`, `grid-template-rows`, `grid-gap`, etc.
- **Dependency**: Requires atomic widget grid support first

### **Advanced Transform Support**
- **Status**: Basic transforms work
- **Missing**: 3D transforms, complex animations
- **Properties**: `transform3d`, `perspective`, `backface-visibility`

### **Modern CSS Features**
- **Container Queries**: `@container` support
- **CSS Layers**: `@layer` support  
- **CSS Nesting**: Nested selector support
- **Custom Properties**: CSS variables (`--custom-prop`)

---

## 🛠️ **Developer Experience**

### **API Endpoint Modernization**
- **Status**: Needs improvement
- **Task**: Update CSS Converter API endpoints to match global-classes-rest-api.php styling
- **Key improvements needed**:
  - Use arrow functions for callbacks (`fn() =>` syntax)
  - Implement route_wrapper for consistent error handling
  - Use Response_Builder and Error_Builder for all responses
  - Add comprehensive parameter validation with enums
  - Use constants for API namespace and base paths
  - Improve separation of concerns in route handlers
- **Reference**: `/plugins/elementor-css/modules/global-classes/global-classes-rest-api.php`
- **Benefit**: Consistent code style across modules, better error handling, improved maintainability

### **Visual Debugger**
- **Feature**: Visual CSS conversion debugger
- **Benefit**: Easier troubleshooting of property mapping
- **Implementation**: Browser extension or admin panel

### **Mapper Generator**
- **Feature**: Auto-generate property mappers from atomic widget schemas
- **Benefit**: Faster development of new property support
- **Implementation**: CLI tool or admin interface

### **Performance Optimizations**
- **Caching**: Property conversion result caching
- **Lazy Loading**: On-demand mapper loading
- **Batch Processing**: Improved batch conversion performance

---

## 📚 **Documentation**

### **Complete API Documentation**
- **Property Mapper API**: Full documentation of mapper interface
- **Atomic Widget Integration**: Guide for new atomic widget types
- **Testing Guide**: How to write property type tests

### **Migration Guides**
- **Legacy to V4**: Complete migration documentation
- **Custom Property Support**: Guide for adding custom properties

---

## 🧪 **Testing Infrastructure**

### **Automated Visual Testing**
- **Feature**: Screenshot comparison testing
- **Benefit**: Catch visual regressions automatically
- **Implementation**: Playwright visual testing

### **Property Fuzzing**
- **Feature**: Automated testing with random CSS values
- **Benefit**: Find edge cases and improve robustness
- **Implementation**: Property value generators

---

## 📊 **Analytics & Monitoring**

### **Conversion Success Tracking**
- **Feature**: Track property conversion success rates
- **Benefit**: Identify problematic properties in production
- **Implementation**: Analytics dashboard

### **Performance Monitoring**
- **Feature**: Monitor conversion performance in production
- **Benefit**: Identify performance bottlenecks
- **Implementation**: APM integration

---

## 🔧 **Architecture Improvements**

### **Plugin Architecture**
- **Feature**: Pluggable property mapper system
- **Benefit**: Third-party property mapper extensions
- **Implementation**: Mapper registry with plugin support

### **Microservice Architecture**
- **Feature**: Separate CSS conversion service
- **Benefit**: Scalability and independent deployment
- **Implementation**: REST API service

---

## 📅 **Roadmap**

### **Phase 1: Polish (Q4 2025)**
- Complete box-shadow implementation
- Add border-width keywords
- Fix remaining edge cases

### **Phase 2: Advanced Features (Q1 2026)**
- CSS Grid support (pending atomic widgets)
- Advanced transforms
- Visual debugger

### **Phase 3: Developer Experience (Q2 2026)**
- Mapper generator
- Complete API documentation
- Migration guides

### **Phase 4: Scale & Monitor (Q3 2026)**
- Performance optimizations
- Analytics dashboard
- Plugin architecture

---

**Note**: This document tracks future enhancements and is not part of the current implementation scope. Items here should be prioritized based on user needs and atomic widget capabilities.
