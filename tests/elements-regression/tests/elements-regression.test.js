const { expect } = require( '@playwright/test' );
const test = require( '../src/test' );
const elementsConfig = require( '../elements-config.json' );
const userConfig = require( '../elements-regression.config' );
const ConfigMediator = require( '../src/config-mediator' );
const widgetHandlers = require( '../src/widgets' );
const controlHandlers = require( '../src/controls' );

const configMediator = ConfigMediator.create( { elementsConfig, userConfig } );

test.describe( 'Elements regression', () => {
	const testedElements = {};

	test.afterAll( async ( {}, testInfo ) => {
		// TODO: Need to find a better solution for now this is not working well.

		if ( 'on' === testInfo.project.use.validateAllPreviousCasesChecked ) {
			expect( JSON.stringify( testedElements, null, '\t' ) ).toMatchSnapshot( [ 'elements-regression.json' ] );
		}
	} );

	for ( const {
		widgetType,
		widgetConfig,
	} of configMediator.getWidgetForTests() ) {
		// Dynamic widget test creation.
		test( widgetType, async ( { editorPage } ) => {
			const widget = createWidgetHandler( editorPage, widgetType, widgetConfig );
			await widget.create();

			await editorPage.page.waitForTimeout( 500 );

			await test.step( `default values`, async () => {
				await assignValuesToControlDependencies( editorPage, widgetType, '*' );

				expect( await editorPage.screenshotWidget( widget ) )
					.toMatchSnapshot( [ widgetType, 'default.jpeg' ] );

				await widget.resetSettings();

				testedElements[ widgetType ] = {};
			} );

			for ( const {
				controlId,
				controlConfig,
				sectionConfig,
			} of configMediator.getControlsForTests( widgetType ) ) {
				// Dynamic control test step creation.
				const control = createControlHandler(
					editorPage.page,
					{ config: controlConfig, sectionConfig },
				);

				if ( ! control || ! control.canTestControl() ) {
					continue;
				}

				await test.step( controlId, async () => {
					const testedValues = [];

					await assignValuesToControlDependencies( editorPage, widgetType, controlId );

					await control.setup();

					await widget.beforeControlTest( { control, controlId } );

					const initialValue = control.hasConditions() || control.hasSectionConditions()
						? undefined
						: await control.getValue();

					for ( const value of await control.getTestValues( initialValue ) ) {
						const valueLabel = control.generateSnapshotLabel( value );

						await test.step( valueLabel, async () => {
							await control.setValue( value );

							expect( await editorPage.screenshotWidget( widget ) )
								.toMatchSnapshot( [ widgetType, controlId, `${ valueLabel }.jpeg` ] );

							testedValues.push( valueLabel );
						} );
					}

					testedElements[ widgetType ][ controlId ] = testedValues.join( ', ' );

					await widget.afterControlTest( { control, controlId } );

					await control.teardown();

					await widget.resetSettings();
				} );
			}
		} );
	}
} );

/**
 * @param {import('@playwright/test').Page} page
 * @param {Object}                          options
 * @param {Object}                          options.config
 * @param {Object}                          options.sectionConfig
 * @return {null|import('../src/controls/control-base').ControlBase}
 */
function createControlHandler( page, { config, sectionConfig } ) {
	const ControlClass = controlHandlers[ config.type ];

	if ( ! ControlClass ) {
		return null;
	}

	return new ControlClass( page, { config, sectionConfig } );
}

/**
 * @param {import('../src/page').EditorPage} editorPage
 * @param {string}                           type
 * @param {Object}                           config
 * @return {import('../src/widgets/widget').Widget}
 */
function createWidgetHandler( editorPage, type, config ) {
	const WidgetClass = widgetHandlers[ type ] || widgetHandlers.widget;

	return new WidgetClass( editorPage, { widgetType: type, ...config } );
}

async function assignValuesToControlDependencies( editorPage, widgetType, controlId ) {
	const controlDependencies = configMediator.getControlDependecies( widgetType, controlId );

	for ( const {
		controlConfig,
		sectionConfig,
		value,
	} of controlDependencies ) {
		const control = createControlHandler(
			editorPage.page,
			{ config: controlConfig, sectionConfig },
		);

		await control.setup();
		await control.setValue( value );
		await control.teardown();
	}
}
