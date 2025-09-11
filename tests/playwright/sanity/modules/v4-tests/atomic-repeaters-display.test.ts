import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { BrowserContext, Page, expect } from '@playwright/test';

test.describe( 'Atomic repeaters display @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	const repeaterControls = [ 'filter', 'Backdrop filter', 'transform', 'Box shadow', 'transitions' ];

	repeaterControls.forEach( ( contorl ) => {
		let containerId: string;

		test( `repeater control ${ contorl } stability`, async () => {
			editor = await wpAdmin.openNewPage();
			containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
			await editor.openV2PanelTab( 'style' );
			await editor.openV2Section( 'effects' );

			const controlRepeaterAdditionButton = page.getByRole( 'button', { name: `Add ${ contorl } item` } );
			await editor.page.pause();
			await controlRepeaterAdditionButton.click();
			await page.locator( '.MuiBackdrop-root' ).click();

			const parentDiv = controlRepeaterAdditionButton.locator( '../../..' );
			const controlName = contorl.trim().toLowerCase().replace( /\s+/g, '-' );

			await expect.soft( parentDiv ).toHaveScreenshot( 'transform-parent-' + controlName + '.png' );
		} );
	} );
} );
