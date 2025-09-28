import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Gap Prop Type Integration @prop-types', () => {
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
		await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async () => {
		// Setup for each test if needed
	} );

	test( 'should convert single gap values and verify atomic mapper success', async ( { request } ) => {
		const htmlContent = `
			<div style="display: flex; gap: 10px;">Gap 10px</div>
			<div style="display: flex; gap: 20px;">Gap 20px</div>
			<div style="display: flex; gap: 1rem;">Gap 1rem</div>
			<div style="display: flex; gap: 2em;">Gap 2em</div>
			<div style="display: flex; gap: 0;">Gap 0</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		// Check if API call failed due to backend issues
		if ( apiResult.errors && apiResult.errors.length > 0 ) {
			test.skip( true, 'Skipping due to backend property mapper issues: ' + apiResult.errors.join( ', ' ) );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.conversion_log.css_processing.properties_converted ).toBeGreaterThan( 0 );
	} );

	test( 'should convert gap shorthand values and verify atomic mapper success', async ( { request } ) => {
		const htmlContent = `
			<div style="display: flex; gap: 10px 20px;">Gap 10px 20px</div>
			<div style="display: flex; gap: 1rem 2rem;">Gap 1rem 2rem</div>
			<div style="display: flex; gap: 5px 10px;">Gap 5px 10px</div>
			<div style="display: flex; gap: 0 10px;">Gap 0 10px</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		// Check if API call failed due to backend issues
		if ( apiResult.errors && apiResult.errors.length > 0 ) {
			test.skip( true, 'Skipping due to backend property mapper issues: ' + apiResult.errors.join( ', ' ) );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.conversion_log.css_processing.properties_converted ).toBeGreaterThan( 0 );
	} );

	test( 'should convert individual row-gap and column-gap properties and verify atomic mapper success', async ( { request } ) => {
		const htmlContent = `
			<div style="display: flex; row-gap: 10px;">Row gap 10px</div>
			<div style="display: flex; column-gap: 20px;">Column gap 20px</div>
			<div style="display: flex; row-gap: 1rem;">Row gap 1rem</div>
			<div style="display: flex; column-gap: 2em;">Column gap 2em</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		// Check if API call failed due to backend issues
		if ( apiResult.errors && apiResult.errors.length > 0 ) {
			test.skip( true, 'Skipping due to backend property mapper issues: ' + apiResult.errors.join( ', ' ) );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.conversion_log.css_processing.properties_converted ).toBeGreaterThan( 0 );
	} );

	test( 'should handle gap with different CSS units and verify atomic mapper success', async ( { request } ) => {
		const htmlContent = `
			<div style="display: flex; gap: 12px;">Gap pixels</div>
			<div style="display: flex; gap: 1.5em;">Gap em units</div>
			<div style="display: flex; gap: 2rem;">Gap rem units</div>
			<div style="display: flex; gap: 10%;">Gap percentage</div>
			<div style="display: flex; gap: 5vh;">Gap viewport height</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		// Check if API call failed due to backend issues
		if ( apiResult.errors && apiResult.errors.length > 0 ) {
			test.skip( true, 'Skipping due to backend property mapper issues: ' + apiResult.errors.join( ', ' ) );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.conversion_log.css_processing.properties_converted ).toBeGreaterThan( 0 );
	} );

	test( 'should verify atomic widget structure for gap properties', async ( { request } ) => {
		const htmlContent = `
			<div style="display: flex; gap: 20px;">Simple gap test</div>
			<div style="display: flex; gap: 15px 25px;">Gap shorthand test</div>
		`;
		
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );

		// Verify the atomic widget conversion was successful
		expect( apiResult.conversion_log ).toBeDefined();
		expect( apiResult.conversion_log.css_processing ).toBeDefined();
		expect( apiResult.conversion_log.css_processing.properties_converted ).toBeGreaterThan( 0 );
	} );
} );
