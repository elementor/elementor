import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import * as path from 'path';
import { ImportExportHelpers } from './helpers/import-export-helpers';

test.describe( 'Import Export Customization - Basic Import', () => {
	let wpAdminPage: WpAdminPage;

	test.beforeEach( async ( { page, apiRequests } ) => {
		wpAdminPage = new WpAdminPage( page, test.info(), apiRequests );

		await wpAdminPage.login();
	} );

	test( 'should complete full import process with progress and summary', async ( { page } ) => {
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportProcess( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '3 Posts | 13 Pages | 2 Floating Elements | 4 Taxonomies' );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'Theme | Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );

		await ImportExportHelpers.verifyLearnMoreLink( page );
	} );

	test( 'should validate file upload requirement', async ( { page } ) => {
		await ImportExportHelpers.openImportPage( page );

		const importButton = page.locator( 'button:has-text("Import")' );
		await expect( importButton ).toBeDisabled();

		await ImportExportHelpers.uploadKitFile( page );

		await expect( importButton ).toBeEnabled();
	} );

	test( 'should handle invalid file format', async ( { page } ) => {
		await ImportExportHelpers.openImportPage( page );

		const invalidFilePath = path.join( __dirname, 'templates', 'elementor-custom-page.json' );
		await page.setInputFiles( 'input[type="file"]', invalidFilePath );

		await ImportExportHelpers.startImport( page );

		await expect( page.locator( 'text=Invalid file format' ) ).toBeVisible();
	} );
} );
