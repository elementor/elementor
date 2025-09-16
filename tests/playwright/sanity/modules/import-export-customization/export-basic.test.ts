import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { setupCompleteTestData, cleanupCreatedItems, CreatedItems } from './utils/test-seeders';

test.describe( 'Import Export Customization - Basic Export', () => {
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

	test.only( 'should complete full export process with progress and summary', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		await page.fill( 'input[placeholder="Type name here..."]', 'test-kit' );
		await page.fill( 'textarea[placeholder="Type description here..."]', 'Test Description' );

		await page.click( 'button:has-text("Export as .zip")' );

		await page.waitForURL( /.*export-customization\/process.*/ );

		await expect( page.locator( 'text=Setting up your website template...' ) ).toBeVisible();
		await expect( page.locator( 'text=This usually takes a few moments.' ) ).toBeVisible();
		await expect( page.locator( 'text=Don\'t close this window until the process is finished.' ) ).toBeVisible();

		await page.waitForURL( /.*export-customization\/complete.*/, { timeout: 30000 } );

		await expect( page.locator( 'text=Your .zip file is ready' ) ).toBeVisible();
		await expect( page.locator( 'text=Once the download is complete, you can upload it to be used for other sites.' ) ).toBeVisible();

		await expect( page.locator( 'text=What\'s included:' ) ).toBeVisible();

		await page.pause()
		const contentSection = page.locator( '[data-testid="summary_section_content"]' );
		await expect( contentSection ).toBeVisible();
		await expect( contentSection.locator( 'text=13 Pages | 2 Floating Elements | 3 Posts | 3 Taxonomies' ) ).toBeVisible();
		await expect( contentSection.locator( 'text=13 Pages' ) ).toBeVisible();
		await expect( contentSection.locator( 'text=2 Floating Elements' ) ).toBeVisible();
		await expect( contentSection.locator( 'text=3 Posts' ) ).toBeVisible();
		await expect( contentSection.locator( 'text=3 Taxonomies' ) ).toBeVisible();

		const templatesSection = page.locator( '[data-testid="summary_section_templates"]' );
		await expect( templatesSection ).toBeVisible();
		await expect( templatesSection.locator( 'text=Templates' ) ).toBeVisible();
		await expect( templatesSection.locator( 'text=No templates exported' ) ).toBeVisible();

		const settingsSection = page.locator( '[data-testid="summary_section_settings"]' );
		await expect( settingsSection ).toBeVisible();
		await expect( settingsSection.locator( 'text=Site settings' ) ).toBeVisible();
		await expect( settingsSection.locator( 'text=Theme' ) ).toBeVisible();
		await expect( settingsSection.locator( 'text=Global Colors' ) ).toBeVisible();
		await expect( settingsSection.locator( 'text=Global Fonts' ) ).toBeVisible();
		await expect( settingsSection.locator( 'text=Theme Style Settings' ) ).toBeVisible();
		await expect( settingsSection.locator( 'text=General Settings' ) ).toBeVisible();
		await expect( settingsSection.locator( 'text=Experiments' ) ).toBeVisible();

		const pluginsSection = page.locator( '[data-testid="summary_section_plugins"]' );
		await expect( pluginsSection ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Plugins' ) ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Elementor' ) ).toBeVisible();
		await expect( pluginsSection.locator( 'text=Hello Dolly' ) ).toBeVisible();
		await expect( pluginsSection.locator( 'text=WordPress Importer' ) ).toBeVisible();

		await expect( page.locator( 'text=Is the automatic download not starting?' ) ).toBeVisible();
		await expect( page.locator( 'text=Download manually.' ) ).toBeVisible();

		await expect( page.locator( '[data-testid="done-button"]' ) ).toBeVisible();

		await page.pause()
	} );

	test( 'should validate required kit name field', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		const exportButton = page.locator( 'button:has-text("Export as .zip")' );
		await expect( exportButton ).toBeDisabled();

		await page.fill( 'input[placeholder="Type name here..."]', 'test-kit' );
		await expect( exportButton ).toBeEnabled();
	} );
} );

