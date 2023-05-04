const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test( 'add widgets from the panel by click', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	const heading = await addWidgetByClick( editor, 'heading' );

	await addWidgetByClick( editor, 'button' );

	await editor.selectElement( heading );

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

test( 'block adding from panel an inner section inside an inner section', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	const firstInnerSection = await editor.addElement( { elType: 'inner-section' }, 'document' );
	const secondInnerSection = await editor.addElement( { elType: 'inner-section' }, firstInnerSection );

	// Assert.
	expect( secondInnerSection ).not.toBeDefined();
} );

async function addElementByClick( editor, { elType, widgetType } ) {
	const isWidget = 'widget' === elType;

	const type = isWidget ? widgetType : elType;
	const title = type.charAt( 0 ).toUpperCase() + type.slice( 1 ).replace( '-', ' ' );

	await editor.page.locator( '#elementor-panel-header-add-button' ).click();
	await editor.page.locator( `.elementor-panel-category-items :text-is('${ title }')` ).click();

	const selector = isWidget ? `.elementor-widget-${ widgetType }` : `.elementor-element-${ elType }`;
	const newElement = await editor.getPreviewFrame().locator( selector );

	return newElement.evaluate( ( el ) => el.dataset.id );
}

function addWidgetByClick( editor, widgetType ) {
	return addElementByClick( editor, { elType: 'widget', widgetType } );
}
