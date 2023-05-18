const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../pages/wp-admin-page' );

test( 'WYSIWYG Control allows mixing HTML & entities', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	const elementId = await editor.addElement( { widgetType: 'text-editor', elType: 'widget' } );

	await page.evaluate( ( containerId ) => {
		// Must be set via a command, in order to demonstrate the loading from server, instead of use typing.
		$e.run( 'document/elements/settings', {
			container: elementor.getContainer( containerId ),
			settings: {
				editor: '&lt;hr&gt;<hr />',
			},
		} );

		// Refresh the text area editor.
		const args = { model, view } = elementor.getContainer( containerId );
		$e.route( 'panel/editor/style', args );
		$e.route( 'panel/editor/content', args );
	}, elementId );

	// Act.
	await editor.page.click( '.wp-switch-editor.switch-html' );
	const value = await editor.page.inputValue( '.elementor-wp-editor' );

	// Assert.
	expect( value ).toContain( '&lt;hr&gt;' );
	expect( value ).toContain( '<hr />' ); // It's seperated because of inconsistent output . Sometimes the widget return a text with a <p> element and sometimes not.
} );
