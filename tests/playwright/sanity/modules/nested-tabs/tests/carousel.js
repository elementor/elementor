const { expect } = require( '@playwright/test' );
const { selectDropdownContainer, clickTab } = require( '../helper' );

async function testCarouselIsVisibleWhenUsingDirectionRightOrLeft( page, editor, widgetId ) {
	// Act.
	const contentContainerId = await selectDropdownContainer( editor, widgetId, 0 ),
		activeContentContainer = await editor.getPreviewFrame().locator( '.e-n-tabs-content > .e-con.e-active' ),
		carouselId = await editor.addWidget( 'image-carousel', contentContainerId );
	// Add images.
	await editor.populateImageCarousel();
	// Set direction right.
	await clickTab( editor.getPreviewFrame(), 0 );
	await page.locator( '.elementor-control-tabs_direction .eicon-h-align-right' ).click();
	await editor.togglePreviewMode();

	// Assert
	expect( await activeContentContainer.screenshot( {
		type: 'jpeg',
		quality: 100,
	} ) ).toMatchSnapshot( 'tabs-direction-right-carousel-visible.jpeg' );

	// Restore original view.
	await editor.togglePreviewMode();
	await editor.removeElement( carouselId );
	await clickTab( editor.getPreviewFrame(), 0 );
	await page.locator( '.elementor-control-tabs_direction .eicon-h-align-right' ).click();
}

module.exports = {
	testCarouselIsVisibleWhenUsingDirectionRightOrLeft,
};
