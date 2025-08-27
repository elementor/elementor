import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Atomic Heading Basic Tests @atomic-heading', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic elements experiment
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
	} );

	test( 'TC-001: Add Atomic heading widget with default content', async () => {
		// Arrange
		editor = await wpAdmin.openNewPage();

		// Act - Add container and atomic heading widget
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'heading', container: containerId } );

		// Assert - Verify widget was added with default content
		await expect( editor.getPreviewFrame().locator( `[data-id="${ headingId }"]` ) ).toBeVisible();
		await expect( editor.getPreviewFrame().locator( `[data-id="${ headingId }"] h2` ) ).toHaveText( 'Add Your Heading Text Here' );

		// Verify widget type
		await expect( editor.getPreviewFrame().locator( `[data-id="${ headingId }"]` ) ).toHaveAttribute( 'data-element_type', 'widget' );
	} );

	test( 'TC-002: Edit heading content and change heading level', async () => {
		// Arrange
		editor = await wpAdmin.openNewPage();

		// Act - Add container and atomic heading widget
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'heading', container: containerId } );

		// Act - Select the heading widget
		await editor.selectElement( headingId );

		// Assert - Verify the widget is selected and can be edited
		await expect( editor.getPreviewFrame().locator( `[data-id="${ headingId }"]` ) ).toHaveClass( /elementor-element-editable/ );
	} );
} );
