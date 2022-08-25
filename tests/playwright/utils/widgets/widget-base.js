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
	 * @type {{
	 * 	widgetType: string,
	 * 	controls: Object<string, Object>,
	 * 	controlsTestConfig: import('../../assets/types/controls-test-config').ControlConfig,
	 * }}
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
	 * Exclude specific controls
	 *
	 * @return {string[]}
	 */
	getExcludedControls() {
		return [];
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

			const isPopover = ( !! controlConfig.popover && 1 === Object.keys( controlConfig.condition ).length );
			const isWidgetConditional = ! isPopover && ( controlConfig.condition || controlConfig.conditions );
			const isSectionConditional = ( controlSection.condition || controlSection.conditions );
			const isControlExcluded = this.getExcludedControls().includes( controlConfig.name );

			if ( isWidgetConditional || isSectionConditional || isControlExcluded ) {
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
		await control.setup();

		await this.beforeControlTest( { control, controlId } );

		await control.test( async ( currentControlValue ) => {
			// TODO: Find a better way to show debug information.
			//  We must have this info because Playwright doesn't give any useful errors.
			// eslint-disable-next-line no-console
			console.log( { widget: this.config.widgetType, control: controlId, value: currentControlValue } );

			await this.beforeControlAssertions( { control, controlId, currentControlValue } );

			await assertionsCallback( controlId, currentControlValue );

			await this.afterControlAssertions( { control, controlId, currentControlValue } );
		} );

		await this.afterControlTest( { control, controlId } );

		await control.teardown();
	}

	/**
	 * @param {Object}                                         args
	 * @param {import('../controls/control-base').ControlBase} args.control
	 * @param {string}                                         args.controlId
	 *
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async beforeControlTest( { control, controlId } ) { // eslint-disable-line no-unused-vars
		const { timeoutBeforeTest = 0 } = this.config.controlsTestConfig[ controlId ] || {};

		if ( timeoutBeforeTest ) {
			await this.editor.page.waitForTimeout( timeoutBeforeTest );
		}
	}

	/**
	 * @param {Object}                                         args
	 * @param {import('../controls/control-base').ControlBase} args.control
	 * @param {string}                                         args.controlId
	 *
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async afterControlTest( { control, controlId } ) { // eslint-disable-line no-unused-vars
		const { timeoutAfterTest = 0 } = this.config.controlsTestConfig[ controlId ] || {};

		if ( timeoutAfterTest ) {
			await this.editor.page.waitForTimeout( timeoutAfterTest );
		}
	}

	/**
	 * @param {Object}                                         args
	 * @param {import('../controls/control-base').ControlBase} args.control
	 * @param {string}                                         args.controlId
	 * @param {any}                                            args.currentControlValue
	 *
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async beforeControlAssertions( { control, controlId, currentControlValue } ) { // eslint-disable-line no-unused-vars
		const { timeoutBeforeAssertions = 0 } = this.config.controlsTestConfig[ controlId ] || {};

		if ( timeoutBeforeAssertions ) {
			await this.editor.page.waitForTimeout( timeoutBeforeAssertions );
		}
	}

	/**
	 * @param {Object}                                         args
	 * @param {import('../controls/control-base').ControlBase} args.control
	 * @param {string}                                         args.controlId
	 * @param {any}                                            args.currentControlValue
	 *
	 * @protected
	 *
	 * @return {Promise<void>}
	 */
	async afterControlAssertions( { control, controlId, currentControlValue } ) { // eslint-disable-line no-unused-vars
		const { timeoutAfterAssertions = 0 } = this.config.controlsTestConfig[ controlId ] || {};

		if ( timeoutAfterAssertions ) {
			await this.editor.page.waitForTimeout( timeoutAfterAssertions );
		}
	}
}

module.exports = {
	WidgetBase,
};
