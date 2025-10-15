import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Device mode', () => {
	test( 'Correct device mode is returned on Desktop', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( { widgetType: 'heading', container } );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.e-con' );

		const deviceMode = await page.evaluate( () => {
			return elementorFrontend.getCurrentDeviceMode();
		} );

		const isInDesktopMode = 'desktop' === deviceMode;

		expect( isInDesktopMode ).toEqual( true );
	} );
} );
