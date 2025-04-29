import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class VideoWidget extends Content {
	/**
	 * Set the video widget source.
	 *
	 * @param {boolean} isPublished - Whether the page is published.
	 *
	 * @return {Promise<string>}
	 */
	async getVideoSrc( isPublished: boolean ): Promise<string> {
		const page = ( true === isPublished )
			? this.page
			: this.editor.getPreviewFrame();
		const src = await page.locator( EditorSelectors.video.iframe ).getAttribute( 'src' );
		return src;
	}

	/**
	 * Verify that the video overlay image has expected value.
	 *
	 * @param {Object}  args             - Image arguments.
	 * @param {string}  args.imageTitle  - Image title.
	 * @param {boolean} args.isPublished - Whether the post/page is published.
	 *
	 * @return {Promise<void>}
	 */
	async verifyVideoOverlayImageSrc( args: { imageTitle: string, isPublished: boolean } ): Promise<void> {
		const imageLocator = ( args.isPublished )
			? this.page.locator( EditorSelectors.video.image )
			: await this.editor.getPreviewFrame().waitForSelector( EditorSelectors.video.image );
		const imageSrc = await imageLocator.getAttribute( 'style' );
		expect( imageSrc ).toContain( args.imageTitle );
	}

	/**
	 * Verify the video widget has lightbox set.
	 *
	 * @param {boolean} isPublished - Whether the page is published.
	 *
	 * @return {Promise<void>}
	 */
	async verifyVideoLightBox( isPublished: boolean ): Promise<void> {
		const page = true === isPublished ? this.page : this.editor.getPreviewFrame();
		await expect( page.locator( EditorSelectors.video.lightBoxSetting ) ).toBeVisible();
		await page.locator( EditorSelectors.video.image ).click( );
		await expect( page.locator( EditorSelectors.video.lightBoxDialog ) ).toBeVisible();

		if ( isPublished ) {
			await this.editor.assertCorrectVwWidthStylingOfElement( page.locator( EditorSelectors.video.videoWrapper ), 85 );
		}
	}

	/**
	 * Toggle the video widget controls.
	 *
	 * @param {string[]} controlSelectors - Control selectors.
	 *
	 * @return {Promise<void>}
	 */
	async toggleVideoControls( controlSelectors: string[] ): Promise<void> {
		for ( const i in controlSelectors ) {
			await this.editor.setSwitcherControlValue( controlSelectors[ i ], true );
		}
	}
}
