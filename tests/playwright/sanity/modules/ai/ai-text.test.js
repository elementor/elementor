import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { userInformationMock } from './user-information.mock';

test.describe( 'AI @ai', () => {
	test( 'Text', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Open the modal with default value from the control', async () => {
			await editor.addWidget( 'heading' );

			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: userInformationMock,
					} );
				}
			} );

			await expect( page.getByText( 'Generate text' ) ).toHaveCount(1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Open the modal with non-default value from the control', async () => {
			await editor.addWidget( 'heading' );
			await page.locator( '.elementor-control-title.elementor-control-type-textarea textarea' ).fill( 'Hello World' );

			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: userInformationMock,
					} );
				}
			} );

			await expect( page.getByText( 'Use text' ) ).toHaveCount(1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );
	} );
} );
