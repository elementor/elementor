import { test, expect } from '@playwright/test';
import { createPage, deletePage } from '../../../utilities/rest-api';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { viewportSize } from '../../../enums/viewport-sizes';
import { testTabIsVisibleInAccordionView } from './tests/accordion';
import { testIconCount } from './tests/icons';
import { testCarouselIsVisibleWhenUsingDirectionRightOrLeft } from './tests/carousel';
import { testTitlesWithHTML } from './tests/titles-with-html';
import { editTab, clickTab, setup, cleanup, setTabItemColor, setTabBorderColor, setBackgroundVideoUrl, isTabTitleVisible, selectDropdownContainer } from './helper';
import ImageCarousel from '../../../pages/widgets/image-carousel';
import _path from 'path';

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	let pageId: string;
	const templatePath = `../templates/nested-tabs-with-icons.json`;

	test.beforeEach( async () => {
		pageId = await createPage();
	} );

	test.afterEach( async () => {
		await deletePage( pageId );
	} );

	test( 'General test', async ( { page }, testInfo ) => {
		const imageCarousel = new ImageCarousel( page, testInfo );
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Tests.
		await testIconCount( editor );
		await testTitlesWithHTML( page, editor );
		await testCarouselIsVisibleWhenUsingDirectionRightOrLeft( page, editor, imageCarousel );
		await testTabIsVisibleInAccordionView( page, editor );
	} );

	test( 'Accessibility inside the Editor', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await editor.addWidget( 'button' );

		// Load template.
		const filePath = _path.resolve( __dirname, `./templates/tabs-accessibility.json` );
		await editor.loadTemplate( filePath, false );
		await frame.waitForSelector( '.e-n-tabs' );

		await test.step( 'Keyboard handling inside the Editor', async () => {
			const tabTitleOne = frame.locator( '.e-n-tab-title >> nth=0' ),
				tabTitleTwo = frame.locator( '.e-n-tab-title >> nth=1' ),
				tabTitleThree = frame.locator( '.e-n-tab-title >> nth=2' ),
				button1 = frame.locator( '.elementor-button >> nth=0' ),
				button2 = frame.locator( '.elementor-button >> nth=1' ),
				buttonBelow = frame.locator( '.elementor-button >> nth=3' );

			// Assert.
			await tabTitleOne.focus();
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Escape' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleThree ).toBeFocused();
			await expect( tabTitleThree ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleTwo ).toBeFocused();
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'Enter' );
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button2 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
		} );
	} );

	test( 'Accessibility on the Front End', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await editor.addWidget( 'button' );

		// Load template.
		const filePath = _path.resolve( __dirname, `./templates/tabs-accessibility.json` );
		await editor.loadTemplate( filePath, false );
		await frame.waitForSelector( '.e-n-tabs' );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		await test.step( 'Keyboard handling on the Front End', async () => {
			const tabTitleOne = page.locator( '.e-n-tab-title >> nth=0' ),
				tabTitleTwo = page.locator( '.e-n-tab-title >> nth=1' ),
				tabTitleThree = page.locator( '.e-n-tab-title >> nth=2' ),
				button1 = page.locator( '.elementor-button >> nth=0' ),
				button2 = page.locator( '.elementor-button >> nth=1' ),
				buttonBelow = page.locator( '.elementor-button >> nth=3' );

			// Assert.
			await page.locator( '.page-header' ).click();

			await page.keyboard.press( 'Tab' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Escape' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleThree ).toBeFocused();
			await expect( tabTitleThree ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleTwo ).toBeFocused();
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'Enter' );
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button2 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
		} );

		await test.step( '@axe-core/playwright', async () => {
			await editor.axeCoreAccessibilityTest( page, '.elementor-widget-n-tabs' );
		} );
	} );

	test( 'Title alignment setting', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Act.
		// Set tabs direction to 'stretch'.
		await editor.setChooseControlValue( 'tabs_justify_horizontal', 'eicon-align-stretch-h' );
		// Set align title to 'start'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-left' );

		// Assert.
		// Check if title's are aligned on the left.
		await expect.soft( editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' ) ).toHaveCSS( 'justify-content', 'flex-start' );

		await cleanup( wpAdmin );
	} );

	test( 'Responsive breakpoints for Nested Tabs', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Act.
		await editor.openSection( 'section_tabs_responsive' );
		await editor.setSelectControlValue( 'breakpoint_selector', 'mobile' );

		const desktopTabWrapper = editor.getPreviewFrame().locator( '.e-n-tabs-heading' );

		// Assert.
		// Check if the correct tabs are displayed on tablet view.
		await editor.changeResponsiveView( 'tablet' );
		await expect.soft( desktopTabWrapper ).toHaveCSS( 'display', 'flex' );

		// Check if the correct tabs are displayed on mobile view.
		await editor.changeResponsiveView( 'mobile' );
		await expect.soft( desktopTabWrapper ).toHaveCSS( 'display', 'contents' );

		await cleanup( wpAdmin );
	} );

	test( `Check visibility of icon svg file when font icons experiment is active`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin, { e_font_icon_svg: 'active' } );

		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Set published page variables
		const icon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:first-child' ).first(),
			activeTabIcon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:last-child' ).first(),
			currentContext = page;

		// Assert
		await expect.soft( activeTabIcon ).toBeVisible();
		await clickTab( currentContext, 1 );
		await expect.soft( icon ).toBeVisible();
		await clickTab( currentContext, 0 );

		await cleanup( wpAdmin, { e_font_icon_svg: 'inactive' } );
	} );

	test( `Check the icon size on frontend`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		// Set experiments.
		await setup( wpAdmin, { e_font_icon_svg: 'active' } );

		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );

		await editor.closeNavigatorIfOpen();

		// Set icon size.
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
		await page.locator( '.elementor-tab-control-style' ).click();
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await page.locator( '.elementor-control-icon_size [data-setting="size"]' ).first().fill( '50' );
		await editor.publishAndViewPage();

		// Set published page variables
		const icon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:first-child' ).first(),
			activeTabIcon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:last-child' ).first(),
			currentContext = page;

		// Assert
		await expect.soft( activeTabIcon ).toBeVisible();
		await expect.soft( activeTabIcon ).toHaveCSS( 'width', '50px' );
		await clickTab( currentContext, 1 );
		await expect.soft( icon ).toBeVisible();
		await expect.soft( icon ).toHaveCSS( 'width', '50px' );
		await clickTab( currentContext, 0 );

		// Set experiments.
		await cleanup( wpAdmin, { e_font_icon_svg: 'inactive' } );
	} );

	test( 'Check Gap between tabs and Space between tabs controls in mobile view', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		await editor.openSection( 'section_tabs_responsive' );
		await editor.setSelectControlValue( 'breakpoint_selector', 'mobile' );
		await page.locator( '.elementor-tab-control-style' ).click();

		// Open responsive bar and select mobile view
		await page.locator( '#elementor-panel-footer-responsive i' ).click();
		await page.waitForSelector( '#e-responsive-bar' );
		await page.locator( '#e-responsive-bar-switcher__option-mobile' ).click();

		// Set controls values.
		await editor.setSliderControlValue( 'tabs_title_spacing_mobile', '50' );
		await editor.setSliderControlValue( 'tabs_title_space_between_mobile', '25' );

		const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ),
			lastTab = editor.getPreviewFrame().locator( '.e-n-tab-title' ).last();

		// Assert.
		await expect.soft( activeTab ).toHaveCSS( 'margin-bottom', '50px' );
		await expect.soft( lastTab ).toHaveCSS( 'margin-top', '25px' );

		await cleanup( wpAdmin );
	} );

	test( 'Check that the hover affects non-active tab only', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_title_style' );
		await page.locator( '.elementor-control-title_hover' ).click();
		await editor.setColorControlValue( 'title_text_color_hover', '#ff0000' );

		const rgbColor = 'rgb(255, 0, 0)';
		const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ).first(),
			notActiveTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"]' ).first();

		// Verify that the activate tab doesn't take on the hover color.
		await activeTab.hover();
		await expect.soft( activeTab ).not.toHaveCSS( 'color', rgbColor );
		// Verify that the non active tab does take on the hover color.
		await notActiveTab.hover();
		await expect.soft( notActiveTab ).toHaveCSS( 'color', rgbColor );

		await cleanup( wpAdmin );
	} );

	test( 'Check that icon color does not affect the tab text color', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await setup( wpAdmin );

		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );

		await editor.closeNavigatorIfOpen();

		// Act.
		// Set icon hover color.
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_hover', 'icon_color_hover', '#ff0000' );

		const redColor = 'rgb(255, 0, 0)',
			whiteColor = 'rgb(255, 255, 255)',
			nonActiveTabIcon = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"] > .e-n-tab-icon i:first-child' ).first(),
			nonActiveTabTitle = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"] > .e-n-tab-title-text' ).first();

		// Assert.
		// Check color differences in non active tab.
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"] > .e-n-tab-icon' );
		await nonActiveTabIcon.hover();
		await expect.soft( nonActiveTabIcon ).toHaveCSS( 'color', redColor );
		await expect.soft( nonActiveTabTitle ).toHaveCSS( 'color', whiteColor );

		await cleanup( wpAdmin );
	} );

	test( 'Verify the separation of the parent and child nested tabs styling', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			parentWidgetId = await editor.addWidget( 'nested-tabs', container ),
			tabsContainer = editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .e-con.e-active` ),
			tabsContainerId = await tabsContainer.getAttribute( 'data-id' );

		await editor.addWidget( 'nested-tabs', tabsContainerId );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-n-tabs-content .e-con.e-active' );

		await editor.closeNavigatorIfOpen();

		// Act.
		// Set tabs direction to 'stretch' for parent widget.
		await editor.selectElement( parentWidgetId );
		await editor.setChooseControlValue( 'tabs_justify_horizontal', 'eicon-align-stretch-h' );
		// Set align title to 'start'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-left' );
		await editor.openPanelTab( 'style' );
		await editor.setChooseControlValue( 'tabs_title_background_color_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( 'tabs_title_background_color_color', '#ff0000' );

		// Assert.
		// Check if title's are aligned on the left for the parent widget.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]` ) ).toHaveCSS( 'justify-content', 'flex-start' );
		// Check if title's are aligned on the center for the child widget.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]` ) ).toHaveCSS( 'justify-content', 'center' );
		// Check if parent widget has red tabs.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"] + .e-n-tab-title` ) ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
		// Check if child widget doesn't have red tabs.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"] + .e-n-tab-title` ) ).not.toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the icons don\'t disappear when the tab title is updated', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );

		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );

		await editor.closeNavigatorIfOpen();

		// Act.
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
		const activeTabSpanCount = await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"] span' ).count();

		// Update active tab title.
		await page.locator( '.elementor-repeater-fields:nth-child( 3 )' ).click();
		await page.locator( '.elementor-repeater-fields:nth-child( 3 ) .elementor-control-tab_title input' ).fill( 'Title change' );
		const activeTabUpdatedSpanCount = await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"] span' ).count();

		// Assert.
		expect.soft( activeTabSpanCount ).toBe( 2 );
		expect.soft( activeTabUpdatedSpanCount ).toBe( 2 );

		await cleanup( wpAdmin );
	} );

	test( 'Verify the correct working of the title alignment', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );

		await editor.closeNavigatorIfOpen();

		const thirdItemTitle = editor.getPreviewFrame().locator( '[data-tab-index="3"].e-n-tab-title > .e-n-tab-title-text' );
		await thirdItemTitle.click();

		if ( 0 === await editor.getPreviewFrame().locator( '[data-tab-index="3"].e-n-tab-title[aria-selected="true"]' ).count() ) {
			await thirdItemTitle.click();
		}
		const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		// Tabs styling scenario 1: Direction: Top, Align Title: Left, Icon Position: Right.
		// Set align title to 'start'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-left' );
		// Set icon position to 'right'.
		await editor.openPanelTab( 'style' );
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await editor.setChooseControlValue( 'icon_position', 'eicon-h-align-right' );

		await editor.togglePreviewMode();

		// Assert
		expect.soft( await activeTab.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'tabs-direction-top-icon-position-right-align-left.jpeg' );

		await editor.togglePreviewMode();

		// Tabs styling scenario 2: Direction: Left, Align Title: Right, Icon Position: Top.
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
		// Set Direction: Left.
		await editor.openPanelTab( 'content' );
		await editor.setChooseControlValue( 'tabs_direction', 'eicon-h-align-left' );
		// Set align title to 'right'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-right' );
		// Set icon position to 'top'.
		await editor.openPanelTab( 'style' );
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await editor.setChooseControlValue( 'icon_position', 'eicon-v-align-top' );

		// Tabs styling scenario 3: Direction: Top, Align Title: Default, Icon Position: Top, Justify: Stretch.
		// Unset Direction: Left.
		await editor.openPanelTab( 'content' );
		await editor.setChooseControlValue( 'tabs_direction', 'eicon-h-align-left' );
		// Justify: Stretch.
		await editor.setChooseControlValue( 'tabs_justify_horizontal', 'eicon-align-stretch-h' );
		// Unset align title to 'right'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-right' );

		await editor.togglePreviewMode();

		// Assert
		expect.soft( await activeTab.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'tabs-direction-top-icon-position-top-align-default.jpeg' );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the tab width doesn\'t change when changing between normal and active state', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );

		// Act.
		const firstTab = editor.getPreviewFrame().locator( '.e-n-tab-title:first-child' );
		const lastTab = editor.getPreviewFrame().locator( '.e-n-tab-title:last-child' );

		// Set first tab to active tab.
		await firstTab.click();
		// Get last tab width.
		const lastTabWidth = ( await lastTab.boundingBox() ).width;
		// Set last tab to active tab.
		await lastTab.click();
		// Get last tab active width.
		const lastTabActiveWidth = ( await lastTab.boundingBox() ).width;

		// Assert.
		// Verify that the last tab is active.
		await expect.soft( lastTab ).toHaveAttribute( 'aria-selected', 'true' );
		// Check if the normal tab width is equal to the active tab width.
		expect.soft( lastTabWidth ).toEqual( lastTabActiveWidth );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the custom hover color doesn\'t affect the active tab color', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await setup( wpAdmin );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		// Set tab hover color.
		await setTabItemColor( page, editor, 'tabs', 'tabs_title_hover', 'tabs_title_background_color_hover_color', '#ff0000' );
		// Set tab active color.
		await setTabItemColor( page, editor, 'tabs', 'tabs_title_active', 'tabs_title_background_color_active_color', '#00ffff' );

		await editor.publishAndViewPage();

		// Hover background style.
		const hoverTabBackgroundColor = 'rgb(255, 0, 0)',
			activeTabBackgroundColor = 'rgb(0, 255, 255)',
			activeTab = page.locator( '.e-n-tab-title[aria-selected="true"]' ),
			nonActiveTab = page.locator( '.e-n-tab-title[aria-selected="false"]:last-child' );

		// Assert.
		// Check that by default the hover color isn't applied.
		await expect.soft( activeTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );
		await expect.soft( activeTab ).toHaveCSS( 'background-color', activeTabBackgroundColor );
		await expect.soft( nonActiveTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );

		// Hover over tab.
		await activeTab.hover();
		// Check that active tab doesn't change background color on hover.
		await expect.soft( activeTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );
		await expect.soft( activeTab ).toHaveCSS( 'background-color', activeTabBackgroundColor );
		// Check that non-active tab receives the hover background color.
		await nonActiveTab.hover();
		await expect.soft( nonActiveTab ).toHaveCSS( 'background-color', hoverTabBackgroundColor );

		await cleanup( wpAdmin );
	} );

	test( 'Check if the icons are visible on mobile display on the front end', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );

		// Act.
		// Open front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Assert
		await page.setViewportSize( viewportSize.mobile );
		await expect.soft( page.locator( '.e-n-tab-title[aria-selected="true"] .e-n-tab-icon' ) ).toBeVisible();
		await page.setViewportSize( viewportSize.desktop );

		await cleanup( wpAdmin );
	} );

	test( 'Check if the svg icons are visible on mobile display on the front end', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin, { e_font_icon_svg: 'active' } );
		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );

		// Act.
		// Open front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Assert
		await page.setViewportSize( viewportSize.mobile );
		await expect.soft( page.locator( '.e-n-tab-title[aria-selected="true"] .e-n-tab-icon' ) ).toBeVisible();
		await page.setViewportSize( viewportSize.desktop );

		await cleanup( wpAdmin, { e_font_icon_svg: 'inactive' } );
	} );

	test( 'Check if the hover style changes the normal tab styling', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await setup( wpAdmin );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		await editor.openPanelTab( 'style' );
		// Set tab hover style.
		await page.locator( '.elementor-control-tabs_title_hover' ).click();
		await editor.setSelectControlValue( 'tabs_title_border_hover_border', 'solid' );
		// Set shadow
		await page.locator( '.elementor-control-tabs_title_box_shadow_hover_box_shadow_type i.eicon-edit' ).click();
		// Close shadow panel
		await page.locator( '.elementor-control-tabs_title_box_shadow_hover_box_shadow_type i.eicon-edit' ).click();
		// Set border radius
		await editor.setDimensionsValue( 'tabs_title_border_radius', '15' );

		// Act.
		await editor.publishAndViewPage();

		// Hover background style.
		const borderStyle = 'solid',
			boxShadow = 'rgba(0, 0, 0, 0.5) 0px 0px 10px 0px',
			borderRadius = '15px',
			nonActiveTab = page.locator( '.e-n-tab-title[aria-selected="false"]:last-child' );

		// Assert.
		await nonActiveTab.hover();

		// Check that active tab receives the hover styling.
		await expect.soft( nonActiveTab ).toHaveCSS( 'border-style', borderStyle );
		await expect.soft( nonActiveTab ).toHaveCSS( 'box-shadow', boxShadow );
		await expect.soft( nonActiveTab ).toHaveCSS( 'border-radius', borderRadius );

		await cleanup( wpAdmin );
	} );

	test( 'Verify the correct relationships between normal, hover and active styling', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		await editor.loadTemplate( templatePath );
		await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ).click();
		await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"]:last-child' ).click();

		// Hex colors.
		const colorGreen = '#95E46E',
			colorYellow = '#CFE46E',
			colorBlue = '#134FF2',
			colorBrown = '#967008',
			colorRed = '#961708',
			colorPink = '#E1086E',
			colorGreenRgb = 'rgb(149, 228, 110)',
			colorYellowRgb = 'rgb(207, 228, 110)',
			colorBlueRgb = 'rgb(19, 79, 242)',
			colorBrownRgb = 'rgb(150, 112, 8)',
			colorRedRgb = 'rgb(150, 23, 8)',
			colorPinkRgb = 'rgb(225, 8, 110)';

		// Normal tab styling: text color green, border color: green and icon color: yellow.
		await editor.openPanelTab( 'style' );
		// Set text color.
		await setTabItemColor( page, editor, 'section_title_style', 'title_normal', 'title_text_color', colorGreen );
		// Set border color.
		await setTabBorderColor( page, editor, 'normal', '', colorGreen, '5' );
		// Set icon color.
		await editor.openPanelTab( 'content' );
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_normal', 'icon_color', colorYellow );
		await editor.openPanelTab( 'content' );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_tabs_style' );

		// Hover tab styling: text color: red, border color: red and icon color: pink.
		// Set text color.
		await setTabItemColor( page, editor, 'section_title_style', 'title_hover', 'title_text_color_hover', colorRed );
		// Set border color.
		await setTabBorderColor( page, editor, 'hover', '_hover', colorRed, '5' );
		// Set icon color.
		await editor.openPanelTab( 'content' );
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_hover', 'icon_color_hover', colorPink );
		await editor.openPanelTab( 'content' );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_tabs_style' );

		// Active tab styling: text color: blue, border color: blue and icon color: brown.
		// Set text color.
		await setTabItemColor( page, editor, 'section_title_style', 'title_active', 'title_text_color_active', colorBlue );
		// Set border color.
		await setTabBorderColor( page, editor, 'active', '_active', colorBlue, '5' );
		// Set icon color.
		await editor.openPanelTab( 'content' );
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_active', 'icon_color_active', colorBrown );
		await editor.openPanelTab( 'content' );

		// Act.
		await editor.getPreviewFrame().locator( '.e-n-tab-title:first-child' ).click();
		const tabNormal = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"]:last-child' ),
			tabActive = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' );

		// Assert.
		// Normal tab.
		await expect.soft( tabNormal ).toHaveCSS( 'color', colorGreenRgb );
		await expect.soft( tabNormal ).toHaveCSS( 'border-color', colorGreenRgb );
		await expect.soft( tabNormal.locator( 'i:first-child' ) ).toHaveCSS( 'color', colorYellowRgb );
		// Active tab.
		await expect.soft( tabActive ).toHaveCSS( 'color', colorBlueRgb );
		await expect.soft( tabActive ).toHaveCSS( 'border-color', colorBlueRgb );
		await expect.soft( tabActive.locator( 'i:last-child' ) ).toHaveCSS( 'color', colorBrownRgb );

		// Hover normal tab.
		await tabNormal.hover();
		// Normal tab.
		await expect.soft( tabNormal ).toHaveCSS( 'color', colorRedRgb );
		await expect.soft( tabNormal ).toHaveCSS( 'border-color', colorRedRgb );
		await expect.soft( tabNormal.locator( 'i:first-child' ) ).toHaveCSS( 'color', colorPinkRgb );

		// Hover active tab.
		await tabNormal.hover();
		// Active tab.
		await expect.soft( tabActive ).toHaveCSS( 'color', colorBlueRgb );
		await expect.soft( tabActive ).toHaveCSS( 'border-color', colorBlueRgb );
		await expect.soft( tabActive.locator( 'i:last-child' ) ).toHaveCSS( 'color', colorBrownRgb );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the tab sizes don\'t shrink when adding a widget in the content section.', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
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

		expect.soft( finalTabWidth ).toBe( initialTabWidth );

		await cleanup( wpAdmin );
	} );

	test( 'Test the hover animation', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = new EditorPage( page, testInfo );
		await editor.gotoPostId( pageId );
		const container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );

		// Act.
		// Set the hover animation.
		await editor.openPanelTab( 'style' );
		await page.locator( '.elementor-control-tabs_title_hover' ).click();
		await page.locator( '.elementor-control-hover_animation .select2' ).click();
		await page.locator( '.select2-results__option:has-text("Grow")' ).first().click();
		await page.waitForLoadState( 'networkidle' );

		// Assert.
		// Test inside editor.
		await expect.soft( editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ) ).toHaveClass( 'e-n-tab-title elementor-animation-grow' );

		// Test on the front end.
		// Open the front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );
		// Test on desktop.
		await expect.soft( page.locator( '.e-n-tab-title[aria-selected="true"]' ) ).toHaveClass( 'e-n-tab-title elementor-animation-grow' );
		// Test the hover animation.
		const tabNormal = page.locator( '.e-n-tab-title[aria-selected="false"]' ).last();
		await tabNormal.hover();
		const tabHover = await tabNormal.evaluate( ( element ) => {
			const animationValue = window.getComputedStyle( element ).getPropertyValue( 'transform' );

			return animationValue.includes( 'matrix(' ) ? true : false;
		} );
		expect.soft( tabHover ).toBe( true );
		// Hover over an active tab.
		const tabActive = page.locator( '.e-n-tab-title[aria-selected="true"]' );
		await tabActive.hover();
		await expect.soft( tabActive ).toHaveCSS( 'transform', 'none' );

		// Test on mobile.
		await page.setViewportSize( viewportSize.mobile );
		await expect.soft( page.locator( '.e-n-tab-title[aria-selected="true"]' ) ).toHaveClass( 'e-n-tab-title elementor-animation-grow' );

		// Reset the original state.
		await page.setViewportSize( viewportSize.desktop );
		await cleanup( wpAdmin );
	} );

	test( 'Test the container width type', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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
		expect.soft( containerFullWidthCheck ).toBe( true );

		await cleanup( wpAdmin );
	} );

	test( 'Test swiper based carousel works as expected when switching to a new tab', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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
		await page.locator( '.elementor-control-infinite .elementor-switch-label' ).click();
		await editor.setNumberControlValue( 'autoplay_speed', '800' );

		await editor.publishAndViewPage();

		// Wait for Nested Tabs widget to be initialized and click to activate second tab.
		await page.waitForSelector( `.e-n-tabs-content .e-con.e-active` );
		await page.locator( `.e-n-tabs-heading .e-n-tab-title>>nth=1` ).click();

		// Assert.
		// Check the swiper in the second nested tab has initialized.
		await expect.soft( page.locator( `.e-n-tabs-content .e-con.e-active .swiper-slide.swiper-slide-active` ) ).toBeVisible();

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the tab activation works correctly', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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
		await expect.soft( lastTab ).toHaveAttribute( 'aria-selected', 'true' );

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
		await expect.soft( secondTab ).toHaveAttribute( 'aria-selected', 'true' );

		await cleanup( wpAdmin );
	} );

	test( 'Test the nested tabs behaviour when using container flex row', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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
		expect.soft( contentContainerOneWidth === contentContainerTwoWidth && contentContainerOneWidth === contentContainerThreeWidth ).toBeTruthy();

		await cleanup( wpAdmin );
	} );

	test( 'Tabs and containers are duplicated correctly', async ( { page }, testInfo ) => {
		/**
		 * This test checks that when duplicating a tab that's not the last tab, the duplicated container
		 * receives the correct index.
		 */
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage();

		// Add widgets.
		await editor.addWidget( 'nested-tabs' );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Act.
		await page.locator( '.elementor-control-tabs .elementor-repeater-fields:nth-child(2) .elementor-repeater-tool-duplicate' ).click();

		await clickTab( editor.getPreviewFrame(), 2 );

		// Assert.
		await expect.soft( editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active' ) ).toHaveCount( 1 );
	} );

	test( "Check widget content styling doesn't override the content container styling when they are used together", async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

		let widgetId, activeContainerId;

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
						await expect.soft( activeContainer ).toHaveCSS( 'background-color', expectedCssValue );
						break;
					case 'containerBorderStyle':
						await expect.soft( activeContainer ).toHaveCSS( 'border-style', expectedCssValue );
						break;
					case 'containerBorderWidth':
						// Workaround Flaky Border Width sometimes shrinks by small % as in Nested Tabs
						// Expect border to not shrink below 90% of set border width.
						const ApproxBorderWidth = ( parseFloat( expectedCssValue.slice( 0, -2 ) ) * 0.90 );
						const borderWidth = await activeContainer.evaluate( ( element ) => {
							return window.getComputedStyle( element ).getPropertyValue( 'border-width' );
						} );

						expect.soft( parseFloat( borderWidth.slice( 0, -2 ) ), 'Child container border width should be larger than ' + ApproxBorderWidth + 'and not overwritten by Nested Tab Border Width' ).toBeGreaterThan( ApproxBorderWidth );
						break;
					case 'containerBorderColor':
						await expect.soft( activeContainer ).toHaveCSS( 'border-color', expectedCssValue );
						break;
					case 'containerBoxedShadow':
						await expect.soft( activeContainer ).toHaveCSS( 'box-shadow', expectedCssValue );
						break;
					case 'containerPadding':
						await expect.soft( activeContainer ).toHaveCSS( 'padding', expectedCssValue );
						break;
				}
			}
		}

		await cleanup( wpAdmin );
	} );

	test( 'Nested tabs check flex wrap', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			frame = editor.getPreviewFrame();

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );

		// Assert
		const nestedTabsHeading = frame.locator( '.e-n-tabs-heading' );
		await expect.soft( nestedTabsHeading ).toHaveCSS( 'flex-wrap', 'wrap' );
	} );

	test( 'Check none breakpoint', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

	test( 'Check that background video is loaded in multiple content containers', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

		await setBackgroundVideoUrl( page, editor, contentContainerOneId, videoUrl );
		await setBackgroundVideoUrl( page, editor, contentContainerTwoId, videoUrl );
		await setBackgroundVideoUrl( page, editor, contentContainerThreeId, videoUrl );

		await expect.soft( contentContainerOne ).toHaveAttribute( 'data-model-cid', firstTabContainerModelCId );
		await expect.soft( videoContainer ).toHaveCount( 1 );

		await page.waitForTimeout( 3000 );
		await expect.soft( contentContainerThree.locator( '.elementor-background-video-container iframe' ) ).not.toHaveCSS( 'width', '0px' );
		await expect.soft( contentContainerThree.locator( '.elementor-background-video-container' ) ).toBeVisible();
		await expect.soft( contentContainerTwo.locator( '.elementor-background-video-container' ) ).not.toBeVisible();

		await clickTab( editor.getPreviewFrame(), 1 );
		await page.waitForTimeout( 3000 );
		await expect.soft( contentContainerTwo.locator( '.elementor-background-video-container iframe' ) ).not.toHaveCSS( 'width', '0px' );
		await expect.soft( contentContainerTwo.locator( '.elementor-background-video-container' ) ).toBeVisible();
		await expect.soft( contentContainerOne.locator( '.elementor-background-video-container' ) ).not.toBeVisible();

		await clickTab( editor.getPreviewFrame(), 0 );
		await page.waitForTimeout( 3000 );
		await expect.soft( contentContainerOne.locator( '.elementor-background-video-container iframe' ) ).not.toHaveCSS( 'width', '0px' );
		await expect.soft( contentContainerOne.locator( '.elementor-background-video-container' ) ).toBeVisible();
		await expect.soft( contentContainerThree.locator( '.elementor-background-video-container' ) ).not.toBeVisible();
	} );

	test( 'Nested tabs horizontal scroll', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

	test( 'Nested tabs horizontal scroll - rtl', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

	test( 'Nested tabs stretch for right direction', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

	test( 'Nested tabs stretch for top direction', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

	test( 'Check title width inside the accordion mode', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

		await cleanup( wpAdmin );
	} );

	test( 'Verify the correct hover effect with screenshots', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

		await cleanup( wpAdmin );
	} );

	test( 'Check title long title alignment', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
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

		await cleanup( wpAdmin );
	} );
} );
