import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.only( 'Promotion screenshot', async ( { page }, testInfo ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo ),
		promotionContainer = '.e-feature-promotion';

	await wpAdminPage.login();
	await page.goto( '/wp-admin/admin.php?page=e-form-submissions/' );
	await page.waitForSelector( promotionContainer );
	expect.soft( await page.locator( promotionContainer ).screenshot( {
		type: 'jpeg',
		quality: 70,
	} ) ).toMatchSnapshot( 'promotion-menu-item-desktop.jpeg' );
} );
