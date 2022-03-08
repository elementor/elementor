const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../pages/wp-admin-page' );

test( 'Command: `document/repeater/select`', async ( { page }, testInfo ) => {
	// Arrange.
	const indexToSelect = 2,
		wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost(),
		widgetId = await editor.addWidget( 'tabs' );

	// Act.
	await editor.page.evaluate( ( [ id, index ] ) => {
		return $e.commands.run( 'document/repeater/select', {
				index,
				container: elementor.getContainer( id ),
			}
		);
	}, [ widgetId, indexToSelect ] );

	// Assert, Ensure tab selected.
	const tabTitle = await editor.previewFrame.locator( `:nth-match(:text("Tab #${ indexToSelect }"), ${ indexToSelect })` );

	await expect( tabTitle ).toHaveClass( 'elementor-tab-title elementor-tab-mobile-title elementor-active' );
} );
