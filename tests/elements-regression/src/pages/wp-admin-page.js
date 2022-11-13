const BasePage = require( './base-page.js' );

module.exports = class WpAdminPage extends BasePage {
	async login( { username, password } ) {
		await this.page.goto( `/wp-admin` );

		await this.page.waitForSelector( 'text=Log In' );
		await this.page.fill( 'input[name="log"]', username );
		await this.page.fill( 'input[name="pwd"]', password );
		await this.page.click( '#wp-submit' );
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	async getWpRESTNonce() {
		await this.page.goto( '/wp-admin' );

		return await this.page.evaluate( () => window.wpApiSettings.nonce );
	}

	/**
	 * @return {Promise<number>}
	 */
	async createElementorPage() {
		await this.page.goto( '/wp-admin' );

		const button = await this.page.locator( 'text="Create New Page"' );
		await button.click();

		await this.page.waitForSelector( '#elementor-panel-header-title' );

		return await this.page.evaluate( () => window.ElementorConfig.document.id );
	}

	/**
	 * @param {number} pageId
	 * @return {Promise<void>}
	 */
	async moveElementorPageToTrash( pageId ) {
		await this.page.goto( '/wp-admin/edit.php?post_type=page' );

		await this.page
			.locator( `[aria-label="“Elementor #${ pageId }” (Edit)"]` )
			.hover();

		await this.page
			.locator( `[aria-label="Move “Elementor #${ pageId }” to the Trash"]` )
			.click();

		await this.page.waitForSelector(
			`[aria-label="“Elementor #${ pageId }” (Edit)"]`,
			{ state: 'detached' },
		);
	}

	/**
	 * @param {number} pageId
	 * @return {Promise<void>}
	 */
	async deletePermenantlyElementorPageFromTrash( pageId ) {
		await this.page.goto( '/wp-admin/edit.php?post_status=trash&post_type=page' );

		await this.page
			.locator( `strong:has-text("Elementor #${ pageId }")` )
			.hover();

		await this.page
			.locator( `[aria-label="Delete “Elementor #${ pageId }” permanently"]` )
			.click();

		await this.page.waitForSelector(
			`[aria-label="Delete “Elementor #${ pageId }” permanently"]`,
			{ state: 'detached' },
		);
	}
};
