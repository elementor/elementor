import { expect, request } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { saveHomepageSettings, restoreHomepageSettings, mockHomeScreenData, transformMockDataByLicense, navigateToHomeScreen, type HomepageSettings } from './home-screen.helper';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Home screen Edit site button tests', () => {
	let originalHomepageSettings: HomepageSettings | null = null;

	test.beforeAll( async ( { browser, apiRequests } ) => {
		await wpCli( 'wp elementor experiments activate e_editor_one' );
		const context = await browser.newContext();
		const page = await context.newPage();
		const requestContext = page.context().request;
		originalHomepageSettings = await saveHomepageSettings( apiRequests, requestContext );
		await page.close();
		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests } ) => {
		await wpCli( 'wp elementor experiments deactivate e_editor_one' );
		const context = await browser.newContext();
		const page = await context.newPage();

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

	test( 'Edit site button has valid Elementor link', async ( { page } ) => {
		await page.goto( 'wp-admin/admin.php?page=elementor' );

		const editWebsiteButton = page.locator( 'a:has-text("Edit site"), button:has-text("Edit site")' ).first();
		await expect( editWebsiteButton ).toBeVisible();

		const href = await editWebsiteButton.getAttribute( 'href' );
		expect( href ).toBeTruthy();

		const isValidElementorUrl = href!.match( /admin\.php\?action=elementor_edit_website_redirect/ );
		expect( isValidElementorUrl ).toBeTruthy();
		expect( href ).toContain( '_wpnonce' );
	} );
} );

