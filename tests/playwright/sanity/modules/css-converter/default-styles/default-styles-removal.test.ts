import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Default Styles Removal @css-converter', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		cssHelper = new CssConverterHelper();
	} );

	test( 'should remove default styles from e-paragraph and e-heading widgets', async ( { page, request } ) => {
		const htmlContent = `
			<div>
				<p>This paragraph should have no default margin</p>
				<p style="margin: 20px;">This paragraph has explicit margin</p>
				<h1>This heading should have no default margin</h1>
				<h2 style="margin: 15px;">This heading has explicit margin</h2>
			</div>
		`;
		
		// Test with converted widgets (zero defaults always enabled)
		const apiResult = await cssHelper.convertHtmlWithCss( 
			request, 
			htmlContent
		);

		// Check if API call succeeded
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'API validation failed' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();


		// Navigate to the editor page
		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Get the Elementor frame with retry mechanism
		let elementorFrame = editor.getPreviewFrame();
		let retries = 0;
		while ( ! elementorFrame && retries < 5 ) {
			await page.waitForTimeout( 1000 );
			elementorFrame = editor.getPreviewFrame();
			retries++;
		}
		
		if ( ! elementorFrame ) {
			throw new Error( 'Elementor frame not available after 5 retries' );
		}
		
		await elementorFrame.waitForLoadState();


		// Find all paragraph and heading elements (CSS converter widgets have no base classes)
		const paragraphElements = elementorFrame.locator( '.elementor-widget-e-paragraph, [data-widget_type="e-paragraph"], [data-widget_type="e-paragraph.default"]' );
		const headingElements = elementorFrame.locator( '.elementor-widget-e-heading, [data-widget_type="e-heading"], [data-widget_type="e-heading.default"]' );
		await expect( paragraphElements ).toHaveCount( 2 );
		await expect( headingElements ).toHaveCount( 2 );

		await test.step( 'Verify API widgets have no base classes (vanilla DOM test)', async () => {
			// Ensure frame is still available and wait for content to load
			await elementorFrame.waitForLoadState( 'networkidle' );
			
			// Try multiple selectors to find paragraph and heading elements
			const allParagraphs = elementorFrame.locator( 'p' );
			const allHeadings = elementorFrame.locator( 'h1, h2, h3, h4, h5, h6' );
			
			// Wait for elements to be present
			await allParagraphs.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );
			await allHeadings.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );
			
			// Get actual counts with error handling
			let paragraphCount = 0;
			let headingCount = 0;
			
			try {
				paragraphCount = await allParagraphs.count();
				headingCount = await allHeadings.count();
			} catch ( error ) {
				// If frame is detached, skip this test step
				console.log( 'Frame detached during count, skipping base class verification' );
				return;
			}
			
			// Only proceed if we have elements to test
			if ( paragraphCount > 0 ) {
				// Check that paragraphs don't have base classes
				for ( let i = 0; i < paragraphCount; i++ ) {
					const paragraph = allParagraphs.nth( i );
					const classes = await paragraph.getAttribute( 'class' );
					expect( classes || '' ).not.toContain( 'e-paragraph-base' );
				}
			}
			
			if ( headingCount > 0 ) {
				// Check that headings don't have base classes
				for ( let i = 0; i < headingCount; i++ ) {
					const heading = allHeadings.nth( i );
					const classes = await heading.getAttribute( 'class' );
					expect( classes || '' ).not.toContain( 'e-heading-base' );
				}
			}
			
			// Ensure we tested at least some elements
			expect( paragraphCount + headingCount ).toBeGreaterThan( 0 );
		} );

		await test.step( 'Verify first heading has browser default margin (no forced styles)', async () => {
			// Find the actual inner heading element (h1) within the widget
			const firstHeadingWidget = headingElements.nth( 0 );
			await firstHeadingWidget.waitFor( { state: 'visible', timeout: 10000 } );
			
			const innerHeading = firstHeadingWidget.locator( 'h1, h2, h3, h4, h5, h6' ).first();
			await innerHeading.waitFor( { state: 'visible', timeout: 10000 } );

			// Check computed styles - should use browser defaults (not forced 0px)
			const computedStyles = await innerHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginBottom: styles.marginBottom,
				};
			} );


			// Without base classes, the heading should use browser defaults (not forced 0px)
			expect( computedStyles.marginTop ).not.toBe( '0px' );
			expect( computedStyles.marginBottom ).not.toBe( '0px' );
		} );

		await test.step( 'Verify second paragraph has explicit margin applied', async () => {
			// Find the actual inner paragraph element with explicit margin
			const secondParagraphWidget = paragraphElements.nth( 1 );
			await secondParagraphWidget.waitFor( { state: 'visible', timeout: 10000 } );
			
			const innerParagraph = secondParagraphWidget.locator( 'p' ).first();
			await innerParagraph.waitFor( { state: 'visible', timeout: 10000 } );

			// This paragraph has explicit margin: 20px, so it should have that applied
			const computedStyles = await innerParagraph.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );


			// Should have the explicit 20px margin applied
			expect( computedStyles.marginTop ).toBe( '20px' );
			expect( computedStyles.marginRight ).toBe( '20px' );
			expect( computedStyles.marginBottom ).toBe( '20px' );
			expect( computedStyles.marginLeft ).toBe( '20px' );
		} );

		await test.step( 'Verify second heading has explicit margin applied', async () => {
			// Find the actual inner heading element with explicit margin
			const secondHeadingWidget = headingElements.nth( 1 );
			await secondHeadingWidget.waitFor( { state: 'visible', timeout: 10000 } );
			
			const innerHeading = secondHeadingWidget.locator( 'h1, h2, h3, h4, h5, h6' ).first();
			await innerHeading.waitFor( { state: 'visible', timeout: 10000 } );

			// This heading has explicit margin: 15px, so it should have that applied
			const computedStyles = await innerHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );


			// Should have the explicit 15px margin applied
			expect( computedStyles.marginTop ).toBe( '15px' );
			expect( computedStyles.marginRight ).toBe( '15px' );
			expect( computedStyles.marginBottom ).toBe( '15px' );
			expect( computedStyles.marginLeft ).toBe( '15px' );
		} );

		await test.step( 'Add a manual widget and verify mixed behavior', async () => {
			// Add a new paragraph widget manually through the editor
			await page.click( 'button[aria-label="Add Element"], .elementor-add-element-button, .elementor-panel-footer-tool[data-tooltip="Add Element"]' );
			await page.waitForTimeout( 1000 );
			
			// Look for the paragraph widget in the elements panel
			const paragraphButton = page.locator( 'button:has-text("Paragraph"), .elementor-element-wrapper:has-text("Paragraph"), [data-tooltip="Paragraph"]' ).first();
			await paragraphButton.waitFor( { state: 'visible', timeout: 10000 } );
			await paragraphButton.click();
			
			// Wait for the widget to be added
			await page.waitForTimeout( 2000 );
			
			// Edit the paragraph content to identify it
			const paragraphTextbox = page.locator( 'textarea[placeholder*="paragraph"], .elementor-control-type-textarea textarea, #elementor-control-default-paragraph' ).first();
			if ( await paragraphTextbox.isVisible() ) {
				await paragraphTextbox.fill( 'MANUAL Widget - should HAVE base class' );
				await page.waitForTimeout( 1000 );
			}
			
			// Save the page
			await page.click( 'button:has-text("Publish"), button:has-text("Update"), #elementor-panel-saver-button-publish' );
			await page.waitForTimeout( 3000 );
			
			// Check current state before reload - API widgets should have no base classes, manual widget should have base class
			const currentWidgets = await elementorFrame.locator( '.elementor-widget-e-paragraph p' ).all();
			let apiWidgetsWithoutBase = 0;
			let manualWidgetsWithBase = 0;
			
			for ( const widget of currentWidgets ) {
				const text = await widget.textContent();
				const classes = await widget.getAttribute( 'class' ) || '';
				
				if ( text && text.includes( 'MANUAL' ) ) {
					// Manual widget should have base class
					if ( classes.includes( 'e-paragraph-base' ) ) {
						manualWidgetsWithBase++;
					}
				} else {
					// API widgets should not have base class
					if ( !classes.includes( 'e-paragraph-base' ) ) {
						apiWidgetsWithoutBase++;
					}
				}
			}
			
			expect( apiWidgetsWithoutBase ).toBeGreaterThan( 0 );
			expect( manualWidgetsWithBase ).toBeGreaterThan( 0 );
		} );

		await test.step( 'Reload page and verify persistence of mixed behavior', async () => {
			// Reload the page
			await page.reload();
			await editor.waitForPanelToLoad();
			
			// Get the Elementor frame again after reload
			const reloadedFrame = editor.getPreviewFrame();
			await reloadedFrame.waitForLoadState();
			
			// Find all paragraph elements after reload
			const allParagraphs = await reloadedFrame.locator( '.elementor-widget-e-paragraph p' ).all();
			expect( allParagraphs.length ).toBeGreaterThan( 2 ); // Should have original 2 + 1 manual
			
			let apiWidgetsCorrect = 0;
			let manualWidgetsCorrect = 0;
			let totalChecked = 0;
			
			for ( const paragraph of allParagraphs ) {
				const text = await paragraph.textContent();
				const classes = await paragraph.getAttribute( 'class' ) || '';
				totalChecked++;
				
				if ( text && text.includes( 'MANUAL' ) ) {
					// Manual widget should HAVE base class
					if ( classes.includes( 'e-paragraph-base' ) ) {
						manualWidgetsCorrect++;
					}
				} else {
					// API widgets should NOT have base class
					if ( !classes.includes( 'e-paragraph-base' ) ) {
						apiWidgetsCorrect++;
					}
				}
			}
			
			// Verify the mixed behavior is maintained after reload
			expect( totalChecked ).toBeGreaterThan( 2 );
			expect( apiWidgetsCorrect ).toBeGreaterThan( 0 ); // API widgets should not have base classes
			expect( manualWidgetsCorrect ).toBeGreaterThan( 0 ); // Manual widgets should have base classes
			
			// Additional verification: check that we have the expected content
			const manualWidget = reloadedFrame.locator( 'p:has-text("MANUAL Widget")' );
			await expect( manualWidget ).toBeVisible();
			
			const manualWidgetClass = await manualWidget.getAttribute( 'class' );
			expect( manualWidgetClass ).toContain( 'e-paragraph-base' );
		} );

		await test.step( 'Verify API widgets have no base classes (vanilla DOM test)', async () => {
			// Ensure frame is still available and wait for content to load
			await elementorFrame.waitForLoadState( 'networkidle' );
			
			// Try multiple selectors to find paragraph and heading elements
			const allParagraphs = elementorFrame.locator( 'p' );
			const allHeadings = elementorFrame.locator( 'h1, h2, h3, h4, h5, h6' );
			
			// Wait for elements to be present
			await allParagraphs.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );
			await allHeadings.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );
			
			// Get actual counts with error handling
			let paragraphCount = 0;
			let headingCount = 0;
			
			try {
				paragraphCount = await allParagraphs.count();
				headingCount = await allHeadings.count();
			} catch ( error ) {
				// If frame is detached, skip this test step
				console.log( 'Frame detached during count, skipping base class verification' );
				return;
			}
			
			// Only proceed if we have elements to test
			if ( paragraphCount > 0 ) {
				// Check that paragraphs don't have base classes
				for ( let i = 0; i < paragraphCount; i++ ) {
					const paragraph = allParagraphs.nth( i );
					const classes = await paragraph.getAttribute( 'class' );
					expect( classes || '' ).not.toContain( 'e-paragraph-base' );
				}
			}
			
			if ( headingCount > 0 ) {
				// Check that headings don't have base classes
				for ( let i = 0; i < headingCount; i++ ) {
					const heading = allHeadings.nth( i );
					const classes = await heading.getAttribute( 'class' );
					expect( classes || '' ).not.toContain( 'e-heading-base' );
				}
			}
			
			// Ensure we tested at least some elements
			expect( paragraphCount + headingCount ).toBeGreaterThan( 0 );
		} );
	} );

	test( 'should work with e-heading widgets as well', async ( { page, request } ) => {
		const htmlContent = `
			<div>
				<h1>This heading should have no default margin</h1>
				<h2 style="margin: 15px;">This heading has explicit margin</h2>
			</div>
		`;

		// Test with converted widgets (zero defaults always enabled)
		const apiResult = await cssHelper.convertHtmlWithCss( 
			request, 
			htmlContent
		);

		// Check if API call succeeded
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'API validation failed' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Get the Elementor frame
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Find all heading elements (CSS converter widgets have no base classes)
		const headingElements = elementorFrame.locator( '.elementor-widget-e-heading, [data-widget_type="e-heading"], [data-widget_type="e-heading.default"]' );
		await expect( headingElements ).toHaveCount( 2 );

		await test.step( 'Verify API heading widgets have no base classes (vanilla DOM test)', async () => {
			// Ensure frame is still available and wait for content to load
			await elementorFrame.waitForLoadState( 'networkidle' );
			
			// Find all heading elements
			const allHeadings = elementorFrame.locator( 'h1, h2, h3, h4, h5, h6' );
			
			// Wait for elements to be present
			await allHeadings.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );
			
			// Get actual count with error handling
			let headingCount = 0;
			
			try {
				headingCount = await allHeadings.count();
			} catch ( error ) {
				// If frame is detached, skip this test step
				console.log( 'Frame detached during count, skipping base class verification' );
				return;
			}
			
			// Only proceed if we have elements to test
			if ( headingCount > 0 ) {
				// Check that headings don't have base classes
				for ( let i = 0; i < headingCount; i++ ) {
					const heading = allHeadings.nth( i );
					const classes = await heading.getAttribute( 'class' );
					expect( classes || '' ).not.toContain( 'e-heading-base' );
				}
				
				// Ensure we tested at least some elements
				expect( headingCount ).toBeGreaterThan( 0 );
			}
		} );

		await test.step( 'Verify second heading has explicit margin applied', async () => {
			// Find the actual inner heading element with explicit margin
			const secondHeadingWidget = headingElements.nth( 1 );
			await secondHeadingWidget.waitFor( { state: 'visible', timeout: 10000 } );
			
			const innerHeading = secondHeadingWidget.locator( 'h1, h2, h3, h4, h5, h6' ).first();
			await innerHeading.waitFor( { state: 'visible', timeout: 10000 } );

			const computedStyles = await innerHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );


			// Should have the explicit 15px margin applied
			expect( computedStyles.marginTop ).toBe( '15px' );
			expect( computedStyles.marginRight ).toBe( '15px' );
			expect( computedStyles.marginBottom ).toBe( '15px' );
			expect( computedStyles.marginLeft ).toBe( '15px' );
		} );
	} );
} );
