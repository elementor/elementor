 1) tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:43:6 › Font-Family Property Exclusion › Simple Font-Family Properties - Completely Filtered Out 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('p').filter({ hasText: /Testing font-family exclusion/i })
    Expected string: "1.5"
    Received string: "24px"
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('p').filter({ hasText: /Testing font-family exclusion/i })
        9 × locator resolved to <p class="" draggable="true">↵⇆⇆⇆⇆⇆⇆⇆⇆⇆⇆Testing font-family exclusion with oth…</p>
          - unexpected value "24px"


      83 |              await expect( paragraph ).toHaveCSS( 'color', 'rgb(51, 51, 51)' ); // #333333
      84 |              await expect( paragraph ).toHaveCSS( 'font-size', '16px' );
    > 85 |              await expect( paragraph ).toHaveCSS( 'line-height', '1.5' );
         |                                        ^
      86 |
      87 |              // Font-family should NOT be applied from our CSS (should use browser/theme default)
      88 |              // We don't test for a specific font-family value since it should be excluded
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:85:29

    Error Context: test-results/modules-css-converter-font-7b9f9-s---Completely-Filtered-Out/error-context.md

    attachment #2: trace (application/zip) ───────
    test-results/modules-css-converter-font-7b9f9-s---Completely-Filtered-Out/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-font-7b9f9-s---Completely-Filtered-Out/trace.zip

    ──────────────────────────────────────────────

  2) tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:92:6 › Font-Family Property Exclusion › Font-Family with CSS Variables - Variables Excluded 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('p').filter({ hasText: /Testing font-family with CSS variables/i })
    Expected string: "rgb(0, 124, 186)"
    Received string: "rgb(243, 186, 253)"
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('p').filter({ hasText: /Testing font-family with CSS variables/i })
        9 × locator resolved to <p class="" draggable="true">↵⇆⇆⇆⇆⇆⇆⇆⇆⇆⇆Testing font-family with CSS variables…</p>
          - unexpected value "rgb(243, 186, 253)"


      125 |
      126 |             // Color CSS variable should work (not excluded)
    > 127 |             await expect( paragraph ).toHaveCSS( 'color', 'rgb(0, 124, 186)' ); // --primary-color
          |                                       ^
      128 | 
      129 |             // Font-weight should work (not excluded)
      130 |             await expect( paragraph ).toHaveCSS( 'font-weight', '700' ); // bold
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:127:29

    Error Context: test-results/modules-css-converter-font-19195-iables---Variables-Excluded/error-context.md

    attachment #2: trace (application/zip) ───────
    test-results/modules-css-converter-font-19195-iables---Variables-Excluded/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-font-19195-iables---Variables-Excluded/trace.zip

    ──────────────────────────────────────────────

  3) tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:199:6 › Font-Family Property Exclusion › Font Shorthand Properties - Font-Family Part Excluded 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('p').filter({ hasText: /Testing font shorthand property/i }).locator('..')
    Expected string: "15px"
    Received string: "0px"
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('p').filter({ hasText: /Testing font shorthand property/i }).locator('..')
        9 × locator resolved to <div data-atomic="" data-model-cid="c923" data-element_type="widget" data-widget_type="e-paragraph.default" data-id="21595fe7-7d28-4104-9c31-605b0263f7d6" class="elementor-element elementor-element-edit-mode elementor-element-21595fe7-7d28-4104-9c31-605b0263f7d6 elementor-element--toggle-edit-tools elementor-widget elementor-widget-e-paragraph">…</div>
          - unexpected value "0px"


      243 | 
      244 |             const shorthandContainer = shorthandParagraph.locator( '..' );
    > 245 |             await expect( shorthandContainer ).toHaveCSS( 'margin', '15px' );
          |                                                ^
      246 |
      247 |             // Test individual font properties
      248 |             const individualParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing individual font properties/i } );
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:245:38

    Error Context: test-results/modules-css-converter-font-d2394---Font-Family-Part-Excluded/error-context.md

    attachment #2: trace (application/zip) ───────
    test-results/modules-css-converter-font-d2394---Font-Family-Part-Excluded/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-font-d2394---Font-Family-Part-Excluded/trace.zip

    ──────────────────────────────────────────────

  4) tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:347:6 › Font-Family Property Exclusion › Complex Font-Family Declarations - All Variations Excluded 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('p').filter({ hasText: /Testing complex font-family declarations/i })
    Expected string: "underline"
    Received string: "none"
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('p').filter({ hasText: /Testing complex font-family declarations/i })
        9 × locator resolved to <p class="" draggable="true">↵⇆⇆⇆⇆⇆⇆⇆⇆⇆⇆Testing complex font-family declaratio…</p>
          - unexpected value "none"


      390 |             await expect( paragraph ).toHaveCSS( 'font-size', '18px' );
      391 |             await expect( paragraph ).toHaveCSS( 'font-weight', '600' );
    > 392 |             await expect( paragraph ).toHaveCSS( 'text-decoration-line', 'underline' );
          |                                       ^
      393 | 
      394 |             const container = paragraph.locator( '..' );
      395 |             await expect( container ).toHaveCSS( 'background-color', 'rgb(236, 240, 241)' ); // #ecf0f1
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:392:29

    Error Context: test-results/modules-css-converter-font-70a9e-s---All-Variations-Excluded/error-context.md

    attachment #2: trace (application/zip) ───────
    test-results/modules-css-converter-font-70a9e-s---All-Variations-Excluded/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-font-70a9e-s---All-Variations-Excluded/trace.zip

    ──────────────────────────────────────────────

  5) tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:402:6 › Font-Family Property Exclusion › Font-Family Mixed with Important Properties - Exclusion Preserved 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('p').filter({ hasText: /Testing font-family with important/i }).locator('..')
    Expected string: "rgb(243, 156, 18)"
    Received string: "rgba(0, 0, 0, 0)"
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('p').filter({ hasText: /Testing font-family with important/i }).locator('..')
        9 × locator resolved to <div data-atomic="" data-model-cid="c894" data-element_type="widget" data-widget_type="e-paragraph.default" data-id="c171dea7-0bec-459b-9dde-5ac3a849c09b" class="elementor-element elementor-element-edit-mode elementor-element-c171dea7-0bec-459b-9dde-5ac3a849c09b elementor-element--toggle-edit-tools elementor-widget elementor-widget-e-paragraph">…</div>
          - unexpected value "rgba(0, 0, 0, 0)"


      437 |
      438 |             const container = paragraph.locator( '..' );
    > 439 |             await expect( container ).toHaveCSS( 'background-color', 'rgb(243, 156, 18)' ); // #f39c12
          |                                       ^
      440 |
      441 |             // Font-family should be excluded even with !important
      442 |     } );
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:439:29

    Error Context: test-results/modules-css-converter-font-31a6f-rties---Exclusion-Preserved/error-context.md

    attachment #2: trace (application/zip) ───────
    test-results/modules-css-converter-font-31a6f-rties---Exclusion-Preserved/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-font-31a6f-rties---Exclusion-Preserved/trace.zip

    ──────────────────────────────────────────────

  6) tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:444:6 › Font-Family Property Exclusion › Font-Family Only CSS - Conversion Succeeds with No Applied Styles 

    Error: expect.toBeVisible: Error: strict mode violation: locator('p').filter({ hasText: /Element with only font-family CSS/i }) resolved to 2 elements:
        1) <p class="" draggable="true">↵⇆⇆⇆⇆⇆⇆⇆⇆⇆⇆Element with only font-family CSS↵⇆⇆⇆⇆…</p> aka getByText('Element with only font-family CSS', { exact: true })
        2) <p class="" draggable="true">↵⇆⇆⇆⇆⇆⇆⇆⇆⇆⇆Another element with only font-family …</p> aka getByText('Another element with only')

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('p').filter({ hasText: /Element with only font-family CSS/i })


      477 |             // Elements should still be created and visible
      478 |             const firstParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Element with only font-family CSS/i } );
    > 479 |             await expect( firstParagraph ).toBeVisible();
          |                                            ^
      480 |
      481 |             const secondParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Another element with only font-family CSS/i } );
      482 |             await expect( secondParagraph ).toBeVisible();
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:479:34

    Error Context: test-results/modules-css-converter-font-01520-eeds-with-No-Applied-Styles/error-context.md

    attachment #2: trace (application/zip) ───────
    test-results/modules-css-converter-font-01520-eeds-with-No-Applied-Styles/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-font-01520-eeds-with-No-Applied-Styles/trace.zip

    ──────────────────────────────────────────────

  7) tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:488:6 › Font-Family Property Exclusion › Font-Family in Compound Selectors - Properly Excluded 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('h2').filter({ hasText: /Header with compound selector/i })
    Expected string: "28px"
    Received string: "32px"
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('h2').filter({ hasText: /Header with compound selector/i })
        9 × locator resolved to <h2 class="" draggable="true">↵⇆⇆⇆Header with compound selector↵⇆⇆</h2>
          - unexpected value "32px"


      525 |             await expect( header ).toBeVisible();
      526 |             await expect( header ).toHaveCSS( 'color', 'rgb(155, 89, 182)' ); // #9b59b6
    > 527 |             await expect( header ).toHaveCSS( 'font-size', '28px' );
          |                                    ^
      528 |
      529 |             // Test compound selector paragraph
      530 |             const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Article content with compound selector/i } );
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:527:26

    Error Context: test-results/modules-css-converter-font-e073c-lectors---Properly-Excluded/error-context.md

    attachment #2: trace (application/zip) ───────
    test-results/modules-css-converter-font-e073c-lectors---Properly-Excluded/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-font-e073c-lectors---Properly-Excluded/trace.zip

    ──────────────────────────────────────────────

  7 failed
    tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:43:6 › Font-Family Property Exclusion › Simple Font-Family Properties - Completely Filtered Out 
    tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:92:6 › Font-Family Property Exclusion › Font-Family with CSS Variables - Variables Excluded 
    tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:199:6 › Font-Family Property Exclusion › Font Shorthand Properties - Font-Family Part Excluded 
    tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:347:6 › Font-Family Property Exclusion › Complex Font-Family Declarations - All Variations Excluded 
    tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:402:6 › Font-Family Property Exclusion › Font-Family Mixed with Important Properties - Exclusion Preserved 
    tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:444:6 › Font-Family Property Exclusion › Font-Family Only CSS - Conversion Succeeds with No Applied Styles 
    tests/playwright/sanity/modules/css-converter/font-family-exclusion/font-family-exclusion.test.ts:488:6 › Font-Family Property Exclusion › Font-Family in Compound Selectors - Properly Excluded 
  2 passed (1.6m)
janvanvlastuin1981@heinv-JG3Q04XX6F modules % 
