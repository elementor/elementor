import { expect, test } from '@playwright/test';
import elementsConfig from '../elements-config.json';
import testConfig from '../test.config';
import configProvider from '../src/config-provider';
import controlHandlers from '../src/controls';
import { summary } from '../src/utils';
import WpAdminPage from '../src/pages/wp-admin-page';
import EditorPage from '../src/pages/editor-page';

const configMediator = configProvider.make( { elementsConfig, testConfig } );

test.describe( 'Elements regression', ( ) => {
	const testedElements = {};

	test.afterAll( async ( {}, testInfo ) => {
		// eslint-disable-next-line no-console
		console.log( 'summaryData', summary( testedElements, elementsConfig ) );

		// TODO: Need to find a better solution for now this is not working well.

		// if ( 'on' === testInfo.project.use.validateAllPreviousCasesChecked ) {
		// 	expect( JSON.stringify( testedElements, null, '\t' ) ).toMatchSnapshot( [ 'elements-regression.json' ] );
		// }
	} );

	for ( const { widgetType } of configMediator.getWidgetsTypes() ) {
		// Dynamic widget test creation.
		test( widgetType, async ( { page } ) => {
			const wpAdminPage = new WpAdminPage( page );
			const editorPage = new EditorPage( page );
			testedElements[ widgetType ] = {};

			await editorPage.setupElementorPage( wpAdminPage );

			const elementId = await editorPage.addWidget( widgetType );

			await editorPage.page.waitForTimeout( 500 );

			await test.step( `default values`, async () => {
				await assignValuesToControlDependencies( editorPage, widgetType, '*' );

				await editorPage.waitForElementRender( elementId );
				await expect( editorPage.getPreviewElement( elementId ) ).toHaveScreenshot( [ widgetType, 'default.png' ] );

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

							await editorPage.waitForElementRender( elementId );
							await expect( editorPage.getPreviewElement( elementId ) ).toHaveScreenshot( [ widgetType, controlId, `${ valueLabel }.png` ] );
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
