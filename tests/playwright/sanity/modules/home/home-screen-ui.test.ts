import { expect, request } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { type LicenseType, mockHomeScreenData, transformMockDataByLicense, navigateToHomeScreen } from './home-screen.helper';

test.describe( 'Home screen visual regression tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_editor_one: 'inactive' } );
		await wpAdmin.enableAdvancedUploads();
		await page.close();
		await context.close();
	} );

	const licenseTypes: LicenseType[] = [ 'free', 'pro' ];

	for ( const licenseType of licenseTypes ) {
		test( `${ licenseType } license variant - UI renders correctly with mocked data`, async ( { page, apiRequests, storageState } ) => {
			const requestContext = await request.newContext( { storageState } );
			const mockData = transformMockDataByLicense( licenseType );
			await mockHomeScreenData( page, mockData, apiRequests, requestContext );
			const homeScreen = await navigateToHomeScreen( page );
			await expect.soft( homeScreen ).toHaveScreenshot( `home-screen-${ licenseType }.png` );
			await requestContext.dispose();
		} );
	}
} );
