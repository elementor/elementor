import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { timeouts } from '../../../config/timeouts';
import { openPromotionPopover, promotionPopoverSelector } from './promotion-popover-helper';

test.describe( 'Locked widget promotion popover @promotions', () => {
	test( 'Promotion popover stays open after clicking a locked panel widget', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		const promotionWidget = page.locator( '.elementor-element-wrapper.elementor-element--promotion .elementor-element' ).first();
		await expect( promotionWidget ).toBeVisible( { timeout: timeouts.longAction } );

		await openPromotionPopover( promotionWidget );

		await expect.poll(
			async () => page.locator( promotionPopoverSelector ).count(),
			{ timeout: timeouts.longAction },
		).toBeGreaterThan( 0 );
	} );
} );
