import { expect } from '@playwright/test';
import { disablePromotionCdn } from '../../../assets/disable-promotion-cdn';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { timeouts } from '../../../config/timeouts';
import { wpCli } from '../../../assets/wp-cli';

// The banner image comes from the real CDN. PR runs mask it, so a new image on the CDN cannot block them,
// while the nightly and manual runs check the real image.
const CHECK_CDN_IMAGES = [ 'schedule', 'workflow_dispatch' ].includes( process.env.GITHUB_EVENT_NAME ?? '' );

test.describe( 'Editor One Menu Visual Tests', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		test.setTimeout( timeouts.singleTest );
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setSiteLanguage( '' );
		await context.close();
	} );

	test( 'Editor One full page screenshot - Hebrew', async ( { page, apiRequests }, testInfo ) => {
		test.setTimeout( timeouts.singleTest );
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await disablePromotionCdn();
		await wpAdmin.setSiteLanguage( 'he_IL' );
		await wpAdmin.updateTranslations();
		await wpCli( 'wp language plugin install elementor he_IL' );

		await page.goto( '/wp-admin/admin.php?page=elementor', {
			timeout: timeouts.singleTest,
			waitUntil: 'domcontentloaded',
		} );

		await wpAdmin.cleanAdminPageForScreenshot();
		// The conversion banner unlocks once earlier tests create two Elementor pages, so it depends on test order.
		await page.addStyleTag( { content: '#e-conversion-banner { display: none !important; }' } );

		const sidebar = page.locator( '#editor-one-sidebar-navigation' );
		const sidebarBannerImage = page.locator( '#e-home-screen .MuiContainer-maxWidthXs img' );
		await expect( sidebar ).toBeVisible();

		await page.waitForLoadState( 'load', { timeout: timeouts.heavyAction } );

		await expect.soft( page ).toHaveScreenshot( 'editor-one-quickstart-full-page-hebrew.png', {
			timeout: timeouts.heavyAction,
			maxDiffPixelRatio: 0.1,
			mask: [
				page.locator( '#wpadminbar' ),
				page.locator( '#adminmenumain' ),
				page.locator( '#e-conversion-banner' ),
				sidebarBannerImage,
			],
		} );

		if ( CHECK_CDN_IMAGES ) {
			await expect.poll( () => sidebarBannerImage.evaluate( ( image: HTMLImageElement ) => image.complete ? image.naturalWidth : 0 ), {
				message: 'The sidebar banner image loads from the CDN',
				timeout: timeouts.heavyAction,
			} ).toBeGreaterThan( 0 );

			await expect.soft( sidebarBannerImage ).toHaveScreenshot( 'editor-one-home-sidebar-banner.png', {
				timeout: timeouts.heavyAction,
			} );
		}
	} );
} );
