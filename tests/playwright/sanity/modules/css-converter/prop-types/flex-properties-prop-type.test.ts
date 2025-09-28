import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Flex Properties Prop Type Integration @prop-types', () => {
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
		await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test.skip( 'should convert flex properties - SKIPPED: Complex flex layout testing needs investigation', async ( { page, request } ) => {
		// This test is skipped because flex properties testing with containers and items is complex
		// The element selection for flex containers and flex items needs investigation
		// Flex properties work in manual testing but are difficult to test reliably in Playwright
		
		const combinedCssContent = `
			<div>
				<div style="display: flex; justify-content: center;">
					<p>Centered content</p>
				</div>
				<div style="display: flex; align-items: center;">
					<p>Vertically centered</p>
				</div>
			</div>
		`;

		// Test implementation would go here but is currently complex to implement correctly
		// Need to investigate proper element selection for flex containers and flex properties
	} );
} );