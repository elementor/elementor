import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { setupCompleteTestData, cleanupCreatedItems, CreatedItems } from './utils/test-seeders';

test.describe( 'Import Export Customization - Content Customization', () => {
	let wpAdminPage: WpAdminPage;
	let createdItems: CreatedItems;

	test.beforeEach( async ( { page, apiRequests } ) => {
		wpAdminPage = new WpAdminPage( page, test.info(), apiRequests );

		await wpAdminPage.login();

		createdItems = await setupCompleteTestData( page, test.info(), apiRequests );
	} );

	test.afterEach( async ( { page, apiRequests } ) => {
		await cleanupCreatedItems( apiRequests, page.context().request, createdItems );
		await apiRequests.cleanUpTestPages( page.request );
	} );

	test( 'should export kit with all checkboxes unselected except plugins', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		await page.uncheck( '[data-testid="KitPartsSelectionRow-content"] input[type="checkbox"]' );
		await page.uncheck( '[data-testid="KitPartsSelectionRow-templates"] input[type="checkbox"]' );
		await page.uncheck( '[data-testid="KitPartsSelectionRow-settings"] input[type="checkbox"]' );

		await page.fill( 'input[placeholder="Type name here..."]', 'test-kit-unselected' );
		await page.fill( 'textarea[placeholder="Type description here..."]', 'Test Description' );

		await page.click( 'button:has-text("Export as .zip")' );

		await page.waitForURL( /.*export-customization\/process.*/ );

		await page.waitForURL( /.*export-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your .zip file is ready' ) ).toBeVisible();

		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();

		const contentSection = page.locator( '[data-testid="summary_section_content"]' );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( 'text=No content exported' ) ).toBeVisible();

		const templatesSection = page.locator( '[data-testid="summary_section_templates"]' );
		await expect( templatesSection ).toBeVisible();
		await expect( templatesSection.locator( 'text=No templates exported' ) ).toBeVisible();

		const settingsSection = page.locator( '[data-testid="summary_section_settings"]' );
		await expect( settingsSection ).toBeVisible();
		await expect( settingsSection.locator( 'text=No settings exported' ) ).toBeVisible();

		const pluginsSection = page.locator( '[data-testid="summary_section_plugins"]' );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Elementor' ) ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Hello Dolly' ) ).toBeVisible();
		await expect( pluginsSection.locator( 'text=WordPress Importer' ) ).toBeVisible();
	} );

	test( 'should export kit with Posts unchecked in Content dialog', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		await page.click( '[data-testid="KitPartsSelectionRow-content"] button:has-text("Edit")' );

		await page.uncheck( 'input[type="checkbox"]:near(label:has-text("Post"))' );

		await page.click( 'button:has-text("Save changes")' );

		await page.fill( 'input[placeholder="Type name here..."]', 'test-kit-no-posts' );
		await page.fill( 'textarea[placeholder="Type description here..."]', 'Test Description' );

		await page.click( 'button:has-text("Export as .zip")' );

		await page.waitForURL( /.*export-customization\/process.*/ );

		await page.waitForURL( /.*export-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your .zip file is ready' ) ).toBeVisible();

		const contentSection = page.locator( '[data-testid="summary_section_content"]' );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( 'text=13 Pages | 2 Floating Elements | 1 Taxonomies' ) ).toBeVisible();
		await expect( contentSection.locator( 'text=3 Posts' ) ).not.toBeVisible();
	} );

	test( 'should export kit with Theme unchecked in Settings dialog', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		await page.click( '[data-testid="KitPartsSelectionRow-settings"] button:has-text("Edit")' );
		await page.click( '[data-testid="theme-switch"]' );

		await page.click( 'button:has-text("Save changes")' );

		await page.fill( 'input[placeholder="Type name here..."]', 'test-kit-no-theme' );
		await page.fill( 'textarea[placeholder="Type description here..."]', 'Test Description' );

		await page.click( 'button:has-text("Export as .zip")' );

		await page.waitForURL( /.*export-customization\/process.*/ );

		await page.waitForURL( /.*export-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your .zip file is ready' ) ).toBeVisible();

		const settingsSection = page.locator( '[data-testid="summary_section_settings"]' );
		await expect( settingsSection ).toBeVisible();
		await expect( settingsSection.locator( 'text=Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' ) ).toBeVisible();
	} );

	test( 'should export kit with only Elementor plugin selected in Plugins dialog', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		await page.click( '[data-testid="KitPartsSelectionRow-plugins"] button:has-text("Edit")' );

		await page.uncheck( 'input[type="checkbox"]:near(label:has-text("Hello Dolly"))' );
		await page.uncheck( 'input[type="checkbox"]:near(label:has-text("WordPress Importer"))' );

		await page.click( 'button:has-text("Save changes")' );

		await page.fill( 'input[placeholder="Type name here..."]', 'test-kit-elementor-only' );
		await page.fill( 'textarea[placeholder="Type description here..."]', 'Test Description' );

		await page.click( 'button:has-text("Export as .zip")' );

		await page.waitForURL( /.*export-customization\/process.*/ );

		await page.waitForURL( /.*export-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your .zip file is ready' ) ).toBeVisible();

		const pluginsSection = page.locator( '[data-testid="summary_section_plugins"]' );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Elementor' ) ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Hello Dolly' ) ).not.toBeVisible();
		await expect( pluginsSection.locator( 'text=WordPress Importer' ) ).not.toBeVisible();
	} );
} );

