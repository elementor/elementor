import Content from '../elementor-panel-tabs/content';

export default class GoogleMaps extends Content {
	/**
	 * Set Google Maps widget parameters
	 *
	 * @param {Object} args          - Google maps parameters.
	 * @param {string} args.location - The location to set.
	 * @param {string} args.zoom     - The zoom to set.
	 * @param {string} args.height   - The height to set.
	 *
	 * @return {Promise<string>}
	 */
	async setGoogleMapsParams( args : { location: string, zoom: string, height: string } ) {
		await this.editor.setTextControlValue( 'address', args.location );
		await this.editor.setSliderControlValue( 'zoom', args.zoom );
		await this.editor.setSliderControlValue( 'height', args.height );
		await this.editor.waitForIframeToLoaded( 'google_maps' );
	}

	/**
	 * Get the Google Maps widget src.
	 *
	 * @param {boolean} isPublished - Optional. Whether the page is published. Default is false.
	 *
	 * @return {Promise<string>}
	 */
	async getSrc( isPublished: boolean = false ): Promise<string> {
		const page = isPublished ? this.page : this.editor.getPreviewFrame();
		const src = await page.locator( 'iframe' ).getAttribute( 'src' );
		return src;
	}

	/**
	 * Get the Google Maps widget height.
	 *
	 * @param {boolean} isPublished - Optional. Whether the page is published. Default is false.
	 *
	 * @return {Promise<number>}
	 */
	async getHeight( isPublished: boolean = false ): Promise<number> {
		const page = isPublished ? this.page : this.editor.getPreviewFrame();
		const box = await page.locator( 'iframe' ).boundingBox();
		return box.height;
	}
}
