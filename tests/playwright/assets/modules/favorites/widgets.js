const { Notifications } = require( '../../../assets/assets/dev/js/editor/notifications' );

exports.Widgets = class Widgets {
	constructor( page ) {
		this.page = page;
	}

	async add( widgetTitle ) {
		const openPanelElementContextMenu = async () => {
			await this.page.click( `.elementor-element >> :text("${ widgetTitle }")`, { button: 'right' } );
			await this.page.waitForSelector( '.elementor-context-menu' );
		};
		await openPanelElementContextMenu();

		if ( await this.page.$( ':text("Remove from Favorites")' ) ) {
			await this.page.click( ':text("Remove from Favorites")' );
			await openPanelElementContextMenu();
		}

		this.page.click( ':text("Add to Favorites")' );

		// Validate that an indication toast appears
		const notifications = new Notifications( this.page );
		await notifications.waitForToast( 'Added' );
	}
};
