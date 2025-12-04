import { expect, request } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { type LicenseType, mockHomeScreenData, transformMockDataByLicense } from './home-screen.helper';

test.describe( 'Home screen visual regression tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_editor_one: false } );
		await wpAdmin.enableAdvancedUploads();
		await page.close();
		await context.close();
	} );

	const licenseTypes: LicenseType[] = [ 'free', 'pro' ];

	for ( const licenseType of licenseTypes ) {
		test( `${ licenseType } license variant - UI renders correctly with mocked data`, async ( { page, apiRequests, storageState } ) => {
			const requestContext = await request.newContext( { storageState } );
			try {
				const mockData = transformMockDataByLicense( licenseType );
				await mockHomeScreenData( page, mockData, apiRequests, requestContext );
				await page.goto( 'wp-admin/admin.php?page=elementor' );
				await page.waitForURL( '**/wp-admin/admin.php?page=elementor' );
				await page.waitForSelector( '#e-home-screen', { timeout: 10000 } );
				await page.waitForLoadState( 'networkidle' );
				const homeScreen = page.locator( '#e-home-screen' );
				await expect( homeScreen ).toHaveScreenshot( `home-screen-${ licenseType }.png` );
			} finally {
				await requestContext.dispose();
			}
		} );
	}
} );
