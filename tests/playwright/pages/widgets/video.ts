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

	/**
	 * Wait for the video src to be updated with expected parameters.
	 *
	 * @param {boolean} isPublished    - Whether the page is published.
	 * @param {Object}  expectedValues - Expected values for video src attribute.
	 * @param {string}  player         - Video player name.
	 * @param {number}  timeout        - Maximum time to wait in milliseconds. Default is 10000.
	 *
	 * @return {Promise<void>}
	 */
	async waitForVideoSrcParams( isPublished: boolean, expectedValues: Record<string, string | number>, player: string, timeout: number = 10000 ): Promise<void> {
		const page = ( true === isPublished )
			? this.page
			: this.editor.getPreviewFrame();
		const iframeLocator = page.locator( EditorSelectors.video.iframe );
		const startTime = Date.now();

		while ( Date.now() - startTime < timeout ) {
			const src = await iframeLocator.getAttribute( 'src' );
			if ( ! src || ! src.includes( '?' ) ) {
				await this.page.waitForTimeout( 100 );
				continue;
			}

			const videoOptions: Record<string, string | number> = this.parseSrc( src );
			if ( 'vimeo' === player && src.includes( '#' ) ) {
				videoOptions.start = src.split( '#' )[ 1 ];
			}

			let allParamsMatch = true;
			for ( const key in expectedValues ) {
				const expectedValue = String( expectedValues[ key ] );
				const actualValue = videoOptions[ key ];
				if ( actualValue !== expectedValue ) {
					allParamsMatch = false;
					break;
				}
			}

			if ( allParamsMatch ) {
				return;
			}

			await this.page.waitForTimeout( 100 );
		}

		const finalSrc = await iframeLocator.getAttribute( 'src' );
		if ( ! finalSrc || ! finalSrc.includes( '?' ) ) {
			throw new Error( `Video src does not contain query parameters: ${ finalSrc }` );
		}
		const finalVideoOptions: Record<string, string | number> = this.parseSrc( finalSrc );
		if ( 'vimeo' === player && finalSrc.includes( '#' ) ) {
			finalVideoOptions.start = finalSrc.split( '#' )[ 1 ];
		}
		for ( const key in expectedValues ) {
			expect( finalVideoOptions[ key ], { message: `Parameter is ${ key }` } ).toEqual( String( expectedValues[ key ] ) );
		}
	}
}
