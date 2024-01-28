import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.only( 'Promotion screenshots', async ( { page }, testInfo ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo ),
		promotionContainer = '.e-feature-promotion';

	await wpAdminPage.login();

	await test.step( 'Submissions Free to Pro Promotion', async () => {
		await page.goto( '/wp-admin/admin.php?page=e-form-submissions/' );
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();
		await expect( promoContainer ).toHaveScreenshot( 'promotion-menu-item-desktop.png' );
	} );

	await test.step( 'Custom Icons Free to Pro Promotion', async () => {
		await page.goto( '/wp-admin/admin.php?page=elementor_custom_icons/' );
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();
		await expect( promoContainer ).toHaveScreenshot( 'custom-icon-menu-item-desktop.png' );
	} );
} );
