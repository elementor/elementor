const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../pages/wp-admin-page' );
import EditorSelectors from '../../../../../../../selectors/editor-selectors';

test.describe( `$e.run( 'editor/elements/views/widget' )`, () => {
	test( 'Check if the empty placeholder is displayed inside the Image Carousel', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'image-carousel' );
		const frame = editor.getPreviewFrame();
		await frame.waitForLoadState();
		await frame.waitForSelector( EditorSelectors.emptyWidgetIcon );

		const emptyViewPlaceholderCount = await frame.locator( EditorSelectors.emptyWidgetIcon ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Sidebar widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'sidebar' );
		const frame = editor.getPreviewFrame();
		await frame.waitForLoadState();
		await frame.waitForSelector( EditorSelectors.emptyWidgetIcon );

		const emptyViewPlaceholderCount = await frame.
			locator( `${ EditorSelectors.widgets.sideBar } ${ EditorSelectors.emptyWidgetIcon }` ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Image Box widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'image-box' );
		const frame = editor.getPreviewFrame();
		await frame.waitForLoadState();
		await page.hover( '.elementor-control-image .elementor-control-media__content' );
		await page.hover( '.elementor-control-media-area' );
		await page.click( '.elementor-control-media__remove' );
		await page.locator( '.elementor-control-title_text input' ).fill( '' );
		await page.locator( '.elementor-control-description_text textarea' ).fill( '' );
		await frame.waitForSelector( EditorSelectors.emptyWidgetIcon );

		const emptyViewPlaceholderCount = await frame.
			locator( `.elementor-widget-image-box > ${ EditorSelectors.emptyWidgetIcon }.eicon-image-box` ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Basic Gallery widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'image-gallery' );
		const frame = editor.getPreviewFrame();
		await frame.waitForLoadState();
		await frame.waitForSelector( EditorSelectors.emptyWidgetIcon );

		const emptyViewPlaceholderCount = await frame.
			locator( `${ EditorSelectors.imageGalleryWidget } ${ EditorSelectors.emptyWidgetIcon }` ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Video widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'video' );
		const frame = editor.getPreviewFrame();
		await frame.waitForLoadState();
		await page.selectOption( '.elementor-control-video_type >> select', 'hosted' );
		await frame.waitForSelector( EditorSelectors.emptyWidgetIcon );

		const emptyViewPlaceholderCount = await frame.
			locator( `${ EditorSelectors.widgets.video } ${ EditorSelectors.emptyWidgetIcon }` ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Google Maps widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'google_maps' );
		const frame = editor.getPreviewFrame();
		await frame.waitForLoadState();
		await page.locator( '.elementor-control-address input' ).fill( '' );
		await editor.page.waitForLoadState( 'domcontentloaded' );
		await frame.waitForSelector( EditorSelectors.emptyWidgetIcon );

		const emptyViewPlaceholderCount = await frame.
			locator( `${ EditorSelectors.widgets.googleMaps } ${ EditorSelectors.emptyWidgetIcon }` ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );
} );
