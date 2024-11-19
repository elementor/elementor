import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Playing cards widget sanity test', () => {
	let editor;
	let wpAdmin;
	let context;
	let page;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		editor = await wpAdmin.openNewPage();
	} );

	test('Add multipel cards', async () => {
		// Add playing card widget
		await editor.addWidget( 'playing-cards' );
		// Add new cards
		await page.click('text=Add Item');
		await page.click('text=Add Item');

		expect(await page.screenshot()).toMatchSnapshot();
	});

	test(`Change card's number & suite `, async () => {
		// Add playing card widget
		await editor.addWidget( 'playing-cards' );
		// Set initial card number to "Q" and it's suite to ♥
		await page.click('.elementor-repeater-row-item-title');
		await editor.setSelectControlValue( 'number', 'Q' );
		await editor.setSelectControlValue( 'suite', '♥' );

		expect(await page.screenshot()).toMatchSnapshot();
	});
});
