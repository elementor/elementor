const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const EditorPage = require( '../pages/editor-page' );
const elementsConfig = require( '../elements-config.json' );
const widgetHandlers = require( '../utils/widgets' );
const controlHandlers = require( '../utils/controls' );
const { Registrar } = require( '../utils/registrar' );
const { isWidgetIncluded, isWidgetExcluded } = require( '../utils/validation' );

const widgetsRegistrar = new Registrar().registerAll( Object.values( widgetHandlers ) );
const controlsRegistrar = new Registrar().registerAll( Object.values( controlHandlers ) );

test.describe( 'Elements regression', () => {
	let editorPage,
		wpAdminPage,
		pageId,
		testedElements = {};

	test.beforeEach( async ( { page }, testInfo ) => {
		// Arrange.
		wpAdminPage = new WpAdminPage( page );
		pageId = await wpAdminPage.createElementorPage();

		editorPage = new EditorPage( wpAdminPage.page );

		await editorPage.ensureLoaded();
		await editorPage.ensureNavigatorClosed();
		await editorPage.ensureNoticeBarClosed();
	} );

	test.afterEach( async () => {
		await wpAdminPage.moveElementorPageToTrash( pageId );
		await wpAdminPage.deletePermenantlyElementorPageFromTrash( pageId );
	} );

	test.afterAll( async () => {
		expect( JSON.stringify( testedElements ) ).toMatchSnapshot( [ 'elements-regression.json' ] );
	} );

	Object.entries( elementsConfig )
		.filter( ( [ widgetType, widgetConfig ] ) =>
			isWidgetIncluded( widgetType ) && ! isWidgetExcluded( widgetType ),
		)
		.forEach( ( [ widgetType, widgetConfig ] ) => {
			// Here dynamic tests are created.
			test( widgetType, async () => {
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
