import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { ImportExportHelpers } from './helpers/import-export-helpers';

test.describe( 'Import Export Customization - Import Customization', () => {
	test( 'should import kit with Theme unchecked in Settings dialog', async ( { page, apiRequests } ) => {
		const wpAdmin = new WpAdminPage( page, test.info(), apiRequests );
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.customizeSettingsSection( page, true );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '13 Pages | 3 Posts | 2 Floating Elements | 4 Taxonomies', wpAdmin );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'No settings imported' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );
	} );

	test( 'should import kit with Posts unchecked in Content dialog', async ( { page, apiRequests } ) => {
		const wpAdmin = new WpAdminPage( page, test.info(), apiRequests );
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.customizeContentSection( page, true );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '13 Pages | 2 Floating Elements | 4 Taxonomies', wpAdmin );
		await ImportExportHelpers.verifyNotInContentSection( page, '3 Posts' );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'Theme | Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor | Hello Dolly | WordPress Importer' );
	} );

	test( 'should import only selected plugins', async ( { page, apiRequests } ) => {
		const wpAdmin = new WpAdminPage( page, test.info(), apiRequests );
		await ImportExportHelpers.openImportPage( page );

		await ImportExportHelpers.uploadKitFile( page );

		await ImportExportHelpers.customizePluginsSection( page, true, true );

		await ImportExportHelpers.startImport( page );

		await ImportExportHelpers.waitForImportComplete( page );

		await ImportExportHelpers.verifyContentSection( page, '13 Pages | 3 Posts | 2 Floating Elements | 4 Taxonomies', wpAdmin );
		await ImportExportHelpers.verifyTemplatesSection( page, 'No templates imported' );
		await ImportExportHelpers.verifySettingsSection( page, 'Theme | Global Colors | Global Fonts | Theme Style Settings | General Settings | Experiments' );
		await ImportExportHelpers.verifyPluginsSection( page, 'Elementor' );
	} );
} );
