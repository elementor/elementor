# PRD: Body Background Import for Page Conversion

## Overview

When we import a page, we are not able to set the site settings, and import the body styling, such as the page background-color.

Study how we can do this.

Main focus: background.

Afterwards:
body padding
body margin
etc.

Use import from obox as example, use plugins/elementor-css/modules/css-converter/docs/page-testing/done/0-0---variables.md for reference.

I have created a sample page with background styling, see: http://elementor.local:10003/wp-admin/post.php?post=60879&action=elementor.

Note: this styling is still v3. There is no v4/atomic approach for this (yet).

---

## Discovery Questions - Please Answer Inline

### 1. CURRENT STATE & BEHAVIOR

#### Q1.1: Current Import Behavior
When a user imports a page with body background styling, what currently happens? Does it get:
- Ignored completely?
- Extracted but not applied?
- Applied somewhere incorrectly?

**Answer:** Ignored completely or extracted but not applied. Please study.

---

#### Q1.2: Sample Page Details
What does the sample page at `http://elementor.local:10003/wp-admin/post.php?post=60879&action=elementor` currently show? Can you describe:
- What body background is set?
- How was it set (page settings, site settings, or custom CSS)?
- Does it show in the editor and/or frontend?

**Answer:** You can study it in the browser. The page has body background, margin and padding in the page settings. It shows both in the editor and frontend.

---

#### Q1.3: Obox Example Reference
In the reference obox example (0-0---variables.md), what body styling was present and how should it have been handled?

**Answer:** No body stylign was applied. I added this reference, so that you can see which endpoint and payload to use.

---

### 2. SCOPE & REQUIREMENTS

#### Q2.1: Priority Order & Phases
You mentioned "Main focus: background" then "Afterwards: body padding, body margin, etc." Should this PRD cover:
- ONLY background (Phase 1)?
- Background + padding/margin (Full scope)?
- Background + all body properties?

**Answer:** background, padding and margin

---

#### Q2.2: Background Properties Scope
For `background`, which sub-properties are in scope?
- `background-color` only?
- `background-image` + all background-* properties?
- Gradients (`linear-gradient`, `radial-gradient`)?
- Multiple backgrounds?

**Answer:** Everything supported by the page settings. > Note: we haven't supported background-image yet. Possibly we should add this to planning / future.md.

---

#### Q2.3: Other Body Properties
Beyond background, which body properties should eventually be supported?
- Layout: `padding`, `margin`, `width`, `max-width`
- Typography: `font-family`, `font-size`, `line-height`, `color`
- Box model: `border`, `box-sizing`
- All CSS properties?

**Answer:** some styles we should add in the typography settings. others should go to the custom css body styling. Let's add this to planning / future.md.

---

#### Q2.4: HTML Element Scope
Should we handle styling for:
- `body` only?
- `body` + `html`?
- `body`, `html`, and `:root`?

**Answer:** Use your recommendation. My assumption body + html. I don't think we can use :root for background-color styling, unless it is a css variable.

---

### 3. TECHNICAL ARCHITECTURE

#### Q3.1: Storage Location
Where should body background be saved in Elementor?
- Option A: Page Settings (`_elementor_page_settings` meta key with `background_*` properties)?
- Option B: Site Settings/Kit (global `body_background`)?
- Option C: Both (page settings override kit settings)?
- Option D: Custom solution?

**Answer:** Inside page settings. Use the edit_url that we have created as reference.

---

#### Q3.2: v3 vs v4 Architecture
You noted "this styling is still v3. There is no v4/atomic approach for this (yet)":
- Should we use the existing v3 page settings system?
- Do we need to wait for v4/atomic body styling?
- Should we build a temporary v3 solution that can migrate to v4 later?
- What's the timeline for v4 body styling support?

**Answer:** Implement with current v3 page settings. V4 is still an unknown. We shouldn't wait for that.

---

#### Q3.3: Elementor API to Use
Which Elementor API should be used to set page background?
- Direct post meta update (`update_post_meta`)?
- Elementor's settings manager (`\Elementor\Core\Settings\Page\Manager`)?
- Document settings API (`$document->update_settings()`)?
- Something else?

**Answer:** Follow existing infra as much as possible. Follow best practices. Use what you would recommend.

---

#### Q3.4: CSS Processor Integration Point
Where in the conversion flow should body styles be extracted and applied?
- During CSS parsing (in `unified-css-processor.php`)?
- After widget creation (in `unified-widget-conversion-service.php`)?
- In a separate post-processing step?
- In the route handler (`atomic-widgets-route.php`)?

**Answer:** process css during css parsing as a separate processor. Apply to the page after the page was created. I am not sure where and how we create the page.

---

### 4. USER EXPERIENCE

#### Q4.1: Import Behavior & Conflicts
When importing a page with body background, what should happen if:
- The page already has Elementor background settings?
- The theme has default body styling?
- Multiple CSS sources have conflicting body backgrounds?

**Answer:** The pages are new, so we wont have existing styling. Ignore the theme. Multiple CSS sources: use a specificity calculator, as we do for all styling.

---

#### Q4.2: User Control Options
Should users be able to:
- Preview the body background before importing?
- Choose to skip body background import?
- Override imported body background after import?
- See a diff between original and imported background?

**Answer:** No. Import as it without any user intervention.

---

#### Q4.3: Editor Experience
After import, should the body background be:
- Immediately visible in the Elementor editor?
- Visible in the preview panel?
- Editable through Page Settings?
- Shown with a notice/indicator that it was imported?

**Answer:** It should be editable through Page Settings. That is all. It should follow Elementor practice.

---

