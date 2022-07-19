const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const widgetsCache = require( '../assets/widgets-cache' );
const controlsTestConfig = require( '../assets/controls-test-config' );

const {
	Heading,
	WidgetBase,
} = require( '../utils/widgets' );

const {
	Choose,
	Select,
	Textarea,
} = require( '../utils/controls' );

const { Registrar } = require( '../utils/registrar' );

test( 'All widgets sanity test @regression', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	const navigatorCloseButton = await page.$( '#elementor-navigator__close' );

	if ( navigatorCloseButton ) {
		await navigatorCloseButton.click();
	}

	const widgetsRegistrar = new Registrar()
		.register( Heading )
		.register( WidgetBase );

	const controlsRegistrar = new Registrar()
		.register( Choose )
		.register( Select )
		.register( Textarea );

	for ( const widgetType of Object.keys( widgetsCache ) ) {
		const WidgetClass = widgetsRegistrar.get( widgetType );

		/**
		 * @type {WidgetBase}
		 */
		const widget = new WidgetClass(
			editor,
			controlsRegistrar,
			{
				widgetType,
				controls: widgetsCache[ widgetType ].controls,
				controlsTestConfig: controlsTestConfig[ widgetType ] || {},
			},
		);

		// Act.
		await widget.create();

		await page.waitForTimeout( 500 );

		const element = await widget.getElement();

		// Assert - Match snapshot for default appearance.
		expect( await element.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( `${ widgetType }--default.jpeg` );

		await widget.test( async ( controlId, currentControlValue ) => {
			// Skip default values.
			if ( [ '', 'default' ].includes( currentControlValue ) ) {
				return;
			}

			// Assert - Match snapshot for specific control.
			expect( await element.screenshot( {
				type: 'jpeg',
				quality: 70,
			} ) ).toMatchSnapshot( `${ widgetType }--${ controlId }--${ currentControlValue }.jpeg` );
		} );
	}
} );
