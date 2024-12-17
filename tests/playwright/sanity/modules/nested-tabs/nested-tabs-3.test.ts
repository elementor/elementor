import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { viewportSize } from '../../../enums/viewport-sizes';
import { editTab, clickTab, setup, selectDropdownContainer } from './helper';
import _path from 'path';

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	const templatePath = _path.resolve( __dirname, '../../../templates/nested-tabs-with-icons.json' );

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await setup( wpAdmin );

		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();

		await page.close();
	} );

	test( 'Verify that the tab sizes don\'t shrink when adding a widget in the content section.', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.loadTemplate( templatePath );
		await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ).click();
		const activeContentContainer = editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active' ),
			activeContentContainerId = await activeContentContainer.getAttribute( 'data-id' );

		// Act.
		// Set Direction: Left.
		await editor.openPanelTab( 'content' );
		await editor.setChooseControlValue( 'tabs_direction', 'eicon-h-align-left' );
		// Get the initial first tab width.
		await editor.getPreviewFrame().locator( '.e-n-tab-title:first-child' ).click();
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );
		const initialTabWidth = await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ).last().evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Add content
		await editor.addWidget( 'image', activeContentContainerId );

		// Assert
		// Verify that the tab width doesn't change after adding the content.
		const finalTabWidth = await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ).last().evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		expect( finalTabWidth ).toBe( initialTabWidth );
	} );

	test( 'Test the hover animation', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add widget and settings', async () => {
			// Arrange.
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			// Add widget.
			await editor.addWidget( 'nested-tabs', container );
			await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );

			// Act.
			// Set the hover animation.
			await editor.openPanelTab( 'style' );
			await editor.setTabControlValue( 'tabs_title_style', 'tabs_title_hover' );
			await editor.setSelect2ControlValue( 'hover_animation', 'Grow' );
			await editor.setSliderControlValue( 'tabs_title_transition_duration', '0' );
		} );

		await test.step( 'Test animation class inside Editor', async () => {
			// Assert.
			// Test inside editor.
			await expect( editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ) ).toHaveClass( 'e-n-tab-title elementor-animation-grow' );

			// Test on the front end.
			// Open the front end.
			await editor.publishAndViewPage();
		} );

		await test.step( 'Test hover animation settings on the frontend', async () => {
			const widget = page.locator( '.elementor-widget-n-tabs' );
			await widget.waitFor();

			await expect( page.locator( '.e-n-tab-title[aria-selected="true"]' ) ).toHaveClass( 'e-n-tab-title elementor-animation-grow' );

			// Test the hover animation.
			const tabNormal = page.locator( '.e-n-tab-title[aria-selected="false"]' ).last();
			await tabNormal.hover();
			await page.waitForTimeout( 100 );
			await expect.soft( widget ).toHaveScreenshot( 'nested-tabs-with-hover-grow.png' );
		} );

		await test.step( 'Test active tab on the frontend', async () => {
			// Hover over an active tab.
			const tabActive = page.locator( '.e-n-tab-title[aria-selected="true"]' );
			await tabActive.hover();
			await expect( tabActive ).toHaveCSS( 'transform', 'none' );
		} );

		await test.step( 'Test mobile on the frontend', async () => {
			// Test on mobile.
			await page.setViewportSize( viewportSize.mobile );
			await expect( page.locator( '.e-n-tab-title[aria-selected="true"]' ) ).toHaveClass( 'e-n-tab-title elementor-animation-grow' );
		} );
	} );

	test( 'Test the container width type', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );

		// Assert.
		// Check if content tab contains the class 'e-con-full'.
		const containerFullWidthCheck = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active' ).evaluate( ( element ) => {
			return element.classList.contains( 'e-con-full' );
		} );
		expect( containerFullWidthCheck ).toBe( true );
	} );

	test( 'Test swiper based carousel works as expected when switching to a new tab', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Act.
		// Add nested-tabs widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );
		// Add image-carousel widget to tab #2.
		const activeContainerId = await editTab( editor, '1' );
		await editor.addWidget( 'image-carousel', activeContainerId );
		// Add images to the image-carousel widget.
		await page.locator( '.elementor-control-carousel .elementor-control-gallery-add' ).click();
		await page.locator( '.media-modal .media-router #menu-item-browse' ).click();
		for ( let i = 0; i <= 4; i++ ) {
			await page.locator( `.media-modal .attachments .attachment>>nth=${ i }` ).click();
		}
		await page.locator( '.media-toolbar-primary .media-button-gallery' ).click();
		await page.locator( '.media-toolbar-primary .media-button-insert' ).click();
		// Modify widget settings.
		await editor.setSelectControlValue( 'slides_to_show', '2' );
		await editor.openSection( 'section_additional_options' );
		await editor.setSwitcherControlValue( 'infinite', false );
		await editor.setNumberControlValue( 'autoplay_speed', '800' );

		await editor.publishAndViewPage();

		// Wait for Nested Tabs widget to be initialized and click to activate second tab.
		await page.waitForSelector( `.e-n-tabs-content .e-con.e-active` );
		await page.locator( `.e-n-tabs-heading .e-n-tab-title>>nth=1` ).click();

		// Assert.
		// Check the swiper in the second nested tab has initialized.
		await expect( page.locator( `.e-n-tabs-content .e-con.e-active .swiper-slide.swiper-slide-active` ) ).toBeVisible();
	} );

	test( 'Verify that the tab activation works correctly', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			tabsWidgetId = await editor.addWidget( 'nested-tabs', container );

		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Act.
		// Click on last tab.
		const lastTab = editor.getPreviewFrame().locator( '.e-n-tabs .e-n-tab-title' ).last();
		await lastTab.click();
		// Use timeout to ensure that the value doesn't change after a short while.
		await page.waitForTimeout( 500 );

		// Assert.
		// Verify that after clicking on the tab, the tab is activated correctly.
		await expect( lastTab ).toHaveAttribute( 'aria-selected', 'true' );

		// Act.
		const lastContentContainer = editor.getPreviewFrame().locator( `.elementor-element-${ tabsWidgetId } .e-n-tabs-content .e-con` ).last(),
			lastContentContainerId = await lastContentContainer.getAttribute( 'data-id' );
		// Add content to the last tab.
		await editor.addWidget( 'heading', lastContentContainerId );
		const secondTab = editor.getPreviewFrame().locator( '.e-n-tabs .e-n-tab-title:nth-child( 2 )' );
		await secondTab.click();
		// Use timeout to ensure that the value doesn't change after a short while.
		await page.waitForTimeout( 500 );

		// Assert.
		// Verify that after clicking on the tab, the tab is activated correctly.
		await expect( secondTab ).toHaveAttribute( 'aria-selected', 'true' );
	} );

	test( 'Test the nested tabs behaviour when using container flex row', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( 'heading', container );
		await editor.addWidget( 'nested-tabs', container );
		await editor.addWidget( 'heading', container );

		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		const tabButtonOne = editor.getPreviewFrame().locator( '.e-n-tabs .e-n-tab-title >> nth=0' ),
			contentContainerOne = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=0` ),
			contentContainerOneId = await contentContainerOne.getAttribute( 'data-id' ),
			tabButtonTwo = editor.getPreviewFrame().locator( '.e-n-tabs .e-n-tab-title >> nth=1' ),
			contentContainerTwo = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=1` ),
			contentContainerTwoId = await contentContainerTwo.getAttribute( 'data-id' ),
			tabButtonThree = editor.getPreviewFrame().locator( '.e-n-tabs .e-n-tab-title >> nth=2' ),
			contentContainerThree = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=2` ),
			contentContainerThreeId = await contentContainerThree.getAttribute( 'data-id' );

		// Act.
		// Add content
		// Tab 1.
		await editor.addWidget( 'video', contentContainerOneId );

		// Tab 2.
		await tabButtonTwo.click();
		await editor.addWidget( 'heading', contentContainerTwoId );

		// Tab 3.
		await tabButtonThree.click();
		await editor.addWidget( 'image', contentContainerThreeId );
		await editor.addWidget( 'text-editor', contentContainerThreeId );

		// Set container direction to `row`.
		await editor.selectElement( container );
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-left' );

		// Assert
		// Get content container widths.
		// Tab 1 & Content Container 1.
		await tabButtonOne.click();

		const contentContainerOneWidth = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con >> nth=0' ).evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Tab 2 & Content Container 2.
		await tabButtonTwo.click();

		const contentContainerTwoWidth = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con >> nth=1' ).evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Tab 3 & Content Container 3.
		await tabButtonThree.click();

		const contentContainerThreeWidth = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con >> nth=2' ).evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Verify that the content width doesn't change after changing the active tab.
		expect( contentContainerOneWidth === contentContainerTwoWidth && contentContainerOneWidth === contentContainerThreeWidth ).toBeTruthy();
	} );

	test( 'Tabs and containers are duplicated correctly', async ( { page, apiRequests }, testInfo ) => {
		/**
		 * This test checks that when duplicating a tab that's not the last tab, the duplicated container
		 * receives the correct index.
		 */
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Add widgets.
		await editor.addWidget( 'nested-tabs' );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Act.
		await page.locator( '.elementor-control-tabs .elementor-repeater-fields:nth-child(2) .elementor-repeater-tool-duplicate' ).click();

		await clickTab( editor.getPreviewFrame(), 2 );

		// Assert.
		await expect( editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active' ) ).toHaveCount( 1 );
	} );

	test( "Check widget content styling doesn't override the content container styling when they are used together", async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Define Nested Tabs widget instances, and custom settings to apply to one of the dropdown Containers.
		const defaultWidgetInstance = {
			elType: 'widget',
			widgetType: 'nested-tabs',
		};
		const styledWidgetInstance = {
			elType: 'widget',
			widgetType: 'nested-tabs',
			settings: {
				box_background_color_background: 'classic',
				box_background_color_color: 'rgb(255, 199, 199)',
				box_border_border: 'dotted',
				box_border_width: { unit: 'px', top: '2', right: '2', bottom: '2', left: '2' },
				box_border_color: 'rgb(106, 0, 0)',
				box_border_radius: { unit: 'px', top: '7', right: '7', bottom: '7', left: '7' },
				box_padding: { unit: 'px', top: '5', right: '5', bottom: '5', left: '5' },
			},
		};
		const styledWidgetContainerSettings = {
			background_background: 'classic',
			background_color: 'rgb(199, 255, 197)',
			border_border: 'dashed',
			border_width: { unit: 'px', top: '3', right: '3', bottom: '3', left: '3' },
			border_color: 'rgb(0, 156, 65)',
			padding: { unit: 'px', top: '13', right: '13', bottom: '13', left: '13'	},
			border_radius: { unit: 'px', top: '15', right: '15', bottom: '15', left: '15' },
			box_shadow_box_shadow_type: 'yes',
			box_shadow_box_shadow: { horizontal: 0, vertical: 6, blur: 15, spread: 0, color: 'rgba(0, 165, 20, 0.5)' },
		};

		// Define css attributes we'll be expecting for each of the widgets.
		const widgetsToTest = {
			defaultWidget: {
				containerPadding: '10px',
				widgetId: '',
			},
			styledWidget: {
				containerBackgroundColor: 'rgb(255, 199, 199)',
				containerBorderStyle: 'dotted',
				containerBorderWidth: '2px',
				containerBorderColor: 'rgb(106, 0, 0)',
				containerPadding: '5px',
				widgetId: '',
			},
			styledWidgetContainer: {
				containerBackgroundColor: 'rgb(199, 255, 197)',
				containerBorderStyle: 'dashed',
				containerBorderWidth: '3px',
				containerBorderColor: 'rgb(0, 156, 65)',
				containerBoxedShadow: 'rgba(0, 165, 20, 0.5) 0px 6px 15px 0px',
				containerPadding: '13px',
				widgetId: '',
			},
		};

		let widgetId: string, activeContainerId: string;

		// Add first default Nested Tabs widget with no styling.
		widgetId = await editor.addElement( defaultWidgetInstance );
		widgetsToTest.defaultWidget.widgetId = widgetId;
		activeContainerId = await selectDropdownContainer( editor, widgetId );
		await editor.addWidget( 'heading', activeContainerId );

		// Add second Nested Tabs widget with custom styled dropdown container via the widget settings.
		widgetId = await editor.addElement( styledWidgetInstance );
		widgetsToTest.styledWidget.widgetId = widgetId;
		activeContainerId = await selectDropdownContainer( editor, widgetId );
		await editor.addWidget( 'heading', activeContainerId );

		// Add third Nested Tabs widget with custom styled dropdown container via the widget settings, and custom
		// styled dropdown container via the containers settings too, to make sure the container styling takes preference.
		widgetId = await editor.addElement( styledWidgetInstance );
		widgetsToTest.styledWidgetContainer.widgetId = widgetId;
		activeContainerId = await selectDropdownContainer( editor, widgetId );
		await editor.applyElementSettings( activeContainerId, styledWidgetContainerSettings );
		await editor.addWidget( 'heading', activeContainerId );

		await editor.togglePreviewMode();

		// Test.
		for ( const widgetIdentifier in widgetsToTest ) {
			const widgetToTest = widgetsToTest[ widgetIdentifier ],
				widgetSelector = `.elementor-widget-n-tabs.elementor-element-${ widgetToTest.widgetId }`,
				activeContainer = editor.getPreviewFrame().locator( `${ widgetSelector } .e-n-tabs-content > .e-con.e-active` );

			for ( const valueToTest in widgetToTest ) {
				const expectedCssValue = widgetToTest[ valueToTest ];

				switch ( valueToTest ) {
					case 'containerBackgroundColor':
						await expect( activeContainer ).toHaveCSS( 'background-color', expectedCssValue );
						break;
					case 'containerBorderStyle':
						await expect( activeContainer ).toHaveCSS( 'border-style', expectedCssValue );
						break;
					case 'containerBorderWidth':
						// Workaround Flaky Border Width sometimes shrinks by small % as in Nested Tabs
						// Expect border to not shrink below 90% of set border width.
						const ApproxBorderWidth = ( parseFloat( expectedCssValue.slice( 0, -2 ) ) * 0.90 );
						const borderWidth = await activeContainer.evaluate( ( element ) => {
							return window.getComputedStyle( element ).getPropertyValue( 'border-width' );
						} );

						expect( parseFloat( borderWidth.slice( 0, -2 ) ), 'Child container border width should be larger than ' + ApproxBorderWidth + 'and not overwritten by Nested Tab Border Width' ).toBeGreaterThan( ApproxBorderWidth );
						break;
					case 'containerBorderColor':
						await expect( activeContainer ).toHaveCSS( 'border-color', expectedCssValue );
						break;
					case 'containerBoxedShadow':
						await expect( activeContainer ).toHaveCSS( 'box-shadow', expectedCssValue );
						break;
					case 'containerPadding':
						await expect( activeContainer ).toHaveCSS( 'padding', expectedCssValue );
						break;
				}
			}
		}
	} );

	test( 'Nested tabs check flex wrap', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame();

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );

		// Assert
		const nestedTabsHeading = frame.locator( '.e-n-tabs-heading' );
		await expect( nestedTabsHeading ).toHaveCSS( 'flex-wrap', 'wrap' );
	} );
} );
