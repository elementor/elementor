const EditorPage = require( '../pages/editor-page' );
module.exports = class {
	constructor( page, testInfo ) {
		this.page = page;
		this.editor = new EditorPage( this.page, testInfo );
		// TODO: throw exception if experiment Breakpoints is deactivated.
	}

	static getAll() {
		return [ 'mobile', 'mobile_extra', 'tablet', 'tablet_extra', 'laptop', 'desktop', 'widescreen' ];
	}

	static getBasic() {
		return [ 'mobile', 'tablet', 'desktop' ];
	}

	async addAllBreakpoints( experimentPostId ) {
		await this.page.locator( '#elementor-panel-footer-responsive i' ).click();
		await this.page.locator( '#elementor-panel-header-menu-button i' ).click();
		await this.page.locator( '.elementor-panel-menu-item-global-settings' ).click();
		await this.page.locator( '.elementor-panel-menu-item-settings-layout' ).click();
		await this.page.locator( '#elementor-kit-panel-content-controls [data-collapse_id="section_breakpoints"]' ).click();
		await this.page.waitForSelector( 'text=Active Breakpoints' );

		const devices = [ 'Mobile Landscape', 'Tablet Landscape', 'Laptop', 'Widescreen' ];

		for ( const device of devices ) {
			if ( await this.page.$( '.select2-selection__e-plus-button' ) ) {
				await this.page.click( '.select2-selection__e-plus-button' );
				await this.page.click( `li:has-text("${ device }")` );
			}
		}

		await this.page.click( 'text=Update' );
		await this.page.waitForSelector( '#elementor-toast' );
		await this.page.reload( { timeout: 20000 } );
		await this.editor.closeSiteSettingsPanel();
		return devices;
	}
};
