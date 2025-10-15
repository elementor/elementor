With the CSS class conversions we will have problems with the following aspects: 

- IDs
e.g. How do we handle this in our editor?
.brown {
        color: brown;
}

#element {
        color: red;
}
<div class="brown" id="element">content</div>

Idea: apply the ID as styling to the element itself.

- nested selectors
.first-class .second-class {
        color: pink;
}

Elementor Global Class only allow for .second-class or .first-class.

Suggestion: can we possibly use a library that will flatten all CSS into flat styling?

In that case, we would need to dynamically do that for all styles that apply on a page (and ideally on website level).
And we also need to consider breakpoints.

Is this possible?
Research if there are tools or libraries to flatten css like this.
Ask as many questions as possible.
Think of difficult scenarios.
Could we flatten this CSS?

- multiple classes
How to handle: 
.first-class {
        color: pink;
}

.first-class .second-class {
        color: red;
}

.first-class .orange-class {
        color: blue;
}

.other-class {
        color: black;
}


<div class="first-class">text</div>
<div class="first-class"><div class="second-class">text</div></div>
<div class="first-class .other-class"><div class="second-class">text</div></div>
<div class="first-class"><div class="orange-class">text</div></div>

---

## CRITICAL ANALYSIS: CSS FLATTENING APPROACH

### The Real Problem

The document presents a fundamentally complex challenge that goes beyond simple CSS "flattening." The core issues are:

