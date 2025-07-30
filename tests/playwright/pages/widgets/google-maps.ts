import Content from '../elementor-panel-tabs/content';

export default class GoogleMaps extends Content {
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
