const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const widgetsCache = require( './widgets-cache' );

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

test( 'All widgets sanity test', async ( { page }, testInfo ) => {
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
			},
		);

		// Act.
		await widget.create();

		const element = await widget.getElement();

		// Assert - Match snapshot for default appearance.
		expect( await element.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( `${ widgetType }--default.jpeg` );

		await widget.test( async ( controlId, currentControlValue ) => {
			// Assert - Match snapshot for specific control.
			expect( await element.screenshot( {
				type: 'jpeg',
				quality: 70,
			} ) ).toMatchSnapshot( `${ widgetType }--${ controlId }--${ currentControlValue }.jpeg` );
		} );
	}
} );
