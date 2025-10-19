import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

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

	const repeaterControls = [ 'filter', 'Backdrop filter', 'transform', 'Box shadow', 'transitions' ];

	for ( const control of repeaterControls ) {
		test( `repeater control ${ control } stability`, async () => {
			const editor = await wpAdmin.openNewPage();
			await editor.addWidget( { widgetType: 'e-heading' } );
			await editor.v4Panel.openTab( 'style' );
			await editor.openV2Section( 'effects' );

			const controlRepeaterAdditionButton = editor.page.getByRole( 'button', { name: `Add ${ control } item` } );
			const inputUnitButton = editor.page.locator( 'button', { hasText: /^(px|ms)$/ } ).last();
			const customSizeButton = editor.page.locator( '.MuiPaper-root ul li .MuiListItemText-root svg' );
			const customSizeInput = editor.page.locator( '.MuiPaper-root .MuiPaper-root .MuiPaper-root input[type="text"]' );

			await controlRepeaterAdditionButton.click();
			await inputUnitButton.click();
			await customSizeButton.click();
			await customSizeInput.fill( 'My milkshake brings all the boys to the yard' );

			await expect( customSizeInput ).toHaveValue( 'My milkshake brings all the boys to the yard' );
			await customSizeInput.clear();

			const currentBackdrop = editor.page.locator( '.MuiBackdrop-root' ).last();

			await currentBackdrop.click();
			await currentBackdrop.waitFor( { state: 'detached' } );
			await editor.page.locator( '.MuiBackdrop-root' ).last().click();

			const parentDiv = controlRepeaterAdditionButton.locator( '../../..' );
			const controlName = control.trim().toLowerCase().replace( /\s+/g, '-' );

			await expect.soft( parentDiv ).toHaveScreenshot( 'transform-parent-' + controlName + '.png' );
		} );
	}
} );
