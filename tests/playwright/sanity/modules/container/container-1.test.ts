import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { getElementSelector } from '../../../assets/elements-utils';
import WpAdminPage from '../../../pages/wp-admin-page';
import widgets from '../../../enums/widgets';

test.describe( 'Container tests @container', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: true,
			e_nested_atomic_repeaters: true,
			'nested-elements': true,
		} );
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
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( 'heading', containerId );
		await editor.selectElement( containerId );

		await editor.closeNavigatorIfOpen();
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_background' );
		await editor.setChooseControlValue( 'background_background', 'eicon-slideshow' );
		await editor.addImagesToGalleryControl();

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
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Set row direction.
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		// Add widgets.
		const button = await editor.addWidget( widgets.button, container ),
			heading = await editor.addWidget( widgets.heading, container ),
			image = await editor.addWidget( widgets.image, container );

		// Act.
		// Move the button to be last.
		await editor.previewFrame.dragAndDrop(
			getElementSelector( button ),
			getElementSelector( image ),
		);

		const buttonEl = await editor.getElementHandle( button ),
			headingEl = await editor.getElementHandle( heading );

		const elBeforeButton = await buttonEl.evaluate( ( node ) => node.previousElementSibling ),
			elAfterHeading = await headingEl.evaluate( ( node ) => node.nextElementSibling );

		// Assert.
		// Test that the image is between the heading & button.
		expect.soft( elBeforeButton ).toEqual( elAfterHeading );
	} );

	test( 'Test widgets display inside the container using various directions and content width', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		await editor.addWidget( widgets.accordion, containerId );
		await editor.addWidget( widgets.divider, containerId );
		const spacer = await editor.addWidget( widgets.spacer, containerId );
		await editor.addWidget( widgets.toggle, containerId );
		await editor.addWidget( widgets.video, containerId );

		await editor.selectElement( spacer );
		await editor.openPanelTab( 'advanced' );
		await editor.openSection( '_section_background' );
		await editor.setChooseControlValue( '_background_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( '_background_color', '#A81830' );

		await editor.selectElement( containerId );
		// Set row direction.
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );

		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-row.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.setSelectControlValue( 'content_width', 'full' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		await expect.soft( container ).toHaveScreenshot( 'container-row-full.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		// Flex-direction: column
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-down' );
		// Align items: flex-start
		await editor.setChooseControlValue( 'flex_align_items', 'eicon-align-start-v' );
		// Set `min-height` to test if there are `flex-grow` issues.
		await editor.setSliderControlValue( 'min_height', '1500' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-column-full-start.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.setSelectControlValue( 'content_width', 'boxed' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-column-boxed-start.png' );
	} );

	test( 'Test widgets inside the container using position absolute', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );

		// Act.
		await editor.addWidget( widgets.heading, container );
		await editor.selectElement( container );
		// Set position absolute.
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'absolute' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );

		await editor.togglePreviewMode();

		// Assert
		// Take screenshot.
		await expect.soft( pageView ).toHaveScreenshot( 'heading-boxed-absolute.png' );

		await editor.togglePreviewMode();

		// Act
		// Select container.
		await editor.selectElement( container );
		// Set full content width
		await editor.openPanelTab( 'layout' );
		await editor.setSelectControlValue( 'content_width', 'full' );

		await editor.togglePreviewMode();

		// Assert
		await expect( pageView ).toHaveScreenshot( 'heading-full-absolute.png' );

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

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		// Select container.
		await editor.selectElement( container );
		// Set position fixed.
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'fixed' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );
		await editor.togglePreviewMode();

		// Assert
		// Take screenshot.
		await expect( pageView ).toHaveScreenshot( 'heading-boxed-fixed.png' );

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

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );

		// Act
		// Set container content full content width.
		await editor.selectElement( container );
		await editor.openPanelTab( 'layout' );
		await editor.setSelectControlValue( 'content_width', 'full' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		// Select container.
		await editor.selectElement( container );
		// Set position fixed.
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'fixed' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );

		await editor.togglePreviewMode();

		// Assert
		await expect( pageView ).toHaveScreenshot( 'heading-full-fixed.png' );
	} );

	test( 'Right click should add Full Width container', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.addElement( { elType: 'container' }, 'document' );

		await editor.getPreviewFrame().locator( '.elementor-editor-element-edit' ).click( { button: 'right' } );
		await expect.soft( page.locator( '.elementor-context-menu-list__item-newContainer' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-newContainer' ).click();
		await expect.soft( editor.getPreviewFrame().locator( '.e-con-full' ) ).toHaveCount( 1 );
	} );
} );
