const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const { ControlBase } = require( '../utils/controls/control-base' );
const { ControlsManager } = require( '../utils/controls/controls-manager' );
const { Choose } = require( '../utils/controls/choose' );
const { Select } = require( '../utils/controls/select' );
const { Textarea } = require( '../utils/controls/textarea' );
const widgetsCache = require( './widgets-cache' );

test( 'All widgets sanity test', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	const navigatorCloseButton = await page.$( '#elementor-navigator__close' );

	if ( navigatorCloseButton ) {
		await navigatorCloseButton.click();
	}

	const controlsManager = new ControlsManager();
	controlsManager.register( Textarea );
	controlsManager.register( Select );
	controlsManager.register( Choose );

	for ( const widgetType of Object.keys( widgetsCache ) ) {
		const { controls } = widgetsCache[ widgetType ];

		// TODO: Set section background color for blend mode.
		const widgetId = await editor.addWidget( widgetType ),
			element = await editor.getPreviewFrame().locator( `.elementor-element-${ widgetId }` );

		// Match snapshot for default appearance.
		expect( await element.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( `${ widgetType }--default.jpeg` );

		for ( const [ controlId, controlData ] of Object.entries( controls ) ) {
			const ControlClass = controlsManager.get( controlData.type );

			// TODO: Remove after all of the controls will have classes.
			if ( ! ControlClass ) {
				continue;
			}

			/**
			 * @type {ControlBase}
			 */
			const control = new ControlClass( page, controlData );
			await control.switchToView();

			// Act & Assert.
			await control.test( async ( currentControlValue ) => {
				expect( await element.screenshot( {
					type: 'jpeg',
					quality: 70,
				} ) ).toMatchSnapshot( `${ widgetType }--${ controlId }--${ currentControlValue }.jpeg` );
			} );
		}

		await editor.page.evaluate( () => $e.run( 'document/elements/empty', { force: true } ) );
	}
} );
