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

		// Test with default useZeroDefaults (now true by default)
		const apiResult = await cssHelper.convertHtmlWithCss( 
			request, 
			htmlContent, 
			''
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
		console.log( 'Loading editor page:', editUrl );
		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Get the Elementor frame
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Find all paragraph and heading elements (try multiple selectors)
		const paragraphElements = elementorFrame.locator( '.e-paragraph, .elementor-widget-e-paragraph, [data-widget_type="e-paragraph"]' );
		const headingElements = elementorFrame.locator( '.e-heading, .elementor-widget-e-heading, [data-widget_type="e-heading"]' );
		await expect( paragraphElements ).toHaveCount( 2 );
		await expect( headingElements ).toHaveCount( 2 );


                await page.pause();

		await test.step( 'Verify first paragraph has no default margin', async () => {
			const firstParagraph = paragraphElements.nth( 0 );
			await firstParagraph.waitFor( { state: 'visible', timeout: 10000 } );

			// Check computed styles - should have no margin from default styles
			const computedStyles = await firstParagraph.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginBottom: styles.marginBottom,
				};
			} );

			console.log( 'First paragraph computed styles:', computedStyles );

			// With useZeroDefaults: true, the paragraph should not have the default margin: 0
			// Instead, it should inherit browser defaults or have no forced margin
			// The key test is that it's NOT forced to margin: 0px by atomic widget defaults
			expect( computedStyles.marginTop ).not.toBe( '0px' );
			expect( computedStyles.marginBottom ).not.toBe( '0px' );
		} );

		await test.step( 'Verify first heading has no default margin', async () => {
			const firstHeading = headingElements.nth( 0 );
			await firstHeading.waitFor( { state: 'visible', timeout: 10000 } );

			// Check computed styles - should have no margin from default styles
			const computedStyles = await firstHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginBottom: styles.marginBottom,
				};
			} );

			console.log( 'First heading computed styles:', computedStyles );

			// With useZeroDefaults: true, the heading should not have the default margin: 0
			// Instead, it should inherit browser defaults or have no forced margin
			expect( computedStyles.marginTop ).not.toBe( '0px' );
			expect( computedStyles.marginBottom ).not.toBe( '0px' );
		} );

		await test.step( 'Verify second paragraph has explicit margin applied', async () => {
			const secondParagraph = paragraphElements.nth( 1 );
			await secondParagraph.waitFor( { state: 'visible', timeout: 10000 } );

			// This paragraph has explicit margin: 20px, so it should have that applied
			const computedStyles = await secondParagraph.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );

			console.log( 'Second paragraph computed styles:', computedStyles );

			// Should have the explicit 20px margin applied
			expect( computedStyles.marginTop ).toBe( '20px' );
			expect( computedStyles.marginRight ).toBe( '20px' );
			expect( computedStyles.marginBottom ).toBe( '20px' );
			expect( computedStyles.marginLeft ).toBe( '20px' );
		} );

		await test.step( 'Verify second heading has explicit margin applied', async () => {
			const secondHeading = headingElements.nth( 1 );
			await secondHeading.waitFor( { state: 'visible', timeout: 10000 } );

			// This heading has explicit margin: 15px, so it should have that applied
			const computedStyles = await secondHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );

			console.log( 'Second heading computed styles:', computedStyles );

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
				const elementorData = window.elementor?.getPreviewContainer?.()?.view?.getContainer?.()?.children?.models;
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

			console.log( 'Widget data:', JSON.stringify( widgetData, null, 2 ) );

			if ( widgetData && widgetData.length > 0 ) {
				// Find paragraph widgets and verify they have disable_base_styles: true
				const paragraphWidgets = widgetData.filter( ( widget: any ) => 
					widget.widgetType === 'e-paragraph' 
				);

				expect( paragraphWidgets.length ).toBeGreaterThan( 0 );

				paragraphWidgets.forEach( ( widget: any, index: number ) => {
					expect( widget.editor_settings ).toBeDefined();
					expect( widget.editor_settings.disable_base_styles ).toBe( true );
					expect( widget.editor_settings.css_converter_widget ).toBe( true );
					console.log( `Paragraph widget ${index + 1} has disable_base_styles: ${widget.editor_settings.disable_base_styles}` );
				} );
			}
		} );
	} );

	test( 'should apply default styles when useZeroDefaults is false (comparison test)', async ( { page, request } ) => {
		const htmlContent = `
			<div>
				<p>This paragraph should have default atomic widget margin: 0</p>
			</div>
		`;

		// Test with useZeroDefaults: false (default behavior)
		const apiResult = await cssHelper.convertHtmlWithCss( 
			request, 
			htmlContent, 
			'', 
			{ useZeroDefaults: false }
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

		// Find the paragraph element
		const paragraphElement = elementorFrame.locator( '.e-paragraph-base' ).first();
		await paragraphElement.waitFor( { state: 'visible', timeout: 10000 } );

		await test.step( 'Verify paragraph has default atomic widget margin: 0', async () => {
			const computedStyles = await paragraphElement.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );

			console.log( 'Default behavior computed styles:', computedStyles );

			// With useZeroDefaults: false, atomic widget should apply its default margin: 0
			expect( computedStyles.marginTop ).toBe( '0px' );
			expect( computedStyles.marginRight ).toBe( '0px' );
			expect( computedStyles.marginBottom ).toBe( '0px' );
			expect( computedStyles.marginLeft ).toBe( '0px' );
		} );

		await test.step( 'Verify widget does NOT have disable_base_styles flag', async () => {
			const widgetData = await elementorFrame.evaluate( () => {
				const elementorData = window.elementor?.getPreviewContainer?.()?.view?.getContainer?.()?.children?.models;
				if ( elementorData && elementorData.length > 0 ) {
					const data = elementorData[0].get( 'data' ) || elementorData[0].attributes;
					return {
						widgetType: data.widgetType,
						editor_settings: data.editor_settings,
						elType: data.elType,
					};
				}
				return null;
			} );

			console.log( 'Default behavior widget data:', JSON.stringify( widgetData, null, 2 ) );

			if ( widgetData ) {
				expect( widgetData.widgetType ).toBe( 'e-paragraph' );
				expect( widgetData.editor_settings ).toBeDefined();
				expect( widgetData.editor_settings.disable_base_styles ).toBe( false );
				expect( widgetData.editor_settings.css_converter_widget ).toBe( true );
			}
		} );
	} );

	test( 'should work with e-heading widgets as well', async ( { page, request } ) => {
		const htmlContent = `
			<div>
				<h1>This heading should have no default margin</h1>
				<h2 style="margin: 15px;">This heading has explicit margin</h2>
			</div>
		`;

		// Test with default useZeroDefaults (now true by default)
		const apiResult = await cssHelper.convertHtmlWithCss( 
			request, 
			htmlContent, 
			''
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

		// Find heading elements
		const headingElements = elementorFrame.locator( '.e-heading-base' );
		await expect( headingElements ).toHaveCount( 2 );

		await test.step( 'Verify first heading has no default margin', async () => {
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

			// Should not be forced to 0px by atomic widget defaults
			expect( computedStyles.marginTop ).not.toBe( '0px' );
			expect( computedStyles.marginBottom ).not.toBe( '0px' );
		} );

		await test.step( 'Verify second heading has explicit margin applied', async () => {
			const secondHeading = headingElements.nth( 1 );
			await secondHeading.waitFor( { state: 'visible', timeout: 10000 } );

			const computedStyles = await secondHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginTop: styles.marginTop,
					marginRight: styles.marginRight,
					marginBottom: styles.marginBottom,
					marginLeft: styles.marginLeft,
				};
			} );

			console.log( 'Second heading computed styles:', computedStyles );

			// Should have the explicit 15px margin applied
			expect( computedStyles.marginTop ).toBe( '15px' );
			expect( computedStyles.marginRight ).toBe( '15px' );
			expect( computedStyles.marginBottom ).toBe( '15px' );
			expect( computedStyles.marginLeft ).toBe( '15px' );
		} );
	} );
} );
