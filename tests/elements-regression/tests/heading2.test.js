const test = require( '../lib/test' );
const Config = require( '../lib/config' );
const WPAdminPage = require( '../lib/pages/wp-admin-page' );
const EditorPage = require( '../lib/pages/editor-page' );
const createWidget = require( '../lib/create-widget' );
const { expect } = require( '@playwright/test' );
const createControl = require( '../lib/create-control' );

const config = Config.create();
const pluginName = 'elementor';
const version = 'base';
const widgetName = 'heading';

test.beforeEach( async ( {}, testInfo ) => {
	// Hack: it will not test for specific platform like "windows" or "linux"
	testInfo.snapshotSuffix = '';
} );

test( `${ pluginName } - ${ version } > ${ widgetName }`, async ( { editorPage } ) => {
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
	).toMatchSnapshot( [ 'default.jpeg' ] );

	for ( const controlName of config.getControlsNames( pluginName, version, widgetName ) ) {
		const control = createControl( config, { pluginName, version, widgetName, controlName } );

		for ( const value of control.getTestValues() ) {
			await editorPage.setControlValue( control, value );

			await editorPage.page.waitForTimeout( 300 );

			// Assert - Match snapshot for current control and value.
			console.log( `         control: ${ controlName }, value: ${ value }` );
			expect(
				await element.screenshot( { type: 'jpeg', quality: 70 } ),
			).toMatchSnapshot( [ controlName, `${ value }.jpeg` ] );

			await editorPage.setControlValue( control, control.defaultValue );
		}
	}

	await editorPage.savePage();
} );
