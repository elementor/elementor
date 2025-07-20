import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Document tests', async () => {
	test( 'Converting Gutenberg page to sections columns',
		async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( {
				container: false,
			} );

			await wpAdmin.openNewWordpressPage();
			await addElement( wpAdmin, 'list' );
			await addElement( wpAdmin, 'heading' );
			const editor = await wpAdmin.convertFromGutenberg();
			const previewFrame = editor.getPreviewFrame();
			const sections = await previewFrame.locator( '[data-element_type="section"]' ).count();
			expect( sections ).toEqual( 1 );
			const columns = await previewFrame.locator( '[data-element_type="column"]' ).count();
			expect( columns ).toEqual( 1 );
			const textEditors = await previewFrame.locator( '.elementor-widget-text-editor' ).count();
			expect( textEditors ).toEqual( 1 );
		} );

	test( 'converting gutenberg page to container',
		async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( {
				container: true,
			} );

			await wpAdmin.openNewWordpressPage();
			await addElement( wpAdmin, 'list' );
			await addElement( wpAdmin, 'heading' );
			const editor = await wpAdmin.convertFromGutenberg();
			const previewFrame = editor.getPreviewFrame();
			const containers = await previewFrame.locator( '[data-element_type="container"]' ).count();
			expect( containers ).toEqual( 1 );
			const textEditors = await previewFrame.locator( '.elementor-widget-text-editor ' ).count();
			expect( textEditors ).toEqual( 1 );
		} );
} );

async function addElement( wpAdmin: WpAdminPage, elementType: string ) {
	const frame = wpAdmin.page.frame( { name: 'editor-canvas' } );
	if ( ! await wpAdmin.page.frameLocator( 'iframe[name="editor-canvas"]' ).locator( 'p[role="document"]' ).isVisible() ) {
		await frame.locator( '.block-editor-inserter__toggle' ).click();
	} else {
		await wpAdmin.page.frameLocator( 'iframe[name="editor-canvas"]' ).locator( 'p[role="document"]' ).click();
		await wpAdmin.page.click( '.block-editor-inserter__toggle' );
	}

	await wpAdmin.page.click( '.editor-block-list-item-' + elementType );
	await frame.click( '.editor-styles-wrapper' );
}
