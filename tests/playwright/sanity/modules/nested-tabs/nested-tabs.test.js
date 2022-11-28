const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const EditorPage = require( '../../../pages/editor-page' );

test.describe( 'Nested Tabs tests', () => {
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

		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
		} );

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

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

	test( `Check visibility of icon svg file when font icons experiment is active`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await setup( wpAdmin );
		await wpAdmin.openNewPage();

		const editor = new EditorPage( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Set icons to tabs according 'TabsIcons' array.
		await setIconsToTabs( page, TabsIcons );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Set published page variables
		const icon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon' ).first(),
			activeTabIcon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon.e-active' ).first(),
			currentContext = page;

		// Assert
		await expect( activeTabIcon ).toBeVisible();
		await clickTab( currentContext, '1' );
		await expect( icon ).toBeVisible();
		await clickTab( currentContext, '0' );

		await cleanup( wpAdmin );
	} );

	test( `Check the icon size on frontend`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		// Set experiments.
		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
			e_font_icon_svg: true,
		} );
		await wpAdmin.openNewPage();

		const editor = new EditorPage( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Set icons to tabs according 'TabsIcons' array.
		await setIconsToTabs( page, TabsIcons );

		// Set icon size.
		await page.locator( '.elementor-tab-control-style' ).click();
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await page.locator( '.elementor-control-icon_size [data-setting="size"]' ).first().fill( '50' );
		await editor.publishAndViewPage();

		// Set published page variables
		const icon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg' ).first(),
			activeTabIcon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon.e-active svg' ).first(),
			currentContext = page;

		// Assert
		await expect( activeTabIcon ).toBeVisible();
		await expect( activeTabIcon ).toHaveCSS( 'height', '50px' );
		await clickTab( currentContext, '1' );
		await expect( icon ).toBeVisible();
		await expect( icon ).toHaveCSS( 'height', '50px' );
		await clickTab( currentContext, '0' );

		// Set experiments.
		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
			e_font_icon_svg: false,
		} );
	} );

	test( 'Check Gap between tabs and Space between tabs controls in mobile view', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
		} );

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
	} );

	test( 'Check that active and non-active tabs color changes on hover', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
		} );

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

		await activeTab.hover();
		await expect( activeTab ).toHaveCSS( 'color', rgbColor );
		await notActiveTab.hover();
		await expect( notActiveTab ).toHaveCSS( 'color', rgbColor );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

	test.only( 'Check that icon color does not effect text color in active and non-active tabs on hover state', async ( { page }, testInfo ) => {
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
		await setIconsToTabs( page, TabsIcons );

		// Set icon hover color.
		await setTabItemColor( page, editor, 'icon_section_style', 'icon_section_hover', 'icon_color_hover', '#ff0000' );

		const redColor = 'rgb(255, 0, 0)',
			whiteColor = 'rgb(255, 255, 255)',
			activeTabIcon = editor.getPreviewFrame().locator( '.e-n-tab-title.e-active > .e-n-tab-icon.e-active i' ).first(),
			activeTabTitle = editor.getPreviewFrame().locator( '.e-n-tab-title.e-active' ).first(),
			notActiveTabIcon = editor.getPreviewFrame().locator( '.e-n-tab-title:not(.e-active) > .e-n-tab-icon:not(.e-active) i' ).first(),
			notActiveTabTitle = editor.getPreviewFrame().locator( '.e-n-tab-title:not(.e-active) > .e-n-tab-title-text' ).first();

		// Assert.
		// Check color differences in active tab.
		await activeTabIcon.hover();
		await expect( activeTabIcon ).toHaveCSS( 'color', redColor );
		await expect( activeTabTitle ).toHaveCSS( 'color', whiteColor );

		// Check color differences in non active tab.
		await notActiveTabIcon.hover();
		await expect( notActiveTabIcon ).toHaveCSS( 'color', redColor );
		await expect( notActiveTabTitle ).toHaveCSS( 'color', whiteColor );

		await cleanup( wpAdmin );
	} );
} );

const TabsIcons = [
	{
		icon: 'fa-arrow-alt-circle-right',
		activeIcon: 'fa-bookmark',
	},
	{
		icon: 'fa-clipboard',
		activeIcon: 'fa-clock',
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
		const index = TabsIcons.indexOf( tab ) + 1;
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

async function setup( wpAdmin ) {
	await wpAdmin.setExperiments( {
		container: 'active',
		'nested-elements': 'active',
	} );
}
async function cleanup( wpAdmin ) {
	await wpAdmin.setExperiments( {
		container: 'inactive',
		'nested-elements': 'inactive',
	} );
}

async function setTabItemColor( page, editor, panelClass, tabState, colorPickerClass, color ) {
	await editor.activatePanelTab( 'style' );
	await page.locator( `.elementor-control-${ panelClass }` ).click();
	await page.locator( `.elementor-control-${ tabState }` ).click();
	await page.locator( `.elementor-control-${ colorPickerClass } .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}

