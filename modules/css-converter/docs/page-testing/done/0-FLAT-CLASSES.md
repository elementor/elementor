I would like the import of a page url into the the widget-convertor endpoint.

I would like you to create an html file with:
- header
- intro text
- a block with a few hyperlinks
- a banner with a title and two buttons

Styling: 
- some inline
- some in a style block
- and two separate css files

Style selectors: 
- only use 'flat' classes
- don't use nested classes

Try to import this page with the widget-converter endpoint.

Create all the tests inside plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports.

Ask as many questions as possible.

1. URL Import Endpoint Questions
A. Does URL import already exist? ✅ YES - The endpoint already supports type: 'url' parameter and fetches HTML + CSS
Should I focus on testing existing functionality, or do you want enhancements?

HVV: Existing.
Is the current URL import behavior what you expect?

HVV: Yes.
B. Where should the HTML file be served from?
Should I create a static HTML file in a specific plugin directory?
Create all files inside plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports.
Should it be served via WordPress (custom endpoint/page)? No. Pure html.
Should I use a local web server for testing? If necessary. But preferably just open the html file in the browser directly using the file path, as it is plain html and css.
Do you want the HTML file committed to the repository or is it test-only? Yes.
C. External CSS files - where should they live?
Same directory as the HTML file? You decide.
Separate CSS directory?
Should they be accessible via HTTP URLs? You decide.
Do you want relative or absolute URLs in the HTML? You decide.

2. HTML Structure Questions
A. Header component:
Just an <h1> tag or a full <header> with logo/nav? I am not sure if we have support for images and header already. For now let's stick to div instead of header, and let's not test images yet.
What text content should it have? Lorem ipsum.
What styles? (size, color, spacing, etc.) You decide. At random.
B. Intro text:
Single paragraph or multiple paragraphs? Lorem ipsum.
Any specific length or content requirements? You decide.
Which styles should be inline vs external? Both.
C. Hyperlinks block:
How many hyperlinks? (you said "a few") 10.
Should they be in a <nav>, <ul>, or just <div>? Div, p.
Real URLs or placeholder # links? Placeholders.
Hover styles via inline or external CSS? Let's not test :hover yet.
D. Banner with title + 2 buttons:
Is this a <section> with <h2> + buttons? Yes.
Should buttons be <a> or <button> elements? <a>
Button styles: colors, sizes, hover states? Yes, yes, but no :hover.
Banner background styling approach? Yes.
3. Styling Distribution Questions
A. What should be inline? You decide. At random.
Which specific elements get inline styles?
Example: colors inline, layout in stylesheets?
B. What should be in the <style> block? You decide.
Which components/properties?
Should this be in <head> or near the elements? You decide.
C. What should be in external CSS file 1? You decide.
Which components/aspects?
D. What should be in external CSS file 2? You decide.
Different components or complementary styles to file 1?
4. Flat Classes Questions
A. Naming convention:
BEM-like (.header__title, .button--primary)? 
Utility-like (.text-large, .color-blue)?
Semantic (.page-header, .intro-text)?
Your preference? You decide.
B. Class scope:
Each element gets its own class?
Can I use multiple classes on one element (.button .button-primary)? Yes please. I like that.
Or strictly one class per element?
C. Specificity:
Are ID selectors allowed (#header) or only classes? Yes.
Can I use element selectors for base styles (body { }, a { })? Not in this test.

A. Test Structure:
Should I create:
One comprehensive test file covering all aspects? Yes.
Multiple test files (one per styling method: inline, style block, external CSS)? No.
Separate files for different components (header test, banner test, etc.)? No.
B. What to test specifically:
Just verify the URL can be fetched and converted? 
Verify all styles are correctly extracted (inline + style block + external)? Most important.
Verify widgets are created correctly? Important.
Verify CSS property mappings? Important.
Visual regression (screenshots)? As well.
All of the above? All of the above.

C. Test assertions:
What should the test validate?
Should I check specific CSS properties on specific elements? Yes.
Should I verify widget types created? Yes.
Should I verify global classes are created correctly? Yes.
D. Helper methods:
Should I add URL-specific methods to helper.ts? Yes.
Current helper has convertHtmlWithCss, convertCssOnly - should I add convertFromUrl? Yes.
6. Scope & Priority Questions
A. What's the PRIMARY goal of this test? To ensure that page creation is working and the CSS is mapped correctly.
Test that URL import works at all?
Test that flat classes are handled correctly? 
Test that mixed styling sources (inline/block/external) are all processed?
Test a realistic page import scenario?
All of the above? All of the above.
B. Edge cases to cover:
Should I test error scenarios (404 URL, malformed HTML, etc.)? No.
Should I test CSS file that fails to load? No.
Should I test relative vs absolute URLs in CSS? No.
Or just happy path for now?
C. Complexity level:
Simple, minimal example?
Realistic, production-like page?
Multiple complexity levels in separate tests? I like that.
7. File Organization Questions
A. HTML + CSS files location:
Create in tests/playwright/resources/?
Create in tests/playwright/sample-data/?
Create in url-imports/fixtures/ subdirectory? Yes.
Serve from a different location entirely?
B. File naming:
flat-classes-test-page.html? Yes.
url-import-test.html?
Multiple files with descriptive names? Yes.
🎯 My Assumptions (Requiring Verification)
Assumptions I'm Making:
URL serving: I'm assuming you want a static HTML file that needs to be accessible via HTTP URL
Flat classes: I'm assuming "flat" means .class-name with no nesting (.parent .child)
Testing scope: I'm assuming you want comprehensive tests (URL fetch + CSS extraction + widget creation + visual verification)
CSS distribution: I'm assuming you want me to decide which styles go inline/block/external (but should YOU decide?) You decide.
Helper methods: I'm assuming I should add convertFromUrl method to the helper. Yes.
Test complexity: I'm assuming you want one comprehensive test file to start. Yes.
Which assumptions are correct? Which should I verify before proceeding?  Yes.