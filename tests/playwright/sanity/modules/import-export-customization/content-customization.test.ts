import { parallelTest as test } from '../../../parallelTest';
import { setupCompleteTestData, cleanupCreatedItems, CreatedItems } from './utils/test-seeders';
import { ImportExportHelpers } from './helpers/import-export-helpers';

test.describe( 'Import Export Customization - Content Customization', () => {
	let createdItems: CreatedItems;

	test.beforeEach( async ( { page, apiRequests } ) => {
		createdItems = await setupCompleteTestData( page, test.info(), apiRequests );
	} );

	test.afterEach( async ( { page, apiRequests } ) => {
		await cleanupCreatedItems( apiRequests, page.context().request, createdItems );
		await apiRequests.cleanUpTestPages( page.request );
	} );

	test( 'should export kit with all checkboxes unselected except plugins', async ( { page } ) => {
		await ImportExportHelpers.navigateToExportCustomizationPage( page );

		await ImportExportHelpers.uncheckAllSections( page );

		await ImportExportHelpers.fillKitInfo( page, 'test-kit-unselected', 'Test Description' );

		await ImportExportHelpers.startExport( page );

		await ImportExportHelpers.waitForExportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, 'No content exported' );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates exported' );
		await ImportExportHelpers.verifySettingsSection( page, 'No settings exported' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );
	} );

	test( 'should export kit with Posts unchecked in Content dialog', async ( { page } ) => {
		await ImportExportHelpers.navigateToExportCustomizationPage( page );

		await ImportExportHelpers.customizeContentSection( page, true );

		await ImportExportHelpers.fillKitInfo( page, 'test-kit-no-posts', 'Test Description' );

		await ImportExportHelpers.startExport( page );

		await ImportExportHelpers.waitForExportProcess( page );
		await ImportExportHelpers.waitForExportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '13 Pages | 2 Floating Elements | 1 Taxonomies' );
		await ImportExportHelpers.verifyNotInContentSection( page, '3 Posts' );
	} );

	test( 'should export kit with Theme unchecked in Settings dialog', async ( { page } ) => {
		await ImportExportHelpers.navigateToExportCustomizationPage( page );

		await ImportExportHelpers.customizeSettingsSection( page, true );

		await ImportExportHelpers.fillKitInfo( page, 'test-kit-no-theme', 'Test Description' );

		await ImportExportHelpers.startExport( page );

		await ImportExportHelpers.waitForExportProcess( page );
		await ImportExportHelpers.waitForExportComplete( page );

		await ImportExportHelpers.verifySettingsSection( page, 'Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' );
	} );

	test( 'should export kit with only Elementor plugin selected in Plugins dialog', async ( { page } ) => {
		await ImportExportHelpers.navigateToExportCustomizationPage( page );

		await ImportExportHelpers.customizePluginsSection( page, true, true );

		await ImportExportHelpers.fillKitInfo( page, 'test-kit-elementor-only', 'Test Description' );

		await ImportExportHelpers.startExport( page );

		await ImportExportHelpers.waitForExportProcess( page );
		await ImportExportHelpers.waitForExportComplete( page );

		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor' );
	} );
} );
