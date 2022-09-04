const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const EditorPage = require( '../pages/editor-page' );
const widgetsCache = require( '../assets/widgets-cache' );
const controlsTestConfig = require( '../assets/controls-test-config' );

const {
	Heading,
	WidgetBase,
} = require( '../utils/widgets' );

const {
	Choose,
	Select,
	Textarea,
} = require( '../utils/controls' );

const { Registrar } = require( '../utils/registrar' );

const widgetsRegistrar = new Registrar()
	.register( Heading )
	.register( WidgetBase );

const controlsRegistrar = new Registrar()
	.register( Choose )
	.register( Select )
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
					controlsTestConfig: controlsTestConfig[ widgetType ] || {},
				},
			);

			// Act.
			await widget.create();

			await editorPage.page.waitForTimeout( 500 );

			const element = await widget.getElement();

			// Assert - Match snapshot for default appearance.
			expect( await element.screenshot( {
				type: 'jpeg',
				quality: 70,
			} ) ).toMatchSnapshot( [ widgetType, 'default.jpeg' ] );

			await widget.test( async ( controlId, currentControlValue ) => {
				// Assert - Match snapshot for specific control.
				expect( await element.screenshot( {
					type: 'jpeg',
					quality: 70,
				} ) ).toMatchSnapshot( [ widgetType, controlId, `${ currentControlValue }.jpeg` ] );
			} );
		} );
	}
} );
