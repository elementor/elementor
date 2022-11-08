const { expect } = require( '@playwright/test' );
const test = require( '../src/test' );
const elementsConfig = require( '../elements-config.json' );
const testConfig = require( '../test.config' );
const ConfigProvider = require( '../src/config-provider' );
const controlHandlers = require( '../src/controls' );

const configMediator = ConfigProvider.make( { elementsConfig, testConfig } );

test.describe( 'Elements regression', () => {
	const testedElements = {};

	test.afterAll( async ( {}, testInfo ) => {
		// TODO: Need to find a better solution for now this is not working well.

		if ( 'on' === testInfo.project.use.validateAllPreviousCasesChecked ) {
			expect( JSON.stringify( testedElements, null, '\t' ) ).toMatchSnapshot( [ 'elements-regression.json' ] );
		}
	} );

	for ( const { widgetType } of configMediator.getWidgetsTypes() ) {
		// Dynamic widget test creation.
		test( widgetType, async ( { editorPage, frontendPage } ) => {
			const elementId = await editorPage.addWidget( widgetType );

			await editorPage.page.waitForTimeout( 500 );

			await test.step( `default values`, async () => {
				await assignValuesToControlDependencies( editorPage, widgetType, '*' );

				expect(
					await editorPage.screenshotElement( elementId ),
				).toMatchSnapshot( [ widgetType, 'default(editor).jpeg' ] );

				await editorPage.publish();

				//
				// expect(
				// 	await frontendPage.screenshotElement( elementId ),
				// ).toMatchSnapshot( [ widgetType, 'default.jpeg' ] );

				await editorPage.resetElementSettings( elementId );

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

					for ( const value of await getTestValues( control ) ) {
						const valueLabel = control.generateSnapshotLabel( value );

						await test.step( valueLabel, async () => {
							await control.setup();

							await control.setValue( value );

							expect(
								await editorPage.screenshotElement( elementId ),
							).toMatchSnapshot( [ widgetType, controlId, `${ valueLabel }(editor).jpeg` ] );

							await editorPage.publish();

							//
							// expect(
							// 	await frontendPage.screenshotElement( elementId ),
							// ).toMatchSnapshot( [ widgetType, controlId, `${ valueLabel }.jpeg` ] );

							testedValues.push( valueLabel );

							await control.teardown();
						} );
					}

					testedElements[ widgetType ][ controlId ] = testedValues.join( ', ' );

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

async function getTestValues( control ) {
	await control.setup();

	const initialValue = control.hasConditions() || control.hasSectionConditions()
		? undefined
		: await control.getValue();

	const testValues = await control.getTestValues( initialValue );

	await control.teardown();

	return testValues;
}
