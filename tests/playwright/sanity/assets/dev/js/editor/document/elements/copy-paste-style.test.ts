import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../../../../pages/wp-admin-page';

test( 'A page can be saved successfully after copy-paste style', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.openNewPage();

	await editor.closeNavigatorIfOpen();

	const heading1 = await editor.addWidget( 'heading' );
	const heading2 = await editor.addWidget( 'heading' );

	await editor.selectElement( heading1 );
	await editor.openPanelTab( 'style' );
	await editor.setColorControlValue( 'title_color', '#77A5BD' );

	await editor.publishPage();

	// Act.
	await editor.copyElement( heading1 );

	await editor.pasteStyleElement( heading2 );

	// Assert.
	const heading2Title = editor.getPreviewFrame().locator( '.elementor-element-' + heading2 + ' .elementor-heading-title' );
	await expect( heading2Title ).toHaveCSS( 'color', 'rgb(119, 165, 189)' );

	// Act.
	await editor.publishPage();

	// Assert.
	expect( await editor.canPublishPage() ).toBeFalsy();
} );
