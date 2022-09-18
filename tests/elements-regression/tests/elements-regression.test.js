const { expect } = require( '@playwright/test' );
const test = require( '../lib/test' );
const elementsConfig = require( '../elements-config.json' );
const widgetHandlers = require( '../lib/widgets' );
const controlHandlers = require( '../lib/controls' );
const { Registrar } = require( '../lib/registrar' );
const { isWidgetIncluded, isWidgetExcluded } = require( '../lib/validation' );

const widgetsRegistrar = new Registrar().registerAll( Object.values( widgetHandlers ) );
const controlsRegistrar = new Registrar().registerAll( Object.values( controlHandlers ) );

test.describe( 'Elements regression', () => {
	const testedElements = {};

	test.afterAll( async () => {
		expect( JSON.stringify( testedElements ) ).toMatchSnapshot( [ 'elements-regression.json' ] );
	} );

	Object.entries( elementsConfig )
		.filter( ( [ widgetType, widgetConfig ] ) =>
			isWidgetIncluded( widgetType ) && ! isWidgetExcluded( widgetType ),
		)
		.forEach( ( [ widgetType, widgetConfig ] ) => {
			// Here dynamic tests are created.
			test( widgetType, async ( { editorPage } ) => {
				const WidgetClass = widgetsRegistrar.get( widgetType );

				/**
				 * @type {WidgetBase}
				 */
				const widget = new WidgetClass(
					editorPage,
					controlsRegistrar,
					{
						widgetType,
						controls: widgetConfig.controls,
					},
				);

				// Act.
				await widget.create();

				await editorPage.page.waitForTimeout( 500 );

				// Assert - Match snapshot for default appearance.
				expect( await editorPage.screenshotWidget( widget ) )
					.toMatchSnapshot( [ widgetType, 'default.jpeg' ] );

				testedElements[ widgetType ] = {};

				await widget.test( async ( controlId, currentControlValue ) => {
					// Assert - Match snapshot for specific control.
					expect( await editorPage.screenshotWidget( widget ) )
						.toMatchSnapshot( [ widgetType, controlId, `${ currentControlValue }.jpeg` ] );

					if ( ! testedElements[ widgetType ][ controlId ] ) {
						testedElements[ widgetType ][ controlId ] = [];
					}

					testedElements[ widgetType ][ controlId ].push( currentControlValue );
				} );
			} );
		} );
} );
