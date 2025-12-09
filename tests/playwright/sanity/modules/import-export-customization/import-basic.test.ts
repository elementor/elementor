import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { ImportExportHelpers } from './helpers/import-export-helpers';

test.describe( 'Import Export Customization - Basic Import', () => {
	test( 'should complete full import process with progress and summary', async ( { page, apiRequests } ) => {
		const wpAdmin = new WpAdminPage( page, test.info(), apiRequests );
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '13 Pages | 3 Posts | 2 Floating Elements | 4 Taxonomies', wpAdmin );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'Theme | Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );
	} );

	test( 'should validate file upload requirement', async ( { page } ) => {
		await ImportExportHelpers.openImportPage( page );

		const importButton = page.locator( 'button:has-text("Import")' );
		await expect( importButton ).not.toBeVisible();

		await ImportExportHelpers.uploadKitFile( page );

		await expect( importButton ).toBeEnabled();
	} );
} );
