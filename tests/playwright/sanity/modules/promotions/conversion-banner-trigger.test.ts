import { expect } from '@playwright/test';
import {
	BANNER_READY_SELECTOR,
	createPublishedElementorPage,
	deleteConversionBannerTestPages,
	resetConversionBannerTriggerState,
} from '../../../assets/promotion-cdn';
import { timeouts } from '../../../config/timeouts';
import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';

const testPageIds: string[] = [];

test.describe.serial( 'Conversion banner admin trigger @promotions', () => {
	test.beforeEach( async ( { page, apiRequests } ) => {
		await resetConversionBannerTriggerState();
		await deleteConversionBannerTestPages( page.context().request, apiRequests, testPageIds );
	} );

	test.afterEach( async ( { page, apiRequests } ) => {
		await deleteConversionBannerTestPages( page.context().request, apiRequests, testPageIds );
	} );

	test( 'Does not show the banner with fewer than two Elementor pages', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await createPublishedElementorPage( page.context().request, apiRequests, testPageIds );
		await wpAdmin.openWordPressDashboard();

		await expect( page.locator( BANNER_READY_SELECTOR ) ).toHaveCount( 0, { timeout: timeouts.expect } );
	} );

	test( 'Shows the banner after two Elementor pages on the dashboard', async ( { page, apiRequests }, testInfo ) => {
		const request = page.context().request;
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await createPublishedElementorPage( request, apiRequests, testPageIds );
		await createPublishedElementorPage( request, apiRequests, testPageIds );
		await wpAdmin.openWordPressDashboard();

		const banner = page.locator( BANNER_READY_SELECTOR );

		await expect( banner ).toBeVisible( { timeout: timeouts.longAction } );
		await expect( banner.locator( '.e-conversion-banner__title' ) ).toContainText( 'Elementor Pro' );
	} );
} );
