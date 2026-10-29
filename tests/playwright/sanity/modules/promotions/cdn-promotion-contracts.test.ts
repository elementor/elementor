import { expect } from '@playwright/test';
import {
	clearPromotionCdnCache,
	hidePromoChromeForScreenshot,
	seedPromotionCdnCache,
	STICKY_PANEL_CDN_OPTION,
	STICKY_PANEL_FIXTURE,
	STICKY_PANEL_STICKY_ROOT,
} from '../../../assets/promotion-cdn';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Editor promotions CDN contracts @promotions @cdn-promotions', () => {
	test.beforeEach( async () => {
		await clearPromotionCdnCache( STICKY_PANEL_CDN_OPTION );
		await seedPromotionCdnCache( STICKY_PANEL_CDN_OPTION, STICKY_PANEL_FIXTURE );
	} );

	test.afterEach( async () => {
		await clearPromotionCdnCache( STICKY_PANEL_CDN_OPTION );
	} );

	test( 'Sticky panel shows seeded CDN copy on the elements panel', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		const sticky = page.locator( STICKY_PANEL_STICKY_ROOT );

		await expect( sticky ).toBeVisible();
		await expect( sticky ).toContainText( STICKY_PANEL_FIXTURE.message! );
		await expect(
			sticky.getByRole( 'link', { name: STICKY_PANEL_FIXTURE.button_text! } ),
		).toHaveAttribute( 'href', STICKY_PANEL_FIXTURE.url! );
	} );

	test( 'Elements panel config matches seeded sticky CDN payload', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		const configPromotion = await page.evaluate( () => {
			return window.elementor?.config?.editingPanelStickyPromotion ?? null;
		} );

		expect( configPromotion ).toMatchObject( {
			message: STICKY_PANEL_FIXTURE.message,
			button_text: STICKY_PANEL_FIXTURE.button_text,
			url: STICKY_PANEL_FIXTURE.url,
		} );
	} );
} );

test.describe( 'Promo chrome masking for unrelated panel snapshots @promotions @cdn-promotions', () => {
	test( 'hidePromoChromeForScreenshot hides sticky strip before capture', async ( { page, apiRequests }, testInfo ) => {
		await seedPromotionCdnCache( STICKY_PANEL_CDN_OPTION, STICKY_PANEL_FIXTURE );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		const sticky = page.locator( STICKY_PANEL_STICKY_ROOT );
		await expect( sticky ).toBeVisible();

		await hidePromoChromeForScreenshot( page );

		await expect( sticky ).toHaveCSS( 'visibility', 'hidden' );

		await clearPromotionCdnCache( STICKY_PANEL_CDN_OPTION );
	} );
} );
