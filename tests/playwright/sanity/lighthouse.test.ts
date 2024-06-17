import { playAudit } from 'playwright-lighthouse';
import { test } from '@playwright/test';
import config from 'lighthouse/lighthouse-core/config/desktop-config';
import WpAdminPage from '../pages/wp-admin-page';
import _path from 'path';

test.describe( 'Lighthouse tests', () => {
	test( 'Accordion widget test', async ( { page }, testInfo ) => {
		const filePath = _path.resolve( __dirname, `../../elements-regression/tests/templates/accordion.json` );
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.hideAdminBar();

		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( filePath, true );
		await editor.publishAndViewPage();

		await playAudit( {
			page,
			config,
			thresholds: {
				performance: 85,
				accessibility: 85,
				'best-practices': 85,
				seo: 80,
			},
			port: parseInt( process.env.DEBUG_PORT ),
		} );
	} );

	test( 'Reset toolbar settings', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.showAdminBar();
	} );
} );
