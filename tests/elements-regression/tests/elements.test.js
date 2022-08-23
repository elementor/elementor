const { expect } = require( '@playwright/test' );
const test = require( '../lib/test' );
const Config = require( '../lib/config' );
const widgets = require( '../lib/widgets/index' );
const controls = require( '../lib/controls/index' );
const createWidget = require( '../lib/create-widget' );
const createControl = require( '../lib/create-control' );

const config = Config.create();

config.getPluginsNames().forEach( ( pluginName ) => {
	config.getWidgetsConfigVersionsNames( pluginName ).forEach( ( version ) => {
		test.describe( `${ pluginName } - ${ version }`, () => {
			test.beforeEach( async ( {}, testInfo ) => {
				// Hack: it will not test for specific platform like "windows" or "linux"
				testInfo.snapshotSuffix = '';
			} );

			config.getWidgetsNames( pluginName, version ).forEach( ( widgetName ) => {
				test( widgetName, async ( { editorPage }, testInfo ) => {
					await editorPage.ensureNavigatorClosed();

					const widget = createWidget( config, { pluginName, version, widgetName } );

					const elementId = await editorPage.addWidget( widget );

					const element = await editorPage.getPreviewFrame().locator(
						widget.getPreviewSelector( elementId ),
					);

					// Assert - Match snapshot for default appearance.
					console.log( `         default` );
					expect(
						await element.screenshot( { type: 'jpeg', quality: 70 } ),
					).toMatchSnapshot( [ widget.type, 'default.jpeg' ] );

					for ( const controlName of config.getControlsNames( pluginName, version, widgetName ) ) {
						const control = createControl( config, { pluginName, version, widgetName, controlName } );

						for ( const value of control.getTestValues() ) {
							await editorPage.setControlValue( control, value );

							await editorPage.page.waitForTimeout( 300 );

							// Assert - Match snapshot for current control and value.
							console.log( `         control: ${ controlName }, value: ${ value }` );
							expect(
								await element.screenshot( { type: 'jpeg', quality: 70 } ),
							).toMatchSnapshot( [ widget.type, `${ controlName }(${ value }).jpeg` ] );

							await editorPage.setControlValue( control, control.defaultValue );
						}
					}

					await editorPage.savePage();
				} );
			} );
		} );
	} );
} );
