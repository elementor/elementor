import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';

test( 'add widgets from the panel by click', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	// Act.
	const heading = await addWidgetByClick( editor, 'heading' );

	await addWidgetByClick( editor, 'button' );

	await editor.selectElement( heading );

	await addWidgetByClick( editor, 'icon' );

	// Assert.
	type dataset = Element & {
		dataset: {
			widget_type: string
		}
	}
	const orderedWidgets = await editor.getPreviewFrame().evaluate( () => {
		// Build a string that represents the widgets order in the page, since
		// evaluate() must return a primitive value.
		return [ ...document.querySelectorAll( '.elementor-widget' ) ]
			.map( ( el: dataset ) => {
				return el.dataset.widget_type.replace( '.default', '' );
			} )
			.join( ',' );
	} );

	expect( orderedWidgets ).toBe( 'heading,icon,button' );
} );

test( 'block adding from panel an inner section inside an inner section', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	// Act.
	const firstInnerSection = await editor.addElement( { elType: 'inner-section' }, 'document' );
	const secondInnerSection = await editor.addElement( { elType: 'inner-section' }, firstInnerSection );

	// Assert.
	expect( secondInnerSection ).not.toBeDefined();
} );

async function addWidgetByClick( editor: EditorPage, widgetType: string ) {
	const title = widgetType.charAt( 0 ).toUpperCase() + widgetType.slice( 1 );
	const elementsPanelItem = `.elementor-panel-category-items :text-is('${ title }')`;

	await editor.openElementsPanel();
	await editor.page.locator( elementsPanelItem ).click();

	return editor.getPreviewFrame().locator( `.elementor-widget-${ widgetType }` ).getAttribute( 'data-id' );
}
