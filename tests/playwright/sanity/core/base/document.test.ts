import { expect, test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Document tests', async () => {
	test( 'Converting Gutenberg page to sections columns',
		async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				container: 'inactive',
			} );

			await wpAdmin.page.goto( '/wp-admin/post-new.php?post_type=page' );
			await addElement( wpAdmin, 'list' );
			await addElement( wpAdmin, 'heading' );
			const editor = await wpAdmin.convertFromGutenberg();
			const sections = await editor.getPreviewFrame().locator( '[data-element_type="section"]' ).count();
			await expect( sections ).toEqual( 1 );
			const columns = await editor.getPreviewFrame().locator( '[data-element_type="column"]' ).count();
			await expect( columns ).toEqual( 1 );
			const textEditors = await editor.getPreviewFrame().locator( '.elementor-widget-text-editor' ).count();
			await expect( textEditors ).toEqual( 1 );

			await wpAdmin.setExperiments( {
				container: 'active',
			} );
		} );

	test( 'Converting Gutenberg page to container',
		async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				container: 'active',
			} );

			await wpAdmin.page.goto( '/wp-admin/post-new.php?post_type=page' );
			await addElement( wpAdmin, 'list' );
			await addElement( wpAdmin, 'heading' );
			const editor = await wpAdmin.convertFromGutenberg();
			const sections = await editor.getPreviewFrame().locator( '[data-element_type="container"]' ).count();
			await expect( containers ).toEqual( 1 );
			const textEditors = await editor.getPreviewFrame().locator( '.elementor-widget-text-editor ' ).count();
			await expect( textEditors ).toEqual( 1 );

			await wpAdmin.setExperiments( {
				container: 'inactive',
			} );
		} );
} );

async function addElement( wpAdmin: WpAdminPage, elementType: string ) {
	await wpAdmin.page.click( '.block-editor-inserter__toggle' );
	await wpAdmin.page.click( '.editor-block-list-item-' + elementType );
	await wpAdmin.page.click( '.editor-styles-wrapper' );
}
