import { expect, type Frame } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import widgets from '../../../enums/widgets';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import VideoWidget from '../../../pages/widgets/video';
import videos from '../../../testData/video.json';

test.describe( 'Video tests inside a container @video', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { container: true } );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Verify that there is no gap between the video widget and the container', async ( { browser, apiRequests }, testInfo ) => {
		// Arrange.
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const videoId = await editor.addWidget( { widgetType: widgets.video, container: containerId } );
		await editor.selectElement( containerId );
		await editor.openPanelTab( 'advanced' );
		await editor.setDimensionsValue( 'padding', '0' );

		// Assert - verify that the container has an equal height to the video iFrame.
		const container = editor.getPreviewFrame().locator( `.elementor-element-${ containerId }` );
		const containerHeight = await container.boundingBox();
		const videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox();
		expect( containerHeight.height ).toEqual( videoIframeHeight.height );
	} );

	for ( const video in videos ) {
		test( `${ video } controls and link test`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const videoWidget = new VideoWidget( page, testInfo );
			const player = videos[ video ];
			const startTime = '10';
			const endTime = '20';
			await wpAdmin.openNewPage();
			await editor.closeNavigatorIfOpen();

			// Act.
			await editor.addWidget( { widgetType: widgets.video } );
			await editor.setSelectControlValue( 'video_type', video );
			await editor.setNumberControlValue( 'start', startTime );
			if ( 'youtube' === video ) {
				await editor.setNumberControlValue( 'end', endTime );
				await editor.setSelectControlValue( 'rel', 'yes' );
			}
			await videoWidget.toggleVideoControls( player.controls );
			await editor.setTextControlValue( `${ video }_url`, player.link );

			// Assert 1 - in the Editor.
			let src = await videoWidget.getVideoSrc( false );
			videoWidget.verifySrcParams( src, player.expected, video );

			// Assert 2 - in the Frontend.
			await editor.publishAndViewPage();
			src = await videoWidget.getVideoSrc( true );
			videoWidget.verifySrcParams( src, player.expected, video );
		} );
	}

	test( 'Add overlay image to the video', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		const videoWidget = new VideoWidget( page, testInfo );
		const imageTitle = 'About-Pic-3-1';
		await wpAdmin.openNewPage();

		// Act 1.
		await editor.addWidget( { widgetType: widgets.video } );
		await editor.openSection( 'section_image_overlay' );
		await editor.setSwitcherControlValue( 'show_image_overlay', true );
		await editor.setMediaControlImageValue( 'image_overlay', `${ imageTitle }.png` );
		const frame: Frame = editor.getPreviewFrame();
		await frame.locator( EditorSelectors.video.widget ).click();
		await editor.setSelectControlValue( 'image_overlay_size', 'thumbnail' );

		// Assert 1 - in the Editor.
		await videoWidget.verifyVideoOverlayImageSrc( { imageTitle, isPublished: false } );

		// Assert 2 - in the Frontend.
		await editor.publishAndViewPage();
		await editor.waitForPanelToLoad();
		await videoWidget.verifyVideoOverlayImageSrc( { imageTitle, isPublished: true } );
	} );

	test( 'Lightbox video test', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		const videoWidget = new VideoWidget( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		// Act.
		await editor.addWidget( { widgetType: widgets.video } );
		await editor.openSection( 'section_image_overlay' );
		await editor.setSwitcherControlValue( 'show_image_overlay', true );
		await editor.setMediaControlImageValue( 'image_overlay', 'About-Pic-3-1.png' );
		await editor.setSwitcherControlValue( 'lightbox', true );

		// Assert 1 - in the Editor.
		await videoWidget.verifyVideoLightBox( false );

		// Assert 2 - in the Frontend.
		await editor.publishAndViewPage();
		await videoWidget.verifyVideoLightBox( true );
	} );
} );

test.describe( 'Video tests inside a section @video', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { container: false } );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Verify that there is no gap between the video widget and the section', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.openNewPage();

		// Act.
		const sectionId = await editor.addElement( { elType: 'section' }, 'document' );
		const column = editor.getPreviewFrame().locator( '.elementor-element-' + sectionId + ' .elementor-column' );
		const columnId = await column.getAttribute( 'data-id' );
		const videoId = await editor.addWidget( { widgetType: widgets.video, container: columnId } );
		await editor.selectElement( columnId );
		await editor.openPanelTab( 'advanced' );
		await editor.setDimensionsValue( 'padding', '0' );

		// Assert - verify that the column has an equal height to the video iFrame.
		const columnHeight = await column.boundingBox();
		const videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox();
		expect( columnHeight.height ).toEqual( videoIframeHeight.height );
	} );
} );
