const BasePage = require( './base-page.js' );

module.exports = class FrontendPage extends BasePage {
	pageId = null;

	setPageId( pageId ) {
		this.pageId = pageId;
	}

	/**
	 * @return {Promise<void>}
	 */
	async ensureLoaded() {
		await this.page.waitForSelector( `.elementor-${ this.pageId }` );
	}

	async refresh() {
		await this.page.reload();
		await this.ensureLoaded();
	}

	async load() {
		await this.page.goto( `?page_id=${ this.pageId }` );
		await this.ensureLoaded();
	}

	async getElement( id ) {
		return this.page.locator( `.elementor-element-${ id }` );
	}

	async screenshotElement( id ) {
		await this.load();

		const pageRect = await this.page.locator( 'body' ).boundingBox();
		const elementRect = await ( await this.getElement( id ) ).boundingBox();

		return await this.page.screenshot( {
			type: 'jpeg',
			quality: 70,
			clip: {
				x: elementRect.x,
				y: elementRect.y,
				width: Math.min( elementRect.width, pageRect.width ) || 1,
				height: Math.min( elementRect.height, pageRect.height ) || 1,
			},
		} );
	}
};
