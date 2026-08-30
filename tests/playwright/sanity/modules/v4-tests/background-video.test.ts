import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Background Video @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	const elementType = 'e-background-video';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
	} );

	test( 'Play state is selected by default when Background Video is added', async () => {
		const elementId = await editor.addElement( { elType: elementType }, 'document' );

		await editor.selectElement( elementId );
		await editor.v4Panel.openTab( 'general' );

		const statesField = editor.page.locator( '[data-type="settings-field"]' ).filter( { hasText: 'States' } );
		await expect( statesField ).toBeVisible();

		const playButton = statesField.getByRole( 'button', { name: 'Play' } );
		const pauseButton = statesField.getByRole( 'button', { name: 'Pause' } );

		await expect( playButton ).toHaveAttribute( 'aria-pressed', 'true' );
		await expect( pauseButton ).toHaveAttribute( 'aria-pressed', 'false' );

		const previewRoot = editor.getPreviewFrame().locator( editor.getWidgetSelector( elementId ) );
		await expect( previewRoot ).toHaveClass( /e-background-video--playing/ );
		await expect( previewRoot ).not.toHaveClass( /e-background-video--paused/ );
	} );

	test( 'User can switch Background Video state to Pause', async () => {
		const elementId = await editor.addElement( { elType: elementType }, 'document' );

		await editor.selectElement( elementId );
		await editor.v4Panel.openTab( 'general' );

		const statesField = editor.page.locator( '[data-type="settings-field"]' ).filter( { hasText: 'States' } );
		await statesField.getByRole( 'button', { name: 'Pause' } ).click();

		await expect( statesField.getByRole( 'button', { name: 'Play' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
		await expect( statesField.getByRole( 'button', { name: 'Pause' } ) ).toHaveAttribute( 'aria-pressed', 'true' );

		const previewRoot = editor.getPreviewFrame().locator( editor.getWidgetSelector( elementId ) );
		await expect( previewRoot ).toHaveClass( /e-background-video--paused/ );
		await expect( previewRoot ).not.toHaveClass( /e-background-video--playing/ );
	} );
} );
