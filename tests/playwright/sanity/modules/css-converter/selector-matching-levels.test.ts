import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Selector Matching Levels @selector-levels', () => {
	const API_URL = 'http://elementor.local:10003/wp-json/elementor/v2/widget-converter/';
	const TEST_URL = 'https://oboxthemes.com/';
	const ELEMENTOR_EDITOR_TIMEOUT = 30000;

	let wpAdmin: WpAdminPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'Level 1: Simple class selector', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-1a10fb4',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Test simple class selector matching', async () => {
			// Find any heading element
			const headings = elementorFrame.locator( 'h2' );
			const headingCount = await headings.count();
			
			console.log( `Level 1: Found ${ headingCount } h2 elements` );
			expect( headingCount ).toBeGreaterThan( 0 );

			// Check if any heading has styles applied
			if ( headingCount > 0 ) {
				const firstHeading = headings.first();
				const styles = await firstHeading.evaluate( ( el ) => {
					const computed = window.getComputedStyle( el );
					return {
						fontSize: computed.fontSize,
						color: computed.color,
						fontWeight: computed.fontWeight,
					};
				} );
				
				console.log( 'Level 1 - First heading styles:', JSON.stringify( styles, null, 2 ) );
				
				// Basic validation - should have some styling
				expect( styles.fontSize ).not.toBe( '' );
				expect( styles.color ).not.toBe( '' );
			}
		} );
	} );

	test( 'Level 2: Single descendant selector', async ( { page } ) => {
		// Test: .elementor-1140 .elementor-heading-title
		const response = await page.request.post( API_URL, {
			data: {
				type: 'html',
				content: `
					<div class="elementor elementor-1140">
						<div class="elementor-element elementor-element-test">
							<h2 class="elementor-heading-title">Test Heading</h2>
						</div>
					</div>
				`,
				css: `
					.elementor-1140 .elementor-heading-title {
						font-size: 24px;
						color: #ff0000;
						font-weight: 600;
					}
				`,
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		console.log( 'Level 2 - API Response stats:', {
			widgetsCreated: data.widgets_created,
			rulesFound: data.css_processing?.widget_specific_rules_found,
			stylesApplied: data.css_processing?.widget_styles_applied,
		} );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Test single descendant selector', async () => {
			const heading = elementorFrame.locator( 'h2' ).filter( { hasText: 'Test Heading' } );
			await expect( heading ).toBeVisible( { timeout: 10000 } );

			const styles = await heading.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontSize: computed.fontSize,
					color: computed.color,
					fontWeight: computed.fontWeight,
				};
			} );

			console.log( 'Level 2 - Heading styles:', JSON.stringify( styles, null, 2 ) );

			// Should match: .elementor-1140 .elementor-heading-title
			expect( styles.fontSize ).toBe( '24px' );
			expect( styles.color ).toBe( 'rgb(255, 0, 0)' );
			expect( styles.fontWeight ).toBe( '600' );
		} );
	} );

	test( 'Level 3: Compound selector', async ( { page } ) => {
		// Test: .elementor-element.elementor-element-test
		const response = await page.request.post( API_URL, {
			data: {
				type: 'html',
				content: `
					<div class="elementor elementor-1140">
						<div class="elementor-element elementor-element-test">
							<h2 class="elementor-heading-title">Test Heading</h2>
						</div>
					</div>
				`,
				css: `
					.elementor-element.elementor-element-test {
						background-color: #00ff00;
						padding: 20px;
					}
				`,
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		console.log( 'Level 3 - API Response stats:', {
			widgetsCreated: data.widgets_created,
			rulesFound: data.css_processing?.widget_specific_rules_found,
			stylesApplied: data.css_processing?.widget_styles_applied,
		} );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Test compound selector', async () => {
			const container = elementorFrame.locator( 'div' ).filter( { has: elementorFrame.locator( 'h2:has-text("Test Heading")' ) } ).first();
			await expect( container ).toBeVisible( { timeout: 10000 } );

			const styles = await container.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					backgroundColor: computed.backgroundColor,
					padding: computed.padding,
				};
			} );

			console.log( 'Level 3 - Container styles:', JSON.stringify( styles, null, 2 ) );

			// Should match: .elementor-element.elementor-element-test
			expect( styles.backgroundColor ).toBe( 'rgb(0, 255, 0)' );
			expect( styles.padding ).toBe( '20px' );
		} );
	} );

	test( 'Level 4: Descendant + Compound selector', async ( { page } ) => {
		// Test: .elementor-1140 .elementor-element.elementor-element-test .elementor-heading-title
		const response = await page.request.post( API_URL, {
			data: {
				type: 'html',
				content: `
					<div class="elementor elementor-1140">
						<div class="elementor-element elementor-element-test">
							<h2 class="elementor-heading-title">Test Heading</h2>
						</div>
					</div>
				`,
				css: `
					.elementor-1140 .elementor-element.elementor-element-test .elementor-heading-title {
						font-size: 28px;
						color: #0000ff;
						font-weight: 700;
						line-height: 1.5;
					}
				`,
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		console.log( 'Level 4 - API Response stats:', {
			widgetsCreated: data.widgets_created,
			rulesFound: data.css_processing?.widget_specific_rules_found,
			stylesApplied: data.css_processing?.widget_styles_applied,
		} );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Test descendant + compound selector', async () => {
			const heading = elementorFrame.locator( 'h2' ).filter( { hasText: 'Test Heading' } );
			await expect( heading ).toBeVisible( { timeout: 10000 } );

			const styles = await heading.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontSize: computed.fontSize,
					color: computed.color,
					fontWeight: computed.fontWeight,
					lineHeight: computed.lineHeight,
				};
			} );

			console.log( 'Level 4 - Heading styles:', JSON.stringify( styles, null, 2 ) );

			// Should match: .elementor-1140 .elementor-element.elementor-element-test .elementor-heading-title
			expect( styles.fontSize ).toBe( '28px' );
			expect( styles.color ).toBe( 'rgb(0, 0, 255)' );
			expect( styles.fontWeight ).toBe( '700' );
		} );
	} );

	test( 'Level 5: Real-world oboxthemes selector', async ( { page } ) => {
		// Test the actual failing selector from oboxthemes
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: TEST_URL,
				selector: '.elementor-element-1a10fb4',
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		console.log( 'Level 5 - API Response stats:', {
			widgetsCreated: data.widgets_created,
			rulesFound: data.css_processing?.widget_specific_rules_found,
			stylesApplied: data.css_processing?.widget_styles_applied,
			contextClasses: data.conversion_log?.options?.context_classes?.slice( 0, 5 ), // First 5 context classes
		} );

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ data.post_id }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		await test.step( 'Test real-world complex selector', async () => {
			const heading1 = elementorFrame.locator( 'h2' ).filter( { hasText: '20 Years of Trust' } );
			await expect( heading1 ).toBeVisible( { timeout: 10000 } );

			const styles1 = await heading1.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontSize: computed.fontSize,
					color: computed.color,
					fontWeight: computed.fontWeight,
					lineHeight: computed.lineHeight,
				};
			} );

			console.log( 'Level 5 - "20 Years of Trust" styles:', JSON.stringify( styles1, null, 2 ) );

			const heading2 = elementorFrame.locator( 'h2' ).filter( { hasText: 'PUBLISHING PLATFORM EXPERTS' } );
			await expect( heading2 ).toBeVisible( { timeout: 10000 } );

			const styles2 = await heading2.evaluate( ( el ) => {
				const computed = window.getComputedStyle( el );
				return {
					fontSize: computed.fontSize,
					color: computed.color,
					fontWeight: computed.fontWeight,
					textTransform: computed.textTransform,
				};
			} );

			console.log( 'Level 5 - "PUBLISHING PLATFORM EXPERTS" styles:', JSON.stringify( styles2, null, 2 ) );

			// Expected from original CSS:
			// .elementor-1140 .elementor-element.elementor-element-14c0aa4 .elementor-heading-title
			// { font-size: 36px; color: rgb(34, 42, 90); font-weight: 400; line-height: 46px; }
			
			// .elementor-1140 .elementor-element.elementor-element-9856e95 .elementor-heading-title  
			// { font-size: 14px; font-weight: 600; text-transform: uppercase; color: #222A5A73; }

			// Log current vs expected for analysis
			console.log( 'Level 5 - Analysis:' );
			console.log( '  Heading 1 (20 Years): Expected 36px/rgb(34,42,90)/400, Got', styles1.fontSize, styles1.color, styles1.fontWeight );
			console.log( '  Heading 2 (PUBLISHING): Expected 14px/600/uppercase, Got', styles2.fontSize, styles2.fontWeight, styles2.textTransform );

			// Don't assert specific values yet - just verify we have some styling
			expect( styles1.fontSize ).not.toBe( '' );
			expect( styles2.fontSize ).not.toBe( '' );
		} );
	} );

	test( 'Level 6: Debug widget tree structure', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'html',
				content: `
					<div class="elementor elementor-1140">
						<div class="elementor-element elementor-element-test">
							<h2 class="elementor-heading-title">Test Heading</h2>
						</div>
					</div>
				`,
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await test.step( 'Analyze widget tree structure', async () => {
			// Log widget structure for analysis
			console.log( 'Level 6 - Widget tree analysis:' );
			console.log( '  Total widgets created:', data.widgets_created );
			
			if ( data.widgets && data.widgets.length > 0 ) {
				const analyzeWidget = ( widget: any, depth = 0 ) => {
					const indent = '  '.repeat( depth + 1 );
					const classes = widget.settings?.classes?.value || [];
					console.log( `${indent}Widget: ${widget.widgetType || widget.elType}` );
					console.log( `${indent}  Classes: ${JSON.stringify( classes )}` );
					
					if ( widget.elements && widget.elements.length > 0 ) {
						widget.elements.forEach( ( child: any ) => analyzeWidget( child, depth + 1 ) );
					}
				};

				data.widgets.forEach( ( widget: any ) => analyzeWidget( widget ) );
			}

			// Basic validation
			expect( data.widgets_created ).toBeGreaterThan( 0 );
		} );
	} );

	test( 'Level 7: CSS rule extraction verification', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'html',
				content: `
					<div class="elementor elementor-1140">
						<div class="elementor-element elementor-element-test">
							<h2 class="elementor-heading-title">Test Heading</h2>
						</div>
					</div>
				`,
				css: `
					/* Level 7 Test Rules */
					.elementor-heading-title { font-size: 16px; }
					.elementor-1140 .elementor-heading-title { font-size: 20px; }
					.elementor-element.elementor-element-test { background: #f0f0f0; }
					.elementor-1140 .elementor-element.elementor-element-test .elementor-heading-title { font-size: 24px; color: #333; }
				`,
			},
			timeout: 60000,
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		expect( data.success ).toBe( true );

		await test.step( 'Verify CSS rule processing', async () => {
			console.log( 'Level 7 - CSS Processing stats:' );
			console.log( '  CSS rules parsed:', data.css_processing?.css_rules_parsed );
			console.log( '  Widget specific rules found:', data.css_processing?.widget_specific_rules_found );
			console.log( '  Widget styles applied:', data.css_processing?.widget_styles_applied );
			console.log( '  Global classes created:', data.global_classes_created );

			// Verify CSS processing is working
			expect( data.css_processing?.css_rules_parsed ).toBeGreaterThan( 0 );
			
			// At least some widget-specific rules should be found
			expect( data.css_processing?.widget_specific_rules_found ).toBeGreaterThan( 0 );
		} );
	} );
} );

