import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import PromotionsHelper from '../../../pages/promotions/helper';

test.describe( 'Promotion tests @promotions', () => {
	test.only( 'Modal Promotions screenshots', async ( { page }, testInfo ) => {
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
} );
