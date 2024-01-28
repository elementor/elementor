import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';

test( 'Promotion screenshots', async ( { page }, testInfo ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo ),
		promotionContainer = '.e-feature-promotion';

	await wpAdminPage.login();

	await test.step( 'Free to Pro - Submissions', async () => {
		await page.goto( '/wp-admin/admin.php?page=e-form-submissions/' );
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();
		await expect( promoContainer ).toHaveScreenshot( 'promotion-menu-item-desktop.png' );
	} );

	await test.step( 'Free to Pro - Custom Fonts', async () => {
		await page.goto( '/wp-admin/admin.php?page=elementor_custom_fonts/' );
		const promoContainer = page.locator( promotionContainer );
		await promoContainer.waitFor();
		await expect( promoContainer ).toHaveScreenshot( 'custom-fonts-menu-item-desktop.png' );
	} );
} );
