module.exports = class ElementorSettingsPage {
	/**
	 * @param {import('playwright').Page} page
	 */
	page;

	constructor( page ) {
		this.page = page;
	}

	async goto() {
		return await this.page.goto( '/wp-admin/admin.php?page=elementor' );
	}

	async moveToTab( name ) {
		return await this.page.click( `text="${ name }"` );
	}

	async getSelectedValue( name ) {
		return await this.page.$eval( `select[name="${ name }"]`, ( select ) => select.value );
	}

	async setSelectedValue( name, value ) {
		return await this.page.selectOption( `select[name="${ name }"]`, value );
	}

	async save() {
		return await this.page.click( 'input[type="submit"]' );
	}
};
