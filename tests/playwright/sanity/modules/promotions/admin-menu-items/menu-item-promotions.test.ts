import { test } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';

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
} );
