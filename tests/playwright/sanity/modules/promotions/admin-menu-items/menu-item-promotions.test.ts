import { test, expect, type Page } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';

test( 'Promotion screenshots', async ( { page }, testInfo ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo ),
		promotionContainer = '.e-feature-promotion';

	await wpAdminPage.login();

	await test.step( 'Free to Pro - Submissions', async () => {
		await promotionPageScreenshotTest( page, promotionContainer, 'e-form-submissions', 'submissions-menu-item-desktop' );
	} );

	await test.step( 'Free to Pro - Custom Icons', async () => {
		await promotionPageScreenshotTest( page, promotionContainer, 'elementor_custom_icons', 'custom-icons-menu-item-desktop' );
	} );

	await test.step( 'Free to Pro - Custom Fonts', async () => {
		await promotionPageScreenshotTest( page, promotionContainer, 'elementor_custom_fonts', 'custom-fonts-menu-item-desktop' );
	} );
} );

async function promotionPageScreenshotTest( page: Page, promotionContainer: string, pageUri: string, screenshotName: string ) {
	await page.goto( `/wp-admin/admin.php?page=${ pageUri }/` );
	const promoContainer = page.locator( promotionContainer );
	await promoContainer.waitFor();
	await expect( promoContainer ).toHaveScreenshot( `${ screenshotName }.png` );
}