#### Q4.4: Conflict Resolution Strategy
How should we handle conflicts between:
- Page-level body styling vs. site-level body styling?
- Imported body background vs. Hello Theme defaults?
- Imported body background vs. existing page settings?

**Answer:** No conclict handling.

---

### 5. EDGE CASES & VALIDATION

#### Q5.1: Complex Background Values
How should we handle:
- `background: url(...), linear-gradient(...), #fff;` (multiple backgrounds)?
- `background: rgba(255, 0, 0, 0.5);` (with transparency)?
- `background: var(--custom-color);` (CSS variables)?
- `background: inherit;` or `background: initial;`?

**Answer:** Map possible styling to Elementor page background options.

---

#### Q5.2: Responsive/Media Queries
Should body background respect responsive breakpoints?
```css
body { background: white; }
@media (max-width: 768px) { 
  body { background: black; } 
}
```

**Answer:** Ignore responsiveness for now. Add to planning / future.md.

---

#### Q5.3: CSS Specificity Handling
How do we handle:
- `body { background: red; }` (element selector)
- `body.home { background: blue; }` (class selector)
- `#page { background: green; }` (if body has ID)
- Inline style: `<body style="background: purple;">`

**Answer:** Same specificity handling as all css.

---

#### Q5.4: Invalid/Missing Values
What should happen if:
- No body background is found in the source?
- The background value is invalid CSS?
- The background image URL is broken?
- The body element doesn't exist in HTML?

**Answer:** Ignore.

---

### 6. IMPLEMENTATION APPROACH

#### Q6.1: Code Reuse Opportunities
Can we reuse existing code from:
- The reset styles handling work (PRD-FIX-RESET-STYLES.md)?
- Element selector to widget mapping (`get_html_element_to_atomic_widget_mapping`)?
- The CSS parsing processor?

**Answer:** You can use all docs, but compare to the current implementation, as docs might be dated.

---

#### Q6.2: Testing Strategy
What tests are needed?
- Playwright E2E tests for visual verification?
- PHPUnit tests for background extraction logic?
- Both?
- Should we test in both editor and frontend?

**Answer:** Playwright for editor and frontend.

---

#### Q6.3: Backward Compatibility
Do we need to support:
- Pages imported before this feature?
- Pages that manually set body background?
- Migration path from old to new approach?

**Answer:** No support.

---

#### Q6.4: Performance Considerations
Are there performance considerations for:
- Large background images?
- Multiple CSS sources?
- Real-time preview updates?

**Answer:** No.

---

### 7. SUCCESS CRITERIA

#### Q7.1: Accuracy Target
What % visual match is acceptable?
- 100% exact match (including pixel-perfect backgrounds)?
- 95% match (close enough visually)?
- What's acceptable deviation?

**Answer:** 95% match.

---

#### Q7.2: Test Coverage
How many test cases are needed?
- Simple solid color background?
- Gradient background?
- Image background?
- Multiple backgrounds?
- All of the above?

**Answer:** simple, gradient. Image background isn't supported yet.

---

#### Q7.3: Success Metrics
How do we measure success?
- All Playwright tests pass?
- Visual regression tests pass?
- User feedback?
- Code review approval?

**Answer:** Playwright tests pass.

---

### 8. DEPENDENCIES & CONSTRAINTS

#### Q8.1: Elementor Core Dependencies
Do we have any dependencies on:
- Elementor core version (minimum version required)?
- Specific Elementor features or APIs?
- Pending Elementor changes?

**Answer:** No.

---

#### Q8.2: Environment Constraints
What are the constraints for:
- WordPress version support?
- PHP version requirements?
- Browser compatibility?

**Answer:** No.

---

#### Q8.3: Theme Compatibility
Should this work with:
- Hello Theme only?
- Any Elementor-compatible theme?
- Themes with existing body background styling?

**Answer:** Hello theme only.

---

#### Q8.4: External Resources Handling
How do we handle:
- External background images (different domain)?
- Data URIs (inline images)?
- CORS issues?
- HTTPS/HTTP mixed content?

**Answer:** Not applicable.

---

### 9. OUT OF SCOPE

#### Q9.1: Explicit Exclusions
Should the following be explicitly excluded from this PRD?
- Site-wide settings (Kit settings)?
- Template-level settings?
- Theme customizer integration?
- Advanced background effects (parallax, video, etc.)?

**Answer:** Exclude.

---

### 10. FUTURE CONSIDERATIONS

#### Q10.1: v4 Migration Path
When atomic/v4 body styling becomes available:
- Will this need a complete rewrite?
- Can we design for forward compatibility?
- Should we document a migration path now?

**Answer:** Not applicable.

---

#### Q10.2: Feature Extensions
What future features might build on this?
- Full page settings import?
- Theme settings import?
- Global styles import?
- Style library/templates?

**Answer:** Not applicable.

---

### 11. ADDITIONAL CONTEXT

#### Q11.1: Existing Issues/Requests
Are there any existing issues, bug reports, or user requests related to this feature?

**Answer:** No

---

#### Q11.2: Timeline & Deadline
What's the expected timeline/deadline for this feature?

**Answer:** [YOUR ANSWER HERE]

---

#### Q11.3: Competitive Analysis
Are there any similar features in competing products we should reference?

**Answer:** [YOUR ANSWER HERE]

---

#### Q11.4: Documentation Requirements
What level of documentation is needed (user docs, developer docs, inline comments)?

**Answer:** [YOUR ANSWER HERE]

---

#### Q11.5: Feature Flag
Should this feature be behind a feature flag initially?

**Answer:** [YOUR ANSWER HERE]

---

## Next Steps

Once all questions are answered, I will create the comprehensive PRD document with:
- Executive Summary
- Problem Statement
- Technical Specification
- Implementation Plan
- Test Plan
- Success Criteria
