import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { getElementSelector } from '../../../assets/elements-utils';
import WpAdminPage from '../../../pages/wp-admin-page';
import widgets from '../../../enums/widgets';

test.describe( 'Container tests #1 @container', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { container: true, 'nested-elements': true } );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Background slideshow', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_background' );
		await editor.setChooseControlValue( 'background_background', 'eicon-slideshow' );
		await editor.addImagesToGalleryControl();
		await editor.addWidget( { widgetType: widgets.heading, container: containerId } );

		// Assert.
		await test.step( 'Verify background slideshow', async () => {
			await editor.togglePreviewMode();
			await expect.soft( editor.getPreviewFrame().locator( '.e-con' ).nth( 0 ) ).toHaveScreenshot( 'editor-container-background-slideshow.png' );
			await editor.togglePreviewMode();
			await editor.publishAndViewPage();
		} );

		await test.step( 'Verify background slideshow on the frontend', async () => {
			await expect.soft( page.locator( '.e-con' ) ).toHaveScreenshot( 'frontend-container-background-slideshow.png' );
		} );
	} );

	test( 'Sort items in a Container using DnD', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );
		const button = await editor.addWidget( { widgetType: widgets.button, container: containerId } );
		const heading = await editor.addWidget( { widgetType: widgets.heading, container: containerId } );
		const image = await editor.addWidget( { widgetType: widgets.image, container: containerId } );

		// Act - Move the button to be last.
		// Note: Apply the drag-and-drop method twice as a workaround for the failure that occurs after [ED-18996]
		await editor.previewFrame.dragAndDrop(
			getElementSelector( button ),
			getElementSelector( image ),
		);
		await editor.previewFrame.dragAndDrop(
			getElementSelector( button ),
			getElementSelector( image ),
		);
		const buttonEl = await editor.getElementHandle( button );
		const headingEl = await editor.getElementHandle( heading );
		const elBeforeButton = await buttonEl.evaluate( ( node ) => node.previousElementSibling );
		const elAfterHeading = await headingEl.evaluate( ( node ) => node.nextElementSibling );

		// Assert - Test that the image is between the heading & button.
		expect.soft( elBeforeButton ).toEqual( elAfterHeading );
	} );

	test( 'Test widgets display inside the container using various directions and content width', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		await editor.addWidget( { widgetType: widgets.accordion, container: containerId } );
		await editor.addWidget( { widgetType: widgets.divider, container: containerId } );
		await editor.addWidget( { widgetType: widgets.spacer, container: containerId } );
		await editor.openPanelTab( 'advanced' );
		await editor.openSection( '_section_background' );
		await editor.setChooseControlValue( '_background_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( '_background_color', '#A81830' );

		await editor.addWidget( { widgetType: widgets.toggle, container: containerId } );
		await editor.addWidget( { widgetType: widgets.video, container: containerId } );
		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert.
		await expect.soft( container ).toHaveScreenshot( 'container-row.png' );

		// Act.
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.setSelectControlValue( 'content_width', 'full' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert.
		await expect.soft( container ).toHaveScreenshot( 'container-row-full.png' );

		// Act.
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-down' );
		await editor.setChooseControlValue( 'flex_align_items', 'eicon-align-start-v' );
		await editor.setSliderControlValue( 'min_height', '1500' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert.
		await expect.soft( container ).toHaveScreenshot( 'container-column-full-start.png' );

		// Act.
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.setSelectControlValue( 'content_width', 'boxed' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert.
		await expect.soft( container ).toHaveScreenshot( 'container-column-boxed-start.png' );
	} );

	test( 'Test widgets inside the container using position absolute', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'absolute' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );

		await editor.addWidget( { widgetType: widgets.heading, container: containerId } );

		await editor.togglePreviewMode();

		// Assert.
		const pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );
		await expect.soft( pageView ).toHaveScreenshot( 'heading-boxed-absolute.png' );

		// Act.
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.openPanelTab( 'layout' );
		await editor.setSelectControlValue( 'content_width', 'full' );
		await editor.togglePreviewMode();

		// Assert.
		await expect.soft( pageView ).toHaveScreenshot( 'heading-full-absolute.png' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Test widgets inside the container using position fixed', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'fixed' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );

		await editor.addWidget( { widgetType: 'heading', container: containerId } );
		await editor.togglePreviewMode();

		// Assert.
		const pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );
		await expect.soft( pageView ).toHaveScreenshot( 'heading-boxed-fixed.png' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Container full width and position fixed', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.openPanelTab( 'layout' );
		await editor.setSelectControlValue( 'content_width', 'full' );
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'fixed' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );

		await editor.addWidget( { widgetType: 'heading', container: containerId } );
		await editor.togglePreviewMode();

		// Assert.
		const pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );
		await expect.soft( pageView ).toHaveScreenshot( 'heading-full-fixed.png' );
	} );

	test( 'Right click should add Full Width container', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addElement( { elType: 'container' }, 'document' );
		await editor.getPreviewFrame().locator( '.elementor-editor-element-edit' ).click( { button: 'right' } );

		// Assert.
		await expect.soft( page.locator( '.elementor-context-menu-list__item-newContainer' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-newContainer' ).click();
		await expect.soft( editor.getPreviewFrame().locator( '.e-con-full' ) ).toHaveCount( 1 );
	} );
} );
