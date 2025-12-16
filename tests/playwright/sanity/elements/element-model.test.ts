import { expect } from '@playwright/test';
import { parallelTest as test } from '../../parallelTest';
import WpAdminPage from '../../pages/wp-admin-page';
import EditorSelectors from '../../selectors/editor-selectors';

test.describe( 'Element Model', () => {
	test( 'Change element name in navigator', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_components: 'active',
		} );

		const editor = await wpAdmin.openNewPage();
		const newElementName = 'My Custom Heading';

		// Add a heading widget.
		const headingId = await editor.addWidget( { widgetType: 'heading' } );

		// Open navigator.
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();
		await expect( page.locator( EditorSelectors.panels.navigator.wrapper ) ).toBeVisible();

		// Act - Click on the element title in navigator to enter edit mode.
		const elementTitleSelector = `${ EditorSelectors.panels.navigator.getElement( headingId ) } .elementor-navigator__element__title__text`;
		const titleElement = page.locator( elementTitleSelector );

		await titleElement.click();

		// Verify title is in edit mode (contenteditable).
		await expect( titleElement ).toHaveAttribute( 'contenteditable', 'true' );

		// Clear existing text and type new name.
		await titleElement.clear();
		await titleElement.fill( newElementName );

		// Exit edit mode by clicking outside (on navigator wrapper).
		await page.locator( EditorSelectors.panels.navigator.wrapper ).click();

		// Assert - Verify the title was updated.
		await expect( titleElement ).toHaveText( newElementName );
		await expect( titleElement ).toHaveAttribute( 'contenteditable', 'false' );
	} );

	test( 'Change element name persists after page reload', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const newName = 'Persistent Button Name';

		// Add a button widget.
		const buttonId = await editor.addWidget( { widgetType: 'button' } );

		// Open navigator and change name.
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();
		const titleSelector = `${ EditorSelectors.panels.navigator.getElement( buttonId ) } .elementor-navigator__element__title__text`;
		const titleElement = page.locator( titleSelector );

		await titleElement.click();
		await titleElement.clear();
		await titleElement.fill( newName );
		await titleElement.press( 'Enter' );

		// Save the page.
		await editor.page.locator( '#elementor-panel-footer-saver-options' ).click();
		await editor.page.locator( '#elementor-panel-footer-sub-menu-item-save-draft' ).click();

		// Reload page.
		await editor.page.reload();
		await editor.page.waitForLoadState( 'networkidle' );

		// Reopen navigator to verify persisted name.
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();
		const persistedTitle = page.locator( titleSelector );
		await expect( persistedTitle ).toHaveText( newName );
	} );

	test( 'Toggle element visibility', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Add a heading widget.
		const headingId = await editor.addWidget( { widgetType: 'heading' } );
		const headingElement = editor.getPreviewFrame().locator( `.elementor-element-${ headingId }` );

		// Verify element is visible initially.
		await expect( headingElement ).toBeVisible();

		// Act - Toggle visibility via navigator.
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();
		const visibilityToggle = page.locator( `${ EditorSelectors.panels.navigator.getElement( headingId ) } .elementor-navigator__element__toggle` );
		await visibilityToggle.click();

		// Assert - Element should be hidden.
		await expect( headingElement ).toBeHidden();

		// Act - Toggle visibility again.
		await visibilityToggle.click();

		// Assert - Element should be visible again.
		await expect( headingElement ).toBeVisible();
	} );

	test( 'Element name change updates in navigator immediately', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Add multiple widgets.
		const headingId = await editor.addWidget( { widgetType: 'heading' } );
		const buttonId = await editor.addWidget( { widgetType: 'button' } );

		// Open navigator.
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();

		// Act - Change heading name.
		const headingTitleSelector = `${ EditorSelectors.panels.navigator.getElement( headingId ) } .elementor-navigator__element__title__text`;
		const headingTitle = page.locator( headingTitleSelector );

		await headingTitle.click();
		await headingTitle.clear();
		await headingTitle.fill( 'Section Header' );
		await headingTitle.press( 'Enter' );

		// Act - Change button name.
		const buttonTitleSelector = `${ EditorSelectors.panels.navigator.getElement( buttonId ) } .elementor-navigator__element__title__text`;
		const buttonTitle = page.locator( buttonTitleSelector );

		await buttonTitle.click();
		await buttonTitle.clear();
		await buttonTitle.fill( 'Call to Action' );
		await buttonTitle.press( 'Enter' );

		// Assert - Both names should be updated.
		await expect( headingTitle ).toHaveText( 'Section Header' );
		await expect( buttonTitle ).toHaveText( 'Call to Action' );
	} );

	test( 'Change container name in navigator', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const newContainerName = 'Hero Section';

		// Add a container.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );

		// Open navigator.
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();
		await expect( page.locator( EditorSelectors.panels.navigator.wrapper ) ).toBeVisible();

		// Act - Change container name.
		const containerTitleSelector = `${ EditorSelectors.panels.navigator.getElement( containerId ) } .elementor-navigator__element__title__text`;
		const titleElement = page.locator( containerTitleSelector );

		await titleElement.click();
		await titleElement.clear();
		await titleElement.fill( newContainerName );
		await titleElement.press( 'Enter' );

		// Assert.
		await expect( titleElement ).toHaveText( newContainerName );
	} );

	test( 'Element name reverts to default when cleared', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Add a heading widget.
		const headingId = await editor.addWidget( { widgetType: 'heading' } );

		// Open navigator and get default title.
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();
		const titleSelector = `${ EditorSelectors.panels.navigator.getElement( headingId ) } .elementor-navigator__element__title__text`;
		const titleElement = page.locator( titleSelector );
		const defaultTitle = await titleElement.textContent();

		// Act - Change name.
		await titleElement.click();
		await titleElement.clear();
		await titleElement.fill( 'Custom Name' );
		await titleElement.press( 'Enter' );
		await expect( titleElement ).toHaveText( 'Custom Name' );

		// Act - Clear the name.
		await titleElement.click();
		await titleElement.clear();
		await titleElement.press( 'Enter' );

		// Assert - Should revert to default title.
		await expect( titleElement ).toHaveText( defaultTitle || 'Heading' );
	} );
} );