1. **CSS Specificity Resolution**: IDs (#element) override classes (.brown) regardless of source order
2. **Complex Selector Matching**: Nested selectors (.first-class .second-class) require DOM context to resolve
3. **Cascading & Inheritance**: Multiple CSS rules can apply to the same element with different specificity
4. **Dynamic Context Dependency**: The same class can have different computed styles depending on DOM structure

### Problems with the Flattening Approach

#### 1. **Context Loss & Maintainability Crisis**
**Critical Issue**: CSS flattening would require destroying the original CSS structure and author intent.

```css
/* Original meaningful CSS */
.card .title { font-size: 18px; }
.card.featured .title { font-size: 24px; }
.sidebar .card .title { font-size: 16px; }

/* Flattened result loses all context */
.generated-class-1 { font-size: 18px; }
.generated-class-2 { font-size: 24px; }
.generated-class-3 { font-size: 16px; }
```

**Problems**:
- **Impossible to maintain**: No relationship between generated classes and original CSS
- **Breaks responsive design**: Media queries become meaningless without context
- **Destroys design systems**: Component-based styling is lost

#### 2. **Exponential Complexity Problem**
**Critical Issue**: Number of required flattened classes grows exponentially with DOM complexity.

```css
/* Simple CSS */
.a { color: red; }
.b { color: blue; }
.c { background: white; }
.a .b { font-size: 14px; }
.a .c { padding: 10px; }
.b .c { margin: 5px; }

/* Required flattened classes for all combinations */
.a-only { color: red; }
.b-only { color: blue; }  
.c-only { background: white; }
.a-b { color: blue; font-size: 14px; }
.a-c { color: red; background: white; padding: 10px; }
.b-c { color: blue; background: white; margin: 5px; }
.a-b-c { color: blue; background: white; font-size: 14px; padding: 10px; margin: 5px; }
```

**Result**: For n classes with dependencies, you could need up to 2^n flattened classes.

#### 3. **Impossible DOM Dependency Resolution**
**Critical Issue**: CSS flattening requires knowing the exact DOM structure at conversion time.

```html
<!-- Same CSS class, different computed styles based on DOM position -->
<div class="container">
  <p class="text">Style A</p> <!-- Inherits container styles -->
</div>
<aside>
  <p class="text">Style B</p> <!-- Different inheritance chain -->
</aside>
<div class="container dark-theme">
  <p class="text">Style C</p> <!-- Contextual modifications -->
</div>
```

**Impossibility**: You cannot flatten CSS without knowing every possible DOM structure where it will be used.

#### 4. **Performance Paradox**
**Critical Issue**: Flattening creates more CSS, not less.

- **CSS Size Explosion**: Flattened classes multiply CSS size dramatically
- **Specificity Wars**: Generated classes need increasingly high specificity
- **Cache Inefficiency**: Every DOM change requires new flattened classes
- **Runtime Overhead**: Computing flattened classes is more expensive than CSS cascade

### Alternative Approaches Analysis

#### Alternative 1: **Selective Class Extraction** (RECOMMENDED)
**Approach**: Only convert standalone, non-contextual CSS classes to Global Classes.

```css
/* CONVERTIBLE - Simple standalone classes */
.button-primary { background: blue; color: white; padding: 12px 24px; }
.text-center { text-align: center; }
.hidden { display: none; }

/* SKIP - Context-dependent classes */
.header .nav-item { /* Requires .header context */ }
#main .content { /* ID-dependent */ }  
.card:hover { /* Pseudo-state */ }
```

**Pros**:
- ✅ Preserves maintainability
- ✅ Manageable scope  
- ✅ Clear conversion rules
- ✅ Compatible with existing workflows

**Cons**:
- ❌ Limited conversion scope
- ❌ Cannot handle complex selectors

#### Alternative 2: **CSS-in-JS Style Objects**
**Approach**: Convert CSS to JavaScript objects that compute styles dynamically.

```javascript
// Convert complex CSS to runtime computation
const styles = {
  getTextStyle: (element) => {
    const context = element.closest('.container');
    const theme = element.closest('[data-theme]');
    return {
      fontSize: context?.classList.contains('large') ? '18px' : '16px',
      color: theme?.dataset.theme === 'dark' ? '#fff' : '#000'
    };
  }
};
```

**Pros**:
- ✅ Handles dynamic context
- ✅ Maintains logical relationships
- ✅ Runtime flexibility

**Cons**:
- ❌ Requires JavaScript runtime
- ❌ Not compatible with Global Classes system
- ❌ Performance overhead

#### Alternative 3: **CSS Variables + Context Classes** (HYBRID APPROACH)
**Approach**: Convert CSS properties to variables, use context classes for selectors.

```css
/* Original */
.card .title { font-size: 18px; color: #333; }
.featured-card .title { font-size: 24px; color: #000; }

/* Converted */
:root {
  --title-font-size: 18px;
  --title-color: #333;
  --featured-title-font-size: 24px;
  --featured-title-color: #000;
}

/* Global Classes */
.title-style { 
  font-size: var(--title-font-size); 
  color: var(--title-color); 
}
.featured-title-style { 
  font-size: var(--featured-title-font-size); 
  color: var(--featured-title-color); 
}
```

**Pros**:
- ✅ Separates values from context
- ✅ Maintains design tokens
- ✅ Partial automation possible

**Cons**:
- ❌ Still requires manual context mapping
- ❌ Complex selector logic remains

#### Alternative 4: **AI-Assisted Semantic Analysis** (FUTURE)
**Approach**: Use AI to understand CSS intent and generate semantic Global Classes.

```css
/* Original */
.hero-section .call-to-action.primary { 
  background: linear-gradient(45deg, #007cba, #005a8b);
  font-weight: 600;
  padding: 16px 32px;
}

/* AI-Generated Global Class */
.hero-cta-primary {
  /* Semantically equivalent styles */
  background: var(--primary-gradient);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) var(--spacing-lg);
}
```

### Questions for Consideration

#### **Technical Feasibility**
1. **How would you handle CSS specificity conflicts?** The browser's CSS engine is optimized for this - recreating it is essentially building a new CSS engine.

2. **What about dynamic content?** Modern websites have dynamic classes, inline styles, and JavaScript-modified styles. How would flattening handle this?

3. **How do you maintain the relationship to source CSS?** If someone needs to modify the original CSS, how do they find the corresponding flattened classes?

#### **Performance & Scalability**
4. **CSS Size Impact**: If a typical stylesheet has 100 classes with dependencies, how many flattened classes would you generate? The math is exponential.

5. **Memory Usage**: Would storing all possible class combinations in memory be feasible for large applications?

6. **Update Complexity**: When source CSS changes, how do you efficiently update only affected flattened classes?

#### **Maintenance & Workflow**
7. **Developer Experience**: How would developers debug CSS issues when looking at generated class names instead of semantic ones?

8. **Design System Integration**: How would this work with component libraries and design systems that rely on CSS context?

9. **Version Control**: How do you track changes in a system where CSS modifications generate completely different class names?

### **Recommended Approach: Pragmatic Selective Conversion**

Based on critical analysis, I recommend **Alternative 1: Selective Class Extraction** with these principles:

1. **Convert Only Standalone Classes**: Focus on utility classes, component base styles, and context-independent rules
2. **Document Conversion Limits**: Clearly communicate what CSS patterns are not supported
3. **Provide Migration Path**: Offer tools to refactor complex CSS into convertible patterns
4. **Hybrid Strategy**: Use CSS variables for values, manual context mapping for complex selectors

### **Critical Questions for Decision Making**

**Before proceeding with any CSS flattening approach, answer these questions:**

1. **What percentage of target CSS actually needs flattening?** Most CSS could be refactored to use simpler selectors.

2. **Is the complexity worth the benefit?** Would it be easier to educate users about writing Global-Classes-compatible CSS?

3. **What is the maintenance cost?** Who will debug issues when automatically-generated classes break?

4. **How does this fit long-term strategy?** Will this create technical debt that limits future development?

The CSS flattening approach, while theoretically interesting, presents far more complexity and risk than benefit. A selective, rules-based conversion strategy would be far more practical and maintainable.

---

## DETAILED ANALYSIS OF ORIGINAL SCENARIOS

### Scenario 1: ID vs Class Specificity Problem

**Original Problem:**
```css
.brown { color: brown; }
#element { color: red; }
```
```html
<div class="brown" id="element">content</div>
```

**Analysis**: This demonstrates CSS specificity hierarchy where IDs (specificity 100) always override classes (specificity 10). The text will be red, not brown.

**Flattening Problems:**
- **Impossible to Resolve**: Without knowing which elements have IDs, you cannot determine final computed styles
- **Dynamic ID Assignment**: IDs can be added/removed via JavaScript, making static flattening impossible
- **Specificity Conflicts**: Flattened classes would need !important declarations, creating maintenance nightmares

**Alternative Solutions:**
1. **Document the Limitation**: Clearly state that Global Classes cannot handle ID-dependent styling
2. **Refactor Recommendation**: Suggest using only class-based selectors for convertible CSS
3. **Validation Rules**: Detect and warn about ID-dependent styles during conversion

### Scenario 2: Nested Selector Complexity

**Original Problem:**
```css
.first-class .second-class { color: pink; }
```

**Analysis**: This requires DOM context - `.second-class` only gets `color: pink` when inside `.first-class`.

**Why Flattening Fails:**
```html
<!-- Same class, different contexts, different results -->
<div class="first-class">
  <p class="second-class">Pink text</p> <!-- Matches nested selector -->
</div>
<div class="other-container">
  <p class="second-class">Default text</p> <!-- No nested selector match -->
</div>
```

**Mathematical Explosion**: For n possible parent contexts and m child classes, you need n×m flattened combinations.

### Scenario 3: Multi-Class Dependencies

**Original Complex Example:**
```css
.first-class { color: pink; }
.first-class .second-class { color: red; }
.first-class .orange-class { color: blue; }
.other-class { color: black; }
```

**Flattening Requirements Analysis:**
To handle all possible combinations, you would need:
- `.first-class-only` → `color: pink`
- `.first-class-with-second-class` → `color: red` 
- `.first-class-with-orange-class` → `color: blue`
- `.other-class-only` → `color: black`
- `.first-class-other-class-with-second-class` → `color: red` (most specific wins)
- And many more combinations...

**Problem Scale**: For just 4 classes in this example, you could need 16+ flattened variants to cover all DOM contexts.

---

## RESEARCH FINDINGS: CSS FLATTENING TOOLS & LIBRARIES

### Existing CSS Flattening Tools

#### 1. **css-flatten (npm package)**
- **Purpose**: Converts nested SCSS/CSS to flat CSS syntax
- **Limitation**: Only handles syntax flattening, not selector specificity resolution
- **Not Suitable**: Doesn't solve our context dependency problem

#### 2. **PostCSS Ecosystem**
**Relevant Plugins:**
- `postcss-nested`: Handles nested syntax but doesn't resolve specificity
- `postcss-custom-properties`: Manages CSS variables but not selector complexity
- `postcss-specificity`: Can calculate specificity but doesn't flatten selectors

**Analysis**: PostCSS tools are syntax transformers, not semantic CSS resolvers.

#### 3. **CSS-in-JS Solutions**
**Tools Researched:**
- **Styled Components**: Scopes styles to components, avoiding global conflicts
- **Emotion**: Runtime CSS generation with dynamic scoping
- **CSS Modules**: Localized CSS class names

**Finding**: These tools avoid the flattening problem by preventing global CSS conflicts entirely.

#### 4. **Utility-First Frameworks**
**Tools Analyzed:**
- **Tailwind CSS**: Pre-defines atomic utility classes
- **Tachyons**: Functional CSS approach
- **Bootstrap Utilities**: Component + utility hybrid

**Insight**: These frameworks succeed by avoiding complex selectors entirely, not by flattening them.

### Browser-Based CSS Resolution Tools

#### 1. **getComputedStyle() API**
- **Capability**: Can extract final computed styles from DOM elements
- **Limitation**: Requires actual DOM elements and browser environment
- **Use Case**: Could be used for runtime style extraction, not static conversion

#### 2. **CSS Specificity Calculators**
**JavaScript Libraries:**
- `specificity` npm package: Calculates CSS specificity values
- Custom specificity calculators in various CSS tools

**Finding**: These calculate specificity but don't resolve which rules apply in different contexts.

#### 3. **Puppeteer/Playwright Style Extraction**
**Capability**: Can run JavaScript in browser environment to extract computed styles
**Process**: Load HTML with CSS → Extract computed styles for each element → Generate atomic classes
**Problems**: 
- Requires full DOM rendering
- Performance intensive
- Still doesn't solve maintenance issues

---

## COMPREHENSIVE QUESTION ANALYSIS

### Questions from Original Document

#### **"Is this possible? Research if there are tools or libraries to flatten css like this."**

**Answer**: Tools exist for syntax flattening (nested → flat syntax) but **no practical tools exist for semantic CSS flattening** (resolving complex selectors into atomic classes) because:

1. **Computational Complexity**: The problem is NP-complete in general case
2. **Context Dependency**: Requires knowledge of all possible DOM structures
3. **Dynamic Nature**: Modern web apps have dynamic classes and styles
4. **Maintenance Impossibility**: Generated classes lose connection to original intent

#### **"And we also need to consider breakpoints."**

**Answer**: Media queries make flattening exponentially more complex:

```css
/* Original */
.container { width: 100%; }
.container .item { font-size: 16px; }

@media (max-width: 768px) {
  .container { width: 90%; }
  .container .item { font-size: 14px; }
}

/* Required flattened classes */
.container-desktop { width: 100%; }
.container-tablet { width: 90%; }
.container-item-desktop { width: 100%; font-size: 16px; }
.container-item-tablet { width: 90%; font-size: 14px; }
```

**Problem**: Each breakpoint multiplies the number of required flattened classes.

### Additional Critical Questions Identified

#### **Technical Implementation**
1. **How would you detect all possible DOM contexts?** Static analysis cannot predict all HTML structures where CSS will be applied.

2. **How do you handle CSS inheritance?** Properties like `color` and `font-family` cascade down the DOM tree - flattening would need to compute all inheritance chains.

3. **What about CSS animations and transitions?** These depend on state changes that cannot be predicted statically.

4. **How do you handle dynamic classes added by JavaScript?** Modern applications frequently modify classes at runtime.

#### **Performance & Scalability**
5. **Storage requirements**: A typical website might have 200+ classes. With dependencies, flattened combinations could exceed 10,000+ classes.

6. **CSS parsing performance**: Browsers would need to parse enormous flattened stylesheets instead of efficient nested ones.

7. **Network impact**: Flattened CSS files would be significantly larger than original nested CSS.

8. **Cache invalidation**: Any change to source CSS would invalidate large numbers of generated classes.

#### **Developer Experience**
9. **Debugging complexity**: How would developers debug styles when looking at `.generated-class-247` instead of `.card .title`?

10. **Version control**: Git diffs would show changes to hundreds of generated classes for simple CSS modifications.

11. **Team collaboration**: How would designers and developers communicate about styles using generated class names?

12. **Documentation**: How would you document what each generated class represents?

#### **Integration & Workflow**
13. **Build process**: How long would CSS flattening take for large applications? Would it block development workflows?

14. **Hot reloading**: How would development servers handle real-time CSS changes with flattening?

15. **Testing**: How would you test that flattened CSS produces identical results to original CSS?

16. **Rollback strategy**: If flattened CSS breaks something, how would you quickly revert?

---

## DIFFICULT SCENARIOS ANALYSIS

### Scenario 1: CSS Grid with Named Lines

```css
.grid-container {
  display: grid;
  grid-template-columns: [sidebar-start] 250px [sidebar-end main-start] 1fr [main-end];
}

.grid-container .sidebar { grid-column: sidebar; }
.grid-container .main { grid-column: main; }
```

**Flattening Challenge**: Grid named lines create implicit relationships that cannot be flattened without losing grid functionality.

### Scenario 2: CSS Custom Properties with calc()

```css
:root { --base-size: 16px; }
.container { --multiplier: 1.2; }
.container .text { 
  font-size: calc(var(--base-size) * var(--multiplier)); 
}
```

**Flattening Challenge**: CSS variables can have different values in different contexts, making calc() impossible to resolve statically.

### Scenario 3: Pseudo-Element Dependencies

```css
.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
}

.featured-card::before {
  background: linear-gradient(45deg, red, blue);
}
```

**Flattening Challenge**: Pseudo-elements cannot be directly styled with classes - they require selector context.

### Scenario 4: CSS Counters

```css
.article { counter-reset: section; }
.article h2::before { 
  counter-increment: section;
  content: "Section " counter(section) ": ";
}
```

**Flattening Challenge**: CSS counters depend on document order and cannot be flattened into atomic classes.

### Scenario 5: Container Queries (Modern CSS)

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .card { font-size: 18px; }
}
```

**Flattening Challenge**: Container queries depend on parent element dimensions, not viewport size - impossible to resolve without DOM context.

---

## ALTERNATIVE APPROACHES DEEP DIVE

### Approach 1: Selective Class Extraction (Detailed Implementation)

**Classification Rules:**
```css
/* ✅ SIMPLE STANDALONE - Convert to Global Classes */
.btn-primary { background: blue; color: white; }
.text-center { text-align: center; }
.mt-4 { margin-top: 1rem; }

