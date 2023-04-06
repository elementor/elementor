export default class WpAdminPage {
	page;

	constructor( page ) {
		this.page = page;
	}

	async login( { username, password } ) {
		await this.page.goto( `/wp-admin` );

		await this.page.waitForSelector( 'text=Log In' );
		await this.page.fill( 'input[name="log"]', username );
		await this.page.fill( 'input[name="pwd"]', password );
		await this.page.click( '#wp-submit' );
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	async openElementorSettings( tab ) {
		await this.page.goto( `/wp-admin/admin.php?page=elementor#${ tab }` );
		await this.page.locator( '#elementor-settings-tab-general' ).waitFor();
	}

	async setExperiments( experiments = {} ) {
		await this.openElementorSettings( 'tab-experiments' );

		const prefix = 'e-experiment';

		for ( const [ id, state ] of Object.entries( experiments ) ) {
			const selector = `#${ prefix }-${ id }`;

			await this.page.selectOption( selector, String( state ) );

			// Confirm any experiment dependency modal that displays as a result of the chosen experiments.
			await this.confirmExperimentModalIfOpen();
		}

		await this.page.click( '#submit' );
	}

	async confirmExperimentModalIfOpen() {
		const dialogButton = this.page.locator( '.dialog-type-confirm .dialog-confirm-ok' );

		if ( await dialogButton.isVisible() ) {
			await dialogButton.click();

			// Clicking the confirm button - "Activate" or "Deactivate" - will immediately save the existing experiments,
			// so we need to wait for the page to save and reload before we continue on to set any more experiments.
			await this.page.waitForLoadState( 'load' );
		}
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

		await this.page.waitForSelector( '#elementor-panel-header-title', { timeout: 20000 } );

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
}
