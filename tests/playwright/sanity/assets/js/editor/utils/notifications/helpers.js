module.exports = class {
	constructor( page ) {
		this.page = page;
	}

	async waitForToast( text ) {
		await this.page.waitForSelector( `#elementor-toast >> :text("${ text }")`, { timeout: 4000 } );
	}
};
