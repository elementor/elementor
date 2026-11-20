import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { wpCli } from '../../../../assets/wp-cli';
import { timeouts } from '../../../../config/timeouts';
import {
	EDITOR_PROMOTION_PATHS,
	HOME_SCREEN_PATH,
	NOTIFICATIONS_PATH,
	NO_PROMOTION_SCENARIO,
	assertScenarioFetched,
	cdnFieldOrDefault,
	readEditorPromotion,
	readFirstFullNotification,
	readSidebarPromotion,
	useCdnScenario,
} from './cdn-scenario';

const CAMPAIGN_SCENARIO = process.env.E2E_CDN_SCENARIO || 'live';

const CORE_DEFAULTS = {
	pluginsPage: { label: 'Get Elementor Pro', url: 'https://go.elementor.com/go-pro-wp-plugins/' },
	sideMenu: { label: 'Upgrade', url: 'https://go.elementor.com/go-pro-upgrade-one-wp-menu/' },
	stickyPanel: {
		message: 'Access all Pro widgets.',
		buttonText: 'Upgrade Now',
		url: 'https://go.elementor.com/go-pro-sticky-widget-panel/',
	},
	themeBuilder: { buttonText: 'Upgrade Now', url: 'https://go.elementor.com/go-pro-theme-builder/' },
	conversionBanner: {
		title: 'Elevate your site with Elementor Pro',
		ctaText: 'Upgrade now',
		ctaUrl: 'https://go.elementor.com/go-pro-wp-admin-upgrade-notice/',
	},
	pointerCtaText: 'View Deals',
};

const FREE_LICENSE = 'free';
const CONVERSION_BANNER_UNLOCK_OPTION = 'elementor_conversion_banner_unlocked';
const CONVERSION_BANNER_DISMISS_KEY = 'conversion_banner_go_pro';
const POINTER_DISMISS_KEY_PREFIX = 'promotional_pointer';
const POINTER_SEEN_TODAY_TRANSIENT_PREFIX = '_elementor_promotional_pointer_';

const resetIntroductionKey = ( key: string ) =>
	wpCli( `wp eval foreach(get_users(["fields"=>"ID"])as$id){$m=(array)get_user_meta($id,"elementor_introduction",true);unset($m["${ key }"]);update_user_meta($id,"elementor_introduction",$m);}` );

const resetPointerSeenToday = () =>
	wpCli( `wp eval foreach(get_users(["fields"=>"ID"])as$id){delete_transient("${ POINTER_SEEN_TODAY_TRANSIENT_PREFIX }".$id);}` );

const getPointerDismissKey = ( campaignId: unknown ): string =>
	'string' === typeof campaignId && campaignId ? `${ POINTER_DISMISS_KEY_PREFIX }_${ campaignId }` : POINTER_DISMISS_KEY_PREFIX;

