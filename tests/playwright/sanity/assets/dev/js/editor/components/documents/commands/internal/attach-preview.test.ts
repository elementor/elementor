import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../../../../parallelTest';
import WpAdminPage from '../../../../../../../../../pages/wp-admin-page';

test( `$e.run( 'editor/documents/attach-preview' ) - Ensure loaded in custom selector`, async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
		editor = await wpAdmin.openNewPage();

	await editor.addWidget( 'tabs' );
	await editor.getPreviewFrame().waitForSelector( '.elementor-tab-title.elementor-active' );

	// Attach-preview inside the tab as a custom selector.
	await editor.page.evaluate( () => {
		// `Attach-preview` is a `tab_content` of the widget tabs.
		$e.internal( 'editor/documents/attach-preview', {
			selector: '.elementor-tab-content',
		} );
	} );
	await editor.page.evaluate( () => {
		// `Attach-preview` is a `tab_content` of the widget tabs.
		$e.internal( 'editor/documents/attach-preview', {
			selector: '.elementor-tab-content',
		} );
	} );

	// Assert - Ensure the tabs are duplicated.
	await expect( editor.getPreviewFrame().locator( '.elementor-tab-content .elementor-tabs-wrapper .elementor-tab-title.elementor-active' ) ).toBeVisible();
	const tabCount = await editor.getPreviewFrame().locator( '.elementor-tab-title' ).count();

	// It will be duplicated since, the same widget tabs gonna be inside the first tab content.
	expect( tabCount ).toBe( 8 ); // 8 Since there is hidden titles for the mobile version.
} );
