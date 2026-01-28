> elementor@3.34.0 test:playwright
> playwright test -c tests/playwright/playwright.config.ts ./css-converter/url-imports/flat-classes-url-import.test.ts


Running 8 tests using 1 worker

  ✓  1 …D selector styles directly to widgets (3.6s)
  ✓  2 …l classes creation from flat classes (253ms)
  ✓  3 … from elements with multiple classes (224ms)
  ✓  4 …ld apply ALL advanced text properties (3.4s)
  ✘  5 …hould apply ALL box-shadow properties (9.0s)
  ✘  6 … - should apply ALL border properties (9.4s)
     7 … should apply ALL link colo
  ✘  7 … apply ALL link colors and      8 …EST - should apply ALL back
  ✓  8 …hould apply ALL background properties (3.7s)

  1) tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:225:6 › HTML Import with Flat Classes @url-imports › COMPREHENSIVE STYLING TEST - should apply ALL box-shadow properties › CRITICAL: Verify button box-shadow from .button-primary class 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('a').filter({ hasText: 'Get Started Now' })
    Expected string: "rgba(52, 152, 219, 0.3) 4px 6px 0px 0px"
    Received: <element(s) not found>
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('a').filter({ hasText: 'Get Started Now' })


      290 |
      291 |                     // THIS SHOULD PASS if box-shadow mapper is working
    > 292 |                     await expect( primaryButton ).toHaveCSS( 'box-shadow', 'rgba(52, 152, 219, 0.3) 4px 6px 0px 0px' );
          |                                                   ^
      293 |             } );
      294 |     } );
      295 |
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:292:34
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:285:14

    Error Context: test-results/modules-css-converter-url--656e5-y-ALL-box-shadow-properties/error-context.md

    attachment #2: trace (application/zip) ─────────
    test-results/modules-css-converter-url--656e5-y-ALL-box-shadow-properties/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-url--656e5-y-ALL-box-shadow-properties/trace.zip

    ────────────────────────────────────────────────

  2) tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:296:6 › HTML Import with Flat Classes @url-imports › COMPREHENSIVE STYLING TEST - should apply ALL border properties › CRITICAL: Verify border-bottom from .link-item class 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('.elementor-element.link-item').first()
    Expected string: "1px solid rgb(233, 236, 239)"
    Received: <element(s) not found>
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('.elementor-element.link-item').first()


      358 |                     // THIS SHOULD PASS if border-bottom mapper is working
      359 |                     // #e9ecef converts to rgb(233, 236, 239)
    > 360 |                     await expect( linkItem ).toHaveCSS( 'border-bottom', '1px solid rgb(233, 236, 239)' );
          |                                              ^
      361 |             } );
      362 |     } );
      363 |
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:360:29
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:351:14

    Error Context: test-results/modules-css-converter-url--6f1f6-apply-ALL-border-properties/error-context.md

    attachment #2: trace (application/zip) ─────────
    test-results/modules-css-converter-url--6f1f6-apply-ALL-border-properties/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-url--6f1f6-apply-ALL-border-properties/trace.zip

    ────────────────────────────────────────────────

  3) tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:364:6 › HTML Import with Flat Classes @url-imports › COMPREHENSIVE STYLING TEST - should apply ALL link colors and typography › CRITICAL: Verify .link-secondary color and typography 

    Error: Timed out 5000ms waiting for expect(locator).toHaveCSS(expected)

    Locator: locator('a').filter({ hasText: 'Link Two' })
    Expected string: "rgb(22, 160, 133)"
    Received: <element(s) not found>
    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for locator('a').filter({ hasText: 'Link Two' })


      391 |
      392 |                     // THIS SHOULD PASS if color mappers are working
    > 393 |                     await expect( linkSecondary ).toHaveCSS( 'color', 'rgb(22, 160, 133)' ); // #16a085
          |                                                   ^
      394 |                     await expect( linkSecondary ).toHaveCSS( 'font-size', '17px' );
      395 |                     await expect( linkSecondary ).toHaveCSS( 'font-weight', '500' );
      396 |             } );
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:393:34
        at /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:385:3

    Error Context: test-results/modules-css-converter-url--270b1--link-colors-and-typography/error-context.md

    attachment #2: trace (application/zip) ─────────
    test-results/modules-css-converter-url--270b1--link-colors-and-typography/trace.zip
    Usage:

        npx playwright show-trace test-results/modules-css-converter-url--270b1--link-colors-and-typography/trace.zip

    ────────────────────────────────────────────────

  3 failed
    tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:225:6 › HTML Import with Flat Classes @url-imports › COMPREHENSIVE STYLING TEST - should apply ALL box-shadow properties 
    tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:296:6 › HTML Import with Flat Classes @url-imports › COMPREHENSIVE STYLING TEST - should apply ALL border properties 
    tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts:364:6 › HTML Import with Flat Classes @url-imports › COMPREHENSIVE STYLING TEST - should apply ALL link colors and typography 
  5 passed (58.1s)
janvanvlastuin1981@heinv-JG3Q04XX6F modules % 
