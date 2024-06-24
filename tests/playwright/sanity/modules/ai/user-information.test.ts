import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import {
	userInformationMock,
	freeUserInformationExceededQuota75Mock,
	freeUserInformationExceededQuota80Mock,
	freeUserInformationExceededQuota95Mock,
	paidUserInformationExceededQuota75Mock,
	paidUserInformationExceededQuota80Mock,
	paidUserInformationExceededQuota95Mock,
	userInformationNoConnectedMock,
	userInformationConnectedNoGetStartedMock,
} from './user-information.mock';

const CREDITS_USAGE_MESSAGE = 'You’ve used %s of credits for this AI feature.';

test.describe( 'AI @ai', () => {
	test( 'User Information', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

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

		await test.step( 'Free user has exceeded the quota with 75% usage', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: freeUserInformationExceededQuota75Mock,
					} );
				}
			} );

			const message = CREDITS_USAGE_MESSAGE.replace( '%s', '75%' );
			await expect( page.getByText( message ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Free user has exceeded the quota with 80% usage', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: freeUserInformationExceededQuota80Mock,
					} );
				}
			} );

			const message = CREDITS_USAGE_MESSAGE.replace( '%s', '80%' );
			await expect( page.getByText( message ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Free user has exceeded the quota with 95% usage', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: freeUserInformationExceededQuota95Mock,
					} );
				}
			} );

			const message = CREDITS_USAGE_MESSAGE.replace( '%s', '95%' );
			await expect( page.getByText( message ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Paid user has exceeded the quota with 75% usage', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: paidUserInformationExceededQuota75Mock,
					} );
				}
			} );

			const message = CREDITS_USAGE_MESSAGE.replace( '%s', '75%' );
			await expect( page.getByText( message ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Paid user has exceeded the quota with 80% usage', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: paidUserInformationExceededQuota80Mock,
					} );
				}
			} );

			const message = CREDITS_USAGE_MESSAGE.replace( '%s', '80%' );
			await expect( page.getByText( message ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );

		await test.step( 'Paid user has exceeded the quota with 95% usage', async () => {
			await page.click( '.e-ai-button' );

			await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
				const requestPostData = route.request().postData();

				if ( requestPostData.includes( 'ai_get_user_information' ) ) {
					await route.fulfill( {
						json: paidUserInformationExceededQuota95Mock,
					} );
				}
			} );

			const message = CREDITS_USAGE_MESSAGE.replace( '%s', '95%' );
			await expect( page.getByText( message ) ).toHaveCount( 1 );

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
