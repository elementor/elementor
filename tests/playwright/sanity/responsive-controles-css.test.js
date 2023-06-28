import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';

test( 'Responsive Controls CSS Update', async ( { page } ) => {
	// This test is checking that the CSS is updated when changing the responsive controls.
	// In case of Additional breakpoints enabled, it's checking that the CSS is updated when changing the responsive controls of loop template.
	const wpAdmin = new WpAdminPage( page );
	await wpAdmin.setExperiments( {
		editor_v2: 'inactive',
		additional_custom_breakpoints: 'active',
	} );
	const loopWidgetHelper = new LoopWidgetHelper();

	await wpAdmin.createNewPage();
	const editor = new EditorPage( page );

	await editor.addWidget( 'loop-grid' );
	// Timeout is needed for the loop to be created. Otherwise, the inline edit will fail.
	// TODO: Fix createLoopTemplateFromWidgetAndInlineEdit to wait for the loop to be created.
	await page.waitForTimeout( 500 );
	await loopWidgetHelper.createLoopTemplateFromWidgetAndInlineEdit( editor );

	await editor.addWidget( 'button' );
	await editor.activatePanelTab( 'advanced' );
	await page.locator( '[data-collapse_id="_section_border"]' ).first().click();
	await page.selectOption( 'select[data-setting="_border_border"]', { value: 'dotted' } );

	const loopItemId = await page.evaluate( () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams( queryString );
		return urlParams.get( 'active-document' );
	} );

	await loopWidgetHelper.saveAndBackAfterInlineEdit( editor, false );

	// Publish and view page in order to trigger the CSS generation.
	await editor.publishAndViewPage();
	const pageURL = page.url();
	await page.goto( `/wp-admin/post.php?post=${ loopItemId }&action=elementor` );
	await page.waitForLoadState( 'networkidle' );

	// Timeout is needed for panel to open in some cases in the CI.
	await page.waitForTimeout( 1000 );

	await editor.getFrame().locator( '.elementor-button-wrapper' ).first().click();

	// Timeout is needed for panel to open in some cases in the CI.
	await page.waitForTimeout( 500 );

	await editor.activatePanelTab( 'advanced' );
	await page.locator( '[data-collapse_id="_section_border"]' ).first().click();
	await page.locator( '.elementor-control-responsive-switchers__holder' ).nth( 0 ).click();
	await page.locator( '[data-device="mobile"]' ).nth( 0 ).click();
	await page.locator( '.elementor-group-control-width.elementor-control-responsive-mobile li:first-child input' ).first().fill( '20' );

	// Publish loop item and view page in order to trigger the CSS generation again.
	await editor.publishPage();
	await page.goto( pageURL, { waitUntil: 'networkidle' } );

	await page.addStyleTag( {
		content: '.elementor-element .elementor-widget-container { transition: none !important; }',
	} );
	await page.setViewportSize( { width: 390, height: 600 } );
	const button = page.locator( '[data-widget_type="button.default"] .elementor-widget-container' ).first();
	const buttonBorder = await button.evaluate( ( element ) => {
		return window.getComputedStyle( element ).getPropertyValue( 'border-bottom-width' );
	} );

	expect( buttonBorder ).toBe( '20px' );
	await wpAdmin.setExperiments( {
		editor_v2: 'active',
		additional_custom_breakpoints: 'inactive',
	} );
} );
