import { playAudit } from 'playwright-lighthouse';
import { test } from '@playwright/test';
import config from 'lighthouse/lighthouse-core/config/desktop-config';
import WpAdminPage from '../pages/wp-admin-page';
import _path from 'path';

test.describe( 'Lighthouse tests', () => {
	test( 'Accordion widget test', async ( { page }, testInfo ) => {
		const filePath = _path.resolve( __dirname, `../../elements-regression/tests/templates/accordion.json` );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editorPage = await wpAdmin.openNewPage();
		const pageId = await editorPage.getPageId();
		await editorPage.closeNavigatorIfOpen();
		await editorPage.loadTemplate( filePath, true );
		await editorPage.publishPage();
		await wpAdmin.logout();

		await page.goto( `/?p=${ pageId }` );
		await page.locator( '.elementor-widget-accordion' ).nth( 0 ).waitFor();

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
} );
