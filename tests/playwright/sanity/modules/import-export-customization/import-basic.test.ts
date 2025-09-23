import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import * as path from 'path';

test.describe( 'Import Export Customization - Basic Import', () => {
	let wpAdminPage: WpAdminPage;

	test.beforeEach( async ( { page, apiRequests } ) => {
		wpAdminPage = new WpAdminPage( page, test.info(), apiRequests );

		await wpAdminPage.login();
	} );

	test( 'should complete full import process with progress and summary', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-tools' );
		await page.waitForLoadState( 'networkidle' );

		await page.locator( '#elementor-settings-tab-import-export-kit' ).scrollIntoViewIfNeeded();
		await page.click( '#elementor-settings-tab-import-export-kit' );

		await page.waitForSelector( '#tab-import-export-kit', { timeout: 10000 } );

		await page.click( '#elementor-import-export__import' );

		await page.waitForLoadState( 'networkidle' );

		const kitPath = path.join( __dirname, 'kits', 'test-kit.zip' );
		await page.setInputFiles( 'input[type="file"]', kitPath );

		await page.click( 'button:has-text("Import")' );

		await page.waitForURL( /.*import-customization\/process.*/ );

		await expect( page.locator( 'text=Settings up your website templates...' ) ).toBeVisible();
		await expect( page.locator( 'text=This usually take a few moments.' ) ).toBeVisible();
		await expect( page.locator( 'text=Don\'t close this window until the process is finished.' ) ).toBeVisible();

		await expect( page.locator( 'text=Elementor activating' ) ).toBeVisible();
		await expect( page.locator( 'text=Hello Dolly activating' ) ).toBeVisible();
		await expect( page.locator( 'text=WordPress Importer activating' ) ).toBeVisible();

		await page.waitForURL( /.*import-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your website templates is now live on your site!' ) ).toBeVisible();
		await expect( page.locator( 'text=You\'ve imported and applied the following to your site:' ) ).toBeVisible();

		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();

		const contentSection = page.locator( '[data-testid="summary_section_content"]' );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( 'text=3 Posts | 13 Pages | 2 Floating Elements | 4 Taxonomies' ) ).toBeVisible();

		const templatesSection = page.locator( '[data-testid="summary_section_templates"]' );
		await expect( templatesSection ).toBeVisible();
		await expect( templatesSection.locator( 'text=No templates imported' ) ).toBeVisible();

		const settingsSection = page.locator( '[data-testid="summary_section_settings"]' );
		await expect( settingsSection ).toBeVisible();
		await expect( settingsSection.locator( 'text=Theme | Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' ) ).toBeVisible();

		const pluginsSection = page.locator( '[data-testid="summary_section_plugins"]' );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Elementor | Hello Dolly | WordPress Importer' ) ).toBeVisible();
	} );
} );
