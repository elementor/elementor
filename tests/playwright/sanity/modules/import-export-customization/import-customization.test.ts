import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import * as path from 'path';

test.describe( 'Import Export Customization - Import Customization', () => {
	let wpAdminPage: WpAdminPage;

	test.beforeEach( async ( { page, apiRequests } ) => {
		wpAdminPage = new WpAdminPage( page, test.info(), apiRequests );

		await wpAdminPage.login();
	} );

	test( 'should import kit with Theme unchecked in Settings dialog', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-tools' );
		await page.waitForLoadState( 'networkidle' );

		await page.locator( '#elementor-settings-tab-import-export-kit' ).scrollIntoViewIfNeeded();
		await page.click( '#elementor-settings-tab-import-export-kit' );

		await page.waitForSelector( '#tab-import-export-kit', { timeout: 10000 } );

		await page.click( '#elementor-import-export__import' );

		await page.waitForLoadState( 'networkidle' );

		const kitPath = path.join( __dirname, 'kits', 'test-kit.zip' );
		await page.setInputFiles( 'input[type="file"]', kitPath );

		await page.click( '[data-testid="KitPartsSelectionRow-settings"] button:has-text("Edit")' );

		await page.click( '[data-testid="theme-switch"]' );

		await page.click( 'button:has-text("Save changes")' );

		await page.click( 'button:has-text("Import")' );

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
		await expect( settingsSection.locator( 'text=No settings imported' ) ).toBeVisible();

		const pluginsSection = page.locator( '[data-testid="summary_section_plugins"]' );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Elementor | Hello Dolly | WordPress Importer' ) ).toBeVisible();
	} );

	test( 'should import kit with Posts unchecked in Content dialog', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-tools' );
		await page.waitForLoadState( 'networkidle' );

		await page.locator( '#elementor-settings-tab-import-export-kit' ).scrollIntoViewIfNeeded();
		await page.click( '#elementor-settings-tab-import-export-kit' );

		await page.waitForSelector( '#tab-import-export-kit', { timeout: 10000 } );

		await page.click( '#elementor-import-export__import' );

		await page.waitForLoadState( 'networkidle' );
		await page.pause();

		const kitPath = path.join( __dirname, 'kits', 'test-kit.zip' );
		await page.setInputFiles( 'input[type="file"]', kitPath );

		await page.click( '[data-testid="KitPartsSelectionRow-content"] button:has-text("Edit")' );

		await page.uncheck( 'input[type="checkbox"]:near(label:has-text("Post"))' );

		await page.click( 'button:has-text("Save changes")' );

		await page.click( 'button:has-text("Import")' );

		await page.waitForURL( /.*import-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your website templates is now live on your site!' ) ).toBeVisible();
		await expect( page.locator( 'text=You\'ve imported and applied the following to your site:' ) ).toBeVisible();

		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();

		const contentSection = page.locator( '[data-testid="summary_section_content"]' );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( 'text=13 Pages | 2 Floating Elements | 4 Taxonomies' ) ).toBeVisible();
		await expect( contentSection.locator( 'text=3 Posts' ) ).not.toBeVisible();

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

	test( 'should import kit with all checkboxes unselected except plugins', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-tools' );
		await page.waitForLoadState( 'networkidle' );

		await page.locator( '#elementor-settings-tab-import-export-kit' ).scrollIntoViewIfNeeded();
		await page.click( '#elementor-settings-tab-import-export-kit' );

		await page.waitForSelector( '#tab-import-export-kit', { timeout: 10000 } );

		await page.click( '#elementor-import-export__import' );

		await page.waitForLoadState( 'networkidle' );

		const kitPath = path.join( __dirname, 'kits', 'test-kit.zip' );
		await page.setInputFiles( 'input[type="file"]', kitPath );

		await page.click( '[data-testid="KitPartsSelectionRow-plugins"] button:has-text("Edit")' );

		await page.uncheck( 'input[type="checkbox"]:near(label:has-text("Hello Dolly"))' );
		await page.uncheck( 'input[type="checkbox"]:near(label:has-text("WordPress Importer"))' );

		await page.click( 'button:has-text("Save changes")' );

		await page.click( 'button:has-text("Import")' );

		await page.waitForURL( /.*import-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your website templates is now live on your site!' ) ).toBeVisible();
		await expect( page.locator( 'text=You\'ve imported and applied the following to your site:' ) ).toBeVisible();

		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();

		const contentSection = page.locator( '[data-testid="summary_section_content"]' );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( 'text=No content imported' ) ).toBeVisible();

		const templatesSection = page.locator( '[data-testid="summary_section_templates"]' );
		await expect( templatesSection ).toBeVisible();
		await expect( templatesSection.locator( 'text=No templates imported' ) ).toBeVisible();

		const settingsSection = page.locator( '[data-testid="summary_section_settings"]' );
		await expect( settingsSection ).toBeVisible();
		await expect( settingsSection.locator( 'text=No settings imported' ) ).toBeVisible();

		const pluginsSection = page.locator( '[data-testid="summary_section_plugins"]' );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Elementor' ) ).toBeVisible();
	} );
} );
