import { expect, request } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { saveHomepageSettings, restoreHomepageSettings, setHomepage, mockHomeScreenData, transformMockDataByLicense, type HomepageSettings } from './home-screen.helper';

test.describe( 'Home screen Edit Website button tests', () => {
	let originalHomepageSettings: HomepageSettings | null = null;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( { e_editor_one: 'active' } );

		const requestContext = page.context().request;
		originalHomepageSettings = await saveHomepageSettings( apiRequests, requestContext );

		await page.close();
		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( { e_editor_one: 'inactive' } );

		if ( originalHomepageSettings ) {
			const requestContext = page.context().request;
			await restoreHomepageSettings( apiRequests, requestContext, originalHomepageSettings );
		}

		await page.close();
		await context.close();
	} );

	test( 'one license variant - UI renders correctly with mocked data', async ( { page, apiRequests, storageState } ) => {
		const requestContext = await request.newContext( { storageState } );
		try {
			const mockData = transformMockDataByLicense( 'one' );
			await mockHomeScreenData( page, mockData, apiRequests, requestContext );
			await page.goto( 'wp-admin/admin.php?page=elementor' );
			await page.waitForURL( '**/wp-admin/admin.php?page=elementor' );
			await page.waitForSelector( '#e-home-screen', { timeout: 10000 } );
			await page.waitForLoadState( 'networkidle' );
			const homeScreen = page.locator( '#e-home-screen' );
			await expect.soft( homeScreen ).toHaveScreenshot( 'home-screen-one.png' );
		} finally {
			await requestContext.dispose();
		}
	} );

	test( 'Edit Website button opens create new page when homepage is not Elementor', async ( { page, apiRequests, storageState } ) => {
		const requestContext = await request.newContext( { storageState } );

		try {
			const gutenbergPageId = await apiRequests.create( requestContext, 'pages', {
				title: 'Test Gutenberg Homepage',
				content: '<!-- wp:paragraph --><p>Gutenberg content</p><!-- /wp:paragraph -->',
				status: 'publish',
			} );

			await setHomepage( apiRequests, requestContext, gutenbergPageId );

			await page.goto( 'wp-admin/admin.php?page=elementor' );
			await page.waitForURL( '**/wp-admin/admin.php?page=elementor' );
			await page.waitForSelector( '#e-home-screen', { timeout: 10000 } );
			await page.waitForLoadState( 'networkidle' );

			const editWebsiteButton = page.locator( 'a:has-text("Edit Website"), button:has-text("Edit Website")' ).first();
			await expect( editWebsiteButton ).toBeVisible();

			const [ newPage ] = await Promise.all( [
				page.waitForEvent( 'popup' ),
				editWebsiteButton.click(),
			] );

			await expect( newPage ).toHaveURL( /wp-admin\/edit\.php\?action=elementor_new_post&post_type=page/ );

			await newPage.close();

			await apiRequests.delete( requestContext, 'pages', String( gutenbergPageId ) );
		} finally {
			await requestContext.dispose();
		}
	} );

	test( 'Edit Website button opens Elementor editor when homepage is Elementor', async ( { page, apiRequests, storageState } ) => {
		const requestContext = await request.newContext( { storageState } );

		try {
			const elementorPageId = await apiRequests.create( requestContext, 'pages', {
				title: 'Test Elementor Homepage',
				content: '',
				status: 'publish',
			} );

			await apiRequests.customPut( requestContext, `index.php?rest_route=/wp/v2/pages/${ elementorPageId }`, {
				meta: {
					_elementor_edit_mode: 'builder',
					_elementor_template_type: 'wp-page',
				},
			} );

			await setHomepage( apiRequests, requestContext, elementorPageId );

			await page.goto( 'wp-admin/admin.php?page=elementor' );
			await page.waitForURL( '**/wp-admin/admin.php?page=elementor' );
			await page.waitForSelector( '#e-home-screen', { timeout: 10000 } );
			await page.waitForLoadState( 'networkidle' );

			const editWebsiteButton = page.locator( 'a:has-text("Edit Website"), button:has-text("Edit Website")' ).first();
			await expect( editWebsiteButton ).toBeVisible();

			const [ editorPage ] = await Promise.all( [
				page.waitForEvent( 'popup' ),
				editWebsiteButton.click(),
			] );

			await expect( editorPage ).toHaveURL( new RegExp( `wp-admin/post\\.php\\?post=${ elementorPageId }&action=elementor` ) );

			await editorPage.close();

			await apiRequests.delete( requestContext, 'pages', String( elementorPageId ) );
		} finally {
			await requestContext.dispose();
		}
	} );
} );

