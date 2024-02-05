import { test, expect, type Page } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import editor from '../../../../pages/editor';

test( 'Promotion screenshots', async ( { page }, testInfo ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo ),
		promotionContainer = '.e-feature-promotion';

	await wpAdminPage.login();

	await test.step( 'Free to Pro - Submissions', async () => {
		await wpAdminPage.promotionPageScreenshotTest( promotionContainer, 'e-form-submissions', 'submissions-menu-item-desktop' );
	} );

	await test.step( 'Free to Pro - Custom Icons', async () => {
		await wpAdminPage.promotionPageScreenshotTest( promotionContainer, 'elementor_custom_icons', 'custom-icons-menu-item-desktop' );
	} );

	await test.step( 'Free to Pro - Custom Fonts', async () => {
		await wpAdminPage.promotionPageScreenshotTest( promotionContainer, 'elementor_custom_fonts', 'custom-fonts-menu-item-desktop' );
	} );

	await test.step( 'Free to Pro - Custom Code', async () => {
		await wpAdminPage.promotionPageScreenshotTest( promotionContainer, 'elementor_custom_code', 'custom-code-menu-item-desktop' );
	} );
} );

test( 'Modal Promotions screenshots', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.openNewPage(),
		container = await editor.addElement( { elType: 'container' }, 'document' );

	await editor.addWidget( 'heading', container );

	await editor.activatePanelTab( 'style' );
	await page.locator( 'elementor-control-section_effects' ).click();

	await test.step( 'Motion Effects - promotion controls screenshots', async () => {
		const promotionControls = [ 'elementor-control-scrolling_effects_pro', 'elementor-control-mouse_effects_pro', 'elementor-control-sticky_pro' ];
		for ( const [control ] of promotionControls ) {
			const controlContainer = page.locator( `.${ control }` );
			await expect( controlContainer ).toHaveScreenshot( `${ control }.png` );
		}
	} );

	await test.step( 'Free to Pro - Scrolling Effect Modal', async () => {
		editor.promotionModalScreenshotTest( page, 'e-motion-effects', 'motion-effects-modal' );
	} );

	await test.step( 'Free to Pro - Mouse Effect Modal', async () => {
		editor.promotionModalScreenshotTest( page, 'e-scrolling-effect', 'scrolling-effect-modal' );
	} );

	await test.step( 'Free to Pro - Sticky Modal', async () => {
		editor.promotionModalScreenshotTest( page, 'e-scrolling-effect', 'scrolling-effect-modal' );
	} );
} );


async function promotionPageScreenshotTest( page: Page, promotionContainer: string, pageUri: string, screenshotName: string ) {
	await page.goto( `/wp-admin/admin.php?page=${ pageUri }/` );
	const promoContainer = page.locator( promotionContainer );
	await promoContainer.waitFor();
	await expect( promoContainer ).toHaveScreenshot( `${ screenshotName }.png` );
}
