import { expect, type Page } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import ImageCarousel from '../../../../pages/widgets/image-carousel';
import { selectDropdownContainer, clickTab } from '../helper';

export async function testCarouselIsVisibleWhenUsingDirectionRightOrLeft( page: Page, editor: EditorPage, imageCarousel: ImageCarousel ) {
	// Act.
	const contentContainerId = await selectDropdownContainer( editor, '0' ),
		activeContentContainer = editor.getPreviewFrame().locator( '.e-n-tabs-content > .e-con.e-active' ),
		carouselId = await editor.addWidget( 'image-carousel', contentContainerId );
	// Add images.
	await imageCarousel.addImageGallery();
	await imageCarousel.setAutoplay();

	// Set direction right.
	await clickTab( editor.getPreviewFrame(), '0' );
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
	await clickTab( editor.getPreviewFrame(), '0' );
	await page.locator( '.elementor-control-tabs_direction .eicon-h-align-right' ).click();
}

module.exports = {
	testCarouselIsVisibleWhenUsingDirectionRightOrLeft,
};
