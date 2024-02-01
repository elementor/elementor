import { test } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';

test( 'Custom code promotion screenshot', async ( { page }, testInfo ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo ),
		promotionContainer = '.e-feature-promotion';
	await wpAdminPage.login();
	await wpAdminPage.promotionPageScreenshotTest( page, promotionContainer, 'elementor_custom_code', 'custom-code-menu-item-desktop' );
} );

