import { expect } from '@playwright/test';
import {
	BANNER_READY_SELECTOR,
	clearPromotionCdnCache,
	CONVERSION_BANNER_CDN_OPTION,
	CONVERSION_BANNER_FIXTURE,
	createPublishedElementorPage,
	deleteConversionBannerTestPages,
	ELEMENTOR_APP_THEME_BUILDER_PROMOTION_URL,
	hidePromoChromeForScreenshot,
	resetConversionBannerTriggerState,
	seedPromotionCdnCache,
	PROMOTION_CDN_INACTIVE_FIXTURE,
	SIDE_MENU_CDN_OPTION,
	SIDE_MENU_FIXTURE,
	STICKY_PANEL_CDN_OPTION,
	STICKY_PANEL_FIXTURE,
	STICKY_PANEL_STICKY_ROOT,
	THEME_BUILDER_CDN_OPTION,
	THEME_BUILDER_FIXTURE,
} from '../../../assets/promotion-cdn';
import { timeouts } from '../../../config/timeouts';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

declare global {
	interface Window {
		elementorAppConfig?: {
			promotion?: {
				button_text?: string;
				upgrade_url?: string;
			};
		};
	}
}

test.describe( 'Editor promotions CDN contracts @promotions @cdn-promotions', () => {
	test.describe.configure( { mode: 'serial' } );

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

	test( 'Sticky panel keeps default copy when CDN campaign is inactive', async ( { page, apiRequests }, testInfo ) => {
		await clearPromotionCdnCache( STICKY_PANEL_CDN_OPTION );
		await seedPromotionCdnCache( STICKY_PANEL_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		const sticky = page.locator( STICKY_PANEL_STICKY_ROOT );
		await expect( sticky ).toBeVisible();
		await expect( sticky ).not.toContainText( STICKY_PANEL_FIXTURE.message! );
	} );
} );

test.describe( 'Side menu promotion CDN contracts @promotions @cdn-promotions', () => {
	test.describe.configure( { mode: 'serial' } );

	test.beforeEach( async () => {
		await clearPromotionCdnCache( SIDE_MENU_CDN_OPTION );
		await seedPromotionCdnCache( SIDE_MENU_CDN_OPTION, SIDE_MENU_FIXTURE );
	} );

	test.afterEach( async () => {
		await clearPromotionCdnCache( SIDE_MENU_CDN_OPTION );
	} );

	test( 'WordPress admin menu shows seeded side menu CDN label and URL', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openWordPressDashboard();

		const upgradeLink = page.locator( '#adminmenu' ).getByRole( 'link', {
			name: SIDE_MENU_FIXTURE.label!,
		} );

		await expect( upgradeLink ).toBeVisible();
		await expect( upgradeLink ).toHaveAttribute(
			'href',
			expect.stringContaining( 'elementor-one-upgrade' ),
		);

		const upgradePopupPromise = page.waitForEvent( 'popup' );
		await upgradeLink.click();
		const upgradePopup = await upgradePopupPromise;
		await upgradePopup.waitForURL( SIDE_MENU_FIXTURE.url!, { timeout: timeouts.heavyAction } );
		await upgradePopup.close();
	} );

	test( 'Side menu shows default Upgrade label when CDN campaign is inactive', async ( { page, apiRequests }, testInfo ) => {
		await clearPromotionCdnCache( SIDE_MENU_CDN_OPTION );
		await seedPromotionCdnCache( SIDE_MENU_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openWordPressDashboard();

		const upgradeLink = page.locator( '#adminmenu' ).getByRole( 'link', { name: 'Upgrade' } );
		await expect( upgradeLink ).toBeVisible();
		await expect( upgradeLink ).toHaveAttribute(
			'href',
			expect.stringContaining( 'elementor-one-upgrade' ),
		);
	} );
} );

test.describe.serial( 'Conversion banner promotion CDN contracts @promotions @cdn-promotions', () => {
	const testPageIds: string[] = [];

	test.beforeEach( async ( { page, apiRequests } ) => {
		await resetConversionBannerTriggerState();
		await deleteConversionBannerTestPages( page.context().request, apiRequests, testPageIds );
		await clearPromotionCdnCache( CONVERSION_BANNER_CDN_OPTION );
		await seedPromotionCdnCache( CONVERSION_BANNER_CDN_OPTION, CONVERSION_BANNER_FIXTURE );
	} );

	test.afterEach( async ( { page, apiRequests } ) => {
		await deleteConversionBannerTestPages( page.context().request, apiRequests, testPageIds );
		await clearPromotionCdnCache( CONVERSION_BANNER_CDN_OPTION );
	} );

	test( 'Dashboard banner shows seeded conversion CDN copy after trigger', async ( { page, apiRequests }, testInfo ) => {
		const request = page.context().request;
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await createPublishedElementorPage( request, apiRequests, testPageIds );
		await createPublishedElementorPage( request, apiRequests, testPageIds );
		await wpAdmin.openWordPressDashboard();

		const banner = page.locator( BANNER_READY_SELECTOR );

		await expect( banner ).toBeVisible( { timeout: timeouts.longAction } );
		await expect( banner.locator( '.e-conversion-banner__title' ) ).toHaveText(
			CONVERSION_BANNER_FIXTURE.title!,
		);
		await expect( banner.locator( '.e-conversion-banner__text' ) ).toHaveText(
			CONVERSION_BANNER_FIXTURE.text!,
		);
		await expect(
			banner.getByRole( 'link', { name: CONVERSION_BANNER_FIXTURE.cta_text! } ),
		).toHaveAttribute( 'href', CONVERSION_BANNER_FIXTURE.cta_url! );
	} );
} );

test.describe( 'Theme builder promotion CDN contracts @promotions @cdn-promotions', () => {
	test.describe.configure( { mode: 'serial' } );

	test.beforeEach( async () => {
		await clearPromotionCdnCache( THEME_BUILDER_CDN_OPTION );
		await seedPromotionCdnCache( THEME_BUILDER_CDN_OPTION, THEME_BUILDER_FIXTURE );
	} );

	test.afterEach( async () => {
		await clearPromotionCdnCache( THEME_BUILDER_CDN_OPTION );
	} );

	test( 'Site editor promotion page uses seeded theme builder CDN copy', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.login();
		await page.goto( ELEMENTOR_APP_THEME_BUILDER_PROMOTION_URL );

		await expect(
			page.getByRole( 'heading', { name: 'Customize every part of your site' } ),
		).toBeVisible( { timeout: timeouts.longAction } );

		const upgradeLink = page.getByRole( 'link', { name: THEME_BUILDER_FIXTURE.button_text! } );

		await expect( upgradeLink ).toHaveAttribute( 'href', THEME_BUILDER_FIXTURE.url! );

		const appPromotionConfig = await page.evaluate( () => {
			return window.elementorAppConfig?.promotion ?? null;
		} );

		expect( appPromotionConfig ).toMatchObject( {
			upgrade_url: THEME_BUILDER_FIXTURE.url,
			button_text: THEME_BUILDER_FIXTURE.button_text,
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

		await expect( sticky ).toHaveCSS( 'display', 'none' );

		await clearPromotionCdnCache( STICKY_PANEL_CDN_OPTION );
	} );
} );
