import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import widgets from '../enums/widgets';
import EditorPage from '../pages/editor-page';
import EditorSelectors from '../selectors/editor-selectors';
import VideoWidget from '../pages/widgets/video';
import videos from '../testData/video.json';

test.describe( 'Video tests inside a container @video', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: true,
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

	test( 'Verify Video Promotions', async ( { browser }, testInfo ) => {
		// Arrange.
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const videoId = await editor.addWidget( widgets.video, containerId );
		const promoArea = page.locator( '.elementor-nerd-box--upsale' );

		// Act.
		await editor.selectElement( videoId );
		await promoArea.scrollIntoViewIfNeeded();

		// Assert
		expect.soft( await promoArea.screenshot( {
			type: 'png',
		} ) ).toMatchSnapshot( 'video-widget-sidebar-promotion.png' );
	} );

	test( 'Verify that there is no gap between the video widget and the container', async ( { browser }, testInfo ) => {
		// Arrange.
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const videoId = await editor.addWidget( widgets.video, containerId );

		// Act.
		await editor.selectElement( containerId );
		await editor.openPanelTab( 'advanced' );
		await editor.setDimensionsValue( 'padding', '0' );

		const container = editor.getPreviewFrame().locator( `.elementor-element-${ containerId }` );
		const containerHeight = await container.boundingBox();
		const videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox();

		// Assert.
		// Verify that the container has an equal height to the video iFrame.
		expect( containerHeight.height ).toEqual( videoIframeHeight.height );
	} );

	for ( const video in videos ) {
		test( `${ video } controls and link test`, async ( { page }, testInfo ) => {
			const player = videos[ video ];
			const wpAdmin = new WpAdminPage( page, testInfo );
			const editor = new EditorPage( page, testInfo );
			const videoWidget = new VideoWidget( page, testInfo );
			const startTime = '10';
			const endTime = '20';

			await wpAdmin.openNewPage();
			await editor.closeNavigatorIfOpen();
			await editor.addWidget( 'video' );
			await videoWidget.selectVideoSource( video );

			await videoWidget.setTime( 'Start', startTime );
			if ( 'youtube' === video ) {
				await videoWidget.setTime( 'End', endTime );
				await videoWidget.selectSuggestedVideos( 'Any Video' );
			}

			const controls = player.controls.map( ( control ) => {
				return EditorSelectors.video[ control ];
			} );

			await videoWidget.toggleControls( controls );
			await videoWidget.setLink( player.link, { linkInpSelector: EditorSelectors.video[ video ].linkInp } );
			let src = await videoWidget.getVideoSrc( false );
			videoWidget.verifySrcParams( src, player.expected, video );
			await editor.publishAndViewPage();
			src = await videoWidget.getVideoSrc( true );
			videoWidget.verifySrcParams( src, player.expected, video );
		} );
	}

	test( 'Choose image test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		const videoWidget = new VideoWidget( page, testInfo );
		const imageTitle = 'About-Pic-3-1';

		await wpAdmin.openNewPage();
		await editor.addWidget( 'video' );
		await editor.openSection( 'section_image_overlay' );
		await videoWidget.toggleControls( [ EditorSelectors.video.showImageOverlay ] );
		await videoWidget.chooseImage( `${ imageTitle }.png` );
		await editor.waitForPanelToLoad();
		await videoWidget.selectImageSize(
			{
				widget: EditorSelectors.video.widget,
				select: EditorSelectors.video.imageSizeSelect,
				imageSize: 'thumbnail',
			} );
		await videoWidget.verifyImageSrc( {
			selector: EditorSelectors.video.image,
			imageTitle,
			isPublished: false,
			isVideo: true } );
		await editor.publishAndViewPage();
		await editor.waitForPanelToLoad();
		await videoWidget.verifyImageSrc( {
			selector: EditorSelectors.video.image,
			imageTitle,
			isPublished: true,
			isVideo: true } );
	} );

	test( 'Lightbox video test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		const videoWidget = new VideoWidget( page, testInfo );

		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.addWidget( 'video' );
		await editor.openSection( 'section_image_overlay' );
		await videoWidget.toggleControls( [ EditorSelectors.video.showImageOverlay ] );
		await videoWidget.chooseImage( 'About-Pic-3-1.png' );
		await videoWidget.toggleControls( [ EditorSelectors.video.lightBoxControlInp ] );
		await videoWidget.verifyVideoLightBox( false );
		await editor.publishAndViewPage();
		await videoWidget.verifyVideoLightBox( true );
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
			editor = await wpAdmin.openNewPage(),
			sectionId = await editor.addElement( { elType: 'section' }, 'document' ),
			column = editor.getPreviewFrame().locator( '.elementor-element-' + sectionId + ' .elementor-column' ),
			columnId = await column.getAttribute( 'data-id' ),
			videoId = await editor.addWidget( widgets.video, columnId );

		// Act.
		await editor.selectElement( columnId );
		await editor.openPanelTab( 'advanced' );
		await editor.setDimensionsValue( 'padding', '0' );

		const columnHeight = await column.boundingBox(),
			videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox();

		// Assert.
		// Verify that the container has an equal height to the video iFrame.
		expect( columnHeight.height ).toEqual( videoIframeHeight.height );
	} );
} );
