module.exports = class {
	constructor( page ) {
		this.page = page;
	}

	async add( widgetTitle ) {
		await this.openPanelElementContextMenu( widgetTitle );
		await this.page.click( `.elementor-context-menu >> :text("Add to Favorites")` );
	}

	async remove( widgetTitle ) {
		await this.openPanelElementContextMenu( widgetTitle );
		await this.page.click( `.elementor-context-menu >> :text("Remove from Favorites")` );
	}

	async openPanelElementContextMenu( widgetTitle ) {
		await this.page.click( `.elementor-element >> :text("${ widgetTitle }")`, { button: 'right' } );
		await this.page.waitForSelector( '.elementor-context-menu' );
	}
};
