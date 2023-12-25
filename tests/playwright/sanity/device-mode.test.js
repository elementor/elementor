const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );

test.describe( 'Device mode', () => {
    test( 'Correct device mode is returned on Desktop', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( 'heading', container );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.e-con' );

		const deviceMode = await page.evaluate( () => {
			return elementorFrontend.getCurrentDeviceMode();
		} );

		const isInDesktopMode = 'desktop' === deviceMode;

		expect( isInDesktopMode ).toEqual( true );
	} );
} );
