import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../../parallelTest';
import WpAdminPage from '../../../../../../../pages/wp-admin-page';
import ContextMenu from '../../../../../../../pages/widgets/context-menu';
import EditorSelectors from '../../../../../../../selectors/editor-selectors';

test( 'A page can be saved successfully after copy-paste style', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const contextMenu = new ContextMenu( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	const heading1 = await editor.addWidget( { widgetType: 'heading' } );
	const heading2 = await editor.addWidget( { widgetType: 'heading' } );

	await editor.closeNavigatorIfOpen();
	await editor.selectElement( heading1 );
	await editor.openPanelTab( 'style' );
	await editor.setColorControlValue( 'title_color', '#77A5BD' );

	// Act.
	await contextMenu.copyElement( heading1 );
	await contextMenu.pasteStyleElement( heading2 );

	// Assert.
	const heading2Title = editor.getPreviewFrame().locator( '.elementor-element-' + heading2 + ' .elementor-heading-title' );
	await expect( heading2Title ).toHaveCSS( 'color', 'rgb(119, 165, 189)' );

	const publishButton = page.locator( EditorSelectors.panels.topBar.wrapper + ' button', { hasText: 'Publish' } );
	await expect( publishButton ).not.toBeDisabled();

	// Act.
	await publishButton.click();

	// Assert.
	await expect( publishButton ).toBeDisabled( { timeout: 10000 } );
} );
