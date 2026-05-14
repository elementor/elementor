import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

type ExtendedWindow = Window & {
<<<<<<< HEAD
	__angieTopBarEventDetail: Record< string, unknown >;
};

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

test.describe( 'Angie Top Bar Button @angie-top-bar', () => {
	test( 'Angie button in tools menu dispatches create-widget event with top_bar entry point', async ( { page, apiRequests }, testInfo ) => {
=======
	__angieTopBarEventFired: boolean;
};

const ANGIE_GUIDE_TOGGLE_EVENT = 'elementor/editor/toggle-angie-guide';

test.describe( 'Angie Top Bar Button @angie-top-bar', () => {
	test( 'Angie button in tools menu dispatches toggle-angie-guide event', async ( { page, apiRequests }, testInfo ) => {
>>>>>>> 01a2c9657e (Fix: Hide Angie install CTAs for non-admin users [ED-24096] (#35863))
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		// The Angie button is visible when isAngieAvailable() returns false,
		// which is the case in test environments (no Angie iframe present).
		const angieButton = page.getByRole( 'button', { name: 'Angie' } );
		await expect( angieButton ).toBeVisible();

		// Listen for the custom event before clicking.
		await page.evaluate( ( eventName ) => {
<<<<<<< HEAD
			window.addEventListener( eventName, ( e: CustomEvent ) => {
				( window as unknown as ExtendedWindow ).__angieTopBarEventDetail = e.detail;
			} );
		}, CREATE_WIDGET_EVENT );

		await angieButton.click();

		const detail = await page.evaluate( () => {
			return ( window as unknown as ExtendedWindow ).__angieTopBarEventDetail;
		} );

		expect( detail ).toMatchObject( {
			entry_point: 'top_bar',
			prompt: expect.stringContaining( 'Create a widget for me.' ),
		} );
=======
			window.addEventListener( eventName, () => {
				( window as unknown as ExtendedWindow ).__angieTopBarEventFired = true;
			} );
		}, ANGIE_GUIDE_TOGGLE_EVENT );

		await angieButton.click();

		const eventFired = await page.evaluate( () => {
			return ( window as unknown as ExtendedWindow ).__angieTopBarEventFired;
		} );

		expect( eventFired ).toBe( true );
>>>>>>> 01a2c9657e (Fix: Hide Angie install CTAs for non-admin users [ED-24096] (#35863))
	} );
} );
