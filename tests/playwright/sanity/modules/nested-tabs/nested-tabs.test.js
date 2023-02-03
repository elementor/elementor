const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const EditorPage = require( '../../../pages/editor-page' );

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	test( 'Count the number of icons inside the Add Section element', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		const iconCountForTabs = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active .elementor-add-new-section i' ).count(),
			iconCountForMainContainer = await editor.getPreviewFrame().locator( '#elementor-add-new-section .elementor-add-new-section i' ).count();

		// Assert.
		// Check if the tabs has 1 icon in the Add Section element and the main container 2 icons.
		expect( iconCountForTabs ).toBe( 1 );
		expect( iconCountForMainContainer ).toBe( 2 );

		await cleanup( wpAdmin );
	} );

	test( 'Title alignment setting', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		// Set tabs direction to 'stretch'.
		await page.locator( '.elementor-control-tabs_justify_horizontal .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
		// Set align title to 'start'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-left' ).click();

		// Assert.
		// Check if title's are aligned on the left.
		await expect( editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tabs-heading .e-n-tab-title.e-active' ) ).toHaveCSS( 'justify-content', 'flex-start' );

		await cleanup( wpAdmin );
	} );

	test( 'Responsive breakpoints for Nested Tabs', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		await page.locator( '.elementor-control-section_tabs_responsive' ).click();
		await page.selectOption( '.elementor-control-breakpoint_selector >> select', { value: 'mobile' } );

		const desktopTabWrapper = editor.getPreviewFrame().locator( '.e-n-tabs-heading' ),
			mobileTabActive = editor.getPreviewFrame().locator( '.e-collapse.e-active' );

		// Assert.
		// Check if the correct tabs are displayed on tablet view.
		await editor.changeResponsiveView( 'tablet' );

		await expect( desktopTabWrapper ).toBeVisible();
		await expect( mobileTabActive ).toHaveCSS( 'display', 'none' );

		// Check if the correct tabs are displayed on mobile view.
		await editor.changeResponsiveView( 'mobile' );

		await expect( desktopTabWrapper ).toHaveCSS( 'display', 'none' );
		await expect( mobileTabActive ).toBeVisible();

		await cleanup( wpAdmin );
	} );

	test( `Check visibility of icon svg file when font icons experiment is active`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin, { e_font_icon_svg: 'active' } );
		await wpAdmin.openNewPage();

		const editor = new EditorPage( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Set icons to tabs according 'tabIcons' array.
		await setIconsToTabs( page, tabIcons );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Set published page variables
		const icon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:first-child' ).first(),
			activeTabIcon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:last-child' ).first(),
			currentContext = page;

		// Assert
		await expect( activeTabIcon ).toBeVisible();
		await clickTab( currentContext, '1' );
		await expect( icon ).toBeVisible();
		await clickTab( currentContext, '0' );

		await cleanup( wpAdmin, { e_font_icon_svg: 'inactive' } );
	} );

	test( `Check the icon size on frontend`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		// Set experiments.
		await setup( wpAdmin, { e_font_icon_svg: 'active' } );
		await wpAdmin.openNewPage();

		const editor = new EditorPage( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Set icons to tabs according 'tabIcons' array.
		await setIconsToTabs( page, tabIcons );

		// Set icon size.
		await page.locator( '.elementor-tab-control-style' ).click();
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await page.locator( '.elementor-control-icon_size [data-setting="size"]' ).first().fill( '50' );
		await editor.publishAndViewPage();

		// Set published page variables
		const icon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:first-child' ).first(),
			activeTabIcon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:last-child' ).first(),
			currentContext = page;

		// Assert
		await expect( activeTabIcon ).toBeVisible();
		await expect( activeTabIcon ).toHaveCSS( 'width', '50px' );
		await clickTab( currentContext, '1' );
		await expect( icon ).toBeVisible();
		await expect( icon ).toHaveCSS( 'width', '50px' );
		await clickTab( currentContext, '0' );

		// Set experiments.
		await cleanup( wpAdmin, { e_font_icon_svg: 'inactive' } );
	} );

	test( 'Check Gap between tabs and Space between tabs controls in mobile view', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active' );

		// Act.
		await page.locator( '.elementor-control-section_tabs_responsive' ).click();
		await page.selectOption( '.elementor-control-breakpoint_selector >> select', { value: 'mobile' } );
		await page.locator( '.elementor-tab-control-style' ).click();

		// Open responsive bar and select mobile view
		await page.locator( '#elementor-panel-footer-responsive i' ).click();
		await page.waitForSelector( '#e-responsive-bar' );
		await page.locator( '#e-responsive-bar-switcher__option-mobile' ).click();

		// Set controls values.
		await page.locator( '.elementor-control-tabs_title_spacing_mobile input' ).fill( '50' );
		await page.locator( '.elementor-control-tabs_title_space_between_mobile input' ).fill( '25' );

		const activeTab = editor.getPreviewFrame().locator( '.e-collapse.e-active' ),
			lastTab = editor.getPreviewFrame().locator( '.e-collapse' ).last();

		// Assert.
		await expect( activeTab ).toHaveCSS( 'margin-bottom', '50px' );
		await expect( lastTab ).toHaveCSS( 'margin-top', '25px' );

		await cleanup( wpAdmin );
	} );

	test( 'Check that the hover affects non-active tab only', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active' );

		// Act.
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-section_title_style' ).click();
		await page.locator( '.elementor-control-title_hover' ).click();
		await page.locator( '.elementor-control-title_text_color_hover .pcr-button' ).click();
		await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', '#ff0000' );

		const rgbColor = 'rgb(255, 0, 0)';
		const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title.e-active' ).first(),
			notActiveTab = editor.getPreviewFrame().locator( '.e-n-tab-title:not(.e-active)' ).first();

		// Verify that the activate tab doesn't take on the hover color.
		await activeTab.hover();
		await expect( activeTab ).not.toHaveCSS( 'color', rgbColor );
		// Verify that the non active tab does take on the hover color.
		await notActiveTab.hover();
		await expect( notActiveTab ).toHaveCSS( 'color', rgbColor );

		await cleanup( wpAdmin );
	} );

	test( 'Check that icon color does not affect the tab text color', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await setup( wpAdmin );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active' );

		// Act.
		// Set icons to tabs.
		await setIconsToTabs( page, tabIcons );

		// Set icon hover color.
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_hover', 'icon_color_hover', '#ff0000' );

		const redColor = 'rgb(255, 0, 0)',
			whiteColor = 'rgb(255, 255, 255)',
			nonActiveTabIcon = editor.getPreviewFrame().locator( '.e-n-tab-title:not(.e-active) > .e-n-tab-icon i:first-child' ).first(),
			nonActiveTabTitle = editor.getPreviewFrame().locator( '.e-n-tab-title:not(.e-active) > .e-n-tab-title-text' ).first();

		// Assert.
		// Check color differences in non active tab.
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active > .e-n-tab-icon' );
		await nonActiveTabIcon.hover();
		await expect( nonActiveTabIcon ).toHaveCSS( 'color', redColor );
		await expect( nonActiveTabTitle ).toHaveCSS( 'color', whiteColor );

		await cleanup( wpAdmin );
	} );

	test( 'Verify the separation of the parent and child nested tabs styling', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			parentWidgetId = await editor.addWidget( 'nested-tabs', container ),
			tabsContainer = editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .e-con.e-active` ),
			tabsContainerId = await tabsContainer.getAttribute( 'data-id' );

		await editor.addWidget( 'nested-tabs', tabsContainerId );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-n-tabs-content .e-con.e-active' );

		// Act.
		// Set tabs direction to 'stretch' for parent widget.
		await editor.selectElement( parentWidgetId );
		await page.locator( '.elementor-control-tabs_justify_horizontal .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
		// Set align title to 'start'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-left' ).click();
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-tabs_title_background_color_background .eicon-paint-brush' ).click();
		await page.locator( '.elementor-control-tabs_title_background_color_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-interaction input.pcr-result' ).fill( '#ff0000' );

		// Assert.
		// Check if title's are aligned on the left for the parent widget.
		await expect( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title.e-active` ) ).toHaveCSS( 'justify-content', 'flex-start' );
		// Check if title's are aligned on the center for the child widget.
		await expect( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title.e-active` ) ).toHaveCSS( 'justify-content', 'center' );
		// Check if parent widget has red tabs.
		await expect( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title.e-active + .e-n-tab-title` ) ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
		// Check if child widget doesn't have red tabs.
		await expect( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title.e-active + .e-n-tab-title` ) ).not.toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the icons don\'t disappear when the tab title is updated', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active' );

		// Act.
		// Add tab icons.
		await setIconsToTabs( page, tabIcons );
		const activeTabSpanCount = await editor.getPreviewFrame().locator( '.e-normal.e-active span' ).count();

		// Update active tab title.
		await page.locator( '.elementor-repeater-fields:nth-child( 3 ) .elementor-control-tab_title input' ).fill( 'Title change' );
		const activeTabUpdatedSpanCount = await editor.getPreviewFrame().locator( '.e-normal.e-active span' ).count();

		// Assert.
		expect( activeTabSpanCount ).toBe( 2 );
		expect( activeTabUpdatedSpanCount ).toBe( 2 );

		await cleanup( wpAdmin );
	} );

	test( 'Verify the correct working of the title alignment', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			tabsId = await editor.addWidget( 'nested-tabs', container );

		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		// Add Icons.
		await setIconsToTabs( page, tabIcons );
		const activeTab = editor.getPreviewFrame().locator( '.e-normal.e-active' );

		// Tabs styling scenario 1: Direction: Top, Align Title: Left, Icon Position: Right.
		await editor.selectElement( tabsId );
		// Set align title to 'start'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-left' ).click();
		// Set icon position to 'right'.
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await page.locator( '.elementor-control-icon_position i.eicon-h-align-right' ).click();

		await editor.togglePreviewMode();

		// Assert
		expect( await activeTab.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'tabs-direction-top-icon-position-right-align-left.jpeg' );

		await editor.togglePreviewMode();

		// Tabs styling scenario 2: Direction: Left, Align Title: Right, Icon Position: Top.
		await editor.selectElement( tabsId );
		// Set Direction: Left.
		await editor.activatePanelTab( 'content' );
		await page.locator( '.elementor-control-tabs_direction i.eicon-h-align-left' ).click();
		// Set align title to 'right'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-right' ).click();
		// Set icon position to 'top'.
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await page.locator( '.elementor-control-icon_position i.eicon-v-align-top' ).click();

		// Tabs styling scenario 3: Direction: Top, Align Title: Default, Icon Position: Top, Justify: Stretch.
		await editor.selectElement( tabsId );
		// Unset Direction: Left.
		await editor.activatePanelTab( 'content' );
		await page.locator( '.elementor-control-tabs_direction i.eicon-h-align-left' ).click();
		// Justify: Stretch.
		await page.locator( '.elementor-control-tabs_justify_horizontal .eicon-h-align-stretch' ).click();
		// Unset align title to 'right'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-right' ).click();

		await editor.togglePreviewMode();

		// Assert
		expect( await activeTab.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'tabs-direction-top-icon-position-top-align-default.jpeg' );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the tab width doesn\'t change when changing between normal and active state', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add tabs widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		// Add Icons.
		await setIconsToTabs( page, tabIcons );
		const firstTab = editor.getPreviewFrame().locator( '.e-normal:first-child' );
		const lastTab = editor.getPreviewFrame().locator( '.e-normal:last-child' );

		// Set first tab to active tab.
		await firstTab.click();
		// Get last tab width.
		const lastTabWidth = await lastTab.boundingBox().width;
		// Set last tab to active tab.
		await lastTab.click();
		// Get last tab active width.
		const lastTabActiveWidth = await lastTab.boundingBox().width;

		// Assert.
		// Verify that the last tab is active.
		await expect( lastTab ).toHaveClass( 'e-n-tab-title e-normal e-active' );
		// Check if the normal tab width is equal to the active tab width.
		expect( lastTabWidth ).toBe( lastTabActiveWidth );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the custom hover color doesn\'t affect the active tab color', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await setup( wpAdmin );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active' );

		// Act.
		// Set tab hover color.
		await setTabItemColor( page, editor, 'tabs', 'tabs_title_hover', 'tabs_title_background_color_hover_color', '#ff0000' );

		await editor.publishAndViewPage();

		// Hover background style.
		const hoverTabBackgroundColor = 'rgb(255, 0, 0)',
			activeTab = page.locator( '.e-normal.e-active' ),
			nonActiveTab = page.locator( '.e-normal:not( .e-active ):last-child' );

		// Assert.
		// Check that by default the hover color isn't applied.
		await expect( activeTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );
		await expect( nonActiveTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );

		// Hover over tab.
		await activeTab.hover();
		// Check that active tab doesn't change background color on hover.
		await expect( activeTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );
		// Check that non-active tab receives the hover background color.
		await nonActiveTab.hover();
		await expect( nonActiveTab ).toHaveCSS( 'background-color', hoverTabBackgroundColor );

		await cleanup( wpAdmin );
	} );

	test( 'Check if the icons are visible on mobile display on the front end', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );

		// Act.
		// Add Icons.
		await setIconsToTabs( page, tabIcons );

		// Open front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Assert
		await page.setViewportSize( viewportSize.mobile );
		await expect( page.locator( '.e-collapse.e-active .e-n-tab-icon' ) ).toBeVisible();
		await page.setViewportSize( viewportSize.desktop );

		await cleanup( wpAdmin );
	} );

	test( 'Check if the svg icons are visible on mobile display on the front end', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin, { e_font_icon_svg: 'active' } );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );

		// Act.
		// Add Icons.
		await setIconsToTabs( page, tabIcons );

		// Open front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Assert
		await page.setViewportSize( viewportSize.mobile );
		await expect( page.locator( '.e-collapse.e-active .e-n-tab-icon' ) ).toBeVisible();
		await page.setViewportSize( viewportSize.desktop );

		await cleanup( wpAdmin, { e_font_icon_svg: 'inactive' } );
	} );

	test( 'Check if the hover style changes the normal tab styling', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await setup( wpAdmin );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active' );

		await editor.activatePanelTab( 'style' );
		// Set tab hover style.
		await page.locator( '.elementor-control-tabs_title_hover' ).click();
		// Select solid border
		await page.locator( '.elementor-control-tabs_title_border_hover_border select' ).selectOption( 'solid' );
		// Set shadow
		await page.locator( '.elementor-control-tabs_title_box_shadow_hover_box_shadow_type i.eicon-edit' ).click();
		// Close shadow panel
		await page.locator( '.elementor-control-tabs_title_box_shadow_hover_box_shadow_type i.eicon-edit' ).click();
		// Set border radius
		await page.locator( '.elementor-control-tabs_title_border_radius .elementor-control-dimensions li:first-child input' ).fill( '15' );

		// Act.
		await editor.publishAndViewPage();

		// Hover background style.
		const borderStyle = 'solid',
			boxShadow = 'rgba(0, 0, 0, 0.5) 0px 0px 10px 0px',
			borderRadius = '15px',
			nonActiveTab = page.locator( '.e-normal:not( .e-active ):last-child' );

		// Assert.
		await nonActiveTab.hover();

		// Check that active tab receives the hover styling.
		await expect( nonActiveTab ).toHaveCSS( 'border-style', borderStyle );
		await expect( nonActiveTab ).toHaveCSS( 'box-shadow', boxShadow );
		await expect( nonActiveTab ).toHaveCSS( 'border-radius', borderRadius );

		await cleanup( wpAdmin );
	} );

	test( 'Verify the correct relationships between normal, hover and active styling', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

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

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title.e-normal.e-active' );
		// Add icons.
		await setIconsToTabs( page, tabIcons );

		// Normal tab styling: text color green, border color: green and icon color: yellow.
		await editor.activatePanelTab( 'style' );
		// Set text color.
		await setTabItemColor( page, editor, 'section_title_style', 'title_normal', 'title_text_color', colorGreen );
		// Set border color.
		await setTabBorderColor( page, editor, 'normal', '', colorGreen, '5' );
		// Set icon color.
		await editor.activatePanelTab( 'content' );
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_normal', 'icon_color', colorYellow );
		await editor.activatePanelTab( 'content' );
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-section_tabs_style' ).click();

		// Hover tab styling: text color: red, border color: red and icon color: pink.
		// Set text color.
		await setTabItemColor( page, editor, 'section_title_style', 'title_hover', 'title_text_color_hover', colorRed );
		// Set border color.
		await setTabBorderColor( page, editor, 'hover', '_hover', colorRed, '5' );
		// Set icon color.
		await editor.activatePanelTab( 'content' );
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_hover', 'icon_color_hover', colorPink );
		await editor.activatePanelTab( 'content' );
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-section_tabs_style' ).click();

		// Active tab styling: text color: blue, border color: blue and icon color: brown.
		// Set text color.
		await setTabItemColor( page, editor, 'section_title_style', 'title_active', 'title_text_color_active', colorBlue );
		// Set border color.
		await setTabBorderColor( page, editor, 'active', '_active', colorBlue, '5' );
		// Set icon color.
		await editor.activatePanelTab( 'content' );
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_active', 'icon_color_active', colorBrown );
		await editor.activatePanelTab( 'content' );

		// Act.
		await editor.getPreviewFrame().locator( '.e-normal:first-child' ).click();
		const tabNormal = editor.getPreviewFrame().locator( '.e-normal:not( .e-active ):last-child' ),
			tabActive = editor.getPreviewFrame().locator( '.e-normal.e-active' );

		// Assert.
		// Normal tab.
		await expect( tabNormal ).toHaveCSS( 'color', colorGreenRgb );
		await expect( tabNormal ).toHaveCSS( 'border-color', colorGreenRgb );
		await expect( tabNormal.locator( 'i:first-child' ) ).toHaveCSS( 'color', colorYellowRgb );
		// Active tab.
		await expect( tabActive ).toHaveCSS( 'color', colorBlueRgb );
		await expect( tabActive ).toHaveCSS( 'border-color', colorBlueRgb );
		await expect( tabActive.locator( 'i:last-child' ) ).toHaveCSS( 'color', colorBrownRgb );

		// Hover normal tab.
		await tabNormal.hover();
		// Normal tab.
		await expect( tabNormal ).toHaveCSS( 'color', colorRedRgb );
		await expect( tabNormal ).toHaveCSS( 'border-color', colorRedRgb );
		await expect( tabNormal.locator( 'i:first-child' ) ).toHaveCSS( 'color', colorPinkRgb );

		// Hover active tab.
		await tabNormal.hover();
		// Active tab.
		await expect( tabActive ).toHaveCSS( 'color', colorBlueRgb );
		await expect( tabActive ).toHaveCSS( 'border-color', colorBlueRgb );
		await expect( tabActive.locator( 'i:last-child' ) ).toHaveCSS( 'color', colorBrownRgb );

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the tab sizes don\'t shrink when adding a widget in the content section.', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			tabsWidgetId = await editor.addWidget( 'nested-tabs', container ),
			activeContentContainer = editor.getPreviewFrame().locator( `.elementor-element-${ tabsWidgetId } .e-n-tabs-content .e-con.e-active` ),
			activeContentContainerId = await activeContentContainer.getAttribute( 'data-id' );

		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		// Add Icons.
		await setIconsToTabs( page, tabIcons );
		// Set Direction: Left.
		await editor.selectElement( tabsWidgetId );
		await editor.activatePanelTab( 'content' );
		await page.locator( '.elementor-control-tabs_direction i.eicon-h-align-left' ).click();
		// Get the initial first tab width.
		await editor.getPreviewFrame().locator( '.e-normal:first-child' ).click();
		await editor.getPreviewFrame().waitForSelector( '.e-normal.e-active' );
		const initialTabWidth = await editor.getFrame().locator( '.e-normal.e-active' ).last().evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Add content
		await editor.addWidget( 'image', activeContentContainerId );

		// Assert
		// Verify that the tab width doesn't change after adding the content.
		const finalTabWidth = await editor.getFrame().locator( '.e-normal.e-active' ).last().evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		expect( finalTabWidth ).toBe( initialTabWidth );

		await cleanup( wpAdmin );
	} );

	test( 'Test the hover animation', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );

		// Act.
		// Set the hover animation.
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-tabs_title_hover' ).click();
		await page.locator( '.elementor-control-hover_animation .select2' ).click();
		await page.locator( '.select2-results__option:has-text("Grow")' ).first().click();
		await page.waitForLoadState( 'networkidle' );

		// Assert.
		// Test inside editor.
		await expect( editor.getPreviewFrame().locator( '.e-normal.e-active' ) ).toHaveClass( 'e-n-tab-title e-normal elementor-animation-grow e-active' );

		// Test on the front end.
		// Open the front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );
		// Test on desktop.
		await expect( page.locator( '.e-normal.e-active' ) ).toHaveClass( 'e-n-tab-title e-normal elementor-animation-grow e-active' );
		// Test the hover animation.
		const tabNormal = await page.locator( '.e-normal:not( .e-active )' ).last();
		await tabNormal.hover();
		const tabHover = await tabNormal.evaluate( ( element ) => {
			const animationValue = window.getComputedStyle( element ).getPropertyValue( 'transform' );

			return animationValue.includes( 'matrix(' ) ? true : false;
		} );
		await expect( tabHover ).toBe( true );
		// Hover over an active tab.
		const tabActive = page.locator( '.e-normal.e-active' );
		await tabActive.hover();
		await expect( tabActive ).toHaveCSS( 'transform', 'none' );

		// Test on mobile.
		await page.setViewportSize( viewportSize.mobile );
		await expect( page.locator( '.e-collapse.e-active' ) ).toHaveClass( 'e-n-tab-title e-collapse elementor-animation-grow e-active' );

		// Reset the original state.
		await page.setViewportSize( viewportSize.desktop );
		await cleanup( wpAdmin );
	} );

	test( 'Test the container width type', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );

		// Assert.
		// Check if content tab contains the class 'e-con-full'.
		const containerFullWidthCheck = await editor.getFrame().locator( '.e-n-tabs-content .e-con.e-active' ).evaluate( ( element ) => {
			return element.classList.contains( 'e-con-full' );
		} );
		expect( containerFullWidthCheck ).toBe( true );

		await cleanup( wpAdmin );
	} );

	test( 'Test swiper based carousel works as expected when switching to a new tab', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Act.
		// Add nested-tabs widget.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs .e-active' );
		// Add image-carousel widget to tab #2.
		const activeContainerId = await editTab( editor, 1 );
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
		await page.locator( '.elementor-control-slides_to_show select' ).selectOption( '2' );
		await page.locator( '.elementor-control-section_additional_options .elementor-panel-heading-title' ).click();
		await page.locator( '.elementor-control-infinite select' ).selectOption( 'no' );
		await page.locator( '.elementor-control-autoplay_speed input' ).fill( '800' );

		await editor.publishAndViewPage();

		// Wait for Nested Tabs widget to be initialized and click to activate second tab.
		await page.waitForSelector( `.e-n-tabs-content .e-con.e-active` );
		await page.locator( `.e-n-tabs-heading .e-n-tab-title>>nth=1` ).click();

		// Assert.
		// Check the swiper in the second nested tab has initialized.
		await expect( await page.locator( `.e-n-tabs-content .e-con.e-active .swiper-slide.swiper-slide-active` ) ).toBeVisible();

		await cleanup( wpAdmin );
	} );

	test( 'Verify that the tab activation works correctly @latest', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			tabsWidgetId = await editor.addWidget( 'nested-tabs', container );

		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		// Click on last tab.
		const lastTab = editor.getPreviewFrame().locator( '.e-n-tabs .e-normal' ).last();
		await lastTab.click();
		// Use timeout to ensure that the value doesn't change after a short while.
		await page.waitForTimeout( 500 );

		// Assert.
		// Verify that after clicking on the tab, the tab is activated correctly.
		await expect( lastTab ).toHaveClass( 'e-n-tab-title e-normal e-active' );

		// Act.
		const lastContentContainer = editor.getPreviewFrame().locator( `.elementor-element-${ tabsWidgetId } .e-n-tabs-content .e-con` ).last(),
			lastContentContainerId = await lastContentContainer.getAttribute( 'data-id' );
		// Add content to the last tab.
		await editor.addWidget( 'heading', lastContentContainerId );
		const secondTab = editor.getPreviewFrame().locator( '.e-n-tabs .e-normal:nth-child( 2 )' );
		await secondTab.click();
		// Use timeout to ensure that the value doesn't change after a short while.
		await page.waitForTimeout( 500 );

		// Assert.
		// Verify that after clicking on the tab, the tab is activated correctly.
		await expect( secondTab ).toHaveClass( 'e-n-tab-title e-normal e-active' );

		await cleanup( wpAdmin );
	} );

	test( 'Test the nested tabs behaviour when using container flex row @latest', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( 'heading', container );
		await editor.addWidget( 'nested-tabs', container );
		await editor.addWidget( 'heading', container );

		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		const tabButtonOne = await editor.getPreviewFrame().locator( '.e-n-tabs .e-normal >> nth=0' ),
			contentContainerOne = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=0` ),
			contentContainerOneId = await contentContainerOne.getAttribute( 'data-id' ),
			tabButtonTwo = await editor.getPreviewFrame().locator( '.e-n-tabs .e-normal >> nth=1' ),
			contentContainerTwo = editor.getPreviewFrame().locator( `.e-n-tabs-content .e-con >> nth=1` ),
			contentContainerTwoId = await contentContainerTwo.getAttribute( 'data-id' ),
			tabButtonThree = await editor.getPreviewFrame().locator( '.e-n-tabs .e-normal >> nth=2' ),
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
		await page.locator( '.elementor-control-flex_direction .eicon-arrow-left' ).click();

		// Assert
		// Get content container widths.
		// Tab 1 & Content Container 1.
		await tabButtonOne.click();

		const contentContainerOneWidth = await editor.getFrame().locator( '.e-n-tabs-content .e-con >> nth=0' ).evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Tab 2 & Content Container 2.
		await tabButtonTwo.click();

		const contentContainerTwoWidth = await editor.getFrame().locator( '.e-n-tabs-content .e-con >> nth=1' ).evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Tab 3 & Content Container 3.
		await tabButtonThree.click();

		const contentContainerThreeWidth = await editor.getFrame().locator( '.e-n-tabs-content .e-con >> nth=2' ).evaluate( ( element ) => {
			return window.getComputedStyle( element ).getPropertyValue( 'width' );
		} );

		// Verify that the content width doesn't change after changing the active tab.
		expect( contentContainerOneWidth === contentContainerTwoWidth && contentContainerOneWidth === contentContainerThreeWidth ).toBeTruthy();

		await cleanup( wpAdmin );
	} );
} );

