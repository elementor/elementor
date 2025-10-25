# Pseudo-Selectors Documentation Index

## 📖 Complete Documentation Suite

This index guides you through the comprehensive pseudo-selector handling research and PRD. Three documents provide different levels of detail for different audiences.

---

## 📄 Document Overview

### 1. **0-PSEUDO-ELEMENTS.md** - Research Report
**📊 Type**: Research & Analysis  
**⏱️ Read Time**: 30 minutes  
**👥 Audience**: Developers, Architects, Technical Leads  
**🎯 Purpose**: Understand current implementation and justify design decisions

**Contents**:
- Current implementation status (what's supported now)
- Atomic widgets architecture & state support
- Research findings for 3 main questions:
  - Q1: Can atomic widgets support pseudo-elements?
  - Q2: How to handle pseudo-classes?
  - Q3: How to handle combined pseudo-selectors?
- Architectural decision points
- Workaround strategies for users
- Direct widget application strategy for non-supported types

**Key Takeaway**: Understand that state pseudo-classes (`:hover`, `:focus`) are fully supported, while pseudo-elements and form states need fallback strategies.

---

### 2. **PSEUDO-SELECTORS-HANDLING-PRD.md** - Product Requirements
**📊 Type**: Complete PRD  
**⏱️ Read Time**: 1-2 hours (or reference as needed)  
**👥 Audience**: Project managers, Lead developers, QA  
**🎯 Purpose**: Define complete implementation scope and phases

**Contents**:
- Executive summary
- Problem statement with business impact
- Solution overview with multi-level fallback strategy
- 6 Functional Requirements (FR1-FR6)
- 6 Technical Requirements (TR1-TR6)
- 6 Implementation Phases with timelines
- Test cases (TC1-TC6)
- Success criteria and rollback plan
- Dependencies and future enhancements
- Appendices with reference tables

**Key Takeaway**: This is the implementation blueprint. Everything needed to build the feature.

---

### 3. **PSEUDO-QUICK-REFERENCE.md** - Developer Handbook
**📊 Type**: Quick Reference  
**⏱️ Read Time**: 15 minutes (or keep bookmarked)  
**👥 Audience**: All developers (especially those implementing)  
**🎯 Purpose**: Quick lookup and decision-making guide

**Contents**:
- Quick decision matrix for selector types
- Implementation quick start (4 phases in brief)
- Support matrix by pseudo-type (tables)
- Testing checklist
- Code templates (copy-paste ready)
- Performance considerations
- FAQ
- Learning path

**Key Takeaway**: "What do I do with this selector?" - answered in seconds.

---

## 🗺️ How to Use This Documentation

### 👶 I'm New to This Feature
1. Start with **PSEUDO-QUICK-REFERENCE.md** - Get the overview
2. Read **0-PSEUDO-ELEMENTS.md** - Understand the research
3. Reference **PSEUDO-SELECTORS-HANDLING-PRD.md** as needed

### 🏗️ I'm Implementing This Feature
1. Read **0-PSEUDO-ELEMENTS.md** - Understand current state
2. Study **PSEUDO-SELECTORS-HANDLING-PRD.md** Phases 1-3
3. Keep **PSEUDO-QUICK-REFERENCE.md** open for code templates
4. Follow test cases in PRD section 6

### 👔 I'm Managing This Feature
1. Review **PSEUDO-SELECTORS-HANDLING-PRD.md** sections 2-5
2. Check Implementation Phases (6 phases, 8-10 days estimated)
3. Review Success Criteria (section 7)
4. Monitor using Test Cases (section 6)

### 🐛 I'm Debugging an Issue
1. Check **PSEUDO-QUICK-REFERENCE.md** FAQ section
2. Look at support matrix to confirm expected behavior
3. Reference code templates if stuck
4. Check full PRD for edge cases

### ❓ I Have a Question
1. Check **PSEUDO-QUICK-REFERENCE.md** FAQ first
2. Search **0-PSEUDO-ELEMENTS.md** for research notes
3. Check PRD appendices for reference tables
4. Look at test cases for examples

---

## 🎯 Key Concepts

### Support Levels

**✅ FULL** - Fully supported  
`.button:hover { color: blue; }` → Creates state variant automatically

**⚠️ PARTIAL** - Partially supported  
`.text::first-letter { color: red; }` → Base styles applied, pseudo-element ignored, warning logged

**❌ NONE** - Not supported  
`input:checked { background: green; }` → Skipped entirely, warning logged

### Fallback Strategy

When selector is not fully supported:

| Scenario | Action | Code Location |
|----------|--------|---|
| State pseudo-class (`:hover`, `:focus`) | Create `meta['state']` variant | Phase 2 |
| Pseudo-element (`::before`, `::after`) | Apply base styles + track in meta | Phase 3 |
| Unsupported (`input:checked`, `:nth-child()`) | Skip + log warning | Phase 4 |
| Nested with pseudo (`.a > .b .c:hover`) | Flatten + preserve pseudo + state | Phase 5 |

### Direct Widget Application

For non-supported types, apply styles **directly to widget** instead of creating global classes:

```php
// Direct application for unsupported types
$widget['styles']['element-id']['variants'][] = [
    'meta' => [
        'state' => null,
        'pseudo_element' => '::first-letter',  // Tracking only
        'source' => 'direct_pseudo_fallback',
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'red'],
    ],
];
```

---

## 📋 Implementation Roadmap

```
Phase 1: Selector Classification & Detection (1-2 days)
├── Create pseudo-selector-classifier.php
├── Implement classification logic
└── Add unit tests
    ↓
Phase 2: State Pseudo-Class Handling (1-2 days)
├── Extract state from pseudo-class
├── Create atomic variants with meta['state']
└── Add state variant tracking
    ↓
Phase 3: Pseudo-Element Fallback (1 day)
├── Extract pseudo-element from selector
├── Apply base styles to widgets
└── Store pseudo-element reference
    ↓
Phase 4: Unsupported Selector Skipping (1 day)
├── Identify unsupported selectors
├── Skip with clear warning
└── Track skipped count
    ↓
Phase 5: Flattening Integration (2-3 days)
├── Extract pseudo before flattening
├── Flatten class chain
├── Re-attach pseudo after flattening
└── Test multi-pseudo selectors
    ↓
Phase 6: Testing & Documentation (2-3 days)
├── Unit tests (85%+ coverage)
├── Integration tests
├── Playwright visual tests
└── Performance tests
```

**Total Estimated Duration**: 8-10 days

---

## 🧪 Testing Strategy

### Unit Tests (Phase 6)
- [ ] Pseudo extraction (all types)
- [ ] Classification logic (full/partial/none)
- [ ] State variant creation
- [ ] Base style application
- [ ] Unsupported selector skipping

### Integration Tests (Phase 6)
- [ ] Multiple pseudo-classes in one widget
- [ ] Nested selectors with pseudo
- [ ] CSS file with mixed pseudo-types
- [ ] Large CSS files (1000+ rules)

### Playwright Tests (Phase 6)
- [ ] Visual verification of state styles
- [ ] Pseudo-element base styles visible
- [ ] Nested flattened selectors rendered correctly

---

## 📊 Support Matrix Reference

### Supported with Full Integration

| Type | Pseudo | Example | Result |
|------|--------|---------|--------|
| State | `:hover` | `.btn:hover` | ✅ Creates state variant |
| State | `:focus` | `input:focus` | ✅ Creates state variant |
| State | `:active` | `.btn:active` | ✅ Creates state variant |
| State | `:visited` | `a:visited` | ✅ Creates state variant |

### Supported with Fallback (Partial)

| Type | Pseudo | Example | Result |
|------|--------|---------|--------|
| Element | `::before` | `.box::before` | ⚠️ Base styles + warning |
| Element | `::after` | `.box::after` | ⚠️ Base styles + warning |

### Not Supported (Skip)

| Type | Pseudo | Example | Reason |
|------|--------|---------|--------|
| Element | `::first-letter` | `.text::first-letter` | No atomic prop type |
| Structural | `:nth-child()` | `li:nth-child(2n)` | Requires DOM knowledge |
| Form | `:checked` | `input:checked` | Form state not tracked |
| Form | `:disabled` | `button:disabled` | Form state not tracked |
| Vendor | `:-webkit-*` | `:-webkit-scrollbar` | Vendor-specific |

---

## 🔗 File Relationships

```
0-PSEUDO-ELEMENTS.md (Research)
    ↓ References architecture & findings
    ↓
PSEUDO-SELECTORS-HANDLING-PRD.md (Implementation)
    ├─ Uses findings from research
    ├─ Defines technical requirements
    └─ References existing code patterns
        ↓
PSEUDO-QUICK-REFERENCE.md (Developer Guide)
    ├─ Simplifies PRD into quick tables
    ├─ Provides code templates
    └─ References both other docs
        ↓
INDEX-PSEUDO-SELECTORS.md (This File)
    └─ Ties all three together
```

---

## 📞 Common Questions

**Q: Where do I start if I want to implement this?**  
A: 1) Read PSEUDO-QUICK-REFERENCE.md, 2) Read 0-PSEUDO-ELEMENTS.md, 3) Follow PRD phases 1-2 first.

