import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import PromotionsHelper from '../../../pages/promotions/helper';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Promotion tests @promotions', () => {
	test( 'Modal Promotions screenshots', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			promotionsHelper = new PromotionsHelper( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( 'heading', container );

		await editor.activatePanelTab( 'advanced' );
		await page.locator( '.elementor-control-section_effects' ).click();

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

	test( 'Context Menu Promotions - Free to Pro', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			heading = await editor.addWidget( 'heading' );

		// Act.
		await editor.getPreviewFrame().locator( `.elementor-element-${ heading }` ).click( { button: 'right' } );
		await page.waitForSelector( EditorSelectors.ContextMenu.menu );
		const saveAsGlobal = page.locator( EditorSelectors.ContextMenu.saveAsGlobal ),
			saveAsGlobalPromotionLinkContainer = saveAsGlobal.locator( 'a' ),
			saveAsGlobalHref = 'https://go.elementor.com/go-pro-global-widget-context-menu/',

			notes = page.locator( EditorSelectors.ContextMenu.notes ),
			notesPromotionLinkContainer = notes.locator( 'a' ),
			notesHref = 'https://go.elementor.com/go-pro-notes-context-menu/';

		// Assert .
		await expect.soft( saveAsGlobal ).toHaveCSS( 'opacity', '0.5' );
		await expect.soft( notes ).toHaveCSS( 'opacity', '0.5' );

		await expect.soft( notesPromotionLinkContainer ).toHaveAttribute( 'href', notesHref );
		await expect.soft( saveAsGlobalPromotionLinkContainer ).toHaveAttribute( 'href', saveAsGlobalHref );
	} );

	test( 'Promotions - Free to Pro - Admin top bar', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdminPage = new WpAdminPage( page, testInfo ),
			promotionContainer = '.e-admin-top-bar__secondary-area';

		// Act.
		await wpAdminPage.promotionPageScreenshotTest( promotionContainer, 'elementor_custom_icons', 'admin-to-bar-desktop' );
	} );
} );
