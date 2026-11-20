import { expect } from '@playwright/test';
import { disablePromotionCdn } from '../../../assets/disable-promotion-cdn';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { timeouts } from '../../../config/timeouts';

test.describe( 'Editor One Menu Visual Tests', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		test.setTimeout( timeouts.singleTest );
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setSiteLanguage( '' );
		await context.close();
	} );

	// Skipped until home-screen.json from the editor-assets CDN is mocked: the live BFCM sidebar banner breaks the screenshot [ED-26387].
	test.skip( 'Editor One full page screenshot - Hebrew', async ( { page, apiRequests }, testInfo ) => {
		test.setTimeout( timeouts.singleTest );
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await disablePromotionCdn();
		await wpAdmin.setSiteLanguage( 'he_IL' );
		await wpAdmin.updateTranslations();

		await page.goto( '/wp-admin/admin.php?page=elementor', {
			timeout: timeouts.singleTest,
			waitUntil: 'domcontentloaded',
		} );

		await wpAdmin.cleanAdminPageForScreenshot();

		const sidebar = page.locator( '#editor-one-sidebar-navigation' );
		await expect( sidebar ).toBeVisible();

		await page.waitForLoadState( 'load', { timeout: timeouts.heavyAction } );

		await expect.soft( page ).toHaveScreenshot( 'editor-one-quickstart-full-page-hebrew.png', {
			timeout: timeouts.heavyAction,
			maxDiffPixelRatio: 0.1,
			mask: [
				page.locator( '#wpadminbar' ),
				page.locator( '#adminmenumain' ),
				page.locator( '#e-conversion-banner' ),
			],
		} );
	} );
} );
