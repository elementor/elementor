import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../../parallelTest';
import WpAdminPage from '../../../../../../../pages/wp-admin-page';
import EditorSelectors from '../../../../../../../selectors/editor-selectors';

test( 'A page can be saved successfully after copy-paste style', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();
	const hasTopBar = await editor.hasTopBar();
	const heading1 = await editor.addWidget( 'heading' );
	const heading2 = await editor.addWidget( 'heading' );
	let publishButton;

	await editor.closeNavigatorIfOpen();
	await editor.selectElement( heading1 );
	await editor.openPanelTab( 'style' );
	await editor.setColorControlValue( 'title_color', '#77A5BD' );

	// Act.
	await editor.copyElement( heading1 );
	await editor.pasteStyleElement( heading2 );

	const heading2Title = editor.getPreviewFrame().locator( '.elementor-element-' + heading2 + ' .elementor-heading-title' );

	// Assert.
	await expect( heading2Title ).toHaveCSS( 'color', 'rgb(119, 165, 189)' );

	if ( hasTopBar ) {
		publishButton = page.locator( EditorSelectors.panels.topBar.wrapper + ' button', { hasText: 'Publish' } );
	} else {
		publishButton = page.locator( '#elementor-panel-saver-button-publish' );
	}

	// Check that the panel footer save button is enabled.
	if ( hasTopBar ) {
		await expect( publishButton ).not.toBeDisabled();
	} else {
		await expect( publishButton ).not.toHaveClass( /(^|\s)elementor-disabled(\s|$)/ );
	}

	// Act.
	await publishButton.click();

	// Assert.
	if ( hasTopBar ) {
		await expect( publishButton ).toBeDisabled( { timeout: 10000 } );
	} else {
		await expect( publishButton ).toHaveClass( /(^|\s)elementor-disabled(\s|$)/, { timeout: 10000 } );
	}
} );
