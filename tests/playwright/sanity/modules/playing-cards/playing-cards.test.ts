import { expect, type Page, type BrowserContext } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Playing cards widget sanity test', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		editor = await wpAdmin.openNewPage();
	} );

	test( 'it successfully adds card', async () => {
		await editor.addWidget( 'playing-cards' );
		await page.click( 'text=Add Item' );

		expect( await page.screenshot() ).toMatchSnapshot();
	} );
} );
