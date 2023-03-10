const { test, expect } = require( '@playwright/test' );

test.describe( 'Device mode', () => {
    test( 'Correct device mode is returned', async ( { page }, testInfo ) => {
		await page.goto( '/' );

		const deviceMode = await page.evaluate( () => {
			return elementorFrontend.getCurrentDeviceMode();
		} );

		const isInDesktopMode = deviceMode === 'desktop';

		expect( isInDesktopMode ).toBeTruthy();
	} );
} );
