module.exports = class {
	constructor( page, editor ) {
		this.page = page;
		this.editor = editor;
        // TODO: throw exception if experiment Breakpoints is deactivated.
	}

    static getAll() {
        return [ 'mobile', 'mobile_extra', 'tablet', 'tablet_extra', 'laptop', 'desktop', 'widescreen' ];
    }

    static getBasic() {
        return [ 'mobile', 'tablet', 'desktop' ];
    }

    async addAllBreakpoints() {
        await this.page.click( '#elementor-panel-footer-responsive' );
        await this.page.click( '#e-responsive-bar__settings-button' );
        await this.page.waitForSelector( 'text=Breakpoints' );

        const devices = [ 'Mobile Extra', 'Tablet Extra', 'Laptop', 'Widescreen' ];

        for ( const device of devices ) {
            if ( await this.page.$( '.select2-selection__e-plus-button' ) ) {
                await this.page.click( '.select2-selection__e-plus-button' );
                await this.page.click( `li:has-text("${ device }")` );
            }
        }

        await this.page.click( 'text=Update' );
        await this.editor.reload();
        await this.page.waitForTimeout( 6000 );
    }
};
