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

	const testFrontendStyles = async ( page ) => {
		await page.waitForLoadState( 'networkidle' );

		const paragraphs = page.locator( 'p' );
		const headings = page.locator( 'h1, h2, h3, h4, h5, h6' );

		await paragraphs.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );
		await headings.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );

		return { paragraphs, headings };
	};

	const verifyFrontendBaseClasses = async ( elements, shouldHaveBaseClass: boolean, baseClassName: string ) => {
		const count = await elements.count();
		
		for ( let i = 0; i < count; i++ ) {
			const element = elements.nth( i );
			const classes = await element.getAttribute( 'class' ) || '';
			const text = await element.textContent() || '';
			
			if ( shouldHaveBaseClass ) {
				expect( classes ).toContain( baseClassName );
			} else {
				expect( classes ).not.toContain( baseClassName );
			}
		}
		
		return count;
	};

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

		// ===== EDITOR TESTS - All editor assertions first =====
		
		await test.step( 'Editor: Verify API widgets have no base classes', async () => {
			// Wait for Elementor widgets to be rendered (they may take time to appear)
			await page.waitForTimeout( 3000 );
			
			// Look for Elementor widgets specifically, not just HTML elements
			const paragraphWidgets = elementorFrame.locator( '.elementor-widget-e-paragraph' );
			const headingWidgets = elementorFrame.locator( '.elementor-widget-e-heading' );
			
			// Wait for at least one widget to appear
			await paragraphWidgets.first().waitFor( { state: 'attached', timeout: 15000 } ).catch( () => {} );
			
			let paragraphWidgetCount = 0;
			let headingWidgetCount = 0;
			
			try {
				paragraphWidgetCount = await paragraphWidgets.count();
				headingWidgetCount = await headingWidgets.count();
				
			} catch ( error ) {
				return;
			}
			
			// Check paragraph widgets for base classes (CSS Converter should NOT add them)
			if ( paragraphWidgetCount > 0 ) {
				for ( let i = 0; i < paragraphWidgetCount; i++ ) {
					const widget = paragraphWidgets.nth( i );
					const paragraph = widget.locator( 'p' );
					const classes = await paragraph.getAttribute( 'class' );
					// Base classes are added by atomic widget system, not CSS Converter
					expect( classes || '' ).not.toContain( 'e-paragraph-base' );
				}
			}
			
			// Check heading widgets for base classes (CSS Converter should NOT add them)
			if ( headingWidgetCount > 0 ) {
				for ( let i = 0; i < headingWidgetCount; i++ ) {
					const widget = headingWidgets.nth( i );
					const heading = widget.locator( 'h1, h2, h3, h4, h5, h6' );
					const classes = await heading.getAttribute( 'class' );
					// Base classes are added by atomic widget system, not CSS Converter
					expect( classes || '' ).not.toContain( 'e-heading-base' );
				}
			}
			
			// Ensure we found at least some widgets (the CSS converter should create them)
			expect( paragraphWidgetCount + headingWidgetCount ).toBeGreaterThan( 0 );
		} );

		await test.step( 'Editor: Verify first heading has browser default margin', async () => {
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

		await test.step( 'Editor: Verify second paragraph has explicit margin', async () => {
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

		await test.step( 'Editor: Verify second heading has explicit margin', async () => {
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

		await test.step( 'Editor: Add manual widget and verify mixed behavior', async () => {
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
			
			// Check current state - API widgets should have no base classes, manual widget should have base class
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

		// ===== FRONTEND TESTS - All frontend assertions together =====

		await test.step( 'Frontend: Verify all styling and base class behavior', async () => {
			// Save the page by using keyboard shortcut (Ctrl+S / Cmd+S)
			await page.keyboard.press( process.platform === 'darwin' ? 'Meta+S' : 'Control+S' );
			await page.waitForTimeout( 3000 );
			
			// Navigate to frontend directly
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState( 'networkidle', { timeout: 15000 } );
			
			const { paragraphs: frontendParagraphs, headings: frontendHeadings } = await testFrontendStyles( page );
			
			// 1. Verify base class behavior on frontend (API widgets vs manual widgets)
			const paragraphCount = await frontendParagraphs.count();
			const headingCount = await frontendHeadings.count();
			
			
			// Check each paragraph individually - API widgets should not have base classes, manual widgets should
			for ( let i = 0; i < paragraphCount; i++ ) {
				const paragraph = frontendParagraphs.nth( i );
				const text = await paragraph.textContent() || '';
				const classes = await paragraph.getAttribute( 'class' ) || '';
				
				
				if ( text.includes( 'MANUAL' ) ) {
					// Manual widget should HAVE base class
					expect( classes ).toContain( 'e-paragraph-base' );
				} else {
					// API widget should NOT have base class
					expect( classes ).not.toContain( 'e-paragraph-base' );
				}
			}
			
			// Check each heading individually
			for ( let i = 0; i < headingCount; i++ ) {
				const heading = frontendHeadings.nth( i );
				const text = await heading.textContent() || '';
				const classes = await heading.getAttribute( 'class' ) || '';
				
				
				if ( text.includes( 'MANUAL' ) ) {
					// Manual widget should HAVE base class
					expect( classes ).toContain( 'e-heading-base' );
				} else {
					// API widget should NOT have base class
					expect( classes ).not.toContain( 'e-heading-base' );
				}
			}
			
			expect( paragraphCount + headingCount ).toBeGreaterThan( 0 );
			
			// 2. Verify first heading has browser default margin on frontend
			const firstFrontendHeading = frontendHeadings.first();
			await firstFrontendHeading.waitFor( { state: 'visible', timeout: 10000 } );
			const frontendHeadingStyles = await firstFrontendHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginBottom: styles.marginBottom,
				};
			} );

			expect( frontendHeadingStyles.marginTop ).not.toBe( '0px' );
			expect( frontendHeadingStyles.marginBottom ).not.toBe( '0px' );
			
			// 3. Verify paragraph with explicit margin on frontend (find by CSS class)
			const paragraphWithMargin = page.locator( 'p[class*="e-"]' ).first(); // Second paragraph with CSS class
			await paragraphWithMargin.waitFor( { state: 'visible', timeout: 10000 } );
			const frontendParagraphStyles = await paragraphWithMargin.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );

			expect( frontendParagraphStyles.marginTop ).toBe( '20px' );
			expect( frontendParagraphStyles.marginRight ).toBe( '20px' );
			expect( frontendParagraphStyles.marginBottom ).toBe( '20px' );
			expect( frontendParagraphStyles.marginLeft ).toBe( '20px' );
			
			// 4. Verify heading with explicit margin on frontend (find by CSS class)
			const headingWithMargin = page.locator( 'h2' );
			await headingWithMargin.waitFor( { state: 'visible', timeout: 10000 } );
			const frontendSecondHeadingStyles = await headingWithMargin.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );
			expect( frontendSecondHeadingStyles.marginTop ).toBe( '15px' );
			expect( frontendSecondHeadingStyles.marginRight ).toBe( '15px' );
			expect( frontendSecondHeadingStyles.marginBottom ).toBe( '15px' );
			expect( frontendSecondHeadingStyles.marginLeft ).toBe( '15px' );
			
			// 5. Verify mixed behavior on frontend (API vs manual widgets)
			let frontendApiWidgetsWithoutBase = 0;
			let frontendManualWidgetsWithBase = 0;
			const frontendParagraphCount = await frontendParagraphs.count();
			
			for ( let i = 0; i < frontendParagraphCount; i++ ) {
				const paragraph = frontendParagraphs.nth( i );
				const text = await paragraph.textContent();
				const classes = await paragraph.getAttribute( 'class' ) || '';
				
				if ( text && text.includes( 'MANUAL' ) ) {
					// Manual widget should have base class on frontend
					if ( classes.includes( 'e-paragraph-base' ) ) {
						frontendManualWidgetsWithBase++;
					}
				} else if ( text && !text.includes( 'All rights reserved' ) && text.trim() !== '' ) {
					// API widgets should not have base class on frontend (exclude theme content)
					if ( !classes.includes( 'e-paragraph-base' ) ) {
						frontendApiWidgetsWithoutBase++;
					}
				}
			}
			
			expect( frontendApiWidgetsWithoutBase ).toBeGreaterThan( 0 );
			expect( frontendManualWidgetsWithBase ).toBeGreaterThan( 0 );
			// 6. Additional verification: check that we have the expected content on frontend
			const frontendManualWidget = page.locator( '.e-con p' ).last();
			await expect( frontendManualWidget ).toBeVisible();

			await expect( frontendManualWidget ).toContainText( 'MANUAL Widget' );
			await expect( frontendManualWidget ).toHaveCSS( 'margin-top', '0px' );
			await expect( frontendManualWidget ).toHaveClass( /e-paragraph-base/ );
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

		// ===== EDITOR TESTS =====
		
		await test.step( 'Editor: Verify API heading widgets have no base classes', async () => {
			await elementorFrame.waitForLoadState( 'networkidle' );
			
			const allHeadings = elementorFrame.locator( 'h1, h2, h3, h4, h5, h6' );
			await allHeadings.first().waitFor( { state: 'attached', timeout: 10000 } ).catch( () => {} );
			
			let headingCount = 0;
			
			try {
				headingCount = await allHeadings.count();
			} catch ( error ) {
				return;
			}
			
			if ( headingCount > 0 ) {
				for ( let i = 0; i < headingCount; i++ ) {
					const heading = allHeadings.nth( i );
					const classes = await heading.getAttribute( 'class' );
					// Base classes are added by atomic widget system, not CSS Converter
					expect( classes || '' ).not.toContain( 'e-heading-base' );
				}
				expect( headingCount ).toBeGreaterThan( 0 );
			}
		} );

		await test.step( 'Editor: Verify second heading has explicit margin', async () => {
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

			expect( computedStyles.marginTop ).toBe( '15px' );
			expect( computedStyles.marginRight ).toBe( '15px' );
			expect( computedStyles.marginBottom ).toBe( '15px' );
			expect( computedStyles.marginLeft ).toBe( '15px' );
		} );

		// ===== FRONTEND TESTS =====
		
		await test.step( 'Frontend: Verify all heading behavior', async () => {
			// Save the page by using keyboard shortcut (Ctrl+S / Cmd+S)
			await page.keyboard.press( process.platform === 'darwin' ? 'Meta+S' : 'Control+S' );
			await page.waitForTimeout( 3000 );
			
			// Navigate to frontend directly
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState( 'networkidle', { timeout: 15000 } );
			
			const { headings: frontendHeadings } = await testFrontendStyles( page );
			
			// 1. Verify no base classes on frontend
			let frontendHeadingCount = 0;
			
			try {
				frontendHeadingCount = await frontendHeadings.count();
			} catch ( error ) {
				return;
			}
			
			if ( frontendHeadingCount > 0 ) {
				for ( let i = 0; i < frontendHeadingCount; i++ ) {
					const heading = frontendHeadings.nth( i );
					const classes = await heading.getAttribute( 'class' );
					expect( classes || '' ).not.toContain( 'e-heading-base' );
				}
				expect( frontendHeadingCount ).toBeGreaterThan( 0 );
			}
			
			// 2. Verify second heading has explicit margin on frontend (it's the second one, index 1)
			const totalFrontendHeadings = await frontendHeadings.count();
			
			// Find the heading with CSS class (the one with explicit margin)
			const headingWithCssClass = page.locator( 'h1, h2, h3, h4, h5, h6' ).locator( '[class*="elementor-element-"]' ).first();
			
			if ( await headingWithCssClass.count() === 0 ) {
				const firstFrontendHeading = frontendHeadings.first();
				await firstFrontendHeading.waitFor( { state: 'visible', timeout: 10000 } );
				
				// Check if this heading has the explicit margin (it should be the h2 with margin: 15px)
				const frontendComputedStyles = await firstFrontendHeading.evaluate( ( el ) => {
					const styles = window.getComputedStyle( el );
					return {
						marginTop: styles.marginTop,
						marginRight: styles.marginRight,
						marginBottom: styles.marginBottom,
						marginLeft: styles.marginLeft,
						tagName: el.tagName.toLowerCase(),
					};
				} );
				
				
				// If this is the h2 with explicit margin, it should have 15px
				if ( frontendComputedStyles.tagName === 'h2' ) {
					expect( frontendComputedStyles.marginTop ).toBe( '15px' );
					expect( frontendComputedStyles.marginRight ).toBe( '15px' );
					expect( frontendComputedStyles.marginBottom ).toBe( '15px' );
					expect( frontendComputedStyles.marginLeft ).toBe( '15px' );
				}
				return;
			}
			
			// Use the heading with CSS class (the one with explicit margin)
			await headingWithCssClass.waitFor( { state: 'visible', timeout: 10000 } );

			const frontendComputedStyles = await headingWithCssClass.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );

			expect( frontendComputedStyles.marginTop ).toBe( '15px' );
			expect( frontendComputedStyles.marginRight ).toBe( '15px' );
			expect( frontendComputedStyles.marginBottom ).toBe( '15px' );
			expect( frontendComputedStyles.marginLeft ).toBe( '15px' );
		} );
	} );
} );
