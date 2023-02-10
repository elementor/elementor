const { expect } = require( '@playwright/test' );
const test = require( '../src/test' );
const elementsConfig = require( '../elements-config.json' );
const testConfig = require( '../test.config' );
const ConfigProvider = require( '../src/config-provider' );
const controlHandlers = require( '../src/controls' );
const { summary } = require( '../src/utils' );

const configMediator = ConfigProvider.make( { elementsConfig, testConfig } );

test.describe( 'Elements regression', () => {
	const testedElements = {};

	test.afterAll( async ( {}, testInfo ) => {
		// eslint-disable-next-line no-console
		console.log( 'summaryData', summary( testedElements, elementsConfig ) );

		// TODO: Need to find a better solution for now this is not working well.

		if ( 'on' === testInfo.project.use.validateAllPreviousCasesChecked ) {
			expect( JSON.stringify( testedElements, null, '\t' ) ).toMatchSnapshot( [ 'elements-regression.json' ] );
		}
	} );

	for ( const { widgetType } of configMediator.getWidgetsTypes() ) {
		// Dynamic widget test creation.
		test( widgetType, async ( { editorPage } ) => {
			testedElements[ widgetType ] = {};

			const elementId = await editorPage.addWidget( widgetType );

			await editorPage.page.waitForTimeout( 500 );

			await test.step( `default values`, async () => {
				await assignValuesToControlDependencies( editorPage, widgetType, '*' );

				expect( await editorPage.screenshotElement( elementId ) )
					.toMatchSnapshot( [ widgetType, 'default.jpeg' ] );

				await editorPage.resetElementSettings( elementId );
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

					const initialValue = control.hasConditions() || control.hasSectionConditions()
						? undefined
						: await control.getValue();

					for ( const value of await control.getTestValues( initialValue ) ) {
						const valueLabel = control.generateSnapshotLabel( value );

						await test.step( valueLabel, async () => {
							testedValues.push( valueLabel );

							await control.setValue( value );

							expect( await editorPage.screenshotElement( elementId ) )
								.toMatchSnapshot( [ widgetType, controlId, `${ valueLabel }.jpeg` ] );
						} );
					}

					testedElements[ widgetType ][ controlId ] = testedValues.join( ', ' );

					await control.teardown();

					await editorPage.resetElementSettings( elementId );
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

async function assignValuesToControlDependencies( editorPage, widgetType, controlId ) {
	const controlDependencies = configMediator.getControlDependencies( widgetType, controlId );

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
