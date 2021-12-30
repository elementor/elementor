module.exports = class {
	constructor( page, editor ) {
		this.page = page;
		this.editor = editor;
	}

    async open() {
        await this.editor.previewFrame.click( '.elementor-add-section-button' );
        await this.editor.previewFrame.click( '.elementor-select-preset-list li:nth-child(2)' );
        await this.page.click( '#elementor-panel-footer-responsive' );
        await this.page.click( 'text=Advanced' );
        await this.page.click( 'text=Responsive' );
    }

    async getFirstColumn() {
        return await this.editor.previewFrame.locator( '.page-content [data-element_type="column"]:nth-child(1)' );
    }

    async toggle( device ) {
        await this.page.click( `.elementor-control.elementor-control-reverse_order_${ device } .elementor-control-content .elementor-control-field .elementor-control-input-wrapper .elementor-switch .elementor-switch-label` );
    }
};
