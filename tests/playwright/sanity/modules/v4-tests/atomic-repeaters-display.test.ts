import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';

const CUSTOM_VALUE = 'my custom value';

test.describe( 'Atomic repeaters display @atomic-widgets', () => {
	let wpAdmin: WpAdminPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		const context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
	} );

	const repeaterControls = [ 'filter', 'Backdrop filter', 'transform', 'Box shadow' ];

	for ( const control of repeaterControls ) {
		test( `repeater control ${ control } stability`, async () => {
			const editor = await wpAdmin.openNewPage();
			await editor.addWidget( { widgetType: 'e-heading' } );
			await editor.v4Panel.openTab( 'style' );
			await editor.openV2Section( 'effects' );

			const controlRepeaterAdditionButton = editor.page.getByRole( 'button', { name: `Add ${ control } item` } );

			await controlRepeaterAdditionButton.click();
			await editor.page.locator( '.MuiBackdrop-root' ).click();

			const parentDiv = controlRepeaterAdditionButton.locator( '../../..' );
			const controlName = control.trim().toLowerCase().replace( /\s+/g, '-' );

			await expect.soft( parentDiv ).toHaveScreenshot( 'transform-parent-' + controlName + '.png' );
		} );

		test( `repeater control ${ control } custom size stability`, async () => {
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
			await customSizeInput.fill( CUSTOM_VALUE );

			await expect( customSizeInput ).toHaveValue( CUSTOM_VALUE );

			while ( await editor.page.locator( '.MuiBackdrop-root' ).count() ) {
				await editor.page.locator( '.MuiBackdrop-root' ).last().click();
			}

			const repeaterItem = editor.page.locator( '.MuiTag-content' );

			expect( await repeaterItem.textContent() ).toContain( CUSTOM_VALUE );
		} );
	}
} );
