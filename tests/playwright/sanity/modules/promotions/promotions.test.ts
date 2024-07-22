import { expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import PromotionsHelper from '../../../pages/promotions/helper';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Promotion tests @promotions', () => {
	test( 'Menu Items Promotions - screenshots', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			promotionContainer = '.e-feature-promotion';

		await wpAdmin.login();

		await test.step( 'Free to Pro - Submissions', async () => {
			await promotionPageScreenshotTest( page, promotionContainer, 'e-form-submissions', 'submissions-menu-item-desktop' );
		} );

		await test.step( 'Free to Pro - Custom Icons', async () => {
			await promotionPageScreenshotTest( page, promotionContainer, 'elementor_custom_icons', 'custom-icons-menu-item-desktop' );
		} );

		await test.step( 'Free to Pro - Custom Fonts', async () => {
			await promotionPageScreenshotTest( page, promotionContainer, 'elementor_custom_fonts', 'custom-fonts-menu-item-desktop' );
		} );

		await test.step( 'Free to Pro - Custom Code', async () => {
			await promotionPageScreenshotTest( page, promotionContainer, 'elementor_custom_code', 'custom-code-menu-item-desktop' );
		} );
	} );

	test( 'Modal Promotions screenshots', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			promotionsHelper = new PromotionsHelper( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( 'heading', container );

		await editor.openPanelTab( 'advanced' );
		await editor.openSection( 'section_effects' );

		await test.step( 'Motion Effects - promotion controls screenshots', async () => {
			const promotionControls = [ 'elementor-control-scrolling_effects_pro', 'elementor-control-mouse_effects_pro', 'elementor-control-sticky_pro' ];

			for ( const control of promotionControls ) {
				const controlContainer = page.locator( `.${ control }` );
				await expect.soft( controlContainer ).toHaveScreenshot( `${ control }.png` );
			}
		} );

		await test.step( 'Free to Pro - Control modals screenshot tests', async () => {
			const promotionControls = [ 'scrolling-effects', 'mouse-effects', 'sticky-effects' ];
			for ( const effect of promotionControls ) {
				await promotionsHelper.widgetControlPromotionModalScreenshotTest( effect );
			}
		} );
	} );

	test( 'Context Menu Promotions - Free to Pro', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			heading = await editor.addWidget( 'heading' );

		// Act.
		await editor.getPreviewFrame().locator( `.elementor-element-${ heading }` ).click( { button: 'right' } );
		await page.waitForSelector( EditorSelectors.contextMenu.menu );
		const saveAsGlobal = page.locator( EditorSelectors.contextMenu.saveAsGlobal ),
			saveAsGlobalPromotionLinkContainer = saveAsGlobal.locator( 'a' ),
			saveAsGlobalHref = 'https://go.elementor.com/go-pro-global-widget-context-menu/',

			notes = page.locator( EditorSelectors.contextMenu.notes ),
			notesPromotionLinkContainer = notes.locator( 'a' ),
			notesHref = 'https://go.elementor.com/go-pro-notes-context-menu/';

		// Assert .
		await expect.soft( saveAsGlobal ).toHaveCSS( 'opacity', '0.5' );
		await expect.soft( notes ).toHaveCSS( 'opacity', '0.5' );

		await expect.soft( notesPromotionLinkContainer ).toHaveAttribute( 'href', notesHref );
		await expect.soft( saveAsGlobalPromotionLinkContainer ).toHaveAttribute( 'href', saveAsGlobalHref );
	} );

	test( 'Promotions - Free to Pro - Admin top bar', async ( { page } ) => {
		// Arrange.
		const promotionContainer = '.e-admin-top-bar__secondary-area';

		// Act.
		await promotionPageScreenshotTest( page, promotionContainer, 'elementor_custom_icons', 'admin-to-bar-desktop' );
	} );

	test( 'Promotions - Free to Pro - Navigator', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			promotionContainer = EditorSelectors.panels.navigator.footer;

		// Act.
		await wpAdmin.openNewPage();
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();

		// Assert.
		await expect( promoContainer ).toHaveScreenshot( `navigator-footer.png` );
	} );

	test( 'Promotions - Free to Pro - Navigator - Dark Mode', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			promotionContainer = EditorSelectors.panels.navigator.footer;

		await editor.setDisplayMode( 'dark' );

		// Act.
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();

		// Assert.
		await expect( promoContainer ).toHaveScreenshot( `navigator-footer-dark.png` );
	} );

	test( 'Promotions - Sticky Free to Pro - Editor- Top Bar Off', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			editor_v2: false,
		} );
		const wrapperContainer = '#elementor-panel-inner',
			promotionContainer = '#elementor-panel-get-pro-elements-sticky';

		// Act.
		await wpAdmin.openNewPage();
		const parentContainer = page.locator( wrapperContainer );
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();

		// Assert.
		await expect( parentContainer ).toHaveScreenshot( `go-pro-sticky.png` );
	} );

	test( 'Promotions - Sticky Free to Pro - Top Bar On', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			editor_v2: true,
		} );
		const wrapperContainer = '#elementor-panel-inner',
			promotionContainer = '#elementor-panel-get-pro-elements-sticky';

		// Act.
		await wpAdmin.openNewPage();
		const parentContainer = page.locator( wrapperContainer );
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();

		// Assert.
		await expect( parentContainer ).toHaveScreenshot( `go-pro-sticky-top-bar.png` );
	} );

	test( 'Promotion text behavior on resizing the structure panel', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			navigatorPanel = page.locator( EditorSelectors.panels.navigator.wrapper );

		// Act.
		for ( let i = 0; i < 20; i++ ) {
			await editor.addElement( { elType: 'container' }, 'document' );
		}

		await navigatorPanel.locator( '.elementor-navigator__element-container' ).nth( 0 ).click();
		await navigatorPanel.evaluate( ( element ) => element.style.width = '150px' );

		// Assert.
		await expect( navigatorPanel ).toHaveScreenshot( 'resized-navigator-panel.png' );
	} );
} );

/**
 * Screenshot test for the promotion page.
 *
 * @param {Page}   page               - Page to test
 * @param {string} promotionContainer - The promotion container selector.
 * @param {string} pageUri            - The page URI.
 * @param {string} screenshotName     - The screenshot name.
 */
const promotionPageScreenshotTest = async ( page: Page, promotionContainer: string, pageUri: string, screenshotName: string ) => {
	await page.goto( `/wp-admin/admin.php?page=${ pageUri }/` );
	const promoContainer = page.locator( promotionContainer );
	await promoContainer.waitFor();
	await expect.soft( promoContainer ).toHaveScreenshot( `${ screenshotName }.png` );
};