/* ⚠️ SINGLE PARENT DEPENDENCY - Convert with Context Prefix */
.card .title { font-size: 18px; } → .card-title { font-size: 18px; }
.form .input { border: 1px solid #ccc; } → .form-input { border: 1px solid #ccc; }

/* ❌ COMPLEX DEPENDENCIES - Skip with Warning */
.sidebar .card .title { /* Too complex */ }
.container > .item:nth-child(2n) { /* Pseudo-selectors */ }
#main .content { /* ID dependency */ }
```

**Implementation Strategy:**
1. **CSS AST Analysis**: Parse CSS and build dependency tree
2. **Complexity Scoring**: Assign complexity scores to selectors
3. **Automatic Conversion**: Handle score ≤ threshold
4. **Manual Review Queue**: Present score > threshold for user decision
5. **Documentation Generation**: Create mapping of original → converted classes

### Approach 2: CSS Variables + Context Classes (Hybrid)

**Value Extraction Strategy:**
```css
/* Original Complex CSS */
.hero-section .call-to-action.primary {
  background: linear-gradient(45deg, #007cba, #005a8b);
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 8px;
}

.sidebar .call-to-action.primary {
  background: #007cba;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 4px;
}

/* Extracted CSS Variables */
:root {
  --cta-primary-gradient: linear-gradient(45deg, #007cba, #005a8b);
  --cta-primary-solid: #007cba;
  --font-weight-semibold: 600;
  --font-weight-medium: 500;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --radius-sm: 4px;
  --radius-md: 8px;
}

/* Generated Global Classes */
.cta-primary-hero {
  background: var(--cta-primary-gradient);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-radius: var(--radius-md);
}

.cta-primary-sidebar {
  background: var(--cta-primary-solid);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-sm);
}
```

**Benefits:**
- ✅ Preserves design tokens through CSS variables
- ✅ Enables theme customization
- ✅ Reduces code duplication
- ✅ Maintains some semantic meaning

**Limitations:**
- ❌ Still requires manual context identification
- ❌ Cannot handle all complex selectors
- ❌ Increases Global Classes count

### Approach 3: Component-Based Conversion

**Strategy**: Convert CSS to component-specific Global Classes
```css
/* Original */
.product-card { /* Base styles */ }
.product-card .image { /* Image styles */ }
.product-card .title { /* Title styles */ }
.product-card .price { /* Price styles */ }
.product-card:hover .price { /* Hover state */ }

/* Component Global Classes */
.product-card-base { /* Base styles */ }
.product-card-image { /* Image styles */ }
.product-card-title { /* Title styles */ }
.product-card-price { /* Price styles */ }
.product-card-price-hover { /* Hover state as separate class */ }
```

**Application Strategy**: Apply classes to specific elements instead of relying on nested selectors.

### Approach 4: CSS-to-Atomic Conversion Tool

**Concept**: Build a tool that generates atomic classes from existing CSS
```css
/* Input CSS */
.button {
  background: #007cba;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 600;
}

/* Generated Atomic Classes */
.bg-primary { background: #007cba; }
.text-white { color: white; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.rounded { border-radius: 4px; }
.font-semibold { font-weight: 600; }

/* Usage Documentation */
/* .button → Apply: bg-primary text-white px-6 py-3 rounded font-semibold */
```

---

## FINAL RECOMMENDATIONS & CONCLUSIONS

### Summary of Analysis

**CSS Flattening is NOT a viable approach** for the following definitive reasons:

1. **Mathematical Impossibility**: Exponential complexity makes it impractical for real-world CSS
2. **Technical Limitations**: Cannot resolve context dependencies without full DOM knowledge
3. **Maintenance Nightmare**: Generated classes lose semantic meaning and become unmaintainable
4. **Performance Degradation**: Creates larger, less efficient CSS than original nested styles
5. **Developer Experience Catastrophe**: Debugging and collaboration become nearly impossible

### Recommended Implementation Strategy

**Phase 1: Selective Class Extraction (Immediate)**
- Focus on utility classes and simple component styles
- Build classification system for convertible vs non-convertible CSS
- Create clear documentation about limitations

**Phase 2: Hybrid CSS Variables Approach (Short-term)**
- Extract design tokens to CSS variables
- Generate context-aware Global Classes for common patterns
- Provide refactoring tools for developers

**Phase 3: Component-Based Conversion (Medium-term)**
- Build tools to identify CSS component patterns
- Generate Global Classes for complete component styling
- Integrate with design system workflows

**Phase 4: AI-Assisted Semantic Analysis (Long-term)**
- Research ML approaches to understand CSS intent
- Generate semantically meaningful Global Classes
- Provide intelligent refactoring suggestions

### Decision Framework

**For any CSS conversion approach, evaluate:**
1. **Complexity vs Benefit Ratio**: Does the solution create more problems than it solves?
2. **Maintainability Impact**: Can developers understand and modify the system long-term?
3. **Performance Implications**: Does it improve or degrade actual performance?
4. **Integration Effort**: How much existing workflow disruption does it cause?
5. **Scalability Concerns**: Does it work for large, complex applications?

### Final Answer to "Is CSS Flattening a Good Approach?"

**Definitively NO.** CSS flattening is not a good approach for converting complex CSS to Global Classes. Instead, focus on:

1. **Selective conversion** of appropriate CSS patterns
2. **Education and tooling** to help developers write Global-Classes-compatible CSS
3. **Hybrid approaches** that preserve semantic meaning while enabling conversion
4. **Clear boundaries** about what CSS patterns are and aren't convertible

The goal should be enabling developers to migrate to Global Classes workflow, not automatically converting all existing CSS regardless of complexity.