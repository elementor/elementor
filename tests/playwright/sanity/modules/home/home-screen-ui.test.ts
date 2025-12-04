import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { type LicenseType, mockHomeScreenData, transformMockDataByLicense } from './home-screen.helper';

test.describe( 'Home screen visual regression tests', () => {
	const licenseTypes: LicenseType[] = [ 'free', 'pro' ];

	for ( const licenseType of licenseTypes ) {
		test( `${ licenseType } license variant - UI renders correctly with mocked data`, async ( { page } ) => {
			const mockData = transformMockDataByLicense( licenseType );
			await mockHomeScreenData( page, mockData );
			await page.goto( 'wp-admin/admin.php?page=elementor' );
			await page.waitForURL( '**/wp-admin/admin.php?page=elementor' );
			await page.waitForSelector( '#e-home-screen', { timeout: 10000 } );
			await page.waitForLoadState( 'networkidle' );

			const homeScreen = page.locator( '#e-home-screen' );
			await expect( homeScreen ).toHaveScreenshot( `home-screen-${ licenseType }.png` );
		} );
	}
} );