async function editTab( editor, tabIndex ) {
	const tabTitleSelector = '.e-n-tabs-heading .e-n-tab-title';
	await editor.getPreviewFrame().waitForSelector( `${ tabTitleSelector }.e-active` );
	const tabTitle = await editor.getPreviewFrame().locator( `${ tabTitleSelector }>>nth=${ tabIndex }` );
	await tabTitle.click();
	await editor.page.waitForTimeout( 100 );
	return await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active.elementor-element-edit-mode' ).getAttribute( 'data-id' );
}

const viewportSize = {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 400, height: 480 },
};

const tabIcons = [
	{
		icon: 'fa-arrow-alt-circle-right',
		activeIcon: 'fa-bookmark',
	},
	{
		icon: 'fa-clipboard',
		activeIcon: 'fa-clock',
	},
	{
		icon: 'fa-clipboard',
		activeIcon: 'fa-address-card',
	},
];

// Set icons to tabs, used in setIconsToTabs function.
const addIcon = async ( page, selectedIcon ) => {
	await page.locator( `#elementor-icons-manager__tab__content .${ selectedIcon }` ).first().click();
	await page.locator( '.dialog-lightbox-insert_icon' ).click();
};

// Iterate tabs and add an icon and an active Icon to each one.
const setIconsToTabs = async ( page, TabIcons ) => {
	for ( const tab of TabIcons ) {
		const index = tabIcons.indexOf( tab ) + 1;
		await page.locator( `#elementor-controls >> text=Tab #${ index }` ).click();
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index } ) .elementor-control-tab_icon .eicon-circle` ).click();
		await addIcon( page, tab.icon );
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index }  ) .elementor-control-tab_icon_active .eicon-circle` ).click();
		await addIcon( page, tab.activeIcon );
	}
};

