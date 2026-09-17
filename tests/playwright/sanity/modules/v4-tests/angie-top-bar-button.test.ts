import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

type ExtendedWindow = Window & {
	__angieTopBarEventFired: boolean;
};

const ANGIE_GUIDE_TOGGLE_EVENT = 'elementor/editor/toggle-angie-guide';

test.describe( 'Angie Top Bar Button @angie-top-bar', () => {
	test( 'Angie button in tools menu dispatches toggle-angie-guide event', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		// The Angie button is visible when isAngieAvailable() returns false,
		// which is the case in test environments (no Angie iframe present).
		const angieButton = page.getByRole( 'button', { name: 'Angie' } );
		await expect( angieButton ).toBeVisible();

		// Listen for the custom event before clicking.
		await page.evaluate( ( eventName ) => {
			window.addEventListener( eventName, () => {
				( window as unknown as ExtendedWindow ).__angieTopBarEventFired = true;
			} );
		}, ANGIE_GUIDE_TOGGLE_EVENT );

		await angieButton.click();

		const eventFired = await page.evaluate( () => {
			return ( window as unknown as ExtendedWindow ).__angieTopBarEventFired;
		} );

		expect( eventFired ).toBe( true );
	} );
} );
