import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';


test.describe( 'WP Admin Elementor Upgrade button @upgrade-button', () => {
	const UPGRADE_LINK_SELECTOR =
		'#toplevel_page_elementor-home .wp-submenu a[href*="elementor-one-upgrade"]';

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openWordPressDashboard();
		await page.goto( '/wp-admin/admin.php?page=elementor' );
		await page.waitForLoadState( 'domcontentloaded' );
	} );

	test( 'Upgrade button is visible in the Elementor WP Admin submenu', async ( { page } ) => {
		// Arrange.
		const link = page.locator( UPGRADE_LINK_SELECTOR );

		// Assert.
		await expect( link ).toBeVisible();
		await expect( link ).toHaveText( 'Upgrade' );
	} );

	test( 'Upgrade button has correct text and background color in normal state', async ( { page } ) => {
		// Arrange.
		const link = page.locator( UPGRADE_LINK_SELECTOR );

		// Assert.
		await expect( link ).toBeVisible();
		await expect( link ).toHaveCSS( 'color', 'rgb(255, 255, 255)' );
		await expect( link ).toHaveCSS( 'background-color', 'rgb(147, 0, 63)' );
	} );

	test( 'Upgrade button text color remains white on hover', async ( { page } ) => {
		// Arrange.
		const link = page.locator( UPGRADE_LINK_SELECTOR );

		// Assert.
		await expect( link ).toBeVisible();

		// Act.
		await link.hover();

		// Assert.
		await expect( link ).toHaveCSS( 'color', 'rgb(255, 255, 255)' );
	} );

	test( 'Upgrade button background lightens on hover', async ( { page } ) => {
		// Arrange.
		const link = page.locator( UPGRADE_LINK_SELECTOR );

		// Act.
		await expect( link ).toBeVisible();

		const normalBg = await link.evaluate(
			( el ) => getComputedStyle( el ).backgroundColor,
		);

		await link.hover();

		const hoverBg = await link.evaluate(
			( el ) => getComputedStyle( el ).backgroundColor,
		);

		// Assert.
		expect( hoverBg ).not.toBe( normalBg );
	} );
} );
