class Widget {
	/**
	 * Widget's id.
	 *
	 * @protected
	 * @type {string}
	 */
	id = null;

	/**
	 * Editor instance from test context.
	 *
	 * @protected
	 * @type {import('../pages/editor-page')}
	 */
	editor = null;

	/**
	 * Widget's config.
	 *
	 * @protected
	 * @type {{
	 * 	widgetType: string,
	 * 	controls: Object<string, Object>,
	 * }}
	 */
	config = null;

	constructor( editor, config ) {
		this.editor = editor;
		this.config = config;
	}

	/**
	 * Create a widget instance.
	 *
	 * @return {Promise<string>}
	 */
	async create() {
		this.id = await this.editor.addWidget( this.config.widgetType );

		return this.id;
	}

	/**
	 * Get the widget's locator in the page.
	 *
	 * @return {import('@playwright/test').Locator}
	 */
	async getElement() {
		if ( ! this.id ) {
			await this.create();
		}

		return this.editor.getPreviewFrame().locator( `.elementor-element-${ this.id }` );
	}

	async afterControlTest( { control, controlId } ) { // eslint-disable-line no-unused-vars
		// Run before testing the control
	}

	async beforeControlTest( { control, controlId } ) { // eslint-disable-line no-unused-vars
		// Run after testing the control
	}

	/**
	 * @return {Promise<void>}
	 */
	async resetSettings() {
		await this.editor.page.evaluate( ( { id } ) => {
			$e.run( 'document/elements/reset-settings', {
				container: window.elementor.getContainer( id ),
				options: {
					external: true,
				},
			} );
		}, { id: this.id } );
	}

	async waitAfterSettingValue( control ) {
		if ( control && control.isForcingServerRender() ) {
			await this.waitForServerRendered();
		}

		await this.editor.page.waitForTimeout( 300 );
	}

	/**
	 * @return {Promise<void>}
	 */
	async waitForServerRendered() {
		await this.editor.getPreviewFrame().waitForSelector( `.elementor-element-${ this.id }.elementor-loading` );
		await this.editor.getPreviewFrame().waitForSelector( `.elementor-element-${ this.id }.elementor-loading`, { state: 'detached' } );
	}
}

module.exports = { Widget };
