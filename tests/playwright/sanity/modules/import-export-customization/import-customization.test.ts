import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { ImportExportHelpers } from './helpers/import-export-helpers';

test.describe( 'Import Export Customization - Import Customization', () => {
	let wpAdminPage: WpAdminPage;

	test.beforeEach( async ( { page, apiRequests } ) => {
		wpAdminPage = new WpAdminPage( page, test.info(), apiRequests );

		await wpAdminPage.login();
	} );

	test( 'should import kit with Theme unchecked in Settings dialog', async ( { page } ) => {
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.customizeSettingsSection( page, true );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '3 Posts | 13 Pages | 2 Floating Elements | 4 Taxonomies' );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'No settings imported' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );
	} );

	test( 'should import kit with Posts unchecked in Content dialog', async ( { page } ) => {
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.customizeContentSection( page, true );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '13 Pages | 2 Floating Elements | 4 Taxonomies' );
		await ImportExportHelpers.verifyNotInContentSection( page, '3 Posts' );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'Theme | Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );
	} );

	test( 'should import kit with all checkboxes unselected except plugins', async ( { page } ) => {
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.customizePluginsSection( page, true, true );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, 'No content imported' );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'No settings imported' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor' );
	} );
} );
