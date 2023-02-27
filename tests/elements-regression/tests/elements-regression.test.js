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
		test( widgetType, async ( { editorPage, page } ) => {
			testedElements[ widgetType ] = {};

			const defaultElementId = await editorPage.addWidget( widgetType );

			await editorPage.page.waitForTimeout( 500 );

			await assignValuesToControlDependencies( editorPage, widgetType, '*' );

			await editorPage.waitForElementRender( defaultElementId );
			await expect( editorPage.getPreviewElement( defaultElementId ) ).toHaveScreenshot( [ widgetType, 'default.png' ] );

			await editorPage.resetElementSettings( defaultElementId );

			const widgets = {};
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

				await test.step( `Setup: controlId - ${ controlId }`, async () => {
					console.log( `controlId: ${ controlId }` );
					// const testedValues = [];

					const initialValue = control.hasConditions() || control.hasSectionConditions()
						? undefined
						: await control.getValue();

					const values = {};
					const setupPromises = [];
					for ( const value of await control.getTestValues( initialValue ) ) {
						console.log( `setup controlId: ${ controlId }, value: ${ value }` );
						const setupPromise = async ( widgetType1 ) => {
							const elementId = await editorPage.addWidget( widgetType1 );
							await editorPage.page.waitForTimeout( 500 );
							await editorPage.waitForElementRender( elementId );
							const valueLabel = control.generateSnapshotLabel( value );
							widgets[ elementId ] = [ widgetType, controlId, `${ valueLabel }.png` ];
							values[ elementId ] = value;
						};
						setupPromises.push( setupPromise( widgetType ) );
					}
					await Promise.all( setupPromises );

					for ( const widgetId in values ) {
						const value = values[ widgetId ];
						console.log( `values controlId: ${ controlId }, value: ${ value }` );
						await editorPage.getPreviewElement( widgetId ).click();
						await assignValuesToControlDependencies( editorPage, widgetType, controlId );

						await control.setup();
						await control.setValue( value );
					}

					// await editorPage.resetElementSettings( defaultElementId );
					await control.teardown();
				} );
			}
			/////
			await test.step( `Snapshot`, async () => {
			await editorPage.getPreviewFrame().locator( 'footer' ).click(); // Deselect elements

			const expectations = [];
			for ( const widgetId in widgets ) {
				// console.log( `snapshot controlId: ${ controlId }, widgetId ${ widgetId }: ${ widgets[ widgetId ].join( '-' ) }` );
				console.log( `snapshot widgetId ${ widgetId }: ${ widgets[ widgetId ].join( '-' ) }` );
				const theTest = async ( theWidgetId ) => {
					await page.locator( '#elementor-panel-header' ).hover();
					const locator = editorPage.getPreviewElement( theWidgetId );
					console.log( `theTest - ${ theWidgetId } - ${ widgets[ theWidgetId ] } - ${ locator }` );
					// await expect( async () => {
						try {
							await expect( locator ).toHaveScreenshot( widgets[ theWidgetId ] );
						} catch ( e ) {
							console.log( 'error', e );
						}
					// } ).toPass( {
					// 	intervals: [ 1_000, 2_000, 6_000 ],
					// 	timeout: 10000,
					// } );
				};
				expectations.push( theTest( widgetId ) );
				// await theTest( widgetId );
			}
			await Promise.all( expectations );
			} );

			await test.step( `Publish`, async () => {
			await editorPage.page.locator( 'button#elementor-panel-saver-button-publish' ).click();
			await editorPage.page.waitForLoadState();
			await Promise.all( [
				editorPage.page.waitForResponse( '/wp-admin/admin-ajax.php' ),
				editorPage.page.locator( '#elementor-panel-header-menu-button i' ).click(),
				editorPage.page.waitForLoadState( 'networkidle' ),
				editorPage.page.waitForSelector( '#elementor-panel-footer-saver-publish .elementor-button.elementor-button-success.elementor-disabled' ),
			] );

			await editorPage.page.locator( '.elementor-panel-menu-item-view-page > a' ).click();
			await editorPage.page.waitForLoadState( 'networkidle' );
			} );

			await test.step( `Snapshot (Frontend)`, async () => {
			const previewExpectations = [];
			for ( const widgetId in widgets ) {
				// console.log( `preview snapshot controlId: ${ controlId }, widgetId ${ widgetId }: ${ widgets[ widgetId ].join( '-' ) }` );
				console.log( `preview snapshot widgetId ${ widgetId }: ${ widgets[ widgetId ].join( '-' ) }` );
				previewExpectations.push( expect( page.locator( `.elementor-element-${ widgetId }` ) ).toHaveScreenshot( [ 'preview' ].concat( widgets[ widgetId ] ) ) );
			}
			await Promise.all( previewExpectations );
			} );
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
