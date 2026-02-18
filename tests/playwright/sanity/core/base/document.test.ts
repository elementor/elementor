import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Document tests', async () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Converting Gutenberg page to sections columns',
		async ( { page, apiRequests }, testInfo ) => {
			await wpCli( 'wp elementor experiments deactivate container' );

			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
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
			await wpAdmin.setExperiments( { container: true } );

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

async function dismissModalIfPresent( wpAdmin: WpAdminPage ) {
	const modalOverlay = wpAdmin.page.locator( '.components-modal__screen-overlay' );
	try {
		await modalOverlay.waitFor( { state: 'visible', timeout: 3000 } );
		await wpAdmin.page.keyboard.press( 'Escape' );
		await modalOverlay.waitFor( { state: 'hidden' } );
	} catch {
		// No modal appeared
	}
}

async function addElement( wpAdmin: WpAdminPage, elementType: string ) {
	await dismissModalIfPresent( wpAdmin );

	const inserterToggle = wpAdmin.page.getByRole( 'button', { name: 'Block Inserter', exact: true } );
	await inserterToggle.waitFor( { timeout: 10000 } );

	if ( await inserterToggle.getAttribute( 'aria-pressed' ) !== 'true' ) {
		await inserterToggle.click();
	}

	const blockItemSelector = [
		`[class*="editor-block-list-item-core-${ elementType }"]`,
		`[class*="editor-block-list-item-${ elementType }"]`,
	].join( ', ' );

	await wpAdmin.page.locator( blockItemSelector ).first().click();
}
