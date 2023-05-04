const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../../../../pages/wp-admin-page.js' );

test( 'add widgets from the panel by click', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await addWidgetByClick( editor, 'heading' );
	await addWidgetByClick( editor, 'button' );

	await focusOnWidget( editor, 'heading' );

	await addWidgetByClick( editor, 'icon' );

	// Assert.
	const orderedWidgets = await editor.getPreviewFrame().evaluate( () => {
		// Build a string that represents the widgets order in the page, since
		// evaluate() must return a primitive value.
		return [ ...document.querySelectorAll( '.elementor-widget' ) ]
			.map( ( el ) => {
				return el.dataset.widget_type.replace( '.default', '' );
			} )
			.join( ',' );
	} );

	expect( orderedWidgets ).toBe( 'heading,icon,button' );
} );

async function addWidgetByClick( editor, widgetType ) {
	const title = widgetType.charAt( 0 ).toUpperCase() + widgetType.slice( 1 );

	await editor.page.locator( '#elementor-panel-header-add-button' ).click();
	await editor.page.locator( `.elementor-panel-category-items :text-is('${ title }')` ).click();
	await editor.getPreviewFrame().waitForSelector( `.elementor-widget-${ widgetType }` );
}

async function focusOnWidget( editor, widgetType ) {
	await editor.getPreviewFrame().locator( `.elementor-widget-${ widgetType }` ).click();
}
