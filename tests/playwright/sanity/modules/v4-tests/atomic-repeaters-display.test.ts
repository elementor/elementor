import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { BrowserContext, Page, expect } from '@playwright/test';

test.describe( 'Atomic repeaters display @atomic-widgets', () => {
	let wpAdmin: WpAdminPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
	} );

	// const repeaterControls = [ 'filter', 'Backdrop filter', 'transform', 'Box shadow', 'transitions' ];
	const repeaterControls = [ 'filter' ];
		
	for ( const control of repeaterControls ) {
		test.only( `repeater control ${ control } stability`, async () => {
			const editor = await wpAdmin.openNewPage();
			await editor.addWidget( { widgetType: 'e-heading' } );
			await editor.openV2PanelTab( 'style' );
			await editor.openV2Section( 'effects' );

			const controlRepeaterAdditionButton = editor.page.getByRole( 'button', { name: `Add ${ control } item` } );

			await controlRepeaterAdditionButton.click();
			await editor.page.locator( '.MuiBackdrop-root' ).click();

			const parentDiv = controlRepeaterAdditionButton.locator( '../../..' );
			const controlName = control.trim().toLowerCase().replace( /\s+/g, '-' );

			await expect.soft( parentDiv ).toHaveScreenshot( 'transform-parent-' + controlName + '.png' );
		} );
	};
} );