for ( const scenario of [ CAMPAIGN_SCENARIO, NO_PROMOTION_SCENARIO ] ) {
	test.describe( `Editor promotions from CDN - ${ scenario } @promotions`, () => {
		test.beforeEach( async ( { page, baseURL } ) => {
			assertScenarioFetched( scenario, EDITOR_PROMOTION_PATHS );
			await useCdnScenario( page.context(), baseURL, scenario );
		} );

		test( 'Plugins page row action', async ( { page } ) => {
			// Arrange.
			const promotion = readEditorPromotion( scenario, 'plugins-page' );

			// Act.
			await page.goto( '/wp-admin/plugins.php' );

			// Assert.
			const link = page.locator( 'tr[data-slug="elementor"] a.elementor-plugins-gopro' );
			await expect( link ).toHaveText( cdnFieldOrDefault( promotion, 'label', CORE_DEFAULTS.pluginsPage.label ) );
			await expect( link ).toHaveAttribute( 'href', cdnFieldOrDefault( promotion, 'url', CORE_DEFAULTS.pluginsPage.url ) );
		} );

		test( 'Admin menu upgrade item', async ( { page } ) => {
			// Arrange.
			const promotion = readEditorPromotion( scenario, 'side-menu' );

			// Act.
			await page.goto( '/wp-admin/admin.php?page=elementor' );
			const redirect = await page.request.get( '/wp-admin/admin.php?page=elementor-one-upgrade', { maxRedirects: 0 } );

			// Assert.
			await expect( page.locator( '#toplevel_page_elementor-home .wp-submenu a[href*="elementor-one-upgrade"]' ) )
				.toHaveText( cdnFieldOrDefault( promotion, 'label', CORE_DEFAULTS.sideMenu.label ) );
			expect( redirect.headers().location ).toBe( cdnFieldOrDefault( promotion, 'url', CORE_DEFAULTS.sideMenu.url ) );
		} );

		test( 'Conversion banner', async ( { page } ) => {
			// Arrange.
			const promotion = readEditorPromotion( scenario, 'conversion-banner' );
			const isCdnBanner = Boolean( promotion.is_active && promotion.title && promotion.cta_url );
			await wpCli( `wp option update ${ CONVERSION_BANNER_UNLOCK_OPTION } 1` );
			await resetIntroductionKey( CONVERSION_BANNER_DISMISS_KEY );

			try {
				// Act.
				await page.goto( '/wp-admin/plugins.php' );

				// Assert.
				const banner = page.locator( '#e-conversion-banner.e-conversion-banner--ready' );
				const button = banner.locator( '.e-conversion-banner__button' );
				await expect( banner ).toBeVisible( { timeout: timeouts.longAction } );
				await expect( banner.locator( '.e-conversion-banner__title' ) )
					.toHaveText( isCdnBanner ? String( promotion.title ) : CORE_DEFAULTS.conversionBanner.title );
				await expect( button )
					.toHaveText( isCdnBanner ? cdnFieldOrDefault( promotion, 'cta_text', CORE_DEFAULTS.conversionBanner.ctaText ) : CORE_DEFAULTS.conversionBanner.ctaText );
				await expect( button )
					.toHaveAttribute( 'href', isCdnBanner ? String( promotion.cta_url ) : CORE_DEFAULTS.conversionBanner.ctaUrl );
			} finally {
				await wpCli( `wp option delete ${ CONVERSION_BANNER_UNLOCK_OPTION }` );
			}
		} );

		test( 'Dashboard pointer', async ( { page } ) => {
			// Arrange.
			const promotion = readEditorPromotion( scenario, 'pointer' );
			const isPointerShown = Boolean( promotion.is_active && promotion.title && promotion.cta_url );
			await resetIntroductionKey( getPointerDismissKey( promotion.campaign_id ) );
			await resetPointerSeenToday();

			// Act.
			await page.goto( '/wp-admin/index.php' );

			// Assert.
			const pointer = page.locator( '.wp-pointer-content' ).filter( { has: page.locator( 'a.button-primary' ) } );

			if ( ! isPointerShown ) {
				await page.waitForLoadState( 'load' );
				await expect( pointer ).toHaveCount( 0 );
				return;
			}

			await expect( pointer.locator( 'h3' ) ).toHaveText( String( promotion.title ) );
			await expect( pointer.locator( 'p' ).first() ).toHaveText( cdnFieldOrDefault( promotion, 'text', '' ) );
			await expect( pointer.locator( 'a.button-primary' ) ).toHaveText( cdnFieldOrDefault( promotion, 'cta_text', CORE_DEFAULTS.pointerCtaText ) );
			await expect( pointer.locator( 'a.button-primary' ) ).toHaveAttribute( 'href', String( promotion.cta_url ) );
		} );

		test( 'Editor widgets panel sticky footer', async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const promotion = readEditorPromotion( scenario, 'sticky-panel' );
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

			// Act.
			await wpAdmin.openNewPage();

			// Assert.
			const sticky = page.locator( '#elementor-panel-get-pro-elements-sticky .elementor-get-pro-sticky-message' );
			const link = sticky.locator( 'a' );
			await expect( sticky ).toContainText( cdnFieldOrDefault( promotion, 'message', CORE_DEFAULTS.stickyPanel.message ) );
			await expect( link ).toHaveText( cdnFieldOrDefault( promotion, 'button_text', CORE_DEFAULTS.stickyPanel.buttonText ) );
			await expect( link ).toHaveAttribute( 'href', cdnFieldOrDefault( promotion, 'url', CORE_DEFAULTS.stickyPanel.url ) );
		} );

		test( 'Theme Builder promotion header button', async ( { page } ) => {
			// Arrange.
			const promotion = readEditorPromotion( scenario, 'theme-builder' );

			// Act.
			await page.goto( '/wp-admin/admin.php?page=elementor-app#/site-editor/promotion' );

			// Assert.
			const button = page.locator( '.e-site-editor__promotion .page-header' ).getByRole( 'link' );
			await expect( button ).toHaveText( cdnFieldOrDefault( promotion, 'button_text', CORE_DEFAULTS.themeBuilder.buttonText ), { timeout: timeouts.longAction } );
			await expect( button ).toHaveAttribute( 'href', cdnFieldOrDefault( promotion, 'url', CORE_DEFAULTS.themeBuilder.url ) );
		} );
	} );
}

test.describe( `Campaign content from CDN - ${ CAMPAIGN_SCENARIO } @promotions`, () => {
	test.beforeEach( async ( { page, baseURL } ) => {
		assertScenarioFetched( CAMPAIGN_SCENARIO, [ NOTIFICATIONS_PATH, HOME_SCREEN_PATH ] );
		await useCdnScenario( page.context(), baseURL, CAMPAIGN_SCENARIO );
	} );

	test( 'What\'s New card', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const notification = readFirstFullNotification( CAMPAIGN_SCENARIO, false );
		test.skip( ! notification, 'The CDN has no What\'s New card for Free users' );
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();

		// Act.
		await page.getByRole( 'button', { name: 'What\'s New' } ).click();

		// Assert.
		const drawer = page.locator( '.MuiDrawer-paper' );
		await expect( drawer.getByText( notification.title, { exact: true } ).first() ).toBeVisible( { timeout: timeouts.longAction } );

		if ( notification.description ) {
			await expect( drawer.getByText( notification.description ).first() ).toBeVisible();
		}

		if ( notification.cta && notification.ctaLink ) {
			await expect( drawer.locator( `a[href="${ notification.ctaLink }"]` ).filter( { hasText: notification.cta } ).first() ).toBeVisible();
		}
	} );

	test( 'Home screen sidebar banner', async ( { page } ) => {
		// Arrange.
		const variant = readSidebarPromotion( CAMPAIGN_SCENARIO, FREE_LICENSE );
		test.skip( ! variant, 'The CDN has no enabled sidebar banner for Free users' );

		// Act.
		await page.goto( '/wp-admin/admin.php?page=elementor' );

		// Assert.
		const banner = page.locator( `#e-home-screen a[href="${ variant.data.link }"]` );
		await expect( banner ).toBeVisible( { timeout: timeouts.longAction } );
		await expect( banner.locator( 'img' ) ).toHaveAttribute( 'src', variant.data.image );
	} );
} );
