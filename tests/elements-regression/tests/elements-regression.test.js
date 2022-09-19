const { expect } = require( '@playwright/test' );
const test = require( '../lib/test' );
const elementsConfig = require( '../elements-config.json' );
const widgetHandlers = require( '../lib/widgets' );
const controlHandlers = require( '../lib/controls' );
const {
	isWidgetIncluded,
	isWidgetExcluded,
	isControlIncluded,
	isControlExcluded,
} = require( '../lib/validation' );

test.describe( 'Elements regression', () => {
	const testedElements = {};

	test.afterAll( async () => {
		// TODO: If the user use "grep" it will always fail.
		expect( JSON.stringify( testedElements ) ).toMatchSnapshot( [ 'elements-regression.json' ] );
	} );

	for ( const [ widgetType, widgetConfig ] of getWidgetForTests() ) {
		// Here dynamic tests are created.
		test( widgetType, async ( { editorPage } ) => {
			const widget = createWidgetHandler( editorPage, widgetType, widgetConfig );
			await widget.create();

			await editorPage.page.waitForTimeout( 500 );

			await test.step( `default values`, async () => {
				expect( await editorPage.screenshotWidget( widget ) )
					.toMatchSnapshot( [ widgetType, 'default.jpeg' ] );

				testedElements[ widgetType ] = {};
			} );

			for ( const [ controlId, controlConfig ] of getControlsForTests( widget.config ) ) {
				const control = createControlHandler(
					editorPage.page,
					{
						config: controlConfig,
						sectionConfig: widget.config.controls[ controlConfig.section ],
					},
				);

				if ( ! control || ! control.canTestControl() ) {
					continue;
				}

				await test.step( controlId, async () => {
					testedElements[ widgetType ][ controlId ] = [];

					await control.setup();

					await widget.beforeControlTest( { control, controlId } );

					const initialValue = control.hasConditions() || control.hasSectionConditions()
						? undefined
						: await control.getValue();

					for ( const value of await control.getTestValues( initialValue ) ) {
						const valueLabel = control.generateSnapshotLabel( value );

						await test.step( valueLabel, async () => {
							await control.setValue( value );

							await widget.waitAfterSettingValue( control );

							expect( await editorPage.screenshotWidget( widget ) )
								.toMatchSnapshot( [ widgetType, controlId, `${ valueLabel }.jpeg` ] );

							testedElements[ widgetType ][ controlId ].push( valueLabel );
						} );
					}

					await widget.afterControlTest( { control, controlId } );

					await control.teardown();

					await widget.resetSettings();

					await widget.waitAfterSettingValue( control );
				} );
			}
		} );
	}
} );

/**
 * @return {[string, Object][]}
 */
function getWidgetForTests() {
	return Object.entries( elementsConfig ).filter(
		( [ widgetType ] ) => isWidgetIncluded( widgetType ) && ! isWidgetExcluded( widgetType ),
	);
}

/**
 * @param {Object} widgetConfig
 * @return {[string, Object][]}
 */
function getControlsForTests( widgetConfig ) {
	return Object.entries( widgetConfig.controls )
		.filter( ( [ controlType ] ) =>
			isControlIncluded( widgetConfig.widgetType, controlType ) &&
			! isControlExcluded( widgetConfig.widgetType, controlType ),
		);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {any}                             config
 * @param {any}                             sectionConfig
 *
 * @return {null|import('../lib/controls/control-base').ControlBase}
 */
function createControlHandler( page, { config, sectionConfig } ) {
	const ControlClass = controlHandlers[ config.type ];

	if ( ! ControlClass ) {
		return null;
	}

	return new ControlClass( page, { config, sectionConfig } );
}

/**
 * @param {import('../lib/page').EditorPage} editorPage
 * @param {string}                           type
 * @param {Object}                           config
 * @return {import('../lib/widgets/widget').Widget}
 */
function createWidgetHandler( editorPage, type, config ) {
	const WidgetClass = widgetHandlers[ type ] || widgetHandlers.widget;

	return new WidgetClass( editorPage, { widgetType: type, ...config } );
}
