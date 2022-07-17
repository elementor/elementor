class WidgetBase {
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
	 * @type {import('../../pages/editor-page')}
	 */
	editor = null;

	/**
	 * Widget's config.
	 *
	 * @protected
	 * @type {Object}
	 */
	config = null;

	/**
	 * Controls registrar that handles all of the available controls handlers.
	 *
	 * @protected
	 * @type {import('../registrar').Registrar}
	 */
	controlsRegistrar = null;

	constructor( editor, controlsRegistrar, config ) {
		this.editor = editor;
		this.config = config;
		this.controlsRegistrar = controlsRegistrar;
	}

	/**
	 * Retreive the widget's handler type.
	 *
	 * @return {string}
	 */
	static getType() {
		return 'default';
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
	 * @return {Promise<import('@playwright/test').Locator>}
	 */
	async getElement() {
		if ( ! this.id ) {
			await this.create();
		}

		return await this.editor.getPreviewFrame().locator( `.elementor-element-${ this.id }` );
	}

	/**
	 * Get the wideget's controls.
	 *
	 * @return {Object}
	 */
	getControls() {
		return this.config.controls;
	}

	/**
	 * Test's setup.
	 *
	 * @protected
	 *
	 * @return {Promise<*>}
	 */
	async setup() {
		// TODO: Override.
	}

	/**
	 * Test's teardown.
	 *
	 * @protected
	 *
	 * @return {Promise<*>}
	 */
	async teardown() {
		await this.editor.page.evaluate( () => $e.run( 'document/elements/empty', { force: true } ) );
	}

	/**
	 * Iterate over all of the widget's controls and run assertions.
	 *
	 * @param {Function} assertionsCallback
	 *
	 * @return {void}
	 */
	async test( assertionsCallback ) {
		await this.setup();

		for ( const [ controlId, controlConfig ] of Object.entries( this.getControls() ) ) {
			const ControlClass = this.controlsRegistrar.get( controlConfig.type );

			// TODO: Remove after all of the controls will have handlers.
			if ( ! ControlClass ) {
				continue;
			}

			// TODO: Remove after there is support for conditional controls.
			const controlSection = this.getControls()[ controlConfig.section ];

			if (
				controlConfig.condition ||
				controlConfig.conditions ||
				controlSection.conditions ||
				controlSection.conditions
			) {
				continue;
			}

			const control = new ControlClass( this.editor.page, controlConfig );

			await this.testControl( control, controlId, assertionsCallback );
		}

		await this.teardown();
	}

	/**
	 * Test a specific control.
	 * Can be overriden in sub-classes in order to arrange things (e.g. set background color when testing blend mode).
	 *
	 * @param {import('../controls').ControlBase} control
	 * @param {string}                            controlId
	 * @param {Function}                          assertionsCallback
	 *
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async testControl( control, controlId, assertionsCallback ) {
		// TODO: Find a way to make the setup & teardown protected and call a single test function.
		await control.setup();

		await control.test( async ( currentControlValue ) => {
			await assertionsCallback( controlId, currentControlValue );
		} );

		await control.teardown();
	}
}

module.exports = {
	WidgetBase,
};
