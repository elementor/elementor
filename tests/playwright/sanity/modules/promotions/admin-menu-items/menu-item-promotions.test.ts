import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';

test( 'Promotion screenshot', async ( { page }, testInfo ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo ),
		promotionContainer = '.e-feature-promotion';

	await wpAdminPage.login();
	await page.goto( '/wp-admin/admin.php?page=e-form-submissions/' );
	const promoContainer = page.locator( promotionContainer );
	await promoContainer.waitFor();
	await expect( promoContainer ).toHaveScreenshot( 'promotion-menu-item-desktop.png' );
} );
