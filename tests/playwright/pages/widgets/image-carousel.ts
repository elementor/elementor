import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class ImageCarousel extends Content {
	async verifyCaption( expectedData: string[], captionCount = 3 ) {
		for ( let i = 0; i < captionCount; i++ ) {
			await expect( this.editor.getPreviewFrame()
				.locator( EditorSelectors.imageCarousel.imgCaption ).nth( i ) ).toHaveText( expectedData[ i ] );
		}
	}

	async waitForSlide( id: string, imageName: string ) {
		await this.page.locator( EditorSelectors.imageCarousel.activeSlide( id ) ).waitFor();
		await this.page.locator( EditorSelectors.imageCarousel.activeSlideImg( imageName ) ).waitFor();
	}
}
