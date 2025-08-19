import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
	const context = await browser.newContext();
	const page = await context.newPage();
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.setExperiments( {
		e_opt_in_v4_page: 'active',
		e_atomic_elements: 'active',
	} );

	await page.close();
} );

test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
	const context = await browser.newContext();
	const page = await context.newPage();
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.resetExperiments();
	await page.close();
} );

const testData = [
	{
		name: 'url_with_query_params',
		input: 'https://elementor.com/search/?type=article&q=Python',
		expected: 'https://elementor.com/search/?type=article&q=Python',
	},
	{
		name: 'anchor_link',
		input: 'https://elementor.com/page#section-1',
		expected: 'https://elementor.com/page#section-1',
	},
	{
		name: 'complex_url_with_multiple_params_and_anchor',
		input: 'https://elementor.com/search?q=test&category=php&sort=date&order=desc#results',
		expected: 'https://elementor.com/search?q=test&category=php&sort=date&order=desc#results',
	},
	{
		name: 'url_with_special_characters',
		input: 'https://elementor.com/search?q=hello%20world&filter=a+b&special=%21%40%23',
		expected: 'https://elementor.com/search?q=hello%20world&filter=a+b&special=%21%40%23',
	},
	{
		name: 'url_with_spaces',
		input: 'https://elementor.com/search?q=hello world',
		expected: 'https://elementor.com/search?q=hello%20world',
	},
];

test.describe( 'Link control tests @v4-tests', () => {
	test( 'Link sanitization tests', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		let buttonId;

		await test.step( 'Setup the widget', async () => {
			await editor.closeNavigatorIfOpen();
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		} );

		for ( const { name, input, expected } of testData ) {
			await test.step( `Test case: ${ name }`, async () => {
				await editor.selectElement( buttonId );
				await editor.openV2PanelTab( 'general' );
				await page.locator( '[aria-label="Toggle link"]' ).click();
				await editor.v4Panel.fillField( 1, input );

				await editor.publishPage();
				await page.reload();
				await editor.waitForPanelToLoad();

				const button = await editor.getWidget( buttonId );
				const anchor = button.locator( 'a' );

				await expect( anchor ).toHaveAttribute( 'href', expected, { timeout: 1000 } );
			} );
		}
	} );
} );
