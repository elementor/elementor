import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'A.I Tests @ai', () => {
	test( 'test', async ( { page }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( 'heading', container );

		await page.route( 'http://localhost:8888/wp-admin/admin-ajax.php', async ( route ) => {
			const json = { success: true, data: { responses: { ai_get_user_information: { success: true, code: 200, data: { is_connected: true, is_get_started: '1', usage: { hasAiSubscription: false, usedQuota: 2, quota: 100 } } } } } };
			await route.fulfill( { json } );
		} );
		await page.click( '.e-ai-button' );
	} );
} );
