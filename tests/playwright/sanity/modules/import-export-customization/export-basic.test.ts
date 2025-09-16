import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import { promises as fs } from 'fs';
import * as path from 'path';
import { setupCompleteTestData, cleanupCreatedItems, CreatedItems } from './utils/test-seeders';

async function verifyZipStructure( zipPath: string ) {
	// Check if file exists and has content
	const stats = await fs.stat( zipPath );
	expect( stats.size ).toBeGreaterThan( 0 );
}

test.describe( 'Import Export Customization - Basic Export', () => {
	let wpAdminPage: WpAdminPage;
	let createdItems: CreatedItems;

	test.beforeEach( async ( { page, apiRequests } ) => {
		wpAdminPage = new WpAdminPage( page, test.info(), apiRequests );

		// Login to WordPress admin
		await wpAdminPage.login();

		// Setup comprehensive test data and store created items
		createdItems = await setupCompleteTestData( page, test.info(), apiRequests );
	} );

	test.afterEach( async ( { page, apiRequests } ) => {
		await cleanupCreatedItems( apiRequests, page.context().request, createdItems );
	} );

	test.only( 'should export kit with default settings', async ( { page } ) => {
		// Navigate to export page
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		// Fill kit information
		await page.fill( 'input[placeholder="Type name here..."]', 'test-kit' );
		await page.fill( 'textarea[placeholder="Type description here..."]', 'Test Description' );

		// Start download
		const downloadPromise = page.waitForEvent( 'download' );
		await page.click( 'button:has-text("Export as .zip")' );
		const download = await downloadPromise;

		// Verify download started
		expect( download.suggestedFilename() ).toBe( 'test-kit.zip' );

		// Save the file to a specific location for easy access
		const downloadsDir = path.join( __dirname, '../../../../downloads' );
		await fs.mkdir( downloadsDir, { recursive: true } );

		const downloadPath = path.join( downloadsDir, 'test-kit.zip' );
		await download.saveAs( downloadPath );

		// Verify file exists and has content
		const stats = await fs.stat( downloadPath );
		expect( stats.size ).toBeGreaterThan( 0 );

		await page.pause()
	} );

	test( 'should validate required kit name field', async ( { page } ) => {
		// Navigate to export page
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		// Try to export without kit name
		await page.click( 'button:has-text("Export as .zip")' );

		// Verify validation error is shown
		await expect( page.locator( 'text=Website template name is required' ) ).toBeVisible();
	} );

	test( 'should export with all default sections selected', async ( { page } ) => {
		// Navigate to export page
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		// Verify all sections are selected by default
		await expect( page.locator( '[data-testid="content-section"] input[type="checkbox"]' ) ).toBeChecked();
		await expect( page.locator( '[data-testid="settings-section"] input[type="checkbox"]' ) ).toBeChecked();
		await expect( page.locator( '[data-testid="plugins-section"] input[type="checkbox"]' ) ).toBeChecked();

		// Fill kit information
		await page.fill( 'input[placeholder="Type name here..."]', 'Default Sections Kit' );

		// Start download
		const downloadPromise = page.waitForEvent( 'download' );
		await page.click( 'button:has-text("Export as .zip")' );
		const download = await downloadPromise;

		// Verify download completed
		const downloadPath = await download.path();
		expect( downloadPath ).toBeTruthy();

		// Verify ZIP file structure
		await verifyZipStructure( downloadPath );
	} );

	test( 'should show export progress indicator', async ( { page } ) => {
		// Navigate to export page
		await page.goto( '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export-customization' );
		await page.waitForLoadState( 'networkidle' );

		// Fill kit information
		await page.fill( 'input[placeholder="Type name here..."]', 'Progress Test Kit' );

		// Start export and wait for progress indicator
		await page.click( 'button:has-text("Export as .zip")' );

		// Verify progress indicator is shown
		await expect( page.locator( '[data-testid="export-progress"]' ) ).toBeVisible();
		await expect( page.locator( 'text=Exporting...' ) ).toBeVisible();

		// Wait for download to complete
		const downloadPromise = page.waitForEvent( 'download' );
		// const download = await downloadPromise;

		// Verify progress indicator is hidden after completion
		await expect( page.locator( '[data-testid="export-progress"]' ) ).not.toBeVisible();
	} );
} );

