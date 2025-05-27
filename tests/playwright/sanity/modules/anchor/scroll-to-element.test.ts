import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

test.describe( 'Scrolling tests in editor @scroll-to-element', () => {
	test( 'Scroll to element from button widget', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const scrollToID = 'scroll_to_id';
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			buttonID = await editor.addWidget( { widgetType: 'button', container } ),
			spacerID = await editor.addWidget( { widgetType: 'spacer', container } ),
			elemWithID = await editor.addWidget( { widgetType: 'heading', container } );

		// Select button and set it's url to scroll to element
		await editor.selectElement( buttonID );
		await editor.setTextControlValue( 'url-external-show', `#${ scrollToID }` );

		// Set the element id to scroll to
		await editor.selectElement( elemWithID );
		await editor.openPanelTab( 'advanced' );
		await editor.setTextControlValue( '_element_id', scrollToID );

		// Set spacer height to be higher than viewport height
		await editor.selectElement( spacerID );
		await editor.setSliderControlValue( 'space', '1500' );

		const buttonElem = editor.getPreviewFrame().locator( `[data-id="${ buttonID }"] a.elementor-button-link` );
		await buttonElem.click();

		const scrollToElem = editor.getPreviewFrame().locator( `[data-id="${ elemWithID }"]` );

		// Assert.
		await expect( scrollToElem ).toBeInViewport( { timeout: 500 } );
	} );

	test( 'Scroll to element from heading with anchor tag container with link ', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const scrollToID = 'scroll_to_id';
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			container2 = await editor.addElement( { elType: 'container' }, 'document' ),
			spacerID = await editor.addWidget( { widgetType: 'spacer', container: container2 } ),
			elemWithID = await editor.addWidget( { widgetType: 'heading', container: container2 } );

		await editor.addWidget( { widgetType: 'heading', container } );

		// Select heading and set it's url to scroll to element
		await editor.selectElement( container );
		await editor.openSection( 'section_layout_additional_options' );
		await editor.setSelectControlValue( 'html_tag', 'a' );
		await editor.setTextControlValue( 'link', `#${ scrollToID }` );

		// Set the element id to scroll to
		await editor.selectElement( elemWithID );
		await editor.openPanelTab( 'advanced' );
		await editor.setTextControlValue( '_element_id', scrollToID );

		// Set spacer height to be higher than viewport height
		await editor.selectElement( spacerID );
		await editor.setSliderControlValue( 'space', '1500' );

		const containerElem = editor.getPreviewFrame().locator( `[data-id="${ container }"]` );
		await containerElem.click();

		const scrollToElem = editor.getPreviewFrame().locator( `[data-id="${ elemWithID }"]` );

		// Assert.
		await expect( scrollToElem ).toBeInViewport( { timeout: 500 } );
	} );
} );
