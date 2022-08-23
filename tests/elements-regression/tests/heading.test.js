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

test.describe.serial.only( `${ pluginName } - ${ version } > ${ widgetName }`, () => {
	let widget;
	let widgetId;
	let pageId;
	let page;
	let editorPage;

	test.beforeAll( async ( { browser } ) => {
		const context = await browser.newContext();
		page = await context.newPage();

		const wpAdminPage = new WPAdminPage( page );

		pageId = await wpAdminPage.createElementorPage();
		widget = createWidget( config, { pluginName, version, widgetName } );

		editorPage = new EditorPage( wpAdminPage.page, pageId );
		await editorPage.ensureLoaded();
		await editorPage.ensureNavigatorClosed();
		widgetId = await editorPage.addWidget( widget );
	} );

	test.afterAll( async ( { browser } ) => {
		const wpAdminPage = new WPAdminPage( page );

		await wpAdminPage.moveElementorPageToTrash( pageId );
		await wpAdminPage.deletePermenantlyElementorPageFromTrash( pageId );

		await page.close();
	} );

	test.beforeEach( async ( {}, testInfo ) => {
		// Hack: it will not test for specific platform like "windows" or "linux"
		testInfo.snapshotSuffix = '';
	} );

	test( 'default', async () => {
		const element = await editorPage.getPreviewWidget( widget, widgetId );

		expect(
			await element.screenshot( { type: 'jpeg', quality: 70 } ),
		).toMatchSnapshot( [ 'default.jpeg' ] );

		await editorPage.savePage();
	} );

	for ( const controlName of config.getControlsNames( pluginName, version, widgetName ) ) {
		test( controlName, async ( { page } ) => {
			const element = await editorPage.getPreviewWidget( widget, widgetId );

			const control = createControl( config, { pluginName, version, widgetName, controlName } );

			for ( const value of control.getTestValues() ) {
				await editorPage.setControlValue( control, value );

				await editorPage.page.waitForTimeout( 300 );

				expect(
					await element.screenshot( { type: 'jpeg', quality: 70 } ),
				).toMatchSnapshot( [ controlName, `${ value }.jpeg` ] );

				await editorPage.setControlValue( control, control.defaultValue );
			}

			await editorPage.savePage();
		} );
	}
} );
