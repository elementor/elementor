const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );

test.describe( 'Device mode', () => {
    test( 'Correct device mode is returned', async ( { page }, testInfo ) => {
		await page.goto( '/' );

		const deviceMode = await page.evaluate( () => {
			return elementorFrontend.getCurrentDeviceMode();
		} );

		console.log( deviceMode );

		const isInDesktopMode = deviceMode === 'desktop';

		expect( isInDesktopMode ).toBeTruthy();
	} );
} );
