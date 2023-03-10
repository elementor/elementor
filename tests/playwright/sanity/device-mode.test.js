const { test, expect } = require( '@playwright/test' );

test.describe( 'Device mode', () => {
    test.only( 'Correct device mode is returned', async ( { page }, testInfo ) => {
		await page.goto( '/' );

		const deviceMode = await page.evaluate( () => {
			return window.elementorFrontend.getCurrentDeviceMode();
		} );

		const isInDesktopMode = 'desktop' === deviceMode;

		expect( isInDesktopMode ).toEqual( true );
	} );
} );
