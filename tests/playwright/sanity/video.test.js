const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );
const widgets = require( '../enums/widgets.js' );
const EditorPage = require( '../pages/editor-page' );
import Content from '../pages/elementor-panel-tabs/content';
import EditorSelectors from '../selectors/editor-selectors';
import VideoWidget from '../pages/widgets/video';

test.describe( 'Video tests inside a container', () => {
	// Test.beforeAll( async ( { browser }, testInfo ) => {
	// 	const context = await browser.newContext(),
	// 		page = await context.newPage(),
	// 		wpAdmin = new WpAdminPage( page, testInfo );

	// 	await wpAdmin.setExperiments( {
	// 		container: true,
	// 	} );
	// } );

	// test.afterAll( async ( { browser }, testInfo ) => {
	// 	const context = await browser.newContext(),
	// 		page = await context.newPage(),
	// 		wpAdmin = new WpAdminPage( page, testInfo );

	// 	await wpAdmin.setExperiments( {
	// 		container: false,
	// 	} );
	// } );

	test( 'Verify that there is no gap between the video widget and the container', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
			videoId = await editor.addWidget( widgets.video, containerId );

		// Act.
		// Set container padding to 0.
		await editor.selectElement( containerId );
		await editor.activatePanelTab( 'advanced' );
		await page.locator( '.elementor-control-padding .elementor-control-dimension input' ).first().fill( '0' );

		const container = await editor.getPreviewFrame().locator( `.elementor-element-${ containerId }` ),
			containerHeight = await container.boundingBox().height,
			videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox().height;

		// Assert.
		// Verify that the container has an equal height to the video iFrame.
		expect( containerHeight ).toEqual( videoIframeHeight );
	} );

	test( 'Video link test', async ( { page }, testInfo ) => {
		const link = 'https://youtu.be/6KNISw9RPTc';
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		const videoWidget = new VideoWidget( page, testInfo );
		const startTime = '10';
		const endTime = '20';

		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.addWidget( 'video' );
		await videoWidget.setStartTime( startTime );
		await videoWidget.setEndTime( endTime );
		await videoWidget.toggleControl( EditorSelectors.video.autoplayInp );
		await videoWidget.toggleControl( EditorSelectors.video.playOnMobileInp );
		await videoWidget.toggleControl( EditorSelectors.video.muteInp );
		await videoWidget.toggleControl( EditorSelectors.video.loopInp );
		await videoWidget.toggleControl( EditorSelectors.video.modestbrandingInp );
		await videoWidget.toggleControl( EditorSelectors.video.privacyInp );
		await videoWidget.toggleControl( EditorSelectors.video.lazyLoadInp );
		await videoWidget.selectSuggestedVideos( 'Any Video' );
		await videoWidget.setLink( link, { linkInpSelector: EditorSelectors.video.youtubeLinkInp } );

		const src = await editor.getPreviewFrame().locator( 'iframe.elementor-video' ).getAttribute( 'src' );

		const videoOptions = await videoWidget.parseSrc( src );

		expect( videoOptions.autoplay ).toEqual( 'true' );
		expect( videoOptions.controls ).toEqual( 'true' );
		expect( videoOptions.start ).toEqual( startTime );
		expect( videoOptions.end ).toEqual( endTime );
		expect( videoOptions.modestbranding ).toEqual( 'true' );
		expect( videoOptions.playsinline ).toEqual( 'true' );
	} );
} );

test.describe( 'Video tests inside a section', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test( 'Verify that there is no gap between the video widget and the section', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost(),
			sectionId = await editor.addElement( { elType: 'section' }, 'document' ),
			column = await editor.getPreviewFrame().locator( '.elementor-element-' + sectionId + ' .elementor-column' ),
			columnId = await column.getAttribute( 'data-id' ),
			videoId = await editor.addWidget( widgets.video, columnId );

		// Act.
		// Set section padding to 0.
		await editor.selectElement( columnId );
		await editor.activatePanelTab( 'advanced' );
		await page.locator( '.elementor-control-padding .elementor-control-dimension input' ).first().fill( '0' );

		const columnHeight = await column.boundingBox().height,
			videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox().height;

		// Assert.
		// Verify that the container has an equal height to the video iFrame.
		expect( columnHeight ).toEqual( videoIframeHeight );
	} );
} );
