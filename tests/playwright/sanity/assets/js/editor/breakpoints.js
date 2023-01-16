module.exports = class {
	constructor( page ) {
		this.page = page;
		// TODO: throw exception if experiment Breakpoints is deactivated.
	}

	static getAll() {
		return [ 'mobile', 'mobile_extra', 'tablet', 'tablet_extra', 'laptop', 'desktop', 'widescreen' ];
	}

	static getBasic() {
		return [ 'mobile', 'tablet', 'desktop' ];
	}

	async addAllBreakpoints() {
		await this.page.click( '#elementor-panel-header-menu-button i' );
		await this.page.click( '.elementor-panel-menu-item.elementor-panel-menu-item-global-settings' );
		await this.page.click( '.elementor-panel-menu-item.elementor-panel-menu-item-settings-layout' );
		await this.page.click( '.elementor-control-section_breakpoints' );
		await this.page.waitForSelector( 'text=Active Breakpoints' );

		const devices = [ 'Mobile Extra', 'Tablet Extra', 'Laptop', 'Widescreen' ];

		for ( const device of devices ) {
			if ( await this.page.$( '.select2-selection__e-plus-button' ) ) {
				await this.page.click( '.select2-selection__e-plus-button' );
				await this.page.click( `li:has-text("${ device }")` );
			}
		}

		await this.page.click( 'text=Update' );
		await this.page.waitForSelector( '#elementor-toast' );
		await this.page.reload();

		if ( await this.page.$( '#elementor-panel-header-kit-close' ) ) {
			await this.page.locator( '#elementor-panel-header-kit-close' ).click();
		}

		await this.page.waitForSelector( '#elementor-editor-wrapper' );
	}
};
