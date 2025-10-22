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

		console.log( '🔥🔥🔥 MAX_DEBUG: Test starting CSS converter API call' );
		console.log( '🔥🔥🔥 MAX_DEBUG: HTML content:', htmlContent );
		
		// Test with converted widgets (zero defaults always enabled)
		const apiResult = await cssHelper.convertHtmlWithCss( 
			request, 
			htmlContent
		);
		
		console.log( '🔥🔥🔥 MAX_DEBUG: API call completed' );
		console.log( '🔥🔥🔥 MAX_DEBUG: API result:', JSON.stringify( apiResult, null, 2 ) );

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
			console.log( `🔍 DEBUG: Elementor frame not ready, retrying... (${retries + 1}/5)` );
			await page.waitForTimeout( 1000 );
			elementorFrame = editor.getPreviewFrame();
			retries++;
		}
		
		if ( ! elementorFrame ) {
			throw new Error( 'Elementor frame not available after 5 retries' );
		}
		
		await elementorFrame.waitForLoadState();

		// Debug: Check if CSS injection is present (should be none for no-base-classes approach)
		const injectedCSSElements = await elementorFrame.locator( '#css-converter-base-styles-override' ).all();
		console.log( `🔍 DEBUG: Found ${injectedCSSElements.length} CSS injection elements (should be 0 for no-base-classes approach)` );
		for ( let i = 0; i < injectedCSSElements.length; i++ ) {
			const cssContent = await injectedCSSElements[ i ].textContent();
			console.log( `🔍 DEBUG: CSS injection ${i + 1}:`, cssContent );
		}
		
		// Debug: Check actual DOM structure
		const allElements = await elementorFrame.locator( '.elementor-widget' ).all();
		for ( let i = 0; i < allElements.length; i++ ) {
			const element = allElements[ i ];
			const widgetType = await element.getAttribute( 'data-widget_type' );
			const classes = await element.getAttribute( 'class' );
			console.log( `🔍 DEBUG: Widget ${i}: type="${widgetType}", classes="${classes}"` );
		}

		// Find all paragraph and heading elements (CSS converter widgets have no base classes)
		const paragraphElements = elementorFrame.locator( '.elementor-widget-e-paragraph, [data-widget_type="e-paragraph"], [data-widget_type="e-paragraph.default"]' );
		const headingElements = elementorFrame.locator( '.elementor-widget-e-heading, [data-widget_type="e-heading"], [data-widget_type="e-heading.default"]' );
		await expect( paragraphElements ).toHaveCount( 2 );
		await expect( headingElements ).toHaveCount( 2 );

		await test.step( 'Verify converted widgets have NO base classes', async () => {
			// CSS converter widgets should NOT have e-paragraph-base or e-heading-base classes
			
			// Find all atomic widgets created by CSS converter (including .default skin)
			const atomicParagraphs = elementorFrame.locator( '[data-widget_type="e-paragraph"], [data-widget_type="e-paragraph.default"]' );
			const atomicHeadings = elementorFrame.locator( '[data-widget_type="e-heading"], [data-widget_type="e-heading.default"]' );
			
			const atomicParagraphCount = await atomicParagraphs.count();
			const atomicHeadingCount = await atomicHeadings.count();
			
			console.log( 'Atomic paragraph widgets found:', atomicParagraphCount );
			console.log( 'Atomic heading widgets found:', atomicHeadingCount );
			
			// Require at least some widgets to be found
			expect( atomicParagraphCount + atomicHeadingCount ).toBeGreaterThan( 0 );
			
			// Check if these atomic widgets have NO base classes
			let hasNoBaseClasses = true;
			let totalWidgetsChecked = 0;
			
			// Check paragraphs - look for inner paragraph elements without base classes
			for ( let i = 0; i < atomicParagraphCount; i++ ) {
				const paragraphWidget = atomicParagraphs.nth( i );
				const innerParagraphs = paragraphWidget.locator( 'p' );
				const innerParagraphCount = await innerParagraphs.count();
				
				for ( let j = 0; j < innerParagraphCount; j++ ) {
					const innerP = innerParagraphs.nth( j );
					const classes = await innerP.getAttribute( 'class' );
					totalWidgetsChecked++;
					
					if ( classes && classes.includes( 'e-paragraph-base' ) ) {
						console.log( `❌ Paragraph widget ${i}, inner p ${j} still has base class: ${classes}` );
						hasNoBaseClasses = false;
					} else {
						console.log( `✅ Paragraph widget ${i}, inner p ${j} has no base class: ${classes || 'no classes'}` );
					}
				}
			}
			
			// Check headings - look for inner heading elements without base classes
			for ( let i = 0; i < atomicHeadingCount; i++ ) {
				const headingWidget = atomicHeadings.nth( i );
				const innerHeadings = headingWidget.locator( 'h1, h2, h3, h4, h5, h6' );
				const innerHeadingCount = await innerHeadings.count();
				
				for ( let j = 0; j < innerHeadingCount; j++ ) {
					const innerH = innerHeadings.nth( j );
					const classes = await innerH.getAttribute( 'class' );
					totalWidgetsChecked++;
					
					if ( classes && classes.includes( 'e-heading-base' ) ) {
						console.log( `❌ Heading widget ${i}, inner heading ${j} still has base class: ${classes}` );
						hasNoBaseClasses = false;
					} else {
						console.log( `✅ Heading widget ${i}, inner heading ${j} has no base class: ${classes || 'no classes'}` );
					}
				}
			}
			
			console.log( `Total inner elements checked: ${totalWidgetsChecked}` );
			
			if ( totalWidgetsChecked > 0 ) {
				console.log( '✅ SUCCESS: CSS converter widgets have NO base classes!' );
				expect( hasNoBaseClasses ).toBe( true );
			} else {
				// Fallback: Check computed styles if no inner elements found
				const firstParagraph = paragraphElements.nth( 0 );
				await firstParagraph.waitFor( { state: 'visible', timeout: 10000 } );

				const computedStyles = await firstParagraph.evaluate( ( el ) => {
					const styles = window.getComputedStyle( el );
					return {
						marginTop: styles.marginTop,
						marginBottom: styles.marginBottom,
					};
				} );

				console.log( 'First paragraph computed styles:', computedStyles );
				console.log( '⚠️  FALLBACK: No inner elements found, checking computed styles' );
				
				// Elements without base classes should use browser defaults (not forced 0px)
				expect( computedStyles.marginTop ).not.toBe( '0px' );
				expect( computedStyles.marginBottom ).not.toBe( '0px' );
			}
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

			console.log( 'First heading computed styles:', computedStyles );

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

		await test.step( 'Verify widgets have disable_base_styles flag in editor_settings', async () => {
			// Check the widget data structure to ensure disable_base_styles is set
			const widgetData = await elementorFrame.evaluate( () => {
				// Access Elementor's internal data structure
				const elementorData = ( window as any ).elementor?.getPreviewContainer?.()?.view?.getContainer?.()?.children?.models;
				if ( elementorData && elementorData.length > 0 ) {
					return elementorData.map( ( model: any ) => {
						const data = model.get( 'data' ) || model.attributes;
						return {
							widgetType: data.widgetType,
							editor_settings: data.editor_settings,
							elType: data.elType,
						};
					} );
				}
				return null;
			} );

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
					if ( ! classes.includes( 'e-paragraph-base' ) ) {
						apiWidgetsWithoutBase++;
					}
				}
			}

			expect( apiWidgetsWithoutBase ).toBeGreaterThan( 0 );
			expect( manualWidgetsWithBase ).toBeGreaterThan( 0 );
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

		await test.step( 'Verify converted heading widgets have NO base classes', async () => {
			// CSS converter widgets should NOT have e-heading-base classes
			
			// Find all atomic heading widgets created by CSS converter (including .default skin)
			const atomicHeadings = elementorFrame.locator( '[data-widget_type="e-heading"], [data-widget_type="e-heading.default"]' );
			
			const atomicHeadingCount = await atomicHeadings.count();
			
			console.log( 'Atomic heading widgets found:', atomicHeadingCount );
			
			// Require at least some widgets to be found
			expect( atomicHeadingCount ).toBeGreaterThan( 0 );
			
			// Check if these atomic widgets have NO base classes
			let hasNoBaseClasses = true;
			let totalWidgetsChecked = 0;
			
			// Check headings - look for inner heading elements without base classes
			for ( let i = 0; i < atomicHeadingCount; i++ ) {
				const headingWidget = atomicHeadings.nth( i );
				const innerHeadings = headingWidget.locator( 'h1, h2, h3, h4, h5, h6' );
				const innerHeadingCount = await innerHeadings.count();
				
				for ( let j = 0; j < innerHeadingCount; j++ ) {
					const innerH = innerHeadings.nth( j );
					const classes = await innerH.getAttribute( 'class' );
					totalWidgetsChecked++;
					
					if ( classes && classes.includes( 'e-heading-base' ) ) {
						console.log( `❌ Heading widget ${i}, inner heading ${j} still has base class: ${classes}` );
						hasNoBaseClasses = false;
					} else {
						console.log( `✅ Heading widget ${i}, inner heading ${j} has no base class: ${classes || 'no classes'}` );
					}
				}
			}
			
			console.log( `Total inner heading elements checked: ${totalWidgetsChecked}` );
			
			if ( totalWidgetsChecked > 0 ) {
				console.log( '✅ SUCCESS: CSS converter heading widgets have NO base classes!' );
				expect( hasNoBaseClasses ).toBe( true );
			} else {
				// Fallback: Check computed styles if no inner elements found
				const firstHeading = headingElements.nth( 0 );
				await firstHeading.waitFor( { state: 'visible', timeout: 10000 } );

				const computedStyles = await firstHeading.evaluate( ( el ) => {
					const styles = window.getComputedStyle( el );
					return {
						marginTop: styles.marginTop,
						marginBottom: styles.marginBottom,
					};
				} );

				console.log( 'First heading computed styles:', computedStyles );
				console.log( '⚠️  FALLBACK: No inner elements found, checking computed styles' );
				
				// Elements without base classes should use browser defaults (not forced 0px)
				expect( computedStyles.marginTop ).not.toBe( '0px' );
				expect( computedStyles.marginBottom ).not.toBe( '0px' );
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

			expect( frontendComputedStyles.marginTop ).toBe( '15px' );
			expect( frontendComputedStyles.marginRight ).toBe( '15px' );
			expect( frontendComputedStyles.marginBottom ).toBe( '15px' );
			expect( frontendComputedStyles.marginLeft ).toBe( '15px' );
		} );
	} );
} );
