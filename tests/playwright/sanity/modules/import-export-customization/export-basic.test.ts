import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { setupCompleteTestData, cleanupCreatedItems, CreatedItems } from './utils/test-seeders';
import { ImportExportHelpers } from './helpers/import-export-helpers';

test.describe( 'Import Export Customization - Basic Export', () => {
	let createdItems: CreatedItems;

	test.beforeEach( async ( { page, apiRequests } ) => {
		createdItems = await setupCompleteTestData( page, test.info(), apiRequests );
	} );

	test.beforeEach( async ( { page, apiRequests } ) => {
		await cleanupCreatedItems( apiRequests, page.context().request, createdItems );
		await apiRequests.cleanUpTestPages( page.request );
	} );

	test( 'should complete full export process with progress and summary', async ( { page } ) => {
		await ImportExportHelpers.navigateToExportCustomizationPage( page );

		await ImportExportHelpers.fillKitInfo( page, 'test-kit', 'Test Description' );

		await ImportExportHelpers.startExport( page );

		await ImportExportHelpers.waitForExportProcess( page );

		await ImportExportHelpers.waitForExportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '13 Pages | 2 Floating Elements | 3 Posts | 3 Taxonomies' );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates exported' );
		await ImportExportHelpers.verifySettingsSection( page, 'Theme | Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );

		await expect( page.locator( 'text=Is the automatic download not starting?' ) ).toBeVisible();
		await expect( page.locator( 'text=Download manually.' ) ).toBeVisible();

		await ImportExportHelpers.verifyDoneButton( page );
	} );

	test( 'should validate required kit name field', async ( { page } ) => {
		await ImportExportHelpers.navigateToExportCustomizationPage( page );

		const exportButton = page.locator( 'button:has-text("Export as .zip")' );
		await expect( exportButton ).toBeDisabled();

		await ImportExportHelpers.fillKitInfo( page, 'test-kit' );
		await expect( exportButton ).toBeEnabled();
	} );
} );
