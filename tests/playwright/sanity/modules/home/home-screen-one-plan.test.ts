import { expect, request } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { saveHomepageSettings, restoreHomepageSettings, mockHomeScreenData, transformMockDataByLicense, navigateToHomeScreen, type HomepageSettings } from './home-screen.helper';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Home screen Edit Website button tests', () => {
	let originalHomepageSettings: HomepageSettings | null = null;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_editor_one: true } );
		const requestContext = page.context().request;
		originalHomepageSettings = await saveHomepageSettings( apiRequests, requestContext );
		await page.close();
		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();

		if ( originalHomepageSettings ) {
			const requestContext = page.context().request;
			await restoreHomepageSettings( apiRequests, requestContext, originalHomepageSettings );
		}

		await page.close();
		await context.close();
	} );

	test( 'one license variant - UI renders correctly with mocked data', async ( { page, apiRequests, storageState } ) => {
		const requestContext = await request.newContext( { storageState } );
		const mockData = transformMockDataByLicense( 'one' );

		await mockHomeScreenData( page, mockData, apiRequests, requestContext );

		const homeScreen = await navigateToHomeScreen( page );
		await expect.soft( homeScreen ).toHaveScreenshot( 'home-screen-one.png' );
		await requestContext.dispose();
	} );

	test( 'Edit Website button has valid Elementor link', async ( { page } ) => {
		await page.goto( 'wp-admin/admin.php?page=elementor' );

		const editWebsiteButton = page.locator( 'a:has-text("Edit Website"), button:has-text("Edit Website")' ).first();
		await expect( editWebsiteButton ).toBeVisible();

		const href = await editWebsiteButton.getAttribute( 'href' );
		expect( href ).toBeTruthy();

		const isValidElementorUrl = href!.match( /wp-admin\/(post\.php\?post=\d+&action=elementor|edit\.php\?action=elementor_new_post&post_type=page)(&.*)?/ );
		expect( isValidElementorUrl ).toBeTruthy();
	} );
} );

