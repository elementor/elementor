# Atomic Heading — Basic E2E Test Plan

## Business logic summary
- User value: Users can create and customize heading elements with rich typography and styling options
- Core behaviors: Add heading widget, edit content, change heading level, apply styling, save/publish changes
- Constraints/invariants: Heading must have content, valid HTML heading tags (H1-H6), proper semantic markup
- Dependencies: Elementor editor, Atomic Elements Alpha feature enabled
- Risks: Styling conflicts, responsive behavior, accessibility compliance

## Scope
- In: Adding Atomic heading widget, editing content and basic styling, saving/publishing
- Out: Advanced effects, complex layouts, custom CSS, responsive breakpoints

## E2E scenarios (6)

### TC-001 — Add Atomic heading widget with default content
- Preconditions: Elementor editor open, Atomic Elements Alpha section available
- Steps:
  1) (Editor) Click "Heading" widget in Atomic Elements Alpha section
  2) (Editor) Verify widget is added with default text "This is a title"
  3) (Editor) Verify default H2 tag is selected
  4) (Save/Publish) Save the page
  5) (Frontend) View published page
- Expected (assertions):
  - Editor computed style: Heading displays with default styling
  - Frontend computed style: Heading renders as H2 with default font and size
  - Persists after reload: Heading content and tag remain unchanged
- Screenshots: Frontend heading display
- Priority: High
- Status: Planned

### TC-002 — Edit heading content and change heading level
- Preconditions: Atomic heading widget added to page
- Steps:
  1) (Editor) Change title text to "Custom Heading Text"
  2) (Editor) Change tag from H2 to H1
  3) (Editor) Verify heading updates in preview
  4) (Save/Publish) Save the page
  5) (Frontend) View published page
- Expected (assertions):
  - Editor computed style: Heading shows new text and H1 tag
  - Frontend computed style: Heading renders as H1 with larger default size
  - Persists after reload: New content and tag level are preserved
- Screenshots: Frontend H1 heading display
- Priority: High
- Status: Planned

### TC-003 — Apply basic typography styling
- Preconditions: Atomic heading widget added with custom text
- Steps:
  1) (Editor) Open Style tab > Typography section
  2) (Editor) Change font size to 48px
  3) (Editor) Set text color to #FF0000 (red)
  4) (Editor) Set text align to Center
  5) (Editor) Set font weight to Bold
  6) (Save/Publish) Save the page
  7) (Frontend) View published page
- Expected (assertions):
  - Editor computed style: Heading displays with 48px red centered bold text
  - Frontend computed style: CSS properties match editor settings
  - Persists after reload: All typography settings are preserved
- Screenshots: Frontend styled heading
- Priority: High
- Status: Planned

### TC-004 — Apply advanced typography options
- Preconditions: Atomic heading widget with basic styling applied
- Steps:
  1) (Editor) Open Style tab > Typography section
  2) (Editor) Click "Show more" to expand typography options
  3) (Editor) Set line height to 1.5
  4) (Editor) Set letter spacing to 2px
  5) (Editor) Set text transform to Uppercase
  6) (Editor) Set font style to Italic
  7) (Save/Publish) Save the page
  8) (Frontend) View published page
- Expected (assertions):
  - Editor computed style: Heading displays with expanded line height, letter spacing, uppercase text, and italic style
  - Frontend computed style: All advanced typography properties are applied correctly
  - Persists after reload: Advanced typography settings are maintained
- Screenshots: Frontend advanced typography heading
- Priority: Medium
- Status: Planned

### TC-005 — Apply background and border styling
- Preconditions: Atomic heading widget with typography styling
- Steps:
  1) (Editor) Open Style tab > Background section
  2) (Editor) Set background color to #F0F0F0 (light gray)
  3) (Editor) Open Style tab > Border section
  4) (Editor) Set border radius to 8px
  5) (Editor) Add border with 2px solid #333333
  6) (Save/Publish) Save the page
  7) (Frontend) View published page
- Expected (assertions):
  - Editor computed style: Heading displays with light gray background, rounded corners, and border
  - Frontend computed style: Background, border radius, and border properties are applied
  - Persists after reload: Background and border styling is preserved
- Screenshots: Frontend heading with background and border
- Priority: Medium
- Status: Planned

### TC-006 — Add link to heading
- Preconditions: Atomic heading widget added to page
- Steps:
  1) (Editor) Open General tab > Settings section
  2) (Editor) Click "Toggle link" button
  3) (Editor) Enter URL "https://example.com" in link field
  4) (Editor) Set link to open in new tab
  5) (Save/Publish) Save the page
  6) (Frontend) View published page and click heading link
- Expected (assertions):
  - Editor computed style: Heading appears as clickable link
  - Frontend computed style: Heading renders as link with proper styling
  - Persists after reload: Link functionality and target settings are maintained
  - Link behavior: Clicking opens example.com in new tab
- Screenshots: Frontend clickable heading link
- Priority: Medium
- Status: Planned

## Mapping to code
- [x] TC-001 → `tests/playwright/sanity/modules/atomic-heading/basic.test.ts` (helpers: editor-page.ts) ✅ **COMPLETED**
- [x] TC-002 → `tests/playwright/sanity/modules/atomic-heading/basic.test.ts` (helpers: editor-page.ts) ✅ **COMPLETED**
- [ ] TC-003 → `tests/playwright/sanity/modules/atomic-heading/basic.test.ts` (helpers: editor-page.ts)
- [ ] TC-004 → `tests/playwright/sanity/modules/atomic-heading/basic.test.ts` (helpers: editor-page.ts)
- [ ] TC-005 → `tests/playwright/sanity/modules/atomic-heading/basic.test.ts` (helpers: editor-page.ts)
- [ ] TC-006 → `tests/playwright/sanity/modules/atomic-heading/basic.test.ts` (helpers: editor-page.ts)
