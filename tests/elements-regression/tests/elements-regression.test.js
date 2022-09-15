const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const EditorPage = require( '../pages/editor-page' );
const widgetsCache = require( '../assets/widgets-cache' );

const {
	Button,
	Heading,
	Divider,
	TextEditor,
	WidgetBase,
} = require( '../utils/widgets' );

const {
	Choose,
	Select,
	Textarea,
	Color,
	Slider,
} = require( '../utils/controls' );

const { Registrar } = require( '../utils/registrar' );

const widgetsRegistrar = new Registrar()
	.register( Button )
	.register( Heading )
	.register( Divider )
	.register( TextEditor )
	.register( WidgetBase );

const controlsRegistrar = new Registrar()
	.register( Choose )
	.register( Select )
	.register( Color )
	.register( Slider )
	.register( Textarea );

test.describe( 'Elements regression', () => {
	let editorPage,
		wpAdminPage,
		pageId;

	test.beforeEach( async ( { page }, testInfo ) => {
		// Arrange.
		wpAdminPage = new WpAdminPage( page, testInfo );
		pageId = await wpAdminPage.createElementorPage();

		editorPage = new EditorPage( wpAdminPage.page, testInfo );

		await editorPage.ensureLoaded();
		await editorPage.ensureNavigatorClosed();
		await editorPage.ensureNoticeBarClosed();
	} );

	test.afterEach( async () => {
		await wpAdminPage.moveElementorPageToTrash( pageId );
		await wpAdminPage.deletePermenantlyElementorPageFromTrash( pageId );
	} );

	for ( const widgetType of Object.keys( widgetsCache ) ) {
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
					controls: widgetsCache[ widgetType ].controls,
				},
			);

			// Act.
			await widget.create();

			await editorPage.page.waitForTimeout( 500 );

			// Assert - Match snapshot for default appearance.
			expect( await editorPage.screenshotWidget( widget ) )
				.toMatchSnapshot( [ widgetType, 'default.jpeg' ] );

			await widget.test( async ( controlId, currentControlValue ) => {
				// Assert - Match snapshot for specific control.
				expect( await editorPage.screenshotWidget( widget ) )
					.toMatchSnapshot( [ widgetType, controlId, `${ currentControlValue }.jpeg` ] );
			} );
		} );
	}
} );
