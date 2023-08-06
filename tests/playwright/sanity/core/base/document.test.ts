import { expect, test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Document tests', async () => {
	test( 'Converting Gutenberg page to sections columns',
		async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				container: false,
			} );

			await wpAdmin.openNewWordpressPage();
			await addElement( wpAdmin, 'list' );
			await addElement( wpAdmin, 'heading' );
			const editor = await wpAdmin.convertFromGutenberg();
			const previewFrame = editor.getPreviewFrame();
			const sections = await previewFrame.locator( '[data-element_type="section"]' ).count();
			await expect( sections ).toEqual( 1 );
			const columns = await previewFrame.locator( '[data-element_type="column"]' ).count();
			await expect( columns ).toEqual( 1 );
			const textEditors = await previewFrame.locator( '.elementor-widget-text-editor' ).count();
			await expect( textEditors ).toEqual( 1 );

			await wpAdmin.setExperiments( {
				container: true,
			} );
		} );

	test( 'converting gutenberg page to container',
		async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				container: true,
			} );

			await wpAdmin.openNewWordpressPage();
			await addElement( wpAdmin, 'list' );
			await addElement( wpAdmin, 'heading' );
			const editor = await wpAdmin.convertFromGutenberg();
			const previewFrame = editor.getPreviewFrame();
			const containers = await previewFrame.locator( '[data-element_type="container"]' ).count();
			await expect( containers ).toEqual( 1 );
			const textEditors = await previewFrame.locator( '.elementor-widget-text-editor ' ).count();
			await expect( textEditors ).toEqual( 1 );

			await wpAdmin.setExperiments( {
				container: false,
			} );
		} );
} );

async function addElement( wpAdmin: WpAdminPage, elementType: string ) {
	await wpAdmin.page.click( '.block-editor-inserter__toggle' );
	await wpAdmin.page.click( '.editor-block-list-item-' + elementType );
	await wpAdmin.page.click( '.editor-styles-wrapper' );
}
