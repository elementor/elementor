const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../pages/wp-admin-page' );

test( 'WYSIWYG Control allows writing HTML entities', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	const elementId = await editor.addElement( { widgetType: 'text-editor', elType: 'widget' } );

	await page.evaluate( () => {
		$e.run( 'document/elements/settings', {
			container: elementor.getContainer( elementId ),
			editor: '&lt;hr&gt;',
		} );
	} );

	// Act.
	await editor.page.click( '.wp-switch-editor.switch-html' );
	const textEditor = await editor.page.locator( '.elementor-wp-editor' );

	// Assert.
	expect( await textEditor.innerText() ).toBe( '&lt;hr&gt;' );
} );
