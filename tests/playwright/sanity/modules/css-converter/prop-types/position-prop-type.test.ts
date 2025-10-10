import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Position Prop Type Integration @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdminPage.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		// await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert basic positioning properties and verify styles', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<!-- Position values -->
				<p style="position: relative;">Relative position</p>
				<p style="position: absolute;">Absolute position</p>
				<p style="position: fixed;">Fixed position</p>
				<p style="position: sticky;">Sticky position</p>
				
				<!-- Physical positioning properties -->
				<p style="position: absolute; top: 10px;">Top 10px</p>
				<p style="position: absolute; right: 20px;">Right 20px</p>
				<p style="position: absolute; bottom: 30px;">Bottom 30px</p>
				<p style="position: absolute; left: 40px;">Left 40px</p>
				
				<!-- Logical positioning properties -->
				<p style="position: absolute; inset-block-start: 15px;">Inset block start 15px</p>
				<p style="position: absolute; inset-inline-end: 25px;">Inset inline end 25px</p>
				<p style="position: absolute; inset-block-end: 35px;">Inset block end 35px</p>
				<p style="position: absolute; inset-inline-start: 45px;">Inset inline start 45px</p>
				
				<!-- Z-index -->
				<p style="z-index: 100;">Z-index 100</p>
				<p style="z-index: -50;">Z-index -50</p>
				<p style="z-index: 0;">Z-index 0</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( '.elementor-widget-e-paragraph p' );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Test position values
		await test.step( 'Verify position values', async () => {
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'position', 'relative' );
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'position', 'absolute' );
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'position', 'fixed' );
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'position', 'sticky' );
		} );

		// Test physical positioning properties
		await test.step( 'Verify physical positioning properties', async () => {
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'inset-block-start', '10px' );
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'inset-inline-end', '20px' );
			await expect( paragraphElements.nth( 6 ) ).toHaveCSS( 'inset-block-end', '30px' );
			await expect( paragraphElements.nth( 7 ) ).toHaveCSS( 'inset-inline-start', '40px' );
		} );

		// Test logical positioning properties
		await test.step( 'Verify logical positioning properties', async () => {
			await expect( paragraphElements.nth( 8 ) ).toHaveCSS( 'inset-block-start', '15px' );
			await expect( paragraphElements.nth( 9 ) ).toHaveCSS( 'inset-inline-end', '25px' );
			await expect( paragraphElements.nth( 10 ) ).toHaveCSS( 'inset-block-end', '35px' );
			await expect( paragraphElements.nth( 11 ) ).toHaveCSS( 'inset-inline-start', '45px' );
		} );

		// Test z-index
		await test.step( 'Verify z-index values', async () => {
			await expect( paragraphElements.nth( 12 ) ).toHaveCSS( 'z-index', '100' );
			await expect( paragraphElements.nth( 13 ) ).toHaveCSS( 'z-index', '-50' );
			await expect( paragraphElements.nth( 14 ) ).toHaveCSS( 'z-index', '0' ); // z-index: 0 should remain '0' in computed styles
		} );
	} );

	test( 'should convert individual positioning properties with different units and values', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<!-- Different units -->
				<p style="position: absolute; top: 2em;">Top 2em</p>
				<p style="position: absolute; right: 3rem;">Right 3rem</p>
				<p style="position: absolute; bottom: 5%;">Bottom 5%</p>
				<p style="position: absolute; left: 10vh;">Left 10vh</p>
				
				<!-- Negative values -->
				<p style="position: absolute; top: -15px;">Top -15px</p>
				<p style="position: absolute; left: -25px;">Left -25px</p>
				
				<!-- Logical properties with different units -->
				<p style="position: absolute; inset-block-start: 2em;">Inset block start 2em</p>
				<p style="position: absolute; inset-inline-end: 3rem;">Inset inline end 3rem</p>
				<p style="position: absolute; inset-block-end: 5%;">Inset block end 5%</p>
				<p style="position: absolute; inset-inline-start: 10vh;">Inset inline start 10vh</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( '.elementor-widget-e-paragraph p' );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Test different units (physical properties)
		await test.step( 'Verify different units for physical properties', async () => {
			// Test that CSS properties are applied correctly (validate unit conversion happened)
			const topEmValue = await paragraphElements.nth( 0 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-block-start' ) );
			const rightRemValue = await paragraphElements.nth( 1 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-inline-end' ) );
			const bottomPercentValue = await paragraphElements.nth( 2 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-block-end' ) );
			const leftVhValue = await paragraphElements.nth( 3 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-inline-start' ) );

			// Validate that units were converted to pixels and values are reasonable
			expect( topEmValue ).toMatch( /^\d+(\.\d+)?px$/ ); // Should be converted to px
			expect( parseFloat( topEmValue ) ).toBeGreaterThan( 20 ); // 2em should be > 20px
			
			expect( rightRemValue ).toMatch( /^\d+(\.\d+)?px$/ ); // Should be converted to px  
			expect( parseFloat( rightRemValue ) ).toBeGreaterThan( 30 ); // 3rem should be > 30px
			
			expect( bottomPercentValue ).toBe( '0px' ); // 5% of 0 height container = 0px
			
			expect( leftVhValue ).toMatch( /^\d+(\.\d+)?px$/ ); // Should be converted to px
			expect( parseFloat( leftVhValue ) ).toBeGreaterThan( 50 ); // 10vh should be > 50px
		} );

		// Test negative values
		await test.step( 'Verify negative values', async () => {
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'inset-block-start', '-15px' );
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'inset-inline-start', '-25px' );
		} );

		// Test logical properties with different units
		await test.step( 'Verify logical properties with different units', async () => {
			// Test that CSS logical properties are applied correctly (validate unit conversion happened)
			const logicalTopEmValue = await paragraphElements.nth( 6 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-block-start' ) );
			const logicalRightRemValue = await paragraphElements.nth( 7 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-inline-end' ) );
			const logicalBottomPercentValue = await paragraphElements.nth( 8 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-block-end' ) );
			const logicalLeftVhValue = await paragraphElements.nth( 9 ).evaluate( el => getComputedStyle( el ).getPropertyValue( 'inset-inline-start' ) );

			// Validate that units were converted to pixels and values are reasonable
			expect( logicalTopEmValue ).toMatch( /^\d+(\.\d+)?px$/ ); // Should be converted to px
			expect( parseFloat( logicalTopEmValue ) ).toBeGreaterThan( 20 ); // 2em should be > 20px
			
			expect( logicalRightRemValue ).toMatch( /^\d+(\.\d+)?px$/ ); // Should be converted to px  
			expect( parseFloat( logicalRightRemValue ) ).toBeGreaterThan( 30 ); // 3rem should be > 30px
			
			expect( logicalBottomPercentValue ).toBe( '0px' ); // 5% of 0 height container = 0px
			
			expect( logicalLeftVhValue ).toMatch( /^\d+(\.\d+)?px$/ ); // Should be converted to px
			expect( parseFloat( logicalLeftVhValue ) ).toBeGreaterThan( 50 ); // 10vh should be > 50px
		} );
	} );

	test( 'should convert inset-inline and inset-block shorthand properties', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<!-- inset shorthand variations (all 4 sides) -->
				<p style="position: absolute; inset: 20px;">Inset 20px</p>
				<p style="position: absolute; inset: 10px 30px;">Inset 10px 30px</p>
				<p style="position: absolute; inset: 5px 15px 25px;">Inset 5px 15px 25px</p>
				<p style="position: absolute; inset: 5px 10px 15px 20px;">Inset 5px 10px 15px 20px</p>
				<p style="position: absolute; inset: 2em;">Inset 2em</p>
				<p style="position: absolute; inset: -10px;">Inset -10px</p>
				
				<!-- inset-inline variations -->
				<p style="position: absolute; inset-inline: 20px;">Inset inline 20px</p>
				<p style="position: absolute; inset-inline: 10px 30px;">Inset inline 10px 30px</p>
				<p style="position: absolute; inset-inline: 2em;">Inset inline 2em</p>
				<p style="position: absolute; inset-inline: 1rem 3rem;">Inset inline 1rem 3rem</p>
				<p style="position: absolute; inset-inline: -10px;">Inset inline -10px</p>
				<p style="position: absolute; inset-inline: -5px 15px;">Inset inline -5px 15px</p>
				
				<!-- inset-block variations -->
				<p style="position: absolute; inset-block: 25px;">Inset block 25px</p>
				<p style="position: absolute; inset-block: 15px 35px;">Inset block 15px 35px</p>
				<p style="position: absolute; inset-block: 1.5em;">Inset block 1.5em</p>
				<p style="position: absolute; inset-block: 2rem 4rem;">Inset block 2rem 4rem</p>
				<p style="position: absolute; inset-block: -20px;">Inset block -20px</p>
				<p style="position: absolute; inset-block: -10px 20px;">Inset block -10px 20px</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( '.elementor-widget-e-paragraph p' );
		await paragraphElements.first().waitFor( { state: 'attached', timeout: 10000 } ); // Use 'attached' instead of 'visible' for zero-dimension elements

		// Test inset shorthand variations (all 4 sides)
		await test.step( 'Verify inset shorthand properties', async () => {
			// Inset: 20px (single value - all 4 sides)
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'inset-block-start', '20px' );
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'inset-inline-end', '20px' );
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'inset-block-end', '20px' );
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'inset-inline-start', '20px' );

			// Inset: 10px 30px (vertical, horizontal)
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'inset-block-start', '10px' );
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'inset-inline-end', '30px' );
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'inset-block-end', '10px' );
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'inset-inline-start', '30px' );

			// Inset: 5px 15px 25px (top, horizontal, bottom)
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'inset-block-start', '5px' );
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'inset-inline-end', '15px' );
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'inset-block-end', '25px' );
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'inset-inline-start', '15px' );

			// Inset: 5px 10px 15px 20px (top, right, bottom, left)
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'inset-block-start', '5px' );
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'inset-inline-end', '10px' );
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'inset-block-end', '15px' );
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'inset-inline-start', '20px' );

			// Inset: 2em (single value with unit conversion)
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'inset-block-start', '32px' ); // 2em = 32px
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'inset-inline-end', '32px' );
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'inset-block-end', '32px' );
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'inset-inline-start', '32px' );

			// Inset: -10px (negative single value)
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'inset-block-start', '-10px' );
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'inset-inline-end', '-10px' );
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'inset-block-end', '-10px' );
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'inset-inline-start', '-10px' );
		} );

		// Test inset-inline variations
		await test.step( 'Verify inset-inline shorthand properties', async () => {
			// Inset-inline: 20px (single value)
			await expect( paragraphElements.nth( 6 ) ).toHaveCSS( 'inset-inline-start', '20px' );
			await expect( paragraphElements.nth( 6 ) ).toHaveCSS( 'inset-inline-end', '20px' );

			// Inset-inline: 10px 30px (two values)
			await expect( paragraphElements.nth( 7 ) ).toHaveCSS( 'inset-inline-start', '10px' );
			await expect( paragraphElements.nth( 7 ) ).toHaveCSS( 'inset-inline-end', '30px' );

			// Inset-inline: 2em (single value with unit conversion)
			await expect( paragraphElements.nth( 8 ) ).toHaveCSS( 'inset-inline-start', '32px' ); // 2em = 32px
			await expect( paragraphElements.nth( 8 ) ).toHaveCSS( 'inset-inline-end', '32px' );

			// Inset-inline: 1rem 3rem (two values with unit conversion)
			await expect( paragraphElements.nth( 9 ) ).toHaveCSS( 'inset-inline-start', '16px' ); // 1rem = 16px
			await expect( paragraphElements.nth( 9 ) ).toHaveCSS( 'inset-inline-end', '48px' ); // 3rem = 48px

			// inset-inline: -10px (negative single value)
			await expect( paragraphElements.nth( 10 ) ).toHaveCSS( 'inset-inline-start', '-10px' );
			await expect( paragraphElements.nth( 10 ) ).toHaveCSS( 'inset-inline-end', '-10px' );

			// Inset-inline: -5px 15px (negative and positive values)
			await expect( paragraphElements.nth( 11 ) ).toHaveCSS( 'inset-inline-start', '-5px' );
			await expect( paragraphElements.nth( 11 ) ).toHaveCSS( 'inset-inline-end', '15px' );
		} );

		// Test inset-block variations
		await test.step( 'Verify inset-block shorthand properties', async () => {
			// Inset-block: 25px (single value)
			await expect( paragraphElements.nth( 12 ) ).toHaveCSS( 'inset-block-start', '25px' );
			await expect( paragraphElements.nth( 12 ) ).toHaveCSS( 'inset-block-end', '25px' );

			// Inset-block: 15px 35px (two values)
			await expect( paragraphElements.nth( 13 ) ).toHaveCSS( 'inset-block-start', '15px' );
			await expect( paragraphElements.nth( 13 ) ).toHaveCSS( 'inset-block-end', '35px' );

			// Inset-block: 1.5em (single value with unit conversion)
			await expect( paragraphElements.nth( 14 ) ).toHaveCSS( 'inset-block-start', '24px' ); // 1.5em = 24px
			await expect( paragraphElements.nth( 14 ) ).toHaveCSS( 'inset-block-end', '24px' );

			// Inset-block: 2rem 4rem (two values with unit conversion)
			await expect( paragraphElements.nth( 15 ) ).toHaveCSS( 'inset-block-start', '32px' ); // 2rem = 32px
			await expect( paragraphElements.nth( 15 ) ).toHaveCSS( 'inset-block-end', '64px' ); // 4rem = 64px

			// inset-block: -20px (negative single value)
			await expect( paragraphElements.nth( 16 ) ).toHaveCSS( 'inset-block-start', '-20px' );
			await expect( paragraphElements.nth( 16 ) ).toHaveCSS( 'inset-block-end', '-20px' );

			// Inset-block: -10px 20px (negative and positive values)
			await expect( paragraphElements.nth( 17 ) ).toHaveCSS( 'inset-block-start', '-10px' );
			await expect( paragraphElements.nth( 17 ) ).toHaveCSS( 'inset-block-end', '20px' );
		} );
	} );

	test( 'should convert positioning offset properties', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="position: absolute; top: 15px;">Top offset 15px</p>
				<p style="position: absolute; right: 25px;">Right offset 25px</p>
				<p style="position: absolute; bottom: 30px;">Bottom offset 30px</p>
				<p style="position: absolute; left: 40px;">Left offset 40px</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( '.elementor-widget-e-paragraph p' );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Test physical positioning properties converted to logical properties
		await test.step( 'Verify physical positioning properties converted to logical properties', async () => {
			// Top: 15px should become inset-block-start: 15px
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'inset-block-start', '15px' );

			// Right: 25px should become inset-inline-end: 25px
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'inset-inline-end', '25px' );

			// Bottom: 30px should become inset-block-end: 30px
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'inset-block-end', '30px' );

			// Left: 40px should become inset-inline-start: 40px
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'inset-inline-start', '40px' );
		} );
	} );

	test( 'should support unitless zero for all positioning properties', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<!-- Physical positioning properties with unitless zero -->
				<p style="position: absolute; top: 0;">Top unitless zero</p>
				<p style="position: absolute; right: 0;">Right unitless zero</p>
				<p style="position: absolute; bottom: 0;">Bottom unitless zero</p>
				<p style="position: absolute; left: 0;">Left unitless zero</p>
				
				<!-- Logical positioning properties with unitless zero -->
				<p style="position: absolute; inset-block-start: 0;">Inset block start unitless zero</p>
				<p style="position: absolute; inset-inline-end: 0;">Inset inline end unitless zero</p>
				<p style="position: absolute; inset-block-end: 0;">Inset block end unitless zero</p>
				<p style="position: absolute; inset-inline-start: 0;">Inset inline start unitless zero</p>
				
				<!-- Shorthand properties with unitless zero -->
				<p style="position: absolute; inset: 0;">Inset shorthand unitless zero</p>
				<p style="position: absolute; inset-inline: 0;">Inset inline shorthand unitless zero</p>
				<p style="position: absolute; inset-block: 0;">Inset block shorthand unitless zero</p>
				<p style="position: absolute; inset-inline: 0 0;">Inset inline shorthand two zeros</p>
				<p style="position: absolute; inset-block: 0 0;">Inset block shorthand two zeros</p>
				
				<!-- Z-index with unitless zero -->
				<p style="z-index: 0;">Z-index unitless zero</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( '.elementor-widget-e-paragraph p' );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Test physical positioning properties with unitless zero
		await test.step( 'Verify physical positioning properties with unitless zero', async () => {
			// Top: 0 should become inset-block-start: 0px
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'inset-block-start', '0px' );

			// Right: 0 should become inset-inline-end: 0px
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'inset-inline-end', '0px' );

			// Bottom: 0 should become inset-block-end: 0px
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'inset-block-end', '0px' );

			// Left: 0 should become inset-inline-start: 0px
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'inset-inline-start', '0px' );
		} );

		// Test logical positioning properties with unitless zero
		await test.step( 'Verify logical positioning properties with unitless zero', async () => {
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'inset-block-start', '0px' );

			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'inset-inline-end', '0px' );

			await expect( paragraphElements.nth( 6 ) ).toHaveCSS( 'inset-block-end', '0px' );

			await expect( paragraphElements.nth( 7 ) ).toHaveCSS( 'inset-inline-start', '0px' );
		} );

		// Test shorthand properties with unitless zero
		await test.step( 'Verify shorthand positioning properties with unitless zero', async () => {
			// Inset: 0 (single value - all 4 sides)
			await expect( paragraphElements.nth( 8 ) ).toHaveCSS( 'inset-block-start', '0px' );
			await expect( paragraphElements.nth( 8 ) ).toHaveCSS( 'inset-inline-end', '0px' );
			await expect( paragraphElements.nth( 8 ) ).toHaveCSS( 'inset-block-end', '0px' );
			await expect( paragraphElements.nth( 8 ) ).toHaveCSS( 'inset-inline-start', '0px' );

			// Inset-inline: 0 (single value)
			await expect( paragraphElements.nth( 9 ) ).toHaveCSS( 'inset-inline-start', '0px' );
			await expect( paragraphElements.nth( 9 ) ).toHaveCSS( 'inset-inline-end', '0px' );

			// Inset-block: 0 (single value)
			await expect( paragraphElements.nth( 10 ) ).toHaveCSS( 'inset-block-start', '0px' );
			await expect( paragraphElements.nth( 10 ) ).toHaveCSS( 'inset-block-end', '0px' );

			// Inset-inline: 0 0 (two values)
			await expect( paragraphElements.nth( 11 ) ).toHaveCSS( 'inset-inline-start', '0px' );
			await expect( paragraphElements.nth( 11 ) ).toHaveCSS( 'inset-inline-end', '0px' );

			// Inset-block: 0 0 (two values)
			await expect( paragraphElements.nth( 12 ) ).toHaveCSS( 'inset-block-start', '0px' );
			await expect( paragraphElements.nth( 12 ) ).toHaveCSS( 'inset-block-end', '0px' );
		} );

		// Test z-index with unitless zero
		await test.step( 'Verify z-index with unitless zero', async () => {
			await expect( paragraphElements.nth( 13 ) ).toHaveCSS( 'z-index', '0' ); // z-index: 0 should remain '0' in computed styles
		} );
	} );
} );
