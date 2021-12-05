const { Notifications } = require( '../../../assets/assets/dev/js/editor/notifications' );

exports.Widgets = class Widgets {
	constructor( page ) {
		this.page = page;
	}

	async add( widgetTitle ) {
		const contextMenuElement = '.elementor-context-menu',
			openPanelElementContextMenu = async () => {
				await this.page.click( `.elementor-element >> :text("${ widgetTitle }")`, { button: 'right' } );
				await this.page.waitForSelector( '.elementor-context-menu' );
			};
		await openPanelElementContextMenu();
		await this.page.click( `${ contextMenuElement } >> :text("Add to Favorites")` );

		// Validate that an indication toast appears
		const notifications = new Notifications( this.page );
		await notifications.waitForToast( 'Added' );

		// Cleanup
		await openPanelElementContextMenu();
		await this.page.click( `${ contextMenuElement } >> :text("Remove from Favorites")` );
	}
};