**Q: How much effort is this feature?**  
A: 8-10 days estimated, split across 6 phases of 1-3 days each.

**Q: What's the minimum viable implementation?**  
A: Phase 1-2 (Selector classification + State handling). That covers 90% of use cases.

**Q: What happens if I rush and skip testing?**  
A: Risk of missing edge cases, performance issues, user confusion about unsupported selectors.

**Q: Can this be merged incrementally?**  
A: Yes! Phases 1-2 are self-contained. Can merge after Phase 2 without Phase 3-5.

---

## 📚 Related Documentation

**Connected Features**:
- Pattern 4: Flatten Nested Classes (depends on this)
- CSS Property Conversion (used by this)
- Atomic Widget Architecture (foundation for this)

**Architecture Documents**:
- `unified-mapper/SOLUTION-INLINE-CSS-TO-ATOMIC-PROPS.md`
- `atomic-widgets/atomic-widgets-research.md`
- `unified-mapper/css-generation-architecture.md`

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-16 | Initial comprehensive documentation suite |

---

## ✅ Checklist Before Starting Implementation

- [ ] Read 0-PSEUDO-ELEMENTS.md completely
- [ ] Understood atomic widgets architecture
- [ ] Reviewed PSEUDO-SELECTORS-HANDLING-PRD.md sections 1-4
- [ ] Know the support matrix by heart
- [ ] Have access to code templates in PSEUDO-QUICK-REFERENCE.md
- [ ] Team agreed on implementation phases
- [ ] Testing strategy approved
- [ ] Timeline set (8-10 days)

---

**Next Steps**: Pick your document based on your role above and start reading! 🚀
