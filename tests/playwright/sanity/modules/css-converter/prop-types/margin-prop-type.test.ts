import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Margin Prop Type Integration @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdmin.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert margin properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'margin', value: '20px', selector: '[data-test="margin-single"]', expectedTop: '20px', expectedRight: '20px', expectedBottom: '20px', expectedLeft: '20px' },
			{ property: 'margin', value: '10px 20px', selector: '[data-test="margin-two"]', expectedTop: '10px', expectedRight: '20px', expectedBottom: '10px', expectedLeft: '20px' },
			{ property: 'margin', value: '10px 20px 30px', selector: '[data-test="margin-three"]', expectedTop: '10px', expectedRight: '20px', expectedBottom: '30px', expectedLeft: '20px' },
			{ property: 'margin', value: '10px 20px 30px 40px', selector: '[data-test="margin-four"]', expectedTop: '10px', expectedRight: '20px', expectedBottom: '30px', expectedLeft: '40px' },
			{ property: 'margin-top', value: '25px', selector: '[data-test="margin-top"]', expectedTop: '25px', expectedRight: '0px', expectedBottom: '0px', expectedLeft: '0px' },
			{ property: 'margin-left', value: '15px', selector: '[data-test="margin-left"]', expectedTop: '0px', expectedRight: '0px', expectedBottom: '0px', expectedLeft: '15px' },
		];

		const combinedCssContent = `
			<div style="background: #f0f0f0; padding: 20px;">
				<p style="margin: 20px; background: #e0e0e0;" data-test="margin-single">Single margin value</p>
				<p style="margin: 10px 20px; background: #e0e0e0;" data-test="margin-two">Two margin values</p>
				<p style="margin: 10px 20px 30px; background: #e0e0e0;" data-test="margin-three">Three margin values</p>
				<p style="margin: 10px 20px 30px 40px; background: #e0e0e0;" data-test="margin-four">Four margin values</p>
				<p style="margin-top: 25px; background: #e0e0e0;" data-test="margin-top">Margin top only</p>
				<p style="margin-left: 15px; background: #e0e0e0;" data-test="margin-left">Margin left only</p>
			</div>
		`;

		// Convert HTML with CSS to Elementor widgets
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to editor
		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify in editor
		for ( const testCase of testCases ) {
			const element = editor.getPreviewFrame().locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'margin-top', testCase.expectedTop );
			await expect( element ).toHaveCSS( 'margin-right', testCase.expectedRight );
			await expect( element ).toHaveCSS( 'margin-bottom', testCase.expectedBottom );
			await expect( element ).toHaveCSS( 'margin-left', testCase.expectedLeft );
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend
		for ( const testCase of testCases ) {
			const element = page.locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'margin-top', testCase.expectedTop );
			await expect( element ).toHaveCSS( 'margin-right', testCase.expectedRight );
			await expect( element ).toHaveCSS( 'margin-bottom', testCase.expectedBottom );
			await expect( element ).toHaveCSS( 'margin-left', testCase.expectedLeft );
		}
	} );

	test( 'should handle margin logical properties', async ( { page, request } ) => {
		const logicalPropertiesCssContent = `
			<div style="background: #f0f0f0; padding: 20px;">
				<p style="margin-block-start: 30px; background: #e0e0e0;" data-test="margin-block-start">Margin block start</p>
				<p style="margin-inline-end: 25px; background: #e0e0e0;" data-test="margin-inline-end">Margin inline end</p>
				<p style="margin-block: 20px; background: #e0e0e0;" data-test="margin-block">Margin block shorthand</p>
				<p style="margin-inline: 15px; background: #e0e0e0;" data-test="margin-inline">Margin inline shorthand</p>
			</div>
		`;

		// Convert and test logical properties
		const apiResult = await cssHelper.convertHtmlWithCss( request, logicalPropertiesCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify logical properties in editor (mapped to physical properties)
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-block-start"]' ) ).toHaveCSS( 'margin-top', '30px' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-inline-end"]' ) ).toHaveCSS( 'margin-right', '25px' );
		
		// Block shorthand maps to top and bottom
		const blockElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-block"]' );
		await expect( blockElement ).toHaveCSS( 'margin-top', '20px' );
		await expect( blockElement ).toHaveCSS( 'margin-bottom', '20px' );
		
		// Inline shorthand maps to left and right
		const inlineElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-inline"]' );
		await expect( inlineElement ).toHaveCSS( 'margin-left', '15px' );
		await expect( inlineElement ).toHaveCSS( 'margin-right', '15px' );
	} );

	test( 'should handle margin different units and edge cases', async ( { page, request } ) => {
		const edgeCasesCssContent = `
			<div style="background: #f0f0f0; padding: 20px;">
				<p style="margin: 1.5em 2rem 10px 5%;" data-test="margin-mixed-units">Mixed units margin</p>
				<p style="margin: 0;" data-test="margin-zero">Zero margin</p>
				<p style="margin: auto;" data-test="margin-auto">Auto margin</p>
				<p style="margin: -10px;" data-test="margin-negative">Negative margin</p>
			</div>
		`;

		// Convert and test edge cases
		const apiResult = await cssHelper.convertHtmlWithCss( request, edgeCasesCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify edge cases in editor
		const mixedUnitsElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-mixed-units"]' );
		await expect( mixedUnitsElement ).toHaveCSS( 'margin-top', '1.5em' );
		await expect( mixedUnitsElement ).toHaveCSS( 'margin-right', '2rem' );
		await expect( mixedUnitsElement ).toHaveCSS( 'margin-bottom', '10px' );
		await expect( mixedUnitsElement ).toHaveCSS( 'margin-left', '5%' );

		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-zero"]' ) ).toHaveCSS( 'margin', '0px' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-auto"]' ) ).toHaveCSS( 'margin', 'auto' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="margin-negative"]' ) ).toHaveCSS( 'margin', '-10px' );
	} );
} );