// Click on tab by position.
const clickTab = async ( context, tabPosition ) => {
	await context.locator( `.elementor-widget-n-tabs .e-n-tab-title >> nth=${ tabPosition } ` ).first().click();
};

async function setup( wpAdmin, customExperiment = '' ) {
    let experiments = {
        container: 'active',
        'nested-elements': 'active',
    };

    experiments = { ...experiments, ...customExperiment };
    await wpAdmin.setExperiments( experiments );
}

async function cleanup( wpAdmin, customExperiment = '' ) {
    let experiments = {
        container: 'inactive',
        'nested-elements': 'inactive',
    };

    experiments = { ...experiments, ...customExperiment };
    await wpAdmin.setExperiments( experiments );
}

async function setTabItemColor( page, editor, panelClass, tabState, colorPickerClass, color ) {
	await editor.activatePanelTab( 'style' );
	if ( 'tabs' !== panelClass ) {
		await page.locator( `.elementor-control-${ panelClass }` ).click();
	}
	await page.locator( `.elementor-control-${ tabState }` ).click();
	await page.locator( `.elementor-control-${ colorPickerClass } .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}

async function setTabBorderColor( page, editor, state, stateExtended, color, borderWidth, borderStyle = 'solid' ) {
	await editor.activatePanelTab( 'style' );
	await page.locator( `.elementor-control-section_tabs_style` ).click();
	await page.locator( `.elementor-control-tabs_title_${ state }` ).click();
	await page.selectOption( `.elementor-control-tabs_title_border${ stateExtended }_border >> select`, borderStyle );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_width .elementor-control-input-wrapper input` ).first().fill( borderWidth );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_color .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}
