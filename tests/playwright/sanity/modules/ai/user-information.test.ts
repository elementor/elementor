import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import {
	userInformationMock,
	userInformationExceededQuotaMock,
	userInformationNoConnectedMock,
	userInformationConnectedNoGetStartedMock,
} from './user-information.mock';

test.describe( 'AI @ai', () => {
	test( 'User Information', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );

		await test.step( 'Connected and Get started', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: userInformationMock,
					} );
				}
			} );

			await expect( page.locator( 'input[name="prompt"]' ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Exceeded the quota', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: userInformationExceededQuotaMock,
					} );
				}
			} );

			await expect( page.getByText( 'You\'ve used 100% of the free trial' ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'No connected', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: userInformationNoConnectedMock,
					} );
				}
			} );

			await expect( page.getByText( 'By clicking "Connect", I approve the' ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Connected but no get started', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: userInformationConnectedNoGetStartedMock,
					} );
				}
			} );

			await expect( page.getByText( 'This includes consenting to the collection and use of data to improve user experience.' ) ).toHaveCount( 1 );

			await page.locator( '#e-ai-terms-approval' ).click();

			await expect( page.getByText( 'Get Started' ) ).toBeEnabled();

			await page.locator( 'button[aria-label="close"]' ).click();
		} );
	} );
} );
