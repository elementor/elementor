import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { viewportSize } from '../../../enums/viewport-sizes';
import { clickTab, setup, setBackgroundVideoUrl, isTabTitleVisible } from './helper';
import _path from 'path';

test.describe( 'Nested Tabs tests @nested-tabs', () => {
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

	test( 'Check none breakpoint', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame();

		await test.step( 'Add nested tabs and select none as breakpoint', async () => {
			await editor.addWidget( 'nested-tabs', container );
			await editor.openSection( 'section_tabs_responsive' );
			await editor.setSelectControlValue( 'breakpoint_selector', 'none' );
		} );

		await test.step( 'Assert no accordion on mobile view', async () => {
			await editor.changeResponsiveView( 'mobile' );
			const nestedTabsHeading = frame.locator( '.e-n-tabs-heading' );
			await expect.soft( nestedTabsHeading ).toHaveCSS( 'display', 'flex' );

			await editor.changeResponsiveView( 'tablet' );
			await expect.soft( nestedTabsHeading ).toHaveCSS( 'display', 'flex' );
		} );
	} );

	test( 'Check that background video is loaded in multiple content containers', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( 'nested-tabs', container );

		const contentContainerOne = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=0` ),
			contentContainerOneId = await contentContainerOne.getAttribute( 'data-id' ),
			contentContainerTwo = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=1` ),
			contentContainerTwoId = await contentContainerTwo.getAttribute( 'data-id' ),
			contentContainerThree = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=2` ),
			contentContainerThreeId = await contentContainerThree.getAttribute( 'data-id' ),
			videoUrl = 'https://youtu.be/XNoaN8qu4fg',
			videoContainer = editor.getPreviewFrame().locator( '.elementor-element-' + contentContainerOneId + ' .elementor-background-video-container iframe' ),
			firstTabContainer = editor.getPreviewFrame().locator( '.elementor-element-' + contentContainerOneId ),
			firstTabContainerModelCId = await firstTabContainer.getAttribute( 'data-model-cid' );

		await setBackgroundVideoUrl( editor, contentContainerOneId, videoUrl );
		await setBackgroundVideoUrl( editor, contentContainerTwoId, videoUrl );
		await setBackgroundVideoUrl( editor, contentContainerThreeId, videoUrl );

		await expect.soft( contentContainerOne ).toHaveAttribute( 'data-model-cid', firstTabContainerModelCId );
		// Assert that the iframe loaded. It's impossible to check if the video is playing due to issue in Chromium.
		await expect.soft( videoContainer ).toHaveCount( 1 );

		await page.waitForTimeout( 3000 );
		// Assert that the iframe loaded. It's impossible to check if the video is playing due to issue in Chromium.
		await expect.soft( contentContainerThree.locator( '.elementor-background-video-container iframe' ) ).toHaveCount( 1 );

		await clickTab( editor.getPreviewFrame(), 1 );
		await page.waitForTimeout( 3000 );
		// Assert that the iframe loaded. It's impossible to check if the video is playing due to issue in Chromium.
		await expect.soft( contentContainerTwo.locator( '.elementor-background-video-container iframe' ) ).toHaveCount( 1 );

		await clickTab( editor.getPreviewFrame(), 0 );
		await page.waitForTimeout( 3000 );
		// Assert that the iframe loaded. It's impossible to check if the video is playing due to issue in Chromium.
		await expect.soft( contentContainerOne.locator( '.elementor-background-video-container iframe' ) ).toHaveCount( 1 );
	} );

	test( 'Nested tabs horizontal scroll', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame();

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );

		await test.step( 'Set scrolling settings', async () => {
			await editor.openSection( 'section_tabs_responsive' );
			await editor.setSelectControlValue( 'horizontal_scroll', 'enable' );

			await editor.openSection( 'section_tabs' );
			Array.from( { length: 3 }, async () => {
				await page.locator( '.elementor-control-tabs .elementor-repeater-fields:nth-child( 2 ) .elementor-repeater-row-tools .elementor-repeater-tool-duplicate' ).click();
			} );

			await editor.openPanelTab( 'style' );
			await editor.setSliderControlValue( 'tabs_title_space_between', '500' );
		} );

		await test.step( 'Assert overflow x', async () => {
			const nestedTabsHeading = frame.locator( '.e-n-tabs-heading' );
			await expect.soft( nestedTabsHeading ).toHaveCSS( 'overflow-x', 'scroll' );
		} );

		await test.step( 'Assert scrolling behaviour inside the Editor', async () => {
			await page.waitForTimeout( 1000 );

			const widgetHeading = frame.locator( '.e-n-tabs-heading' ),
				itemCount = await widgetHeading.evaluate( ( element ) => element.querySelectorAll( '.e-n-tab-title' ).length );

			let isFirstItemVisible = await isTabTitleVisible( frame, 0 ),
				isLastItemVisible = await isTabTitleVisible( frame, ( itemCount - 1 ) );

			expect.soft( isFirstItemVisible ).toBeTruthy();
			expect.soft( isLastItemVisible ).not.toBeTruthy();

			await widgetHeading.hover();
			await page.mouse.down();

			await frame.locator( '.e-scroll' ).evaluate( ( element ) => {
				element.scrollBy( 300, 0 );
			} );

			isFirstItemVisible = await isTabTitleVisible( frame, 0 );

			expect.soft( isFirstItemVisible ).not.toBeTruthy();

			await frame.locator( '.e-scroll' ).evaluate( ( element ) => {
				element.scrollBy( -300, 0 );
			} );

			isFirstItemVisible = await isTabTitleVisible( frame, 0 );
			isLastItemVisible = await isTabTitleVisible( frame, ( itemCount - 1 ) );

			expect.soft( isFirstItemVisible ).toBeTruthy();
			expect.soft( isLastItemVisible ).not.toBeTruthy();

			await frame.locator( '.e-n-tabs-content' ).hover();
			await frame.locator( '.e-n-tabs-content' ).click();
		} );

		await test.step( 'Assert scrolling behaviour on the Frontend', async () => {
			await editor.publishAndViewPage();

			const widgetHeading = page.locator( '.e-n-tabs-heading' ),
				itemCount = await widgetHeading.evaluate( ( element ) => element.querySelectorAll( '.e-n-tab-title' ).length );

			let isFirstItemVisible = await isTabTitleVisible( page, 0 ),
				isLastItemVisible = await isTabTitleVisible( page, ( itemCount - 1 ) );

			expect.soft( isFirstItemVisible ).toBeTruthy();
			expect.soft( isLastItemVisible ).not.toBeTruthy();

			await widgetHeading.hover();
			await page.mouse.down();

			await page.locator( '.e-scroll' ).evaluate( ( element ) => {
				element.scrollBy( 600, 0 );
			} );

			isFirstItemVisible = await isTabTitleVisible( page, 0 );

			expect.soft( isFirstItemVisible ).not.toBeTruthy();

			await page.locator( '.e-scroll' ).evaluate( ( element ) => {
				element.scrollBy( -600, 0 );
			} );

			isFirstItemVisible = await isTabTitleVisible( page, 0 );
			isLastItemVisible = await isTabTitleVisible( page, ( itemCount - 1 ) );

			expect.soft( isFirstItemVisible ).toBeTruthy();
			expect.soft( isLastItemVisible ).not.toBeTruthy();
		} );
	} );

	test( 'Nested tabs horizontal scroll - rtl', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setSiteLanguage( 'he_IL' );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame();

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );

		await test.step( 'Set scrolling settings', async () => {
			await editor.openSection( 'section_tabs_responsive' );
			await editor.setSelectControlValue( 'breakpoint_selector', 'none' );
			await editor.setSelectControlValue( 'horizontal_scroll', 'enable' );

			await editor.openSection( 'section_tabs' );
			Array.from( { length: 3 }, async () => {
				await page.locator( '.elementor-control-tabs .elementor-repeater-fields:nth-child( 2 ) .elementor-repeater-row-tools .elementor-repeater-tool-duplicate' ).click();
			} );
		} );

		await test.step( 'Assert scrolling behaviour inside the Editor', async () => {
			await page.waitForTimeout( 1000 );

			const widgetHeading = frame.locator( '.e-n-tabs-heading' ),
				itemCount = await widgetHeading.evaluate( ( element ) => element.querySelectorAll( '.e-n-tab-title' ).length );

			await editor.changeResponsiveView( 'mobile' );
			await editor.isUiStable( frame.locator( '.e-n-tabs-heading' ) );

			const isFirstItemVisible = await isTabTitleVisible( frame, 0 ),
				isLastItemVisible = await isTabTitleVisible( frame, ( itemCount - 1 ) );

			expect.soft( isFirstItemVisible ).toBeTruthy();
			expect.soft( isLastItemVisible ).not.toBeTruthy();
			await expect.soft( frame.locator( '.e-n-tabs-heading' ) ).toHaveCSS( 'justify-content', 'start' );

			expect.soft( await frame.locator( '.e-n-tabs-heading' ).first().screenshot( {
				type: 'png',
			} ) ).toMatchSnapshot( 'tabs-horizontal-scroll-initial-editor.png' );
		} );

		await test.step( 'Assert scrolling behaviour on the Frontend', async () => {
			await editor.publishAndViewPage();

			const widgetHeading = page.locator( '.e-n-tabs-heading' ),
				itemCount = await widgetHeading.evaluate( ( element ) => element.querySelectorAll( '.e-n-tab-title' ).length );

			await page.setViewportSize( viewportSize.mobile );
			await editor.isUiStable( page.locator( '.e-n-tabs-heading' ) );

			const isFirstItemVisible = await isTabTitleVisible( page, 0 ),
				isLastItemVisible = await isTabTitleVisible( page, ( itemCount - 1 ) );

			expect.soft( isFirstItemVisible ).toBeTruthy();
			expect.soft( isLastItemVisible ).not.toBeTruthy();
			await expect.soft( page.locator( '.e-n-tabs-heading' ) ).toHaveCSS( 'justify-content', 'start' );

			expect.soft( await page.locator( '.e-n-tabs-heading' ).first().screenshot( {
				type: 'png',
			} ) ).toMatchSnapshot( 'tabs-horizontal-scroll-initial-frontend.png' );
		} );

		await test.step( 'Reset language to English', async () => {
			await wpAdmin.setSiteLanguage( '' );
		} );
	} );

	test( 'Nested tabs stretch for right direction', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame();
		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		// Act
		await editor.setChooseControlValue( 'tabs_direction', 'eicon-h-align-left' );
		await editor.setChooseControlValue( 'tabs_justify_vertical', 'eicon-align-stretch-v' );

		const tabsHeading = frame.locator( '.e-n-tabs-heading' );
		const tabTitle = frame.locator( '.e-n-tab-title' ).first();

		// Assert
		await expect.soft( tabsHeading ).toHaveCSS( 'flex-wrap', 'nowrap' );
		await expect.soft( tabTitle ).toHaveCSS( 'flex-basis', 'auto' );
		await expect.soft( tabTitle ).toHaveCSS( 'flex-shrink', '1' );
	} );

	test( 'Nested tabs stretch for top direction', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame();
		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		// Act
		await editor.setChooseControlValue( 'tabs_direction', 'eicon-v-align-top' );
		await editor.setChooseControlValue( 'tabs_justify_horizontal', 'eicon-align-stretch-h' );

		const tabsHeading = frame.locator( '.e-n-tabs-heading' );
		const tabTitle = frame.locator( '.e-n-tab-title' ).first();

		// Assert
		await expect.soft( tabsHeading ).toHaveCSS( 'flex-wrap', 'wrap' );
		await expect.soft( tabTitle ).toHaveCSS( 'flex-basis', 'content' );
		await expect.soft( tabTitle ).toHaveCSS( 'flex-shrink', '0' );
	} );

	test( 'Check title width inside the accordion mode', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Load template.
		const filePath = _path.resolve( __dirname, `./templates/tabs-accordion.json` );
		await editor.loadTemplate( filePath, false );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs' );

		// Act.
		// Open front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Assert
		await page.setViewportSize( viewportSize.mobile );

		expect.soft( await page.locator( '.e-con' ).first().screenshot( {
			type: 'png',
		} ) ).toMatchSnapshot( 'tabs-accordion-title-width.png' );
	} );

	test( 'Verify the correct hover effect with screenshots', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Load template', async () => {
			// Load template.
			const filePath = _path.resolve( __dirname, `./templates/tabs-hover-styling.json` );
			await editor.loadTemplate( filePath, false );
			await editor.getPreviewFrame().waitForSelector( '.e-n-tabs' );

			// Open front end.
			await editor.publishAndViewPage();
			await page.waitForSelector( '.elementor-widget-n-tabs' );
		} );

		const secondTab = page.locator( '.e-n-tab-title >> nth=1' ),
			widget = page.locator( '.e-n-tabs' );

		await test.step( 'Verify hover styling - desktop', async () => {
			await secondTab.hover();
			await page.waitForTimeout( 500 );

			expect.soft( await widget.screenshot( {
				type: 'png',
			} ) ).toMatchSnapshot( 'tabs-with-hover-desktop.png' );
		} );

		// Assert
		await test.step( 'Verify hover styling - mobile', async () => {
			await page.setViewportSize( viewportSize.mobile );

			await secondTab.hover();
			await page.waitForTimeout( 500 );

			expect.soft( await widget.screenshot( {
				type: 'png',
			} ) ).toMatchSnapshot( 'tabs-with-hover-mobile.png' );
		} );
	} );

	test( 'Check title long title alignment', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Load template.
		const filePath = _path.resolve( __dirname, `./templates/tabs-long-titles.json` );
		await editor.loadTemplate( filePath, false );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs' );

		// Act.
		// Open front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Assert
		expect.soft( await page.locator( '.e-con' ).first().screenshot( {
			type: 'png',
		} ) ).toMatchSnapshot( 'tabs-long-titles.png' );
	} );
} );
