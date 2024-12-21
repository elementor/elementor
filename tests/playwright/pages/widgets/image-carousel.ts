import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class ImageCarousel extends Content {
	/**
	 * Verify the image carousel images has captions.
	 *
	 * @param {string[]} expectedData - Expected captions.
	 * @param {number}   captionCount - Optional. Number of captions to verify. Default is 3.
	 *
	 * @return {Promise<void>}
	 */
	async verifyCaption( expectedData: string[], captionCount: number = 3 ): Promise<void> {
		for ( let i = 0; i < captionCount; i++ ) {
			await expect( this.editor.getPreviewFrame()
				.locator( EditorSelectors.imageCarousel.imgCaption ).nth( i ) ).toHaveText( expectedData[ i ] );
		}
	}

	/**
	 * Wait for the image carousel slides to load.
	 *
	 * @param {string} id        - Slide ID.
	 * @param {string} imageName - Image name.
	 *
	 * @return {Promise<void>}
	 */
	async waitForSlide( id: string, imageName: string ): Promise<void> {
		await this.page.locator( EditorSelectors.imageCarousel.activeSlide( id ) ).waitFor();
		await this.page.locator( EditorSelectors.imageCarousel.activeSlideImg( imageName ) ).waitFor();
	}
}
